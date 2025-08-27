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
    // "https://json-schema.org/keyword/allOf": (allOf, instance, ast, dynamicAnchors, coveredPropertiesMap, coveredItemsMap) => {
    //     for (const schema of allOf) {
    //         instance = evaluateSchema(schema, instance, ast, dynamicAnchors, coveredPropertiesMap, coveredItemsMap);
    //     }
    //     return instance;
    // },
    // "https://json-schema.org/keyword/anyOf": (anyOf, instance, ast, dynamicAnchors, coveredPropertiesMap, coveredItemsMap) => {
    //     for (const schema of anyOf) {
    //         const instanceWithDefaults = evaluateSchema(schema, instance, ast, dynamicAnchors, coveredPropertiesMap, coveredItemsMap);
    //         if (Validation.interpret(schema, Instance.fromJs(instanceWithDefaults), { ast, dynamicAnchors, errors: [], annotations: [], outputFormat: FLAG })) {
    //             instance = instanceWithDefaults;
    //         }
    //     }
    //     return instance;
    // },
    // "https://json-schema.org/keyword/oneOf": (oneOf, instance, ast, dynamicAnchors, coveredPropertiesMap, coveredItemsMap) => {
    //     for (const schema of oneOf) {
    //         const validationResult = instance ? Validation.interpret(schema, Instance.fromJs(instance), { ast, dynamicAnchors, errors: [], annotations: [], outputFormat: FLAG }) : false;
    //         instance = evaluateSchema(schema, instance, ast, dynamicAnchors, coveredPropertiesMap, coveredItemsMap);

    //         if (validationResult) return instance;
    //     }
    //     return instance;
    // },
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
    // // eslint-disable-next-line no-unused-vars
    // "https://json-schema.org/keyword/contains": ({ contains, minContains, maxContains }, instance, ast, dynamicAnchors, coveredPropertiesMap, coveredItemsMap) => {
    //     if (Array.isArray(instance)) {
    //         for (const [index, item] of instance.entries()) {
    //             const instanceWithDefaults = evaluateSchema(contains, item, ast, dynamicAnchors, coveredPropertiesMap, coveredItemsMap);
    //             instance[index] = instanceWithDefaults;

    //             const parentSchema = getParentSchema(contains, "contains");
    //             if (parentSchema in coveredItemsMap) {
    //                 coveredItemsMap[parentSchema].push(index);
    //             } else {
    //                 coveredItemsMap[parentSchema] = [index];
    //             }
    //         }
    //     }
    //     return instance;
    // },
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
    // "https://json-schema.org/keyword/type": (_keywordValue, instance) => instance,
    // "https://json-schema.org/keyword/enum": (_keywordValue, instance) => instance,
    "https://json-schema.org/keyword/const": (ast: AST, _keywordId, keywordValue, nodes, edges, parentId) => {
        return { key: "const", value: keywordValue }
    },
    // "https://json-schema.org/keyword/maxLength": (_keywordValue, instance) => instance,
    "https://json-schema.org/keyword/minLength": (ast: AST, _keywordId, keywordValue, nodes, edges, parentId) => {
        return { key: "minLength", value: keywordValue }
    },
    // "https://json-schema.org/keyword/pattern": (_keywordValue, instance) => instance,
    // "https://json-schema.org/keyword/exclusiveMaximum": (_keywordValue, instance) => instance,
    // "https://json-schema.org/keyword/exclusiveMinimum": (_keywordValue, instance) => instance,
    // "https://json-schema.org/keyword/maximum": (_keywordValue, instance) => instance,
    // "https://json-schema.org/keyword/minimum": (_keywordValue, instance) => instance,
    // "https://json-schema.org/keyword/multipleOf": (_keywordValue, instance) => instance,
    // "https://json-schema.org/keyword/dependentRequired": (_keywordValue, instance) => instance,
    // "https://json-schema.org/keyword/maxProperties": (_keywordValue, instance) => instance,
    // "https://json-schema.org/keyword/minProperties": (_keywordValue, instance) => instance,
    // "https://json-schema.org/keyword/required": (_keywordValue, instance) => instance,
    // "https://json-schema.org/keyword/maxItems": (_keywordValue, instance) => instance,
    // "https://json-schema.org/keyword/minItems": (_keywordValue, instance) => instance,
    // "https://json-schema.org/keyword/maxContains": (_keywordValue, instance) => instance,
    // "https://json-schema.org/keyword/minContains": (_keywordValue, instance) => instance,
    // "https://json-schema.org/keyword/uniqueItems": (_keywordValue, instance) => instance,

    // // Meta Data
    // "https://json-schema.org/keyword/default": (defaultValue, instance) => {
    //     return instance === undefined ? defaultValue : instance;
    // },
    // "https://json-schema.org/keyword/title": (_keywordValue, instance) => instance,
    // "https://json-schema.org/keyword/description": (_keywordValue, instance) => instance,
    // "https://json-schema.org/keyword/deprecated": (_keywordValue, instance) => instance,
    // "https://json-schema.org/keyword/examples": (_keywordValue, instance) => instance,
    // "https://json-schema.org/keyword/readOnly": (_keywordValue, instance) => instance,
    // "https://json-schema.org/keyword/writeOnly": (_keywordValue, instance) => instance,

    // // Format Annotation
    // "https://json-schema.org/keyword/format": (_keywordValue, instance) => instance,

    // // Format Assertion
    // "https://json-schema.org/keyword/format-assertion": (_keywordValue, instance) => instance,

    // // Content
    // "https://json-schema.org/keyword/contentEncoding": (_keywordValue, instance) => instance,
    // "https://json-schema.org/keyword/contentMediaType": (_keywordValue, instance) => instance,
    // "https://json-schema.org/keyword/contentSchema": (_keywordValue, instance) => instance,

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