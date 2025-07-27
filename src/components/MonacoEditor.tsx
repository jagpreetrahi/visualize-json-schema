import Editor from '@monaco-editor/react';
import schema from '../data/dummy-schema.json'
import {useCallback, useContext, useState} from 'react';
import { MonacoEditorContext } from '../contexts/EditorContext';
import { ThemeContext } from '../contexts/ThemeContext'
import * as monaco from 'monaco-editor';
import { CgChevronDown } from "react-icons/cg";
import SchemaVisualization from './SchemaVisualization';
import {Panel, PanelGroup, PanelResizeHandle} from 'react-resizable-panels'

const MonacoEditor = () => {
    const {editorRef,  editorHeight, editorWidth , isFullScreen, containerRef, toggleButton} = useContext(MonacoEditorContext);
    const { theme } = useContext(ThemeContext);
    // Extract the schema to a state so that react tracks the schema updates
    const [schemaValue, setSchemaValue] = useState(JSON.stringify(schema, null, 2));
    const [validationError, setValidationError] = useState('');
    const [isEditorReady, setIsEditorReady] = useState(false);
    //define the panel size for editor and visualization
    const editorPanelMaxSize : number = 40;
    const editorPanelMinSize : number = 20;
    const visualizePanelMaxSize :number = 70;
    // validates the JSON Schema before creation the visualization and prevent the un-necessary creation 
    const updateVisualizationFromJSON = useCallback((jsonString : string | undefined) => {
        if(!jsonString || jsonString.trim() === ''){
            setValidationError("Empty JSON schema")
            return;
        }
        try {
            const parsedSchema = JSON.parse(jsonString);
            if(typeof parsedSchema === 'object' || parsedSchema !== null){
                setSchemaValue(jsonString);
                setValidationError('');   
            }
            window.sessionStorage.setItem('JSON Schema', jsonString)
        } catch (error : any) {
            setValidationError(`Invalid JSON: ${error.message}`);
        }
    }, [schemaValue])

   

    {/*Assign the editor instance when the editor's mounted */}
    function MonacoEditorDidMount(editor: monaco.editor.IStandaloneCodeEditor) {
        editorRef.current = editor;
        setIsEditorReady(true);
       const isItems =  window.sessionStorage.getItem('JSON Schema');
       if(isItems){
         setSchemaValue(isItems);
       }
    }
    // state for toggle the view visibility
    const view = ['Graph' , 'Tree']
    const [isView, setInView] = useState(false); 
    const [isSelected , setIsSelected] = useState('Graph');
    return (
       <div ref={containerRef} className={`${isFullScreen ? "fixed inset-0 z-50 " : "relative z-10"}`}  >
            <div className='w-full px-2 py-1 bg-[var(--view-bg-color)]'>
                <div className='flex flex-row justify-between'>
                    <div className='flex flex-row space-x-5'>
                        <span className='text-md text-[var(--view-text-color)]'>JSON Schema</span>
                        <div className='relative'>
                            <button className='text-[var(--view-text-color)] cursor-pointer rounded-md px-1 flex flex-row items-center gap-x-1 hover:bg-white/50' onClick={() => setInView(!isView)}> View 
                                <CgChevronDown size={12} />
                            </button>   
                            {isView && (
                                <div className='absolute left-0 top-full mt-2 bg-[var(--view-bg-color)] rounded-sm px-2 py-1 z-50'>
                                    <ul className='flex flex-row gap-x-2 text-[var(--view-text-color)]'>
                                        {view.map((item) => (
                                          <li key={item}>
                                             <button onClick={() => setIsSelected(item)} className={`${isSelected === item ? 'bg-neutral-400 text-[var(-view-option-text-color)]' : 'bg-transparent text-gray-300 hover:bg-neutral-400'} px-2 py-1 rounded cursor-pointer`}>{item}</button>
                                          </li>
                                        ) )}
                                    </ul>
                               </div>
                            )}
                        </div>
                    </div>
                    <div className='mr-5 text-[var(--view-text-color)]'>
                        {toggleButton}
                    </div>
                </div>
            </div>
            <PanelGroup direction="horizontal">
              <Panel maxSize={editorPanelMaxSize} minSize={editorPanelMinSize} defaultSize={editorPanelMaxSize}>
                  <div className='flex flex-col h-[100vh] gap-y-1'>
                        <div className="flex-[8] overflow-hidden">
                            <Editor height={editorHeight} width={editorWidth}  defaultLanguage="json" value={schemaValue} theme={theme === 'light' ? 'vs-light' : 'vs-dark'} onMount={MonacoEditorDidMount} options={{
                                scrollbar: { horizontal: "hidden" },
                                minimap: { enabled: false }
                            }}
                            onChange={value => updateVisualizationFromJSON(value)}
                            />
                        </div>
                        <div className="flex-[2] bg-[var(--validation-bg-color)] text- text-sm py-2">
                            <div className="flex">
                                <h3 className="mx-4 rounded-md px-2 py-1 text-[var(--validation-text-color)] bg-[var(--validation-heading-color)]">Validation Result</h3>
                            </div>
                           <pre className="mt-2 whitespace-pre-wrap">{validationError}</pre>
                        </div>
                   </div>
                </Panel>
               <PanelResizeHandle className='pillar-handle'/>
               <Panel  defaultSize={visualizePanelMaxSize}>
                  {isEditorReady && (<SchemaVisualization schema={schemaValue} />)}
               </Panel>
          </PanelGroup>
       </div>
)}
export default MonacoEditor

