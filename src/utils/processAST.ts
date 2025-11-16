import type { AST } from "@hyperjump/json-schema/experimental";
import { toAbsoluteIri } from "@hyperjump/uri";

export type GraphNode = {
    id: string;
    type: string;
    data: {
        label: string,
        type?: string,
        nodeData: Record<string, unknown>,
        isLeafNode?: boolean
    };
};

export type GraphEdge = {
    id: string;
    source: string;
    target: string;
};

type ASTContext = [
    ast: AST,
    schemaUri: string,
    nodes: GraphNode[],
    edges: GraphEdge[],
    parentId: string,
    renderedNodes?: string[]
];

type ProcessAST = (...args: ASTContext) => void;
type KeywordHandler = (...args: ASTContext) => { key?: string, value?: unknown, LeafNode?: boolean };
type GetKeywordHandler = (handlerName: string) => KeywordHandler;
type KeywordHandlerMap = Record<string, KeywordHandler>;
type CreateBasicKeywordHandler = (key: string) => KeywordHandler;

export const processAST: ProcessAST = (ast, schemaUri, nodes, edges, parentId, renderedNodes = [], subSchemaCount = undefined) => {
    if (renderedNodes.includes(schemaUri)) {
        if (parentId) {
            edges.push({
                id: `${parentId}-${schemaUri}`,
                source: parentId,
                target: schemaUri
            });
        }
        return;
    }

    const schemaNodes = ast[schemaUri];
    const nodeData: Record<string, unknown> = {};
    let schemaType: string | undefined;
    let isLeafNode: boolean | undefined = false;
    let containsDefinition: boolean = false;

    renderedNodes.push(schemaUri);
    nodeData["nodeId"] = schemaUri;

    if (typeof schemaNodes === "boolean") {
        // console.log(222);
        nodeData["booleanSchema"] = schemaNodes;
        isLeafNode = true;
    } else {
        for (const [keywordHandlerName, , keywordValue] of schemaNodes) {
            const handler = getKeywordHandler(toAbsoluteIri(keywordHandlerName));
            const { key, value, LeafNode, defs } = handler(ast, keywordValue as string, nodes, edges, schemaUri, renderedNodes);

            if (defs) containsDefinition = true;
            if (key) {
                nodeData[key] = value;
                if (key === "type") schemaType = value as string;
            }
            isLeafNode = LeafNode;
        }
    }

    nodes.push({
        id: schemaUri,
        type: "customNode",
        data: { label: "", type: schemaType, nodeData, isLeafNode, containsDefinition }
    });

    if (parentId) {
        // console.log({
        //     id: `${parentId}-${schemaUri}`,
        //     source: parentId,
        //     target: schemaUri,
        //     // ...(subSchemaCount !==  undefined && { sourceHandle: String(subSchemaCount) })
        //     sourceHandle: subSchemaCount !== undefined ? `${parentId}-${subSchemaCount}` : parentId
        // })
        edges.push({
            id: `${parentId}-${schemaUri}`,
            source: parentId,
            target: schemaUri,
            // ...(subSchemaCount !==  undefined && { sourceHandle: String(subSchemaCount) })
            sourceHandle:
                subSchemaCount === true
                    ? `${parentId}-definitions`
                    : subSchemaCount !== undefined
                        ? `${parentId}-${subSchemaCount}`
                        : parentId
        });
    }
    // return { nodes, edges };

};

const getKeywordHandler: GetKeywordHandler = (handlerName) => {
    if (!(handlerName in keywordHandlerMap)) {
        throw Error(`No handler found for Keyword: ${handlerName}`);
    }
    return keywordHandlerMap[handlerName];
}

const createBasicKeywordHandler: CreateBasicKeywordHandler = (key) => {
    return (_ast, keywordValue, _nodes, _edges, _parentId) => {
        return { key, value: keywordValue, LeafNode: true }
    }
}

