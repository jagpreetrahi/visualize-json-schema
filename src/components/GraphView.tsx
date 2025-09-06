import { useCallback, useEffect, useState } from "react";
import type { CompiledSchema } from "@hyperjump/json-schema/experimental";
import "@xyflow/react/dist/style.css";
import dagre from "@dagrejs/dagre";
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Position,
  type Node,
  type Edge,
  type NodeMouseHandler,
} from "@xyflow/react";

import CustomNode from "./CustomReactFlowNode";
import NodeDetailsPopup from "./NodeDetailsPopup";
import {
  processAST,
  type GraphEdge,
  type GraphNode,
} from "../utils/processAST";

const nodeTypes = { customNode: CustomNode };
const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

const nodeWidth = 172;
const nodeHeight = 36;

const GraphView = ({
  compiledSchema,
}: {
  compiledSchema: CompiledSchema | null;
}) => {
  const [expandedNode, setExpandedNode] = useState<{
    nodeId: string;
    data: Record<string, unknown>;
  } | null>(null);

  const [nodes, setNodes, onNodeChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgeChange] = useEdgesState<Edge>([]);

  const onNodeClick: NodeMouseHandler = useCallback((_event, node) => {
    setExpandedNode({
      nodeId: node.id,
      data: node.data,
    });
  }, []);

  const generateNodesAndEdges = useCallback(
    (
      compiledSchema: CompiledSchema | null,
      nodes: GraphNode[] = [],
      edges: GraphEdge[] = []
    ) => {
      if (!compiledSchema) return;
      const { ast, schemaUri } = compiledSchema;
      // console.log(ast)
      // const result = processAST(ast, schemaUri, nodes, edges, "");
      processAST(ast, schemaUri, nodes, edges, "");

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
    const result = generateNodesAndEdges(compiledSchema);
    if (!result) return;

    const { nodes: rawNodes, edges: rawEdges } = result;
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      rawNodes,
      rawEdges
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [
    compiledSchema,
    generateNodesAndEdges,
    getLayoutedElements,
    setNodes,
    setEdges,
  ]);

  return (
    <div className="relative w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodeClick={onNodeClick}
        onNodesChange={onNodeChange}
        onEdgesChange={onEdgeChange}
        deleteKeyCode={null}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>

      {expandedNode && (
        <NodeDetailsPopup
          data={expandedNode.data}
          onClose={() => setExpandedNode(null)}
        />
      )}
    </div>
  );
};

export default GraphView;
