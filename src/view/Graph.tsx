import { useRef, useEffect } from "react";
import cytoscape from "cytoscape";
import dagre from 'cytoscape-dagre';
import { parseSchemaInternal } from "../utils/schemaParse";
// use the dagre layout 
cytoscape.use(dagre)
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
                content: 'data(label)',
                shape: 'roundrectangle',
                'background-color': '#6fb0ec',
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
              style: { 'background-color': '#f56262', 'label': 'data(label)'}
            },
            {
              selector: 'node[type="array"]',
              style: { 'background-color': '#ffd966',  'label': 'data(label)' }
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
          ],
          layout: {
            name: 'dagre',
            rankDir: 'LR',
            nodeSep: 5,
            edgeSep: 5,
            rankSep: 15,
            animate: false,
            fit: false,
          } as any,
       });
        if(exposeInstances){
          exposeInstances.current = cyInstanceRef.current
        }
        cyInstanceRef.current.center();
        cyInstanceRef.current.zoom(3);
        cyInstanceRef.current.resize();
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
        let parsedSchema = JSON.parse(schema);
        if (!parsedSchema || typeof parsedSchema !== 'object') {
          throw new Error("Invalid parsed schema");
        }
        let elements = parseSchemaInternal(parsedSchema);
        if (!elements || !Array.isArray(elements) || elements.length === 0) {
          console.error("No valid elements generated from schema");
          return;
        }
        // Validate elements before update
        const hasInvalidElements =  elements.some(el => !('id' in el.data)  ||  typeof el.data.id !== 'string');
        if (hasInvalidElements) {
          console.error("Invalid elements detected", elements);
          return;
        }
        // Update elements (nodes and edges)
        cyInstanceRef.current.json({ elements });
    
        // Re-run layout
        const layout = cyInstanceRef.current.layout({
          name: 'dagre',
          rankDir: 'LR',
          nodeSep: 15,
          edgeSep: 5,
          rankSep: 20,
          animate: false,
          fit: false,
        } as any) as cytoscape.Layouts;
        layout.run();
        cyInstanceRef.current!.nodes().ungrabify();
        cyInstanceRef.current!.center();
     }, [schema]);
    return (
      <div id="cy" ref={cyRef} style={{height : 'calc(100vh - 70px)'}} className="visualize "></div>
    )
}
