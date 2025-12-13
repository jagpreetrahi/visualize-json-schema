import type { AST, Node } from "@hyperjump/json-schema/experimental";
import { toAbsoluteIri } from "@hyperjump/uri";
import { Position } from "@xyflow/react";
import { inferSchemaType } from "./inferSchemaType";

export type GraphNode = {
    id: string;
    type: string;
    data: RFNodeData;
};

export type RFNodeData = {
    nodeLabel: string,
    isBooleanNode: boolean,
    nodeData: Record<string, unknown>,
    nodeStyle: Partial<NodeStyle>,
    sourceHandles: HandleConfig[],
    targetHandles: HandleConfig[]
}

type NodeStyle = {
    color: string
}

export type GraphEdge = {
    id: string;
    source: string;
    target: string;
    sourceHandle: string;
    targetHandle: string;
};

type ProcessASTParams = {
    ast: AST,
    schemaUri: string,
    nodes: GraphNode[],
    edges: GraphEdge[],
    parentId: string,
    nodeTitle: string,
    renderedNodes?: string[],
    childId?: string
};

type KeywordHandlerParams = [
    ast: AST,
    keywordValue: unknown,
    nodes: GraphNode[],
    edges: GraphEdge[],
    parentId: string,
    renderedNodes?: string[]
];

export type HandleConfig = {
    handleId: string;
    position: Position;
}

type UpdateNodeOptionalParameters = Partial<{
    nodeData: Record<string, unknown>,
    nodeStyle: NodeStyle,
    addTargetHandle: HandleConfig
}>

type ProcessAST = (params: ProcessASTParams) => void;
type KeywordHandler = (...args: KeywordHandlerParams) => { key?: string, value?: unknown, leafNode?: boolean, defs?: boolean };
type GetKeywordHandler = (handlerName: string) => KeywordHandler;
type KeywordHandlerMap = Record<string, KeywordHandler>;
type CreateBasicKeywordHandler = (key: string) => KeywordHandler;
type GetArrayFromNumber = (number: number) => number[];
type GetSourceHandle = (parentId: string, childId?: string) => string;
type GenerateSourceHandles = (keywordValue: unknown, nodeId: string, defs: boolean | undefined) => HandleConfig[];
type UpdateNode = (nodes: GraphNode[], schemaUri: string, update: UpdateNodeOptionalParameters) => void;


const neonColors = {
    string: "#FF6EFF", // neon magenta
    number: "#00FF95", // neon mint
    boolean: "#FFEA00", // neon yellow
    array: "#FF8F00", // neon amber
    object: "#00E5FF", // neon cyan
    null: "#A259FF", // neon purple
    booleanSchemaTrue: "#12FF4B", // neon green
    booleanSchemaFalse: "#FF3B3B", // neon red 
    reference: "#FFE1BD", // soft neon cream
    others: "#CCCCCC", // soft gray
};

export const processAST: ProcessAST = ({ ast, schemaUri, nodes, edges, parentId, childId, renderedNodes = [], nodeTitle }) => {
    if (renderedNodes.includes(schemaUri)) {
        const sourceHandle = getSourceHandle(parentId, childId);
        const targetHandle = `${getSourceHandle(parentId, childId)}-target`;
        edges.push({
            id: `${parentId}-${schemaUri}`,
            source: parentId,
            target: schemaUri,
            sourceHandle: sourceHandle,
            targetHandle: targetHandle
        });
        updateNode(
            nodes,
            schemaUri,
            { addTargetHandle: { handleId: targetHandle, position: Position.Top } }
        );
        return;
    }

    const schemaNodes: boolean | Node<unknown>[] = ast[schemaUri];
    const nodeData: Record<string, unknown> = {};
    const sourceHandles: HandleConfig[] = [];
    const targetHandles: HandleConfig[] = [];

    renderedNodes.push(schemaUri);
    nodes.push({
        id: schemaUri,
        type: "customNode",
        data: {
            nodeLabel: nodeTitle,
            isBooleanNode: (typeof schemaNodes === "boolean"),
            nodeData: {},
            nodeStyle: {},
            sourceHandles,
            targetHandles
        }
    });

    if (typeof schemaNodes === "boolean") {
        nodeData["booleanSchema"] = schemaNodes;
    } else {
        for (const [keywordHandlerName, , keywordValue] of schemaNodes) {
            const handler = getKeywordHandler(toAbsoluteIri(keywordHandlerName));
            const { key, value, leafNode, defs } = handler(ast, keywordValue, nodes, edges, schemaUri, renderedNodes);

            if (key) {
                nodeData[key] = value;
            }
            if (!leafNode) {
                sourceHandles.push(...generateSourceHandles(value, schemaUri, defs));
            }
        }
    }

    const getColor = (nodeData: Record<string, unknown>) => {
        const [, definedFor] = inferSchemaType(nodeData);
        return (
            neonColors[definedFor as keyof typeof neonColors] ?? neonColors.others
        );
    };

    const color = getColor(nodeData);
    const sourceHandle = getSourceHandle(parentId, childId);
    const targetHandle = `${getSourceHandle(parentId, childId)}-target`;

    edges.push({
        id: `${parentId}-${schemaUri}`,
        source: parentId,
        target: schemaUri,
        sourceHandle: sourceHandle,
        targetHandle: targetHandle
    });

    updateNode(
        nodes,
        schemaUri,
        { nodeData, nodeStyle: { color: color }, addTargetHandle: { handleId: targetHandle, position: Position.Left } }
    );
};

