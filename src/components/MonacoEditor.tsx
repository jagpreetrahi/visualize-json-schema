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

const DEFAULT_SCHEMA_ID = "https://studio.ioflux.org/schema";
const DEFAULT_SCHEMA_DIALECT = "https://json-schema.org/draft/2020-12/schema";
const SESSION_STORAGE_KEY = "ioflux.schema.editor.content";

const VALIDATION_UI = {
  success: {
    message: "✓ Valid JSON Schema",
    className: "text-green-400 font-semibold",
  },
  warning: {
    message: `⚠ Schema dialect not provided. Using default dialect: ${DEFAULT_SCHEMA_DIALECT}`,
    className: "text-yellow-400",
  },
  error: {
    message: "✗ ",
    className: "text-red-400",
  },
};

const MonacoEditor = () => {
  const { theme, isFullScreen, containerRef } = useContext(AppContext);

  const [compiledSchema, setCompiledSchema] = useState<CompiledSchema | null>(
    null
  );

  const [schemaText, setSchemaText] = useState<string>(
    window.sessionStorage.getItem(SESSION_STORAGE_KEY)?.trim() ??
      JSON.stringify(defaultSchema, null, 2)
  );

  const [schemaValidation, setSchemaValidation] = useState<ValidationStatus>({
    status: "success",
    message: VALIDATION_UI["success"].message,
  });

  useEffect(() => {
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, schemaText);
  }, [schemaText]);

  useEffect(() => {
    if (!schemaText.trim()) return;

    const timeout = setTimeout(async () => {
      try {
        // INFO: parsedSchema is mutated by buildSchemaDocument function
        const parsedSchema = JSON.parse(schemaText);

        const dialect = parsedSchema.$schema;
        const dialectVersion = dialect ?? DEFAULT_SCHEMA_DIALECT;
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
                message: VALIDATION_UI["warning"].message,
              }
            : {
                status: "success",
                message: VALIDATION_UI["success"].message,
              }
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);

        setSchemaValidation({
          status: "error",
          message: VALIDATION_UI["error"].message + message,
        });
      }
    }, 300);

    return () => clearTimeout(timeout);
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
            <div className={VALIDATION_UI[schemaValidation.status].className}>
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
