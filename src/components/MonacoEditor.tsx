import Editor from "@monaco-editor/react";
import schema from "../data/defaultSchema.json";
import { useCallback, useContext, useState, useRef } from "react";
import * as monaco from "monaco-editor";
import SchemaVisualization from "./SchemaVisualization";
import FullscreenToggleButton from "./FullscreenToggleButton";
import { AppContext } from "../contexts/AppContext";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import {
  registerSchema,
  unregisterSchema,
} from "@hyperjump/json-schema/draft-2020-12";

const MonacoEditor = () => {
  const { theme, isFullScreen, containerRef } = useContext(AppContext);

  const [validationError, setValidationError] = useState("");
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [schemaValue, setSchemaValue] = useState(
    JSON.stringify(schema, null, 2)
  );

  const editorPanelMinWidth: number = 25;
  const editorPanelDefaultWidth: number = 35;
  const visualizePanelMinWidth: number = 60;

  const editorHeight: string = "90%";
  const editorWidth: string = "100%";
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const handleChange = useCallback(
    async (jsonSchemaString: string | undefined) => {
      setValidationError("empty");
      if (!jsonSchemaString) return;

      try {
        setValidationError("");
        const parsedSchema = JSON.parse(jsonSchemaString);
        const schemaId = parsedSchema.$id;
        unregisterSchema(schemaId);

        registerSchema(parsedSchema, schemaId);
        setSchemaValue(jsonSchemaString);

        window.sessionStorage.setItem("JSON Schema", jsonSchemaString);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setValidationError(err.message);
        } else {
          setValidationError(String(err));
        }
      }
    },
    []
  );

  {
    /*Assign the editor instance when the editor's mounted */
  }
  function MonacoEditorDidMount(editor: monaco.editor.IStandaloneCodeEditor) {
    editorRef.current = editor;
    setIsEditorReady(true);
    const prevSchema = window.sessionStorage.getItem("JSON Schema");
    if (prevSchema) {
      setSchemaValue(prevSchema);
    }
  }

  return (
    <div ref={containerRef} className="h-[85vh] flex flex-col">
      {isFullScreen ? (
        <div className="w-full px-1 bg-[var(--view-bg-color)] justify-items-end">
          <div className="text-[var(--view-text-color)]">
            <FullscreenToggleButton />
          </div>
        </div>
      ) : (
        <>{/* <ToolSummary /> */}</>
      )}
      <PanelGroup direction="horizontal">
        <Panel
          className="flex flex-col"
          minSize={editorPanelMinWidth}
          defaultSize={editorPanelDefaultWidth}
        >
          <Editor
            height={editorHeight}
            width={editorWidth}
            defaultLanguage="json"
            value={schemaValue}
            theme={theme === "light" ? "vs-light" : "vs-dark"}
            onMount={MonacoEditorDidMount}
            options={{
              minimap: { enabled: false },
            }}
            onChange={handleChange}
          />
          <div className="flex-1 p-2 bg-[var(--validation-bg-color)] text-sm overflow-y-auto">
            {validationError === "empty" ? null : validationError ? (
              <div className="text-red-400">{validationError}</div>
            ) : (
              <div className="text-green-400 font-semibold">
                ✓ Valid JSON Schema
              </div>
            )}
          </div>
        </Panel>
        <PanelResizeHandle className="panel-resize-handle" />
        <Panel
          minSize={visualizePanelMinWidth}
          className="flex flex-col relative"
        >
          {isEditorReady && <SchemaVisualization schema={schemaValue} />}
        </Panel>
      </PanelGroup>
    </div>
  );
};
export default MonacoEditor;