const getSourceHandle: GetSourceHandle = (parentId, childId) => {
    if (childId) return `${parentId}-${childId}`;
    return parentId;
};

const generateSourceHandles: GenerateSourceHandles = (keywordValue, nodeId, defs) => {
    if (defs) return [{
        handleId: `${nodeId}-definitions`,
        position: Position.Bottom
    }];

    // CASE 1: Array --> generate 1 handle per element
    if (Array.isArray(keywordValue)) {
        return keywordValue.map((eachValue) => ({
            handleId: `${nodeId}-${eachValue}`,
            position: Position.Right
        }))
    }

    // CASE 2: Everything else --> 1 handle for this property
    return [{
        handleId: `${nodeId}`,
        position: Position.Right
    }];
}

const updateNode: UpdateNode = (nodes, nodeId, update) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) {
        // throw new Error(`Node with id ${nodeId} not found`);
        console.log(`Node with id ${nodeId} not found`)
        return;
    }

    if (update.nodeData) {
        Object.assign(node.data.nodeData, update.nodeData);
    }

    if (update.nodeStyle) {
        Object.assign(node.data.nodeStyle, update.nodeStyle);
    }

    if (update.addTargetHandle) {
        node.data.targetHandles.push(update.addTargetHandle);
    }
};

const getKeywordHandler: GetKeywordHandler = (handlerName) => {
    if (!(handlerName in keywordHandlerMap)) {
        // throw Error(`No handler found for Keyword: ${handlerName}`);
        return fallbackHandler(handlerName);
    }
    return keywordHandlerMap[handlerName];
}

const fallbackHandler: GetKeywordHandler = (handlerName) => {
    const keyword = handlerName.split('/').pop();
    console.warn(`⚠️ Keyword handler for "${keyword}" is not implemented yet.`);

    return (_ast, _keywordValue, _nodes, _edges, _parentId) => {
        return { key: keyword, value: `⚠️  This keyword handler is not implemented yet!` }
    }
};

const createBasicKeywordHandler: CreateBasicKeywordHandler = (key) => {
    return (_ast, keywordValue, _nodes, _edges, _parentId) => {
        return { key, value: key === "unknown" ? JSON.stringify(keywordValue) : keywordValue, leafNode: true }
    }
}

const getArrayFromNumber: GetArrayFromNumber = (number) => (
    Array.from({ length: number }, (_, i) => i)
);

