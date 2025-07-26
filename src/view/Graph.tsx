import { useRef, useEffect } from "react";
import cytoscape from "cytoscape";
import dagre from 'cytoscape-dagre';
import { parseSchemaInternal } from "../utils/schemaParse";
// @ts-ignore
import nodeHtmlLabel from 'cytoscape-node-html-label';
// use the dagre layout 
cytoscape.use(dagre)
nodeHtmlLabel(cytoscape)

export const Graph = ({schema , exposeInstances} : {schema : string , exposeInstances : React.RefObject<cytoscape.Core | null>}) => {
    const cyRef = useRef<HTMLDivElement>(null);
    /* Does not get destroy or re-creating everytime the component updates */
    const cyInstanceRef = useRef<cytoscape.Core | null>(null);
    // Initialize Cytoscape once on mount
    useEffect(() => {
      if (!cyRef.current) return;
      cyInstanceRef.current = cytoscape({
          container: cyRef.current,
          userPanningEnabled: true,
          zoomingEnabled: true,
          panningEnabled: true,
          boxSelectionEnabled: false,
          autounselectify: false,
          style: [
            {
              selector: 'node',
              style: {
                shape: 'roundrectangle',
                width: '80px',
                height: '40px',
                'background-color': 'transparent',
                'background-opacity': 0,
              },
            },
            {
              selector: 'node:selected',
              style: {
                  // Remove selection styling that might show gray
                  'background-color': 'transparent',
                  'border-width': 0,
                  'overlay-opacity': 0,
              }
            },
            {
              selector: 'edge',
              style: {
                "curve-style" : 'bezier',
                'target-arrow-shape': 'none',
                 width: 0.5,
                'line-color': '#ccc',
                'target-arrow-color': '#ccc',
              },
            },
          ]
        });
        if(exposeInstances){
          exposeInstances.current = cyInstanceRef.current
        }

        cyInstanceRef.current.center();
        cyInstanceRef.current.zoom(3);
        
        // Cleanup on unmount
        return () => {
          if(exposeInstances){
             exposeInstances.current = null;
          }
          cyInstanceRef.current?.destroy();
        };
     }, []);

     // Update elements/layout when schema changes
    useEffect(() => {
      if (!schema || !cyRef.current || !cyInstanceRef.current) return;
      try {
        let parsedSchema = JSON.parse(schema);
        if (!parsedSchema || typeof parsedSchema !== 'object') {
          throw new Error("Invalid parsed schema");
        }
        let elements = parseSchemaInternal(parsedSchema);
        if (!elements || !Array.isArray(elements) || elements.length === 0) return;
        // Validate elements before update
        const hasInvalidElements = elements.some(
          el => !('id' in el.data) || typeof el.data.id !== 'string'
        );

        if (hasInvalidElements) return;
        // remove existing elements and HTML labels without destroy the instance completely
        cyInstanceRef.current.elements().remove();

        // Remove any existing HTML labels
        try {
          (cyInstanceRef.current as any).nodeHtmlLabel('destroy');
        } catch (e) {
                // Ignore if nodeHtmlLabel wasn't initialized
        }

        // Add new elements 
        cyInstanceRef.current.add(elements);

        // Make nodes non-draggable after layout
        cyInstanceRef.current!.nodes().ungrabify();
              
        // NOW apply the Dagre layout after elements are added
        const layout = cyInstanceRef.current.layout({
          name: 'dagre',
          rankDir: 'LR', // Left to Right
          nodeSep: 50,   
          edgeSep: 10,   
          rankSep: 100,  
          animate: false, 
          fit: false,     
          padding: 30,   
        } as any);
            
        // Apply HTML labels after layout is complete
        layout.one('layoutstop', () => {
          (cyInstanceRef.current as any).nodeHtmlLabel([
            {
              query: 'node',
              tpl: function(data: any) {
                return `
                  <div style="
                    border: 1px solid #6fb0ec; 
                    background : #5b5b5b;
                    border-radius: 4px;
                    letter-spacing : 1px;
                    font-family: Arial, sans-serif;
                    min-width: 120px;
                  ">
                    <div style="font-weight: bold; color: #6fb0ec;  margin-left : 5px;">
                        ${data.label || 'Property'}
                    </div>
                    <hr style="margin: 2px 0; color: #fff " />
                    <div style="font-size: 14px; color: #bcbcbc;  margin-left : 5px;">
                      Type : ${data.type || 'primitive'}
                    </div>
                  </div>
                `;
              },
              halign: 'center',
              valign: 'center',
            }
          ]);
          setTimeout(() => {  // to ensure the html labels are render in the viewport after browser added the elements to the dom
              cyInstanceRef.current?.fit();
              cyInstanceRef.current?.center();
          }, 50)

        });
          // Run the layout
          layout.run();
        } catch (error) {
            console.error("Error processing schema:", error);
        }
    }, [schema]);
    return (
      <div id="cy" ref={cyRef} style={{height : 'calc(100vh - 70px)'}} className="visualize "></div>
    )
}
