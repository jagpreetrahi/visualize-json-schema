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
        // console.log(schemaUri, schemaNodes)
        for (const [keywordHandlerName, keywordId, keywordValue] of schemaNodes) {
            if (keywordHandlerName === "https://json-schema.org/keyword/type") {
                schemaType = keywordValue;
                continue;
            }
            const handler = getKeywordHandler(keywordHandlerName);
            const { key, value } = handler(ast, keywordId, keywordValue, nodes, edges, schemaUri);
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


const keywordHandlers = {

    // // Core
    // "https://json-schema.org/keyword/dynamicRef": (dynamicAnchor, instance, ast, dynamicAnchors, coveredPropertiesMap, coveredItemsMap) => {
    //     if (!(dynamicAnchor in dynamicAnchors)) {
    //         throw Error(`No dynamic anchor found for "${dynamicAnchor}"`);
    //     }
    //     return evaluateSchema(dynamicAnchors[dynamicAnchor], instance, ast, dynamicAnchors, coveredPropertiesMap, coveredItemsMap);
    // },
    // "https://json-schema.org/keyword/draft-2020-12/dynamicRef": ([id, fragment, ref], instance, ast, dynamicAnchors, coveredPropertiesMap, coveredItemsMap) => {
    //     if (fragment in ast.metaData[id].dynamicAnchors) {
    //         dynamicAnchors = { ...ast.metaData[id].dynamicAnchors, ...dynamicAnchors };
    //         return evaluateSchema(dynamicAnchors[fragment], instance, ast, dynamicAnchors, coveredPropertiesMap, coveredItemsMap);
    //     } else {
    //         return evaluateSchema(ref, instance, ast, dynamicAnchors, coveredPropertiesMap, coveredItemsMap, coveredPropertiesMap, coveredItemsMap);
    //     }
    // },
    "https://json-schema.org/keyword/ref": (ast: AST, _keywordId, keywordValue, nodes, edges, parentId) => {
        processAST(ast, keywordValue, nodes, edges, parentId);
        return { key: "$ref", value: [keywordValue] }
    },
    // "https://json-schema.org/keyword/comment": (_keywordValue, instance) => instance,
    "https://json-schema.org/keyword/definitions": (ast: AST, _keywordId, keywordValue, nodes, edges, parentId) => {
        for (const value of keywordValue) {
            processAST(ast, value, nodes, edges, parentId);
        }
        return { key: "$defs", value: keywordValue.length }
    },

    // // Applicator
    "https://json-schema.org/keyword/allOf": (ast: AST, _keywordId, keywordValue, nodes, edges, parentId) => {
        for (const item of keywordValue) {
            processAST(ast, item, nodes, edges, parentId);
        }
        return { key: "allOf", value: keywordValue.length }
    },
    "https://json-schema.org/keyword/anyOf": (ast: AST, _keywordId, keywordValue, nodes, edges, parentId) => {
        for (const item of keywordValue) {
            processAST(ast, item, nodes, edges, parentId);
        }
        return { key: "anyOf", value: keywordValue.length }
    },
    "https://json-schema.org/keyword/oneOf": (ast: AST, _keywordId, keywordValue, nodes, edges, parentId) => {
        for (const item of keywordValue) {
            processAST(ast, item, nodes, edges, parentId);
        }
        return { key: "oneOf", value: keywordValue.length }
    },
    // "https://json-schema.org/keyword/if": (ifSchema, instance, ast, dynamicAnchors, coveredPropertiesMap, coveredItemsMap) => {
    //     const instanceCopy = JSON.parse(JSON.stringify(instance));
    //     const instanceWithDefaults = evaluateSchema(ifSchema, instanceCopy, ast, dynamicAnchors, coveredPropertiesMap, coveredItemsMap);
    //     const validationResult = Validation.interpret(ifSchema, Instance.fromJs(instance), { ast, dynamicAnchors, errors: [], annotations: [], outputFormat: FLAG });
    //     return validationResult ? instanceWithDefaults : instance;
    // },
    // "https://json-schema.org/keyword/then": ([ifSchema, thenSchema], instance, ast, dynamicAnchors, coveredPropertiesMap, coveredItemsMap) => {
    //     // const instanceCopy = JSON.parse(JSON.stringify(instance));
    //     // const instanceWithDefaults = evaluateSchema(ifSchema, instanceCopy, ast, dynamicAnchors);
    //     const validationResult = Validation.interpret(ifSchema, Instance.fromJs(instance), { ast, dynamicAnchors, errors: [], annotations: [], outputFormat: FLAG });
    //     return validationResult ? evaluateSchema(thenSchema, instance, ast, dynamicAnchors, coveredPropertiesMap, coveredItemsMap) : instance;
    // },
    // "https://json-schema.org/keyword/else": ([ifSchema, elseSchema], instance, ast, dynamicAnchors, coveredPropertiesMap, coveredItemsMap) => {
    //     // const instanceCopy = JSON.parse(JSON.stringify(instance));
    //     // const instanceWithDefaults = evaluateSchema(ifSchema, instanceCopy, ast, dynamicAnchors);
    //     const validationResult = Validation.interpret(ifSchema, Instance.fromJs(instance), { ast, dynamicAnchors, errors: [], annotations: [], outputFormat: FLAG });
    //     return !validationResult ? evaluateSchema(elseSchema, instance, ast, dynamicAnchors, coveredPropertiesMap, coveredItemsMap) : instance;
    // },
    "https://json-schema.org/keyword/properties": (ast: AST, _keywordId, keywordValue, nodes, edges, parentId) => {
        const propertyNames = [];
        for (const [key, value] of Object.entries(keywordValue)) {
            propertyNames.push(key);
            processAST(ast, value as string, nodes, edges, parentId);
        }
        return { key: "properties", value: propertyNames }
    },
    // "https://json-schema.org/keyword/additionalProperties": ([isDefinedProperty, additionalProperties], instance, ast, dynamicAnchors, coveredPropertiesMap, coveredItemsMap) => {
    //     if (isObject(instance)) {
    //         for (const propertyName in instance) {
    //             if (!isDefinedProperty.test(propertyName)) {
    //                 instance[propertyName] = evaluateSchema(additionalProperties, instance[propertyName], ast, dynamicAnchors, coveredPropertiesMap, coveredItemsMap);

    //                 const parentSchema = getParentSchema(additionalProperties, "additionalProperties");
    //                 if (parentSchema in coveredPropertiesMap) {
    //                     coveredPropertiesMap[parentSchema].push(propertyName);
    //                 } else {
    //                     coveredPropertiesMap[parentSchema] = [propertyName];
    //                 }
    //             }
    //         }
    //     }
    //     return instance;
    // },
    // "https://json-schema.org/keyword/patternProperties": (patternProperties, instance, ast, dynamicAnchors, coveredPropertiesMap, coveredItemsMap) => {
    //     const instanceCopy = JSON.parse(JSON.stringify(instance));
    //     if (isObject(instance)) {
    //         for (const propertyName in instanceCopy) {
    //             for (const [pattern, property] of patternProperties) {
    //                 if (pattern.test(propertyName)) {
    //                     instanceCopy[propertyName] = evaluateSchema(property, instanceCopy[propertyName], ast, dynamicAnchors, coveredPropertiesMap, coveredItemsMap);

    //                     const parentSchema = getParentSchema(property, "patternProperties");
    //                     if (parentSchema in coveredPropertiesMap) {
    //                         coveredPropertiesMap[parentSchema].push(propertyName);
    //                     } else {
    //                         coveredPropertiesMap[parentSchema] = [propertyName];
    //                     }
    //                 }
    //             }
    //         }
    //     }
    //     return instanceCopy;
    // },
    // "https://json-schema.org/keyword/dependentSchemas": (dependentSchemas, instance, ast, dynamicAnchors, coveredPropertiesMap, coveredItemsMap) => {
    //     if (isObject(instance)) {
    //         for (const [propertyName, propertySchema] of dependentSchemas) {
    //             if (propertyName in instance) {
    //                 instance = evaluateSchema(propertySchema, instance, ast, dynamicAnchors, coveredPropertiesMap, coveredItemsMap);
    //             }
    //         }
    //     }
    //     return instance;
    // },
    "https://json-schema.org/keyword/contains": (ast: AST, _keywordId, keywordValue, nodes, edges, parentId) => {
        processAST(ast, keywordValue["contains"], nodes, edges, parentId);
        return { key: "contains", value: keywordValue }
    },
    // "https://json-schema.org/keyword/items": ([numberOfPrefixItems, items], instance, ast, dynamicAnchors, coveredPropertiesMap, coveredItemsMap) => {
    //     if (Array.isArray(instance)) {
    //         for (let i = numberOfPrefixItems; i < instance.length; i++) {
    //             const instanceWithDefaults = evaluateSchema(items, instance[i], ast, dynamicAnchors, coveredPropertiesMap, coveredItemsMap);
    //             instance[i] = instanceWithDefaults;

    //             const parentSchema = getParentSchema(items, "items");
    //             if (parentSchema in coveredItemsMap) {
    //                 coveredItemsMap[parentSchema].push(i);
    //             } else {
    //                 coveredItemsMap[parentSchema] = [i];
    //             }
    //         }
    //     }
    //     return instance;
    // },
    // "https://json-schema.org/keyword/prefixItems": (prefixItems, instance, ast, dynamicAnchors, coveredPropertiesMap, coveredItemsMap) => {
    //     if (Array.isArray(instance)) {
    //         for (const [index, prefixItem] of prefixItems.entries()) {
    //             const value = evaluateSchema(prefixItem, instance[index], ast, dynamicAnchors, coveredPropertiesMap, coveredItemsMap);
    //             if (value !== undefined) {
    //                 instance[index] = value;

    //                 const parentSchema = getParentSchema(prefixItem, "prefixItems");
    //                 if (parentSchema in coveredItemsMap) {
    //                     coveredItemsMap[parentSchema].push(index);
    //                 } else {
    //                     coveredItemsMap[parentSchema] = [index];
    //                 }
    //             }
    //         }
    //     }
    //     return instance;
    // },
    // "https://json-schema.org/keyword/not": (_keywordValue, instance) => instance,
    // "https://json-schema.org/keyword/propertyNames": (_keywordValue, instance) => instance,

    // // Validation
    "https://json-schema.org/keyword/type": (ast: AST, _keywordId, keywordValue, nodes, edges, parentId) => {
        return { key: "type", value: keywordValue }
    },
    "https://json-schema.org/keyword/enum": (ast: AST, _keywordId, keywordValue, nodes, edges, parentId) => {
        return { key: "enum", value: keywordValue }
    },
    "https://json-schema.org/keyword/const": (ast: AST, _keywordId, keywordValue, nodes, edges, parentId) => {
        return { key: "const", value: keywordValue }
    },
    "https://json-schema.org/keyword/maxLength": (ast: AST, _keywordId, keywordValue, nodes, edges, parentId) => {
        return { key: "maxLength", value: keywordValue }
    },
    "https://json-schema.org/keyword/minLength": (ast: AST, _keywordId, keywordValue, nodes, edges, parentId) => {
        return { key: "minLength", value: keywordValue }
    },
    "https://json-schema.org/keyword/pattern": (ast: AST, _keywordId, keywordValue, nodes, edges, parentId) => {
        return { key: "pattern", value: keywordValue }
    },
    "https://json-schema.org/keyword/exclusiveMaximum": (ast: AST, _keywordId, keywordValue, nodes, edges, parentId) => {
        return { key: "exclusiveMaximum", value: keywordValue }
    },
    "https://json-schema.org/keyword/exclusiveMinimum": (ast: AST, _keywordId, keywordValue, nodes, edges, parentId) => {
        return { key: "exclusiveMinimum", value: keywordValue }
    },
    "https://json-schema.org/keyword/maximum": (ast: AST, _keywordId, keywordValue, nodes, edges, parentId) => {
        return { key: "maximum", value: keywordValue }
    },
    "https://json-schema.org/keyword/minimum": (ast: AST, _keywordId, keywordValue, nodes, edges, parentId) => {
        return { key: "minimum", value: keywordValue }
    },
    "https://json-schema.org/keyword/multipleOf": (ast: AST, _keywordId, keywordValue, nodes, edges, parentId) => {
        return { key: "multipleOf", value: keywordValue }
    },
    "https://json-schema.org/keyword/dependentRequired": (ast: AST, _keywordId, keywordValue, nodes, edges, parentId) => {
        return { key: "dependentRequired", value: keywordValue }
    },
    "https://json-schema.org/keyword/maxProperties": (ast: AST, _keywordId, keywordValue, nodes, edges, parentId) => {
        return { key: "maxProperties", value: keywordValue }
    },
    "https://json-schema.org/keyword/minProperties": (ast: AST, _keywordId, keywordValue, nodes, edges, parentId) => {
        return { key: "minProperties", value: keywordValue }
    },
    "https://json-schema.org/keyword/required": (ast: AST, _keywordId, keywordValue, nodes, edges, parentId) => {
        return { key: "requied", value: keywordValue }
    },
    "https://json-schema.org/keyword/maxItems": (ast: AST, _keywordId, keywordValue, nodes, edges, parentId) => {
        return { key: "maxItems", value: keywordValue }
    },
    "https://json-schema.org/keyword/minItems": (ast: AST, _keywordId, keywordValue, nodes, edges, parentId) => {
        return { key: "minItems", value: keywordValue }
    },
    "https://json-schema.org/keyword/maxContains": (ast: AST, _keywordId, keywordValue, nodes, edges, parentId) => {
        return { key: "maxContains", value: keywordValue }
    },
    "https://json-schema.org/keyword/minContains": (ast: AST, _keywordId, keywordValue, nodes, edges, parentId) => {
        return { key: "minContains", value: keywordValue }
    },
    "https://json-schema.org/keyword/uniqueItems": (ast: AST, _keywordId, keywordValue, nodes, edges, parentId) => {
        return { key: "uniqueItems", value: keywordValue }
    },

    // // Meta Data
    "https://json-schema.org/keyword/default": (ast: AST, _keywordId, keywordValue, nodes, edges, parentId) => {
        return { key: "default", value: keywordValue }
    },
    "https://json-schema.org/keyword/title": (ast: AST, _keywordId, keywordValue, nodes, edges, parentId) => {
        return { key: "title", value: keywordValue }
    },
    "https://json-schema.org/keyword/description": (ast: AST, _keywordId, keywordValue, nodes, edges, parentId) => {
        return { key: "description", value: keywordValue }
    },
    "https://json-schema.org/keyword/deprecated": (ast: AST, _keywordId, keywordValue, nodes, edges, parentId) => {
        return { key: "deprecated", value: keywordValue }
    },
    "https://json-schema.org/keyword/examples": (ast: AST, _keywordId, keywordValue, nodes, edges, parentId) => {
        return { key: "examples", value: keywordValue }
    },
    "https://json-schema.org/keyword/readOnly": (ast: AST, _keywordId, keywordValue, nodes, edges, parentId) => {
        return { key: "readOnly", value: keywordValue }
    },
    "https://json-schema.org/keyword/writeOnly": (ast: AST, _keywordId, keywordValue, nodes, edges, parentId) => {
        return { key: "writeOnly", value: keywordValue }
    },

    // // Format Annotation
    "https://json-schema.org/keyword/format": (ast: AST, _keywordId, keywordValue, nodes, edges, parentId) => {
        return { key: "format", value: keywordValue }
    },

    // // Format Assertion
    // "https://json-schema.org/keyword/format-assertion": (_keywordValue, instance) => instance,

    // // Content
    "https://json-schema.org/keyword/contentEncoding": (ast: AST, _keywordId, keywordValue, nodes, edges, parentId) => {
        return { key: "contentEncoding", value: keywordValue }
    },
    "https://json-schema.org/keyword/contentMediaType": (ast: AST, _keywordId, keywordValue, nodes, edges, parentId) => {
        return { key: "contentMediaType", value: keywordValue }
    },
    "https://json-schema.org/keyword/contentSchema": (ast: AST, _keywordId, keywordValue, nodes, edges, parentId) => {
        return { key: "contentSchema", value: keywordValue }
    },

    // // Unknown keywords
    // "https://json-schema.org/keyword/unknown": (unknown, instance) => instance,

    // // Unevaluated
    // "https://json-schema.org/keyword/unevaluatedProperties": ([parentSchema, unevaluatedProperties], instance, ast, dynamicAnchors, coveredPropertiesMap, coveredItemsMap) => {
    //     if (isObject(instance)) {
    //         const coveredProperties = [];
    //         for (const key in coveredPropertiesMap) {
    //             if (key.includes(parentSchema)) {
    //                 coveredProperties.push(...coveredPropertiesMap[key]);
    //             }
    //         }
    //         for (const propertyName in instance) {
    //             if (!coveredProperties.includes(propertyName)) {
    //                 const value = evaluateSchema(unevaluatedProperties, instance[propertyName], ast, dynamicAnchors, coveredPropertiesMap, coveredItemsMap);
    //                 instance[propertyName] = value;

    //                 const parentSchema = getParentSchema(unevaluatedProperties, "unevaluatedProperties");
    //                 if (parentSchema in coveredPropertiesMap) {
    //                     coveredPropertiesMap[parentSchema].push(propertyName);
    //                 } else {
    //                     coveredPropertiesMap[parentSchema] = [propertyName];
    //                 }
    //             }
    //         }
    //     }
    //     return instance;
    // },
    // "https://json-schema.org/keyword/unevaluatedItems": ([parentSchema, unevaluatedItems], instance, ast, dynamicAnchors, coveredPropertiesMap, coveredItemsMap) => {
    //     if (Array.isArray(instance)) {
    //         const coveredItems = [];
    //         for (const key in coveredItemsMap) {
    //             if (key.includes(parentSchema)) {
    //                 coveredItems.push(...coveredItemsMap[key]);
    //             }
    //         }
    //         for (const [index, _] of instance.entries()) {
    //             if (!coveredItems.includes(index)) {
    //                 const instanceWithDefaults = evaluateSchema(unevaluatedItems, instance[index], ast, dynamicAnchors, coveredPropertiesMap, coveredItemsMap);
    //                 instance[index] = instanceWithDefaults;

    //                 const parentSchema = getParentSchema(unevaluatedItems, "unevaluatedItems");
    //                 if (parentSchema in coveredItemsMap) {
    //                     coveredItemsMap[parentSchema].push(index);
    //                 } else {
    //                     coveredItemsMap[parentSchema] = [index];
    //                 }
    //             }
    //         }
    //     }
    //     return instance;
    // }
};