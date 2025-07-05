import Editor from '@monaco-editor/react';
import schema from '../data/dummy-schema.json'
import {useContext, useState} from 'react';
import { MonacoEditorContext } from '../contexts/EditorContext';
import * as monaco from 'monaco-editor';
import SchemaVisualization from './SchemaVisualization';
import {Panel, PanelGroup, PanelResizeHandle} from 'react-resizable-panels'

const MonacoEditor = () => {
    const {editorRef,  editorHeight, editorWidth , isFullScreen, containerRef} = useContext(MonacoEditorContext);
    // Extract the schema to a state so that react tracks the schema updates
    const [schemaValue, setSchemaValue] = useState(JSON.stringify(schema, null, 2));
    //define the panel size for editor and visualization
      const editorPanelMaxSize : number = 40;
      const editorPanelMinSize : number = 30;
      const visualizePanelMaxSize : number = 70;
      const visualizePanelMinSIze :number = 60;

    {/*Assign the editor instance when the editor's mounted */}
    function MonacoEditorDidMount(editor: monaco.editor.IStandaloneCodeEditor) {
        editorRef.current = editor;
    }
    return (
       <div ref={containerRef} className={`${isFullScreen ? "fixed inset-0 z-50 p-4" : "relative z-10"}`}  >
          <PanelGroup direction="horizontal">
              <Panel maxSize={editorPanelMaxSize} minSize={editorPanelMinSize} defaultSize={editorPanelMaxSize}>
                  <div className='flex flex-col h-[100vh] gap-y-1'>
                        <div className="flex-[8] overflow-hidden">
                            <Editor height={editorHeight} width={editorWidth}  defaultLanguage="json" value={schemaValue} theme="vs-dark" onMount={MonacoEditorDidMount} options={{
                                scrollbar: { horizontal: "hidden" },
                                minimap: { enabled: false }
                            }}
                            onChange={(value) => setSchemaValue(value || "")}
                            />
                        </div>
                        <div className="flex-[2] bg-neutral-800 text-white text-sm py-2">
                            <div className="flex">
                                <h3 className="mx-4">Validation Result</h3>
                            </div>
                           <pre className="mt-2 whitespace-pre-wrap">{}</pre>
                        </div>
                   </div>
                
               </Panel>
               <PanelResizeHandle className='pillar-handle'/>
               <Panel maxSize={visualizePanelMaxSize} minSize={visualizePanelMinSIze} defaultSize={visualizePanelMinSIze}>
                   <SchemaVisualization schema={schemaValue} />
               </Panel>
          </PanelGroup>
       </div>
)}
export default MonacoEditor

