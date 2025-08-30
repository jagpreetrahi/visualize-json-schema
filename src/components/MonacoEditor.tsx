import { useCallback, useContext, useState, useRef, useEffect } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import {
  registerSchema,
  unregisterSchema,
} from "@hyperjump/json-schema/draft-2020-12";
import {
  getSchema,
  compile,
  type CompiledSchema,
} from "@hyperjump/json-schema/experimental";
import * as monaco from "monaco-editor";
import Editor from "@monaco-editor/react";
import schema from "../data/defaultSchema.json";
import { AppContext } from "../contexts/AppContext";
import SchemaVisualization from "./SchemaVisualization";
import FullscreenToggleButton from "./FullscreenToggleButton";

type ValidationState =
  | { status: "idle" }
  | { status: "valid" }
  | { status: "error"; message: string };

const MonacoEditor = () => {
  console.count("aaa");
  const { theme, isFullScreen, containerRef } = useContext(AppContext);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [validationState, setValidationState] = useState<ValidationState>({
    status: "idle",
  });
  const [compiledSchema, setCompiledSchema] = useState<CompiledSchema | null>(
    null
  );
  const [schemaValue, setSchemaValue] = useState<string | undefined>(
    window.sessionStorage.getItem("JSON Schema") ??
      JSON.stringify(schema, null, 2)
  );

  const compileSchema = useCallback(async (value: string | undefined) => {
    if (!value) return;

    let schemaId: string;
    try {
      setValidationState({ status: "idle" });
      const parsedSchema = JSON.parse(value);
      schemaId = parsedSchema.$id;

      unregisterSchema(schemaId);
      registerSchema(parsedSchema, schemaId);

      const schemaDocument = await getSchema(schemaId);
      const compiledSchema = await compile(schemaDocument);

      setCompiledSchema(compiledSchema);
      setValidationState({ status: "valid" });
      if (value !== schemaValue) {
        setSchemaValue(value);
      }
      window.sessionStorage.setItem("JSON Schema", value);
    } catch (err) {
      setCompiledSchema(null);
      setValidationState({
        status: "error",
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }, []);

  useEffect(() => {
    compileSchema(schemaValue);
  }, [compileSchema, schemaValue]);

  const handleEditorMount = useCallback(
    (editor: monaco.editor.IStandaloneCodeEditor) => {
      editorRef.current = editor;
    },
    []
  );

  return (
    <div ref={containerRef} className="h-[85vh] flex flex-col">
      {isFullScreen && (
        <div className="w-full px-1 bg-[var(--view-bg-color)] justify-items-end">
          <div className="text-[var(--view-text-color)]">
            <FullscreenToggleButton />
          </div>
        </div>
      )}
      <PanelGroup direction="horizontal">
        <Panel className="flex flex-col" minSize={10} defaultSize={35}>
          <Editor
            height="90%"
            width="100%"
            defaultLanguage="json"
            value={schemaValue}
            theme={theme === "light" ? "vs-light" : "vs-dark"}
            onMount={handleEditorMount}
            options={{ minimap: { enabled: false } }}
            onChange={compileSchema}
          />
          {validationState.status !== "idle" && (
            <div className="flex-1 p-2 bg-[var(--validation-bg-color)] text-sm overflow-y-auto">
              {validationState.status === "error" ? (
                <div className="text-red-400">{validationState.message}</div>
              ) : (
                <div className="text-green-400 font-semibold">
                  ✓ Valid JSON Schema
                </div>
              )}
            </div>
          )}
        </Panel>
        <PanelResizeHandle className="panel-resize-handle" />
        <Panel minSize={60} className="flex flex-col relative">
          <SchemaVisualization compiledSchema={compiledSchema} />
        </Panel>
      </PanelGroup>
    </div>
  );
};
export default MonacoEditor;
