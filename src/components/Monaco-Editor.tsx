import Editor from '@monaco-editor/react';
import schema from './../data/dummy-schema.json'
import {  useRef  } from 'react';


import * as monaco from 'monaco-editor';

interface MonacoEditorProps{
    height : string,
    width : string,
    togglebutton?: React.ReactNode
}

function MonacoEditor({height, width, togglebutton} : MonacoEditorProps) {

    const editorRef =  useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    

    interface MonacoEditorDidMountProps {
        editor: monaco.editor.IStandaloneCodeEditor;  // editor instance
        monaco: typeof monaco;
    }

    function MonacoEditorDidMount(editor: MonacoEditorDidMountProps['editor'], monaco: MonacoEditorDidMountProps['monaco']) {
        editorRef.current = editor;
    }

    
    
  return  <>
    <div className='flex justify-end items-center mt-1 mr-9 px-2 py-1'>
        <button>{togglebutton}</button>
    </div>

    <div className="flex flex-col  gap-4">

       <div className="flex flex-1 gap-2">
            {/* JSON Schema Editor */}
            
            <div className="flex-1  overflow-hidden">
                
                <Editor height={height} width={width} defaultLanguage="json" defaultValue={JSON.stringify(schema , null , 2)}  theme='vs-light' onMount={MonacoEditorDidMount} options={{scrollbar : {horizontal : 'hidden'} , minimap : {enabled : false}}}/>;
            </div>

            {/* Visualization Editor */}
            <div className="flex-1  overflow-hidden">
            
            <Editor height={height} width={width} defaultLanguage="json" defaultValue={JSON.stringify(schema , null , 2)}  theme='vs-light' onMount={MonacoEditorDidMount} options={{scrollbar : {horizontal : 'hidden' , vertical : 'hidden'} , minimap : {enabled : false}}}/>;
            </div>
        </div>

        {/* Validation Result Panel */}
        <div className="border rounded p-4 bg-gray-900 text-white text-sm">
            <div className="flex justify-between items-center">
            <h3>Validation Result</h3>
            
            </div>
            <pre className="mt-2 whitespace-pre-wrap">{}</pre>
        </div>
    </div>
     
    

    </>
}

export default MonacoEditor

