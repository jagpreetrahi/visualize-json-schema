// Types
type CyNode = {
    data: {
    type?: string,
    id: string;
    label: string;
    isCenter?: boolean
    };
  };

type CyEdge = {
    data: {
      id : string
      source: string;
      target: string;
    };
  };

export type CyElement = CyNode | CyEdge;
/* Recursive function for storing the schema properties in the array of elements */ 
 export function schemaParse( schema: any, parentId: string | null = null, elements: CyElement[] = [], path = 'root' , depth = 0): CyElement[] {
    if (!schema || typeof schema !== 'object') {
      console.warn("Invalid or missing schema at path:", path);
    }
    const nodeId = path || `node-${Math.random().toString(36).substring(2, 8)}`;
    if (!nodeId || typeof nodeId !== 'string') {
      console.warn("Skipping invalid node ID", schema);
      return elements;
    }
    /*pushing the nodes and edges to the elements array */
    elements.push({
      data: {
        type : schema.type || undefined,
        id: nodeId,
        label: schema.title || path.split('.').slice(-1)[0],
      },
    });

    if (parentId) {
      elements.push({
        data: {
          id : `${parentId}->${nodeId}`,
          source: parentId,
          target: nodeId,
        },
      });
    }
    
    const type = schema.type;
    if (type === 'object'   && schema.properties) {
      const properties = schema.properties;
      const propertyKeys = Object.keys(properties);
      const propertiesNodeId = `${nodeId}_properties`;
      //explicitly add a node for properties 
      if(depth === 0){
        elements.push({
          data: {
            type: 'properties',
            id: propertiesNodeId,
            label: 'properties',
            isCenter: true
          },
        });

        // add a edge between the root and property  
        elements.push({
            data: {
              id : `${nodeId}->${propertiesNodeId}`,
              source: nodeId,
              target: propertiesNodeId,
            },
        });
      }
     
      const parentprops = depth === 0 ? propertiesNodeId : nodeId;
      // check the length of keys so that , lazy loading happening only for >5
      const isLazy =  propertyKeys.length >= 5 ;
      if(!isLazy){
        for (const [key, value] of Object.entries(schema.properties)) {
          schemaParse(value, parentprops , elements, `${path}.properties.${key}` , depth +1);
        }
      } 
     
    } else if (schema.type === 'array' && schema.items) {
      const itemPath = `${path}[]`;
      schemaParse(schema.items, nodeId, elements, itemPath);
    }
    return elements;
}