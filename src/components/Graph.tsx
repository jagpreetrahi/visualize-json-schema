import { useRef, useEffect } from "react";
import cytoscape from "cytoscape";
import dagre from 'cytoscape-dagre';
import { parseSchemaInternal } from "../utils/schemaParse";
// @ts-ignore
import nodeHtmlLabel from 'cytoscape-node-html-label';
// use the dagre layout 
cytoscape.use(dagre)
nodeHtmlLabel(cytoscape)

export const Graph = ({schema , exposeInstances} : {schema : string | undefined , exposeInstances : React.RefObject<cytoscape.Core | null>}) => {
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
                width: '70px',
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
              selector: '[edge = "nested"]',
              style: {
                'curve-style': 'straight',
                'target-arrow-shape': 'none',
                'line-color': '#b0b0b0',
                'width': 0.5
              }
            },
          ]
        });
        if(exposeInstances){
          exposeInstances.current = cyInstanceRef.current
        }

        cyInstanceRef.current.center();
        cyInstanceRef.current.zoom(1);
        
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
        let elements = parseSchemaInternal(parsedSchema, { preserveRefs: true });
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
          edgeSep: 100,   
          rankSep: 120,  
          animate: false, 
          fit: false,     
          padding: 30,  
          spacingFactor: 1, 
        } as any);
            
        // Apply HTML labels after layout is complete
        layout.one('layoutstop', () => {
          (cyInstanceRef.current as any).nodeHtmlLabel([
            {
              query: 'node',
              tpl: function(data: any) {
                const backgroundColor = data.matched ? '#8fce00' : '#5b5b5b'
                return `
                  <div style="
                    border: 3px solid #9fc5e8;
                    background: ${backgroundColor};
                    border-radius: 6px;
                    letter-spacing : 1px;
                    font-family: Arial, sans-serif;
                    min-width: 160px;
                    width : ${data.label};
                    padding : 4px 6px;
                    color: #ccc;
                    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
                    cursor: pointer;
                    transition:  0.2s ease;
                  " 
                   onmouseover="this.style.borderColor='#2986cc';"
                   onmouseout="this.style.borderColor='#6fb0ec';"
                   
                  >
                    <div style="font-weight: 600; color: #6fb0ec; font-size: 15px;">
                        ${data.label || 'Property'}
                    </div>
                    <hr style="color: #fff" />
                    <div style="font-size: 15px; ">
                         <span style="color: #999;">Type:</span> <span style="color: #fff;">${data.type || 'primitive'}</span>
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
              cyInstanceRef.current?.zoom(1)
          }, 50)

        });
          // Run the layout
          layout.run();
        } catch (error) {
            console.error("Error processing schema:", error);
        }
    }, [schema]);
    return (
      <div id="cy" ref={cyRef} className="visualize h-full"></div>
    )
}
