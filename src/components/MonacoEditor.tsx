import { useContext, useState, useEffect } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import {
  registerSchema,
  unregisterSchema,
  type SchemaObject,
} from "@hyperjump/json-schema/draft-2020-12";
import {
  getSchema,
  compile,
  type CompiledSchema,
} from "@hyperjump/json-schema/experimental";
import Editor from "@monaco-editor/react";
import defaultSchema from "../data/defaultJSONSchema.json";
import { AppContext } from "../contexts/AppContext";
import SchemaVisualization from "./SchemaVisualization";
import FullscreenToggleButton from "./FullscreenToggleButton";

type ValidationStatus = {
  status: "success" | "warning" | "error";
  message: string;
};

const MonacoEditor = () => {
  const { theme, isFullScreen, containerRef } = useContext(AppContext);

  const [compiledSchema, setCompiledSchema] = useState<CompiledSchema | null>(
    null
  );

  const DEFAULT_SCHEMA_DIALECT = "https://json-schema.org/draft/2020-12/schema";
  const DEFAULT_SCHEMA_ID = "https://example.com/schema";
  const SESSION_STORAGE_KEY = "JSON Schema";
  const VALIDATION_MESSAGE = {
    success: "✓ Valid JSON Schema",
    warning: `⚠ Schema dialect not provided. Using default dialect, that is ${DEFAULT_SCHEMA_DIALECT}`,
  };
  const statusClassMap: Record<ValidationStatus["status"], string> = {
    error: "text-red-400",
    warning: "text-yellow-400",
    success: "text-green-400 font-semibold",
  };

  const [schemaText, setSchemaText] = useState<string>(
    window.sessionStorage.getItem(SESSION_STORAGE_KEY)?.trim() ??
      JSON.stringify(defaultSchema, null, 2)
  );

  const [schemaValidation, setSchemaValidation] = useState<ValidationStatus>({
    status: "success",
    message: VALIDATION_MESSAGE["success"],
  });

  useEffect(() => {
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, schemaText);
  }, [schemaText]);

  useEffect(() => {
    if (!schemaText.trim()) return;

    (async () => {
      try {
        const parsed = JSON.parse(schemaText);

        const schemaDialect = parsed.$schema ?? DEFAULT_SCHEMA_DIALECT;
        const schemaId = parsed.$id ?? DEFAULT_SCHEMA_ID;

        unregisterSchema(schemaId);
        registerSchema(parsed, schemaId, schemaDialect);

        const schemaDoc = await getSchema(schemaId);

        setCompiledSchema(await compile(schemaDoc));
        setSchemaValidation(
          parsed.$schema
            ? {
                status: "success",
                message: VALIDATION_MESSAGE["success"],
              }
            : {
                status: "warning",
                message: VALIDATION_MESSAGE["warning"],
              }
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);

        setSchemaValidation({
          status: "error",
          message,
        });
      }
    })();
  }, [schemaText]);

  return (
    <div ref={containerRef} className="h-[92vh] flex flex-col">
      {isFullScreen && (
        <div className="w-full px-1 bg-[var(--view-bg-color)] justify-items-end">
          <div className="text-[var(--view-text-color)]">
            <FullscreenToggleButton />
          </div>
        </div>
      )}
      <PanelGroup direction="horizontal">
        <Panel className="flex flex-col" minSize={10} defaultSize={25}>
          <Editor
            height="90%"
            width="100%"
            defaultLanguage="json"
            value={schemaText}
            theme={theme === "light" ? "vs-light" : "vs-dark"}
            options={{ minimap: { enabled: false } }}
            onChange={(value) => setSchemaText(value ?? "")}
          />
          <div className="flex-1 p-2 bg-[var(--validation-bg-color)] text-sm overflow-y-auto">
            <div className={statusClassMap[schemaValidation.status]}>
              {schemaValidation.message}
            </div>
          </div>
        </Panel>
        <PanelResizeHandle className="w-[1px] bg-gray-400" />
        <Panel
          minSize={60}
          className="flex flex-col relative bg-[var(--visualize-bg-color)]"
        >
          <SchemaVisualization compiledSchema={compiledSchema} />
        </Panel>
      </PanelGroup>
    </div>
  );
};
export default MonacoEditor;
