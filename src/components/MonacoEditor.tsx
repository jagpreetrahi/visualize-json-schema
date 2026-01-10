import { useContext, useState, useEffect } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
// INFO: modifying the following import statement to (import type { SchemaObject } from "@hyperjump/json-schema/draft-2020-12") creates error;
import { type SchemaObject } from "@hyperjump/json-schema/draft-2020-12";
import {
  getSchema,
  compile,
  buildSchemaDocument,
  type CompiledSchema,
  type SchemaDocument,
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

type CreateBrowser = (
  id: string,
  schemaDoc: SchemaDocument
) => {
  _cache: Record<string, SchemaDocument>;
};

const MonacoEditor = () => {
  const { theme, isFullScreen, containerRef } = useContext(AppContext);

  const [compiledSchema, setCompiledSchema] = useState<CompiledSchema | null>(
    null
  );

  const DEFAULT_DIALECT_VERSION =
    "https://json-schema.org/draft/2020-12/schema";
  const DEFAULT_SCHEMA_ID = "https://studio.ioflux.org/schema";
  const SESSION_STORAGE_KEY = "JSON Schema";
  const VALIDATION_MESSAGE = {
    success: "✓ Valid JSON Schema",
    warning: `⚠ Schema dialect not provided. Using default dialect, that is ${DEFAULT_DIALECT_VERSION}`,
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
        // INFO: parsedSchema is mutated by buildSchemaDocument function
        const parsedSchema = JSON.parse(schemaText);

        const dialect = parsedSchema.$schema;
        const dialectVersion = dialect ?? DEFAULT_DIALECT_VERSION;
        const schemaId = parsedSchema.$id ?? DEFAULT_SCHEMA_ID;

        const schemaDocument = buildSchemaDocument(
          parsedSchema as SchemaObject,
          schemaId,
          dialectVersion
        );

        const createBrowser: CreateBrowser = (id, schemaDoc) => {
          return {
            _cache: {
              [id]: schemaDoc,
            },
          };
        };

        const browser = createBrowser(schemaId, schemaDocument);
        // @ts-expect-error
        const schema = await getSchema(schemaDocument.baseUri, browser);

        setCompiledSchema(await compile(schema));
        setSchemaValidation(
          !dialect && typeof parsedSchema !== "boolean"
            ? {
                status: "warning",
                message: VALIDATION_MESSAGE["warning"],
              }
            : {
                status: "success",
                message: VALIDATION_MESSAGE["success"],
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
