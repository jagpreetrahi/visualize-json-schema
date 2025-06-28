import Editor from '@monaco-editor/react';
import schema from '../data/dummy-schema.json'
import {  useContext , useState} from 'react';
import { MonacoEditorContext } from '../contexts/EditorContext';
import * as monaco from 'monaco-editor';
import  SchemaVisualization from './SchemaVisualization';

const  MonacoEditor = () => {
    const {editorRef,  editorHeight, editorWidth , isEditorFullScreen} = useContext(MonacoEditorContext);
    // Extract the schema to a state so that react tracks the schema updates
    const [schemaValue, setSchemaValue] = useState(JSON.stringify(schema, null, 2));

    {/*Assign the editor instance when the editor's mounted */}
    function MonacoEditorDidMount(editor: monaco.editor.IStandaloneCodeEditor) {
        editorRef.current = editor;
    }

    return (
        <>
           <div className={`${isEditorFullScreen ? "fixed inset-0 z-50 bg-white p-4" : "relative z-10"}`}>
                {/* <div className='flex justify-end items-center mt-1 mr-9 md:mr-5 px-2 py-1 md:px-4 md:py-2'>
                    {toggleButton}
                </div> */}

                <div className="flex flex-col">

                    <div className="flex flex-1 ">
                        {/* JSON Schema Editor */}
                        <div className="flex-1  overflow-hidden">
                            <Editor height={editorHeight} width={editorWidth} defaultLanguage="json" value={schemaValue}  theme='vs-dark' onMount={MonacoEditorDidMount} options={{scrollbar : {horizontal : 'hidden'} , minimap : {enabled : false}}} onChange={(value) => {setSchemaValue(value || '')}}/>
                            {/* Validation Result Panel */}
                            <div className="border rounded  h-1/5  p-4 bg-neutral-800 text-white text-sm">
                                <div className="flex justify-between items-center">
                                    <h3>Validation Result</h3>
                                </div>
                               <pre className="mt-2 whitespace-pre-wrap">{}</pre>
                            </div>
                        </div>
                        <SchemaVisualization schema = {schemaValue}/>
                    </div>

                    
                  
                </div>
           </div>
        </>
    )
     
}
export default MonacoEditor