const keywordHandlerMap: KeywordHandlerMap = {

    // Core
    // "https://json-schema.org/keyword/dynamicRef": createBasicKeywordHandler("$dynamicRef"),
    // "https://json-schema.org/keyword/draft-2020-12/dynamicRef": createBasicKeywordHandler("$dynamicRef"),
    "https://json-schema.org/keyword/ref": (ast, keywordValue, nodes, edges, parentId, renderedNodes) => {
        processAST({ ast, schemaUri: keywordValue as string, nodes, edges, parentId, renderedNodes, nodeTitle: "" });
        return { key: "$ref", value: keywordValue }
    },
    "https://json-schema.org/keyword/comment": createBasicKeywordHandler("$comment"),
    "https://json-schema.org/keyword/definitions": (ast, keywordValue, nodes, edges, parentId, renderedNodes) => {
        ast["https://json-schema.org/keyword/$defs"] = [
            [
                "https://json-schema.org/keyword/$defs",
                `${parentId}/$defs`,
                keywordValue
            ]
        ];
        processAST({ ast, schemaUri: "https://json-schema.org/keyword/$defs", nodes, edges, parentId, renderedNodes, childId: "definitions", nodeTitle: "definitions" });
        return { defs: true }
    },
    "https://json-schema.org/keyword/$defs": (ast, keywordValue, nodes, edges, parentId, renderedNodes) => {
        const value = keywordValue as string[];
        for (const [index, item] of value.entries()) {
            processAST({ ast, schemaUri: item, nodes, edges, parentId, renderedNodes, childId: String(index), nodeTitle: `defs[${index}]` });
        }
        return { key: "$defs", value: getArrayFromNumber(value.length) }
    },

    // Applicator
    "https://json-schema.org/keyword/allOf": (ast, keywordValue, nodes, edges, parentId, renderedNodes) => {
        const value = keywordValue as string[];
        for (const [index, item] of value.entries()) {
            processAST({ ast, schemaUri: item, nodes, edges, parentId, renderedNodes, childId: String(index), nodeTitle: `allOf[${index}]` });
        }
        return { key: "allOf", value: getArrayFromNumber(value.length) }
    },
    "https://json-schema.org/keyword/anyOf": (ast, keywordValue, nodes, edges, parentId, renderedNodes) => {
        const value = keywordValue as string[];
        for (const [index, item] of value.entries()) {
            processAST({ ast, schemaUri: item, nodes, edges, parentId, renderedNodes, childId: String(index), nodeTitle: `anyOf[${index}]` });
        }
        return { key: "anyOf", value: getArrayFromNumber(value.length) }
    },
    "https://json-schema.org/keyword/oneOf": (ast, keywordValue, nodes, edges, parentId, renderedNodes) => {
        const value = keywordValue as string[];
        for (const [index, item] of value.entries()) {
            processAST({ ast, schemaUri: item, nodes, edges, parentId, renderedNodes, childId: String(index), nodeTitle: `oneOf[${index}]` });
        }
        return { key: "oneOf", value: getArrayFromNumber(value.length) }
    },
    "https://json-schema.org/keyword/if": (ast, keywordValue, nodes, edges, parentId, renderedNodes) => {
        processAST({ ast, schemaUri: keywordValue as string, nodes, edges, parentId, renderedNodes, nodeTitle: "if" });
        return { key: "if", value: keywordValue }
    },
    "https://json-schema.org/keyword/then": (ast, keywordValue, nodes, edges, parentId, renderedNodes) => {
        const value = keywordValue as string[];
        processAST({ ast, schemaUri: value[1] as string, nodes, edges, parentId, renderedNodes, nodeTitle: "then" });
        return { key: "then", value: value[1] }
    },
    "https://json-schema.org/keyword/else": (ast, keywordValue, nodes, edges, parentId, renderedNodes) => {
        const value = keywordValue as string[];
        processAST({ ast, schemaUri: value[1], nodes, edges, parentId, renderedNodes, nodeTitle: "else" });
        return { key: "else", value: value[1] }
    },
    "https://json-schema.org/keyword/properties": (ast, keywordValue, nodes, edges, parentId, renderedNodes) => {
        const propertyNames = [];
        for (const [key, value] of Object.entries(keywordValue as string)) {
            propertyNames.push(key);
            processAST({ ast, schemaUri: value, nodes, edges, parentId, renderedNodes, childId: key, nodeTitle: `properties["${key}"]` });
        }
        return { key: "properties", value: propertyNames }
    },
    "https://json-schema.org/keyword/additionalProperties": (ast, keywordValue, nodes, edges, parentId, renderedNodes) => {
        const value = keywordValue as string[];
        processAST({ ast, schemaUri: value[1], nodes, edges, parentId, renderedNodes, nodeTitle: "additionalProperties" });
        return { key: "additionalProperties", value: value[1] }
    },
    "https://json-schema.org/keyword/patternProperties": (ast, keywordValue, nodes, edges, parentId, renderedNodes) => {
        const value = keywordValue as string[];
        for (const [index, item] of value.entries()) {
            processAST({ ast, schemaUri: item[1], nodes, edges, parentId, renderedNodes, childId: String(index), nodeTitle: "patternProperties" });
        }
        return { key: "patternProperties", value: getArrayFromNumber(value.length) }
    },
    // "https://json-schema.org/keyword/dependentSchemas": createBasicKeywordHandler("dependentSchemas"),
    "https://json-schema.org/keyword/contains": (ast, keywordValue, nodes, edges, parentId, renderedNodes) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        processAST({ ast, keywordValue: keywordValue["contains"], nodes, edges, parentId, renderedNodes, nodeTitle: "contains" });
        return { key: "contains", value: keywordValue }
    },
    "https://json-schema.org/keyword/items": (ast, keywordValue, nodes, edges, parentId, renderedNodes) => {
        const value = keywordValue as string[];
        processAST({ ast, schemaUri: value[1], nodes, edges, parentId, renderedNodes, nodeTitle: "items" });
        return { key: "items", value: value[1] }
    },
    "https://json-schema.org/keyword/prefixItems": (ast, keywordValue, nodes, edges, parentId, renderedNodes) => {
        const value = keywordValue as string[];
        for (const [index, item] of value.entries()) {
            processAST({ ast, schemaUri: item, nodes, edges, parentId, renderedNodes, childId: String(index), nodeTitle: `prefixItems[${index}]` });
        }
        return { key: "prefixItems", value: getArrayFromNumber(value.length) }
    },
    "https://json-schema.org/keyword/not": (ast, keywordValue, nodes, edges, parentId, renderedNodes) => {
        processAST({ ast, schemaUri: keywordValue as string, nodes, edges, parentId, renderedNodes, nodeTitle: "not" });
        return { key: "not", value: keywordValue }
    },
    "https://json-schema.org/keyword/propertyNames": (ast, keywordValue, nodes, edges, parentId, renderedNodes) => {
        processAST({ ast, schemaUri: keywordValue as string, nodes, edges, parentId, renderedNodes, nodeTitle: "propertyNames" });
        return { key: "propertyNames", value: keywordValue }
    },

    // Validation
    "https://json-schema.org/keyword/type": createBasicKeywordHandler("type"),
    "https://json-schema.org/keyword/enum": createBasicKeywordHandler("enum"),
    "https://json-schema.org/keyword/const": createBasicKeywordHandler("const"),
    "https://json-schema.org/keyword/maxLength": createBasicKeywordHandler("maxLength"),
    "https://json-schema.org/keyword/minLength": createBasicKeywordHandler("minLength"),
    "https://json-schema.org/keyword/pattern": createBasicKeywordHandler("pattern"),
    "https://json-schema.org/keyword/exclusiveMaximum": createBasicKeywordHandler("exclusiveMaximum"),
    "https://json-schema.org/keyword/exclusiveMinimum": createBasicKeywordHandler("exclusiveMinimum"),
    "https://json-schema.org/keyword/maximum": createBasicKeywordHandler("maximum"),
    "https://json-schema.org/keyword/minimum": createBasicKeywordHandler("minimum"),
    "https://json-schema.org/keyword/multipleOf": createBasicKeywordHandler("multipleOf"),
    "https://json-schema.org/keyword/dependentRequired": createBasicKeywordHandler("dependentRequired"),
    "https://json-schema.org/keyword/maxProperties": createBasicKeywordHandler("maxProperties"),
    "https://json-schema.org/keyword/minProperties": createBasicKeywordHandler("minProperties"),
    "https://json-schema.org/keyword/required": createBasicKeywordHandler("required"),
    "https://json-schema.org/keyword/maxItems": createBasicKeywordHandler("maxItems"),
    "https://json-schema.org/keyword/minItems": createBasicKeywordHandler("minItems"),
    "https://json-schema.org/keyword/maxContains": createBasicKeywordHandler("maxContains"),
    "https://json-schema.org/keyword/minContains": createBasicKeywordHandler("minContains"),
    "https://json-schema.org/keyword/uniqueItems": createBasicKeywordHandler("uniqueItems"),

    // Meta Data
    "https://json-schema.org/keyword/default": createBasicKeywordHandler("default"),
    "https://json-schema.org/keyword/title": createBasicKeywordHandler("title"),
    "https://json-schema.org/keyword/description": createBasicKeywordHandler("description"),
    "https://json-schema.org/keyword/deprecated": createBasicKeywordHandler("deprecated"),
    "https://json-schema.org/keyword/examples": createBasicKeywordHandler("examples"),
    "https://json-schema.org/keyword/readOnly": createBasicKeywordHandler("readOnly"),
    "https://json-schema.org/keyword/writeOnly": createBasicKeywordHandler("writeOnly"),

    // Format Annotation
    "https://json-schema.org/keyword/format": createBasicKeywordHandler("format"),

    // Format Assertion
    // "https://json-schema.org/keyword/format-assertion": createBasicKeywordHandler("format-assertion"),

    // Content
    "https://json-schema.org/keyword/contentEncoding": createBasicKeywordHandler("contentEncoding"),
    "https://json-schema.org/keyword/contentMediaType": createBasicKeywordHandler("contentMediaType"),
    "https://json-schema.org/keyword/contentSchema": createBasicKeywordHandler("contentSchema"),

    // Unknown keywords
    "https://json-schema.org/keyword/unknown": createBasicKeywordHandler("unknown"),

    // Unevaluated
    "https://json-schema.org/keyword/unevaluatedProperties": (ast, keywordValue, nodes, edges, parentId, renderedNodes) => {
        const value = keywordValue as string[];
        processAST({ ast, schemaUri: value[1], nodes, edges, parentId, renderedNodes, nodeTitle: "unevaluatedProperties" });
        return { key: "unevaluatedProperties", value: value[1] }
    },
    "https://json-schema.org/keyword/unevaluatedItems": (ast, keywordValue, nodes, edges, parentId, renderedNodes) => {
        const value = keywordValue as string[];
        processAST({ ast, schemaUri: value[1], nodes, edges, parentId, renderedNodes, nodeTitle: "unevaluatedItems" });
        return { key: "unevaluatedItems", value: value[1] }
    }
};
