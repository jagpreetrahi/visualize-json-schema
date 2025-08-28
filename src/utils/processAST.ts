import type { AST } from "@hyperjump/json-schema/experimental";


export type GraphNode = {
    id: string;
    data: { label: string, type: string | undefined, nodeData: Record<string, string | object | unknown[]> };
    type: string;
};

export type GraphEdge = {
    id: string;
    source: string;
    target: string;
};

export const processAST = (
    ast: AST,
    schemaUri: string,
    nodes: GraphNode[],
    edges: GraphEdge[],
    parentId: string
) => {
    const schemaNodes = ast[schemaUri];
    const nodeData: Record<string, string | object | unknown[]> = {};
    let schemaType: string = "";

    if (typeof schemaNodes !== 'boolean') {
        for (const [keywordHandlerName, , keywordValue] of schemaNodes) {
            if (keywordHandlerName === "https://json-schema.org/keyword/type") {
                schemaType = keywordValue;
                continue;
            }
            const handler = getKeywordHandler(keywordHandlerName);
            const { key, value } = handler(ast, keywordValue, nodes, edges, schemaUri);
            nodeData[key] = value;
        }
    }
    const newNode: GraphNode = {
        id: schemaUri,
        type: "customNode",
        data: { label: "", type: schemaType ? schemaType : "N/A", nodeData: nodeData }
    }
    if (parentId) {
        const newEdge: GraphEdge = {
            id: `${parentId}-${schemaUri}`,
            source: parentId,
            target: schemaUri
        }
        edges.push(newEdge)
    }
    nodes.push(newNode)
    // return { nodes, edges };
};

const getKeywordHandler = (handlerName: string): () => void => {
    if (!(handlerName in keywordHandlers)) {
        throw Error(`No handler found for Keyword: ${handlerName}`);
    }
    return keywordHandlers[handlerName];
}

const createBasicKeywordHandler = (key: string) => {
    return (
        _ast,
        keywordValue,
        _nodes,
        _edges,
        _parentId
    ) => {
        return { key, value: keywordValue }
    }
}

const keywordHandlers = {

    // Core
    // "https://json-schema.org/keyword/dynamicRef": createBasicKeywordHandler("$dynamicRef"),
    // "https://json-schema.org/keyword/draft-2020-12/dynamicRef": createBasicKeywordHandler("$dynamicRef"),
    "https://json-schema.org/keyword/ref": (ast: AST, keywordValue, nodes, edges, parentId) => {
        processAST(ast, keywordValue, nodes, edges, parentId);
        return { key: "$ref", value: [keywordValue] }
    },
    "https://json-schema.org/keyword/comment": createBasicKeywordHandler("$comment"),
    "https://json-schema.org/keyword/definitions": (ast: AST, keywordValue, nodes, edges, parentId) => {
        for (const item of keywordValue) {
            processAST(ast, item, nodes, edges, parentId);
        }
        return { key: "$defs", value: keywordValue.length }
    },

    // Applicator
    "https://json-schema.org/keyword/allOf": (ast: AST, keywordValue, nodes, edges, parentId) => {
        for (const item of keywordValue) {
            processAST(ast, item, nodes, edges, parentId);
        }
        return { key: "allOf", value: keywordValue.length }
    },
    "https://json-schema.org/keyword/anyOf": (ast: AST, keywordValue, nodes, edges, parentId) => {
        for (const item of keywordValue) {
            processAST(ast, item, nodes, edges, parentId);
        }
        return { key: "anyOf", value: keywordValue.length }
    },
    "https://json-schema.org/keyword/oneOf": (ast: AST, keywordValue, nodes, edges, parentId) => {
        for (const item of keywordValue) {
            processAST(ast, item, nodes, edges, parentId);
        }
        return { key: "oneOf", value: keywordValue.length }
    },
    "https://json-schema.org/keyword/if": (ast: AST, keywordValue, nodes, edges, parentId) => {
        processAST(ast, keywordValue, nodes, edges, parentId);
        return { key: "if", value: keywordValue }
    },
    "https://json-schema.org/keyword/then": (ast: AST, keywordValue, nodes, edges, parentId) => {
        processAST(ast, keywordValue[1], nodes, edges, parentId);
        return { key: "then", value: keywordValue[1] }
    },
    "https://json-schema.org/keyword/else": (ast: AST, keywordValue, nodes, edges, parentId) => {
        processAST(ast, keywordValue[1], nodes, edges, parentId);
        return { key: "else", value: keywordValue[1] }
    },
    "https://json-schema.org/keyword/properties": (ast: AST, keywordValue, nodes, edges, parentId) => {
        const propertyNames = [];
        for (const [key, value] of Object.entries(keywordValue)) {
            propertyNames.push(key);
            processAST(ast, value as string, nodes, edges, parentId);
        }
        return { key: "properties", value: propertyNames }
    },
    "https://json-schema.org/keyword/additionalProperties": (ast: AST, keywordValue, nodes, edges, parentId) => {
        processAST(ast, keywordValue[1], nodes, edges, parentId);
        return { key: "additionalProperties", value: keywordValue[1] }
    },
    "https://json-schema.org/keyword/patternProperties": (ast: AST, keywordValue, nodes, edges, parentId) => {
        for (const item of keywordValue) {
            processAST(ast, item[1], nodes, edges, parentId);
        }
        return { key: "patternProperties", value: keywordValue.length }
    },
    // "https://json-schema.org/keyword/dependentSchemas": createBasicKeywordHandler("dependentSchemas"),
    "https://json-schema.org/keyword/contains": (ast: AST, nodes, edges, parentId) => {
        processAST(ast, keywordValue["contains"], nodes, edges, parentId);
        return { key: "contains", value: keywordValue }
    },
    "https://json-schema.org/keyword/items": (ast: AST, nodes, edges, parentId) => {
        processAST(ast, keywordValue[1], nodes, edges, parentId);
        return { key: "items", value: keywordValue }
    },
    "https://json-schema.org/keyword/prefixItems": (ast: AST, keywordValue, nodes, edges, parentId) => {
        for (const item of keywordValue) {
            processAST(ast, item, nodes, edges, parentId);
        }
        return { key: "prefixItems", value: keywordValue.length }
    },
    "https://json-schema.org/keyword/not": (ast: AST, keywordValue, nodes, edges, parentId) => {
        processAST(ast, keywordValue, nodes, edges, parentId);
        return { key: "not", value: keywordValue }
    },
    "https://json-schema.org/keyword/propertyNames": (ast: AST, keywordValue, nodes, edges, parentId) => {
        processAST(ast, keywordValue, nodes, edges, parentId);
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
    // "https://json-schema.org/keyword/unknown": createBasicKeywordHandler("unknown"),

    // Unevaluated
    // "https://json-schema.org/keyword/unevaluatedProperties": createBasicKeywordHandler("unevaluatedProperties"),
    // "https://json-schema.org/keyword/unevaluatedItems": createBasicKeywordHandler("unevaluatedItems")
};
