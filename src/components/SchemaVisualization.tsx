import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre'
import React, {  useEffect, useRef } from 'react';

cytoscape.use(dagre)

const SchemaVisualization = ({schema} : {schema : string}) => {
  const cyRef = useRef<HTMLDivElement>(null);
  /* Does not get destroy or re-creating everytime the component updates */
  const cyInstanceRef = useRef<cytoscape.Core | null>(null);
  // Types
  type CyNode = {
    data: {
      type?: string,
      id: string;
      label: string;
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

 

  /* Recursive function for storing the schema properties in the array of elements */ 
  function schemaParse( schema: any, parentId: string | null = null, elements: CyElement[] = [], path = 'root'): CyElement[] {
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
        type : schema.type,
        id: nodeId,
        label: schema.title || path.split('.').slice(-1)[0],
      },
    });

    if (parentId) {
      const edgeId = `${parentId}->${nodeId}`; // Unique ID format
      elements.push({
        data: {
          id : edgeId,
          source: parentId,
          target: nodeId,
        },
      });
    }
    
    const type = schema.type;
    
    if (type === 'object'   && schema.properties) {
      for (const [key, value] of Object.entries(schema.properties)) {
        schemaParse(value, nodeId, elements, `${path}.${key}`);
      }
    } else if (schema.type === 'array' && schema.items) {
      const itemPath = `${path}[]`;
      schemaParse(schema.items, nodeId, elements, itemPath);
    }
   
    
    return elements;

  }

  // Initialize Cytoscape once on mount
  useEffect(() => {
    if (!cyRef.current) return;
    cyInstanceRef.current = cytoscape({
      container: cyRef.current,
      userPanningEnabled: true,
      zoomingEnabled: true,
      panningEnabled: true,
      boxSelectionEnabled: false,
      autounselectify: true,
      style: [
        {
          selector: 'node',
          style: {
            content: 'data(label)',
            shape: 'roundrectangle',
            'background-color': '#007acc',
            color: '#fff',
            'font-size': '7px',
            'text-wrap': 'wrap',
            'text-max-width': '100px',
            'text-valign': 'center',
            padding : '2px',
            width: 'label',
            height: 'label',
            'min-width': '40px',
            'min-height': '20px',
          },
        },
        {
          selector: 'node[type="object"]',
          style: { 'background-color': 'red', 'label': 'data(label)'}
        },
        {
          selector: 'node[type="array"]',
          style: { 'background-color': 'yellow', 'label': 'data(label)' }
        },

        {
          selector: 'edge',
          style: {
            width: 0.5,
            'line-color': '#ccc',
            'target-arrow-color': '#ccc',
            'target-arrow-shape': 'triangle',
          },
        },
      ],
      layout: {
        name: 'dagre',
        rankDir: 'LR',
        nodeSep: 15,
        edgeSep: 5,
        rankSep: 20,
        animate: false,
        fit: false,
      } as any,
    });
     cyInstanceRef.current.centre();
     cyInstanceRef.current.zoom(3);

    // Cleanup on unmount
    return () => {
      cyInstanceRef.current?.destroy();
    };
  }, []);

  // Update elements/layout when schema changes
  useEffect(() => {
    if (!schema || !cyRef.current || !cyInstanceRef.current) return;
    let parsedSchema : any;

    try {
      parsedSchema = JSON.parse(schema);
    
    }  
    catch (error){
      console.error('Invalid JSON:', error);
      return;
    }
    const elements = schemaParse(parsedSchema);
    // Validate elements before update
    const hasInvalidElements =  elements.some(el => !('id' in el.data) || !el.data.id);
    if (hasInvalidElements) {
      console.error("Invalid elements detected", elements);
      return;
    }

    // Update elements (nodes and edges)
    cyInstanceRef.current.json({ elements });

    // Re-run layout
    cyInstanceRef.current.layout({
      name: 'dagre',
      rankDir: 'LR',
      nodeSep: 15,
      edgeSep: 5,
      rankSep: 20,
      animate: false,
      fit: false,
    } as any).run();

    cyInstanceRef.current.center()  
    cyInstanceRef.current.zoom(3);
    cyInstanceRef.current.nodes().ungrabify();  /*  It prevent the draggable of nodes */

  }, [schema]);

  return (
    <div>
      <div id="cy" ref={cyRef} style={{ width: '100vw', height: '100vh'}} className="visualize"/>
    </div>
  );
};

export default React.memo(SchemaVisualization);
