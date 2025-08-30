import { Handle, Position } from "@xyflow/react";
import { useCallback, type CSSProperties } from "react";
import { inferSchemaType } from "../utils/inferSchemaType";

const nodeStyles: {
  [key: string]: Record<string, { [key: string]: string }>;
} = {
  objectSchema: {
    string: {
      background: "#D1C4E9", // Soft lavender
    },
    number: {
      background: "#F5A5A0", // Muted coral
    },
    boolean: {
      background: "#FEC8D8", // Soft pink
    },
    array: {
      background: "#A0E7E5", // Muted teal
    },
    object: {
      background: "#F8D7A0", // Warm beige
    },
    null: {
      background: "#D3D3D3", // Light gray
    },
    others: {
      background: "#CCCCFF", // Soft blue
      border: "2px dashed #888",
    },
  },
  booleanSchema: {
    true: {
      background: "#6dbf81",
      border: "2px solid gray",
      borderRadius: "25px",
      fontWeight: "bold",
    },
    false: {
      background: "#e36d7f",
      border: "2px solid gray",
      borderRadius: "25px",
      fontWeight: "bold",
    },
  },
};

const CustomNode = ({
  data,
}: {
  data: {
    label: string;
    type: string;
    nodeData: Record<string, unknown>;
    isLeafNode?: boolean;
  };
}) => {
  const getNodeStyle = useCallback(
    (data: {
      type?: string;
      nodeData: Record<string, unknown>;
    }): CSSProperties => {
      const [schemaType, definedFor] = inferSchemaType(data.nodeData);

      return nodeStyles[schemaType][definedFor];
    },
    []
  );

  const nodeStyle = getNodeStyle(data);

  return (
    <div
      className="flex items-center px-3 py-2 w-[200px] min-h-[50px] rounded-lg shadow-sm"
      style={nodeStyle}
    >
      {!data.isLeafNode && <Handle type="source" position={Position.Right} />}
      <Handle type="target" position={Position.Left} />
      <div className="text-xs overflow-x-auto w-full">
        <table className="table-fixed w-full">
          <tbody>
            {Object.entries(data.nodeData).map(([key, value]) => (
              <tr key={key}>
                {key !== "booleanSchema" && (
                  <td className="font-medium break-words">{key}</td>
                )}
                <td className="break-words text-center">{String(value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomNode;
