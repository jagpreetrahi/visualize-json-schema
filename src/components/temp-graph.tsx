import { useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";

import dagre from "@dagrejs/dagre";
import "@xyflow/react/dist/style.css";

const initialNodes = [
  {
    id: "n1",
    data: { label: "Root Node" },
    position: { x: 250, y: 0 },
  },
  {
    id: "n2",
    data: { label: "Child A" },
    position: { x: 150, y: 150 },
  },
  {
    id: "n3",
    data: { label: "Grandchild A1" },
    position: { x: 100, y: 300 },
  },
  {
    id: "n4",
    data: { label: "Child B" },
    position: { x: 350, y: 150 },
  },
];

const initialEdges = [
  {
    id: "e1-2",
    source: "n1",
    target: "n2",
  },
  {
    id: "e1-4",
    source: "n1",
    target: "n4",
  },
  {
    id: "e2-3",
    source: "n2",
    target: "n3",
  },
];

const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

const nodeWidth = 172;
const nodeHeight = 36;

const getLayoutedElements = (nodes, edges, direction = "LR") => {
  const isHorizontal = direction === "LR";
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const newNode = {
      ...node,
      targetPosition: isHorizontal ? "left" : "top",
      sourcePosition: isHorizontal ? "right" : "bottom",
      // We are shifting the dagre node position (anchor=center center) to the top left
      // so it matches the React Flow node anchor point (top left).
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };

    return newNode;
  });

  return { nodes: newNodes, edges };
};

const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
  initialNodes,
  initialEdges
);


const TempGraph = ({ schema }) => {
  const [nodes, setNodes, onNodeChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgeChange] = useEdgesState(layoutedEdges);


  return (
    <div className="bg-gray-200" style={{ width: "100%", height: "100%" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodeChange}
        onEdgesChange={onEdgeChange}
        deleteKeyCode={null}
        fitView
      >
        <Background color="gray" size={2} gap={40} />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default TempGraph;
