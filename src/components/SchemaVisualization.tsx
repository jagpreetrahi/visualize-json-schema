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
  const handleInput = (event : React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value.trim());
    setErrorMessage('');
  }
  const handlePointValue = (input : any) => {
      const cy = cyRef.current;
      if(!cy) return;
      if(input === '') {
         cy.nodes().forEach(node => {
            node.removeStyle('background-color');
         });
         return 
      }
      //find the matches 
      const matchesNodes = cy.nodes().filter(n => n.data('label') === input);
      if (matchesNodes.length > 0) {
        matchesNodes.style({
          'background-color': '#ffa500',
        });
      }
    }
  // debouncing the input value
  useEffect(() => {
    const delayValue =  setTimeout(() => {
      setDebouncedValue(inputValue)
    }, 300)
    return () => clearTimeout(delayValue)
  }, [inputValue])

  // Validates the value only after the user stop to search
  useEffect(() => {
    handlePointValue(debouncedValue);
    if(!debouncedValue) return; // don't validate it on the empty value;
    let parsedSchema : any;
    try {
      parsedSchema = JSON.parse(schema)
      const properties = parsedSchema.properties;
      const propertyKey = Object.keys(properties);
      
      if(!propertyKey.includes(debouncedValue)){
        setErrorMessage(`${debouncedValue} not in prop`)
      }
      else{
        setErrorMessage('');
      }
    } catch (error) {
      console.warn("Invalid JSON Schema")
    }
  } , [debouncedValue , schema]);

  useEffect(() => {
    if(errorMessage){
       setCloseError(false);
    }
  }, [errorMessage])

  const handleCenter = () => {
    const cy = cyRef.current;
    if(!cy) return;
    cy.center();
  }

  const handleZoomIn = () => {
    const cy = cyRef.current;
    if(!cy) return;
    const newZoom = Math.min(zoomlevel + 0.1 , cy.maxZoom())
    cy.zoom(newZoom)
    setZoomlevel(newZoom);
  }
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
