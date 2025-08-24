import { useCallback, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Position,
  type Node,
  type Edge,
} from "@xyflow/react";

import dagre from "@dagrejs/dagre";
import "@xyflow/react/dist/style.css";

const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

const nodeWidth = 172;
const nodeHeight = 36;

type GraphNode = {
  id: string;
  data: { label: string };
};

type GraphEdge = {
  id: string;
  source: string;
  target: string;
};

const GraphView = ({ schema }: { schema: string }) => {
  const [nodes, setNodes, onNodeChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgeChange] = useEdgesState<Edge>([]);

  const generateNodesAndEdges = useCallback(
    (
      schema: JSON,
      parentNodeId: string,
      nodes: GraphNode[] = [],
      edges: GraphEdge[] = []
    ) => {
      if (parentNodeId === "root") {
        nodes.push({ id: `${parentNodeId}`, data: { label: "root" } });
      }
      for (const [key, value] of Object.entries(schema)) {
        const isExpandable = value !== null && typeof value === "object";
        const currentNodeId = `${parentNodeId}-${key}`;

        const newNode = {
          id: currentNodeId,
          data: { label: `${key} -- ${value}` },
        };

        const newEdge = {
          id: `${parentNodeId}-${currentNodeId}`,
          source: parentNodeId,
          target: currentNodeId,
        };

        if (isExpandable) {
          generateNodesAndEdges(value, currentNodeId, nodes, edges);
        }
        nodes.push(newNode);
        edges.push(newEdge);
      }
      return { nodes, edges };
    },
    []
  );

  const getLayoutedElements = useCallback(
    (nodes: GraphNode[], edges: GraphEdge[], direction = "LR") => {
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
        const newNode: Node = {
          ...node,
          targetPosition: isHorizontal ? Position.Left : Position.Top,
          sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
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
    },
    []
  );

  useEffect(() => {
    const { nodes: rawNodes, edges: rawEdges } = generateNodesAndEdges(
      JSON.parse(schema),
      "root"
    );

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      rawNodes,
      rawEdges
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [schema, generateNodesAndEdges, getLayoutedElements, setNodes, setEdges]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodeChange}
        onEdgesChange={onEdgeChange}
        deleteKeyCode={null}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default GraphView;
