import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre'
import { useContext, useEffect, useRef } from 'react';
import { MonacoEditorContext } from './../contexts/EditorContext';

cytoscape.use(dagre)

export const SchemaVisualization = () => {
  const { editorRef } = useContext(MonacoEditorContext);
  const cyRef = useRef<HTMLDivElement>(null);

  // Types
  type CyNode = {
    data: {
      id: string;
      label: string;
    };
  };

  type CyEdge = {
    data: {
      source: string;
      target: string;
    };
  };

  type CyElement = CyNode | CyEdge;

  // JSON Schema to Cytoscape elements
  function schemaParse( schema: any, parentId: string | null = null, elements: CyElement[] = [], path = 'root'): CyElement[] {
    const nodeId = path;
    elements.push({
      data: {
        id: nodeId,
        label: schema.title || path.split('.').slice(-1)[0],
      },
    });

    if (parentId) {
      elements.push({
        data: {
          source: parentId,
          target: nodeId,
        },
      });
    }

    if (schema.type === 'object' && schema.properties) {
      for (const [key, value] of Object.entries(schema.properties)) {
        schemaParse(value, nodeId, elements, `${path}.${key}`);
      }
    } else if (schema.type === 'array' && schema.items) {
      const itemPath = `${path}[]`;
      schemaParse(schema.items, nodeId, elements, itemPath);
    }

    return elements;
  }

  // run only when editorRef is available
  useEffect(() => {
    const editorSchema = editorRef.current?.getValue();
    if (!editorSchema || !cyRef.current) return;

    try {
      const parsedSchema = JSON.parse(editorSchema);
      const elements = schemaParse(parsedSchema);

      const cy = cytoscape({
        container: cyRef.current,
        elements,
        userPanningEnabled: true,
      panningEnabled: true,
      boxSelectionEnabled: false,
      autounselectify: true,
        style: [
          {
            selector: 'node:hover',
            style: {
              content: 'data(label)',
              'text-valign': 'center',
              'background-color': '#007acc',
               color: 'white',
              'font-size': '10px',
              'text-wrap': 'wrap',
              
            },
          },
          {
            selector: 'edge',
            style: {
              width: 2,
              'line-color': '#ccc',
              'target-arrow-color': '#ccc',
              'target-arrow-shape': 'triangle',
            },
          },
        ],
        layout: {
          name: 'dagre',
                
             
        },
      });

      // Optional: destroy when component unmounts
      return () => {
        cy.destroy();
      };
    } catch (error) {
      console.error('Invalid JSON:', error);
    }
  }, [editorRef.current]);

  return (
    <div>
      <div
        id="cy"
        ref={cyRef}
        style={{ width: '60vw', height: '100vh', marginLeft: '15px' }}
        className="visualize"
      />
    </div>
  );
};
