import $RefParser from "@apidevtools/json-schema-ref-parser";
// Types
type CyNode = {
  data: {
    type?: string,
    id: string;
    label: string;
    isCenter?: boolean;
    description?: string;
    required?: boolean
  };
};

type CyEdge = {
  data: {
    id : string
    source: string;
    target: string;
  };
};

type CyElement = CyNode | CyEdge;
interface SchemaContext{
  elements : CyElement[],
  maxDepth : number,
  depth: number,
  preserveRef: boolean,
  visitedSchema: WeakMap<object, string>
  rootSchema :any
}

export async function schemaPreserveRef(schema:any , options : {maxDepth?: number, resolveInternal?: boolean, resolveExternal?: boolean} = {}) {
  const resolveExternal = options.resolveExternal ?? false;
  const resolveInternal = options.resolveInternal ?? false;

  try {
    let processSchema = schema;
    if(resolveExternal && resolveInternal){
      processSchema = await $RefParser.dereference(schema);
    }
    else if(resolveExternal){  // only resolve the external urls
      processSchema =  await $RefParser.resolve(schema) // return the $Ref
    } 
    else if(resolveInternal){  // internal references
      processSchema =  await $RefParser.dereference(processSchema);
    } 
    const context: SchemaContext = {
      elements: [],
      maxDepth: options.maxDepth || 50,
      depth: 0,
      preserveRef: !resolveInternal, //don't keep the $ref as it is
      visitedSchema: new WeakMap(),
      rootSchema: processSchema
    };
    return schemaParse(processSchema, null, context.elements, 'root', context);
  } catch (error) {
    //fallback handling for parse the schema 
    const context: SchemaContext = {
      elements: [],
      maxDepth: options.maxDepth || 50,
      depth: 0,
      preserveRef: true,
      visitedSchema: new WeakMap(),
      rootSchema: schema
    };
    return schemaParse(schema, null, context.elements,  'root', context);
  }
}

// synchronous internal parsing
export function parseSchemaInternal(
  schema: any,
  options: { maxDepth?: number; preserveRefs?: boolean } = {}
): CyElement[] {
  const context: SchemaContext = {
    elements: [],
    maxDepth: options.maxDepth || 50,
    depth: 0,
    preserveRef: true,
    visitedSchema: new WeakMap(),
    rootSchema: schema
  };
  return schemaParse(schema, null, context.elements, 'root', context);
}

// infer the type of the schema
function inferType(schema : any): string | undefined{
  if ('$ref' in schema) return '$ref';
  if ('$dynamicRef' in schema) return '$dynamicRef';
  if ('enum' in schema) return 'enum';
  if ('const' in schema) return 'const';
  if ('anyOf' in schema) return 'anyOf';
  if ('oneOf' in schema) return 'oneOf';
  if ('allOf' in schema) return 'allOf';
  if ('if' in schema || 'then' in schema || 'else' in schema) return 'conditional';
  if ('not' in schema) return 'not';
  return schema.type || undefined;
} 
// creating the better naming label for node
function createLabel(schema: any, type: string, path: string): string {
  if (schema.title) return schema.title;
  const name = path.split('.').pop()?.replace(/\[.*\]/, '') || 'root';
  
  if (type === 'const') {
    return `${name} -> ${JSON.stringify(schema.const).slice(0, 20)}`;
  }
  if (type === 'enum') {
    const preview = schema.enum.slice(0, 2).map((v: any) => JSON.stringify(v)).join(', ');
    return `${name} -> {${preview}${schema.enum.length > 2 ? '...' : ''}}`;
  }
  if (type === '$ref') {
    const ref = schema.$ref.split('/').pop() || schema.$ref;
    return `${name} → ${ref}`;
  }
  if (type === '$dynamicRef') {
    const dynRef = schema.$dynamicRef.split('/').pop() || schema.$dynamicRef;
    return `${name} -> ${dynRef}`;
  }
  if (type === 'object') {
    const hasProps = schema?.properties && Object.keys(schema.properties).length > 0;
    return hasProps  ? `${name}` : `${name} (empty object)`;
  }
  if (type === 'array') {
    const hasPrefix = schema.prefixItems?.length || 0;
    const hasItems = !!schema.items;
    if(hasPrefix > 0 && hasItems){
       return `${name} [${hasPrefix}+ items]`
    }
    if(hasPrefix > 0){
       return `${name} [${hasPrefix}]`
    }
    if(hasItems){
      return `${name}`
    }
    return `${name} []`;
  }
  return `${name}`;
}

