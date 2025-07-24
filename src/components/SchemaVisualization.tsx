import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';
import React, { useEffect,  useRef, useState } from 'react';
import { CgMaximize, CgMathPlus, CgMathMinus, CgClose} from "react-icons/cg";
import { Graph } from '../view/Graph';

// use the dagre layout 
cytoscape.use(dagre)
const SchemaVisualization = ({schema} : {schema : string}) => {
  const cyRef = useRef<cytoscape.Core | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [zoomlevel , setZoomlevel] = useState(3);
  const [debouncedValue, setDebouncedValue] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [closeError, setCloseError] = useState(false);

   // deeply find the key in the schema
   const RecursivelyKeys = (schema : any, findkey : string): string | undefined  =>  {
     if(!schema || typeof schema !== 'object') return;
     if (schema.properties && typeof schema.properties === 'object') {
        for (const  key of Object.keys(schema.properties)) {
          if(key === findkey) return key;
          const result = RecursivelyKeys(schema.properties[key], findkey)
          if(result) return result;
        }
      }
      // for an array
      if (schema?.items) {
        if (Array.isArray(schema.items)) {
          for(const item of schema.items){
            const findItem = RecursivelyKeys(item, findkey);
            if (findItem) return findItem
          }
         
        } else {
          return RecursivelyKeys(schema.items, findkey);
        }
      }
      return;
    }

  // track the real type value
  const handleInput = (event : React.ChangeEvent<HTMLInputElement>) => {
    const newInput = event.target.value
    setInputValue(newInput);
    setErrorMessage('');
    if(newInput){
      handlePointValue(newInput)
    }
  }
  // change the color after or before matches
  const handlePointValue = (input : any) => {
    const normalizeLabel = (label : string) => label.split('(')[0].trim();
      const cy = cyRef.current;
      if(!cy) return;
      cy.nodes().forEach(node => {
        const label = normalizeLabel(node.data('label'))
        if (label === input) {
          node.style('background-color', '#75f209'); // example color
        } else {
          node.removeStyle('background-color');
        }
      });
    }
  // debouncing the input value
  useEffect(() => {
   const delayValue =  setTimeout(() => {
      setDebouncedValue(inputValue)
    }, 1500)
    return () => clearTimeout(delayValue)
  }, [inputValue])

  // Validates the value only after the user stop to search
  useEffect(() => {
   if(!debouncedValue){  // don't validate it on the empty value;
      setErrorMessage('');
      return;
    }; 
    try {
      const parsedSchema = JSON.parse(schema);
      console.log("The parseSchema is ", parsedSchema);
      // check whether the value is found or not
      const isFound = RecursivelyKeys(parsedSchema, debouncedValue);
      console.log("THe found value is ", isFound)
      if (!isFound) {
        setErrorMessage(`${debouncedValue} not in properties`);
      } else {
        setErrorMessage('');
        handlePointValue(debouncedValue);
      }
      
    } catch (error) {
      console.error("Error parsing JSON Schema:", error);
      setErrorMessage("Invalid schema format");
    }
  } , [debouncedValue]);

  useEffect(() => {
    if(errorMessage){
      setCloseError(false);
    }
  }, [errorMessage])

  // move the graph at the center
  const handleCenter = () => {
    const cy = cyRef.current;
    if(!cy) return;
    cy.center();
  }
  // increase  the zoom  
  const handleZoomIn = () => {
    const cy = cyRef.current;
    if(!cy) return;
    const newZoom = Math.min(zoomlevel + 0.1 , cy.maxZoom())
    cy.zoom(newZoom)
    setZoomlevel(newZoom);
  }
  // decrease the zoom
  const handleZoomOut = () => {
    const cy = cyRef.current;
    if(!cy) return;
    const newZoom = Math.max(zoomlevel - 0.1 , cy.minZoom())
    cy.zoom(newZoom)
    setZoomlevel(newZoom);
  }
  return (
  <div className='flex flex-col'>
    {/* Cytoscape  */}
     <div className='relative'>
      <Graph schema={schema} exposeInstances={cyRef} />
       {/*Error Message */}
        <div className='absolute top-0 left-10 mt-2  mx-auto w-auto'>
         <div>
            { errorMessage && !closeError && (
              <div className='flex flex-row gap-x-2 px-2 py-1 bg-red-400 rounded-sm'>
                <p style={{letterSpacing : '1px' ,color : 'white' , fontFamily : 'Roboto, sans-serif'}}>{errorMessage}</p>
                <button className='cursor-pointer' onClick={() => setCloseError(true)}><CgClose color='white'/></button>
              </div>
            )}
          </div> 
        </div>
     </div>
    {/* Below controls */}
    <div className='visualize flex flex-row px-5'>
      <div className='w-20 rounded mx-5 px-2 py-1' style={{background : '#404040'}}>
        <ul className='flex justify-around'>
          <li>
            <button className='custom-btn' onClick={handleCenter}>
               <CgMaximize size={15}/>
            </button>
          </li>
          <li>
            <button className='custom-btn' onClick={handleZoomIn}>
              <CgMathPlus size={15}/>
            </button>
          </li>
          <li>
            <button className='custom-btn' onClick={handleZoomOut}>
                <CgMathMinus size={15}/>
            </button>
          </li>
        </ul>
      </div>
      <div>
          <input
            type="text"
            maxLength={20}
            placeholder="Search for node"
            className='outline-none text-white border-b-2'
            onChange={handleInput}
          />
        </div>
      </div>
  </div>
  );
};

export default React.memo(SchemaVisualization);