const keywordHandlerMap: KeywordHandlerMap = {

    // Core
    // "https://json-schema.org/keyword/dynamicRef": createBasicKeywordHandler("$dynamicRef"),
    // "https://json-schema.org/keyword/draft-2020-12/dynamicRef": createBasicKeywordHandler("$dynamicRef"),
    "https://json-schema.org/keyword/ref": (ast, keywordValue, nodes, edges, parentId, renderedNodes) => {
        processAST(ast, keywordValue, nodes, edges, parentId, renderedNodes);
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
        // for (const item of keywordValue) {
        processAST(ast, "https://json-schema.org/keyword/$defs", nodes, edges, parentId, renderedNodes, true);
        // }
        // return { key: "$defs", value: keywordValue.length }
        return { defs: true }
    },
    "https://json-schema.org/keyword/$defs": (ast, keywordValue, nodes, edges, parentId, renderedNodes) => {
        for (const [index, item] of keywordValue.entries()) {
            processAST(ast, item, nodes, edges, parentId, renderedNodes, index);
        }
        return { key: "$defs", value: keywordValue.length }
    },

    // Applicator
    "https://json-schema.org/keyword/allOf": (ast, keywordValue, nodes, edges, parentId, renderedNodes) => {
        for (const [index, item] of keywordValue.entries()) {
            processAST(ast, item, nodes, edges, parentId, renderedNodes, index);
        }
        return { key: "allOf", value: keywordValue.length }
    },
    "https://json-schema.org/keyword/anyOf": (ast, keywordValue, nodes, edges, parentId, renderedNodes) => {
        for (const [index, item] of keywordValue.entries()) {
            processAST(ast, item, nodes, edges, parentId, renderedNodes, index);
        }
        return { key: "anyOf", value: keywordValue.length }
    },
    "https://json-schema.org/keyword/oneOf": (ast, keywordValue, nodes, edges, parentId, renderedNodes) => {
        for (const [index, item] of keywordValue.entries()) {
            processAST(ast, item, nodes, edges, parentId, renderedNodes, index);
        }
        return { key: "oneOf", value: keywordValue.length }
    },
    "https://json-schema.org/keyword/if": (ast, keywordValue, nodes, edges, parentId, renderedNodes) => {
        processAST(ast, keywordValue, nodes, edges, parentId, renderedNodes);
        return { key: "if", value: keywordValue }
    },
    "https://json-schema.org/keyword/then": (ast, keywordValue, nodes, edges, parentId, renderedNodes) => {
        processAST(ast, keywordValue[1], nodes, edges, parentId, renderedNodes);
        return { key: "then", value: keywordValue[1] }
    },
    "https://json-schema.org/keyword/else": (ast, keywordValue, nodes, edges, parentId, renderedNodes) => {
        processAST(ast, keywordValue[1], nodes, edges, parentId, renderedNodes);
        return { key: "else", value: keywordValue[1] }
    },
    "https://json-schema.org/keyword/properties": (ast, keywordValue, nodes, edges, parentId, renderedNodes) => {
        const propertyNames = [];
        for (const [key, value] of Object.entries(keywordValue)) {
            propertyNames.push(key);
            processAST(ast, value as string, nodes, edges, parentId, renderedNodes, key);
        }
        return { key: "properties", value: propertyNames }
    },
    "https://json-schema.org/keyword/additionalProperties": (ast, keywordValue, nodes, edges, parentId, renderedNodes) => {
        processAST(ast, keywordValue[1], nodes, edges, parentId, renderedNodes);
        return { key: "additionalProperties", value: keywordValue[1] }
    },
    "https://json-schema.org/keyword/patternProperties": (ast, keywordValue, nodes, edges, parentId, renderedNodes) => {
        for (const [index, item] of keywordValue.entries()) {
            processAST(ast, item[1], nodes, edges, parentId, renderedNodes, index);
        }
        return { key: "patternProperties", value: keywordValue.length }
    },
    // "https://json-schema.org/keyword/dependentSchemas": createBasicKeywordHandler("dependentSchemas"),
    "https://json-schema.org/keyword/contains": (ast, keywordValue, nodes, edges, parentId, renderedNodes) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        processAST(ast, keywordValue["contains"], nodes, edges, parentId, renderedNodes);
        return { key: "contains", value: keywordValue }
    },
    "https://json-schema.org/keyword/items": (ast, keywordValue, nodes, edges, parentId, renderedNodes) => {
        processAST(ast, keywordValue[1], nodes, edges, parentId, renderedNodes);
        return { key: "items", value: keywordValue }
    },
    "https://json-schema.org/keyword/prefixItems": (ast, keywordValue, nodes, edges, parentId, renderedNodes) => {
        for (const [index, item] of keywordValue.entries()) {
            processAST(ast, item, nodes, edges, parentId, renderedNodes, index);
        }
        return { key: "prefixItems", value: keywordValue.length }
    },
    "https://json-schema.org/keyword/not": (ast, keywordValue, nodes, edges, parentId, renderedNodes) => {
        processAST(ast, keywordValue, nodes, edges, parentId, renderedNodes);
        return { key: "not", value: keywordValue }
    },
    "https://json-schema.org/keyword/propertyNames": (ast, keywordValue, nodes, edges, parentId, renderedNodes) => {
        processAST(ast, keywordValue, nodes, edges, parentId, renderedNodes);
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
    // "https://json-schema.org/keyword/unevaluatedProperties": createBasicKeywordHandler("unevaluatedProperties"),
    // "https://json-schema.org/keyword/unevaluatedItems": createBasicKeywordHandler("unevaluatedItems")
};
