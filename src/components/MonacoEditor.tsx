import Editor from "@monaco-editor/react";
import schema from "../data/dummy-schema.json";
import { useCallback, useContext, useState, useMemo } from "react";
import { MonacoEditorContext } from "../contexts/EditorContext";
import { ThemeContext } from "../contexts/ThemeContext";
import * as monaco from "monaco-editor";
import SchemaVisualization from "./SchemaVisualization";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

const MonacoEditor = () => {
  const {
    editorRef,
    editorHeight,
    editorWidth,
    isFullScreen,
    containerRef,
    toggleButton,
  } = useContext(MonacoEditorContext);
  const { theme } = useContext(ThemeContext);
  // Extract the schema to a state so that react tracks the schema updates
  const [schemaValue, setSchemaValue] = useState(
    JSON.stringify(schema, null, 2)
  );
  const [validationError, setValidationError] = useState("");
  const [isEditorReady, setIsEditorReady] = useState(false);
  //define the panel size for editor and visualization
  const editorPanelMaxSize: number = 40;
  const editorPanelMinSize: number = 20;
  const visualizePanelMaxSize: number = 70;
  // validates the JSON Schema before creation the visualization and prevent the un-necessary creation
  const updateVisualizationFromJSON = useCallback(
    (jsonString: string | undefined) => {
      if (!jsonString || jsonString.trim() === "") {
        setValidationError("Empty JSON schema");
        return;
      }
      try {
        const parsedSchema = JSON.parse(jsonString);
        if (typeof parsedSchema === "object" || parsedSchema !== null) {
          setSchemaValue(jsonString);
          setValidationError("");
        }
        window.sessionStorage.setItem("JSON Schema", jsonString);
      } catch (error: any) {
        setValidationError(`Invalid JSON: ${error.message}`);
      }
    },
    [schemaValue]
  );

  {
    /*Assign the editor instance when the editor's mounted */
  }
  function MonacoEditorDidMount(editor: monaco.editor.IStandaloneCodeEditor) {
    editorRef.current = editor;
    setIsEditorReady(true);
    const isItems = window.sessionStorage.getItem("JSON Schema");
    if (isItems) {
      setSchemaValue(isItems);
    }
  }

  // Memoized validation result to prevent unnecessary renders
  const validationDisplay = useMemo(() => {
    if (validationError) {
      return <span className="text-red-400">{validationError}</span>;
    }
    return <span className="text-green-400">✓ Valid JSON Schema</span>;
  }, [validationError]);

  return (
    <div
      ref={containerRef}
        className={`${isFullScreen ? "fixed inset-0 z-50 " : "relative z-10"}`}
    >
      <div className="w-full px-2 py-1 mt-1 bg-[var(--view-bg-color)] justify-items-end">
        {isFullScreen && (
          <div className="text-[var(--view-text-color)]">{toggleButton}</div>
        )}
      </div>
      <PanelGroup direction="horizontal">
        <Panel
          maxSize={editorPanelMaxSize}
          minSize={editorPanelMinSize}
          defaultSize={editorPanelMaxSize}
        >
          <div className="flex flex-col h-[100vh] gap-y-1">
            <div className="flex-[8] overflow-hidden">
              <Editor
                height={editorHeight}
                width={editorWidth}
                defaultLanguage="json"
                value={schemaValue}
                theme={theme === "light" ? "vs-light" : "vs-dark"}
                onMount={MonacoEditorDidMount}
                options={{
                  scrollbar: { horizontal: "hidden" },
                  minimap: { enabled: false },
                }}
                onChange={(value) => updateVisualizationFromJSON(value)}
              />
            </div>
            <div className="flex-[2] w-[40vw] bg-[var(--validation-bg-color)] text- text-sm py-2">
              <div className="flex">
                <h3 className="mx-4 rounded-md px-2 py-1 text-[var(--validation-text-color)] bg-[var(--validation-heading-color)]">
                  Validation Result
                </h3>
              </div>
              <pre className="mt-2 whitespace-pre-wrap">
                {validationDisplay}
              </pre>
            </div>
          </div>
        </Panel>
        <PanelResizeHandle className="pillar-handle" />
        <Panel defaultSize={visualizePanelMaxSize}>
          {isEditorReady && <SchemaVisualization schema={schemaValue} />}
        </Panel>
      </PanelGroup>
    </div>
  );
};
export default MonacoEditor;