/* Recursive function for storing the schema properties in the array of elements */ 
export function schemaParse(schema: any, parentId: string | null = null, elements : CyElement[] = [],  path = 'root', context: SchemaContext): CyElement [] {
  if (!schema || context.depth > context.maxDepth) {
    return elements;
  }
  // creating a nodeId here
  const nodeId = path.replace(/[^\w\[\]]/g, '_');
  if (!nodeId || typeof nodeId !== 'string') {
    return elements;
  }
  // checks the type of the schema
  const type =  inferType(schema) ?? schema.type ?? 'unknownType';
  const label = createLabel(schema, type, path);
  /*pushing the nodes and edges to the elements array */
  context.elements.push({
    data: {
      type : type,
      id: nodeId,
      label: label,
      description: schema.description,
      ...(context.depth === 0 && { isCenter: true })
    },
  });
  if (parentId) {
    const edgeId = `${parentId}_${nodeId}`;
    context.elements.push({
      data: {
        id : edgeId,
        source: parentId,
        target: nodeId,
      },
    });
  }
  const childContext: SchemaContext = {
    ...context,
    depth: context.depth + 1
  };

  if (type === 'anyOf' && schema.anyOf && Array.isArray(schema.anyOf)) {
    schema.anyOf.forEach((subSchema: any, index: number) => {
      if (subSchema && typeof subSchema === 'object') {
        schemaParse(subSchema, nodeId, context.elements, `${path}_${index}`, childContext);
      }
    });
  }
  
  if (type === 'oneOf' && schema.oneOf && Array.isArray(schema.oneOf)) {
    schema.oneOf.forEach((subSchema: any, i: number) => {
      if (subSchema && typeof subSchema === 'object') {
        schemaParse(subSchema, nodeId, context.elements, `${path}_${i}`, childContext);
      }
    });
  }
  if (type === 'allOf' && schema.allOf && Array.isArray(schema.allOf)) {
    schema.allOf.forEach((subSchema: any, i: number) => {
      if (subSchema && typeof subSchema === 'object') {
        schemaParse(subSchema, nodeId, context.elements, `${path}_${i}`, childContext);
      }
    });
  }

  if (type === 'conditional') {
    if (schema.if) {
      schemaParse(schema.if, nodeId, context.elements, `${path}_if`, childContext);
    }
    if (schema.then) {
      schemaParse(schema.then, nodeId, context.elements, `${path}_then`, childContext);
    }
    if (schema.else) {
        schemaParse(schema.else, nodeId,context.elements,  `${path}_else`, childContext);
    }
  }

  if (type === 'not' && schema.not) {
    schemaParse(schema.not, nodeId, context.elements, `${path}.not`, childContext);
  }
    
  if (type === 'object'   && schema.properties) {
    const required = schema.required || [];
    const isRoot = context.depth === 0;
    let parentIdprops = nodeId;
    const propertiesNodeId = `${nodeId}_properties`;
    if(isRoot){
     //explicitly add a node for properties 
      context.elements.push({
        data: {
          type: 'properties',
          id: propertiesNodeId,
          label: 'properties',
          isCenter: true
        },
      });
      // add a edge between the root and property  
      context.elements.push({
        data: {
          id : `${nodeId}->${propertiesNodeId}`,
          source: nodeId,
          target: propertiesNodeId,
        },
      });
      parentIdprops = propertiesNodeId;      
    }
    
    for (const [key, value] of Object.entries(schema.properties)) {
      const schemaValue = value as Record<string, any> // type assertion from unknown to object
      const isNestedObject = (schemaValue.type === 'object' && schemaValue.properties) || (schemaValue.type === 'array' &&  schemaValue.items?.type === 'object');
      const propertyPath = isRoot ? key :  `${key}`;
      const propNodeId = `${parentIdprops}_${key}`.replace(/[^\w\[\]]/g, '_');
      if(isNestedObject){
        // Recursively process 
        schemaParse(schemaValue, parentIdprops, context.elements, propertyPath, childContext)
        continue; 
      }
      // Add node for the primitives and leaf nodes
      context.elements.push({
        data: {
          id: propNodeId,
          label: `${key}`,
          type: schemaValue.type || 'unknown',
          ...(isNestedObject ? {isCenter : true} : {})
        },
      });

      // Add edge
      if(parentIdprops !== propNodeId){
        context.elements.push({
          data: {
            id: `${parentIdprops}->${propNodeId}`,
            source: parentIdprops,
            target: propNodeId,
          },
        });
      }
      if(required.includes(key)) {
        const propNodeIndex = context.elements.findIndex(el => 
          'data' in el && el.data.id === propNodeId
        );
        if(propNodeIndex >= 0) {
          (context.elements[propNodeIndex] as CyNode).data.required = true;
        }
      }
    }
  } 
  // Handle additional properties
  if (schema.additionalProperties && typeof schema.additionalProperties === 'object') {
    schemaParse(schema.additionalProperties, nodeId, context.elements,`${path}_additionalProperties`, childContext);
  }

  if (schema.unevaluatedProperties && typeof schema.unevaluatedProperties === 'object') {
    schemaParse(schema.unevaluatedProperties, nodeId, context.elements, `${path}_unevaluatedProperties`, childContext);
  }
  // Handle patternProperties
  if (schema.patternProperties && typeof schema.patternProperties === 'object' && schema.patternProperties !== null) {
    Object.entries(schema.patternProperties).forEach(([pattern ,patternSchema], index) => {
      schemaParse(patternSchema, nodeId, context.elements, `${path}_patternProperties_${pattern}`, childContext);
    });
  }
 if (schema.type === 'array') {
    if (schema.prefixItems && Array.isArray(schema.prefixItems)) {
      schema.prefixItems.forEach((itemsSchema: any, index: any) => {
        schemaParse(itemsSchema, nodeId, context.elements, `${path}[${index}]`, childContext);
      });
    }
    if(schema.items && typeof schema.items === 'object') {
      schemaParse(schema.items, nodeId, context.elements, `${path}_item`, childContext);
    }
    if (schema.unevaluatedItems) { // for disallow the extra items
      schemaParse(schema.unevaluatedItems, nodeId,context.elements, `${path}_unevaluatedItems`, childContext);
    }
  }
return elements;
}