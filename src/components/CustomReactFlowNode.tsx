import { Handle, Position } from "@xyflow/react";
import { useCallback, type CSSProperties } from "react";
import { inferSchemaType } from "../utils/inferSchemaType";

const nodeStyles: {
  [key: string]: Record<string, { [key: string]: string }>;
} = {
  objectSchema: {
    string: {
      background: "#FEC8D8", // Soft pink
    },
    number: {
      background: "#A0E7A0", // Soft Mint Green
    },
    boolean: {
      background: "#CCCCFF", // Soft blue
    },
    array: {
      background: "#A0E7E5", // Muted teal
    },
    object: {
      background: "#F8D7A0", // Warm beige
    },
    null: {
      background: "#F5A5A0", // Muted coral
    },
    others: {
      background: "#D3D3D3", // Light gray
      border: "2px dashed #888",
    },
  },
  booleanSchema: {
    true: {
      background: "#6dbf81",
      height: "50px",
      width: "100px",
      border: "2px solid gray",
      borderRadius: "50%",
      fontWeight: "bold",
    },
    false: {
      background: "#e36d7f",
      height: "50px",
      width: "100px",
      border: "2px solid gray",
      borderRadius: "50%",
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
      className="relative flex items-center px-3 py-2 rounded-sm shadow-sm w-[200px] h-[80px]"
      style={nodeStyle}
    >
      {!data.isLeafNode && <Handle type="source" position={Position.Right} />}
      <Handle type="target" position={Position.Left} />
      <div className="flex text-xs overflow-x-auto overflow-y-auto h-full w-full">
        <table className="table-fixed w-full">
          <tbody>
            {Object.entries(data.nodeData).flatMap(([key, value]) => {
              if (Array.isArray(value)) {
                return [
                  <tr key={key}>
                    <td className="font-medium whitespace-nowrap align-top">
                      {key}
                    </td>
                    <td>
                      <table className="w-full border">
                        <tbody>
                          {value.map((item, idx) => (
                            <tr
                              key={`${key}-item-${idx}`}
                              className="border-t text-center"
                            >
                              <td className="px-1 py-1 whitespace-nowrap">
                                {item}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>,
                ];
              }

              return (
                <tr key={key}>
                  {key !== "booleanSchema" && (
                    <td className="font-medium whitespace-nowrap">{key}</td>
                  )}
                  <td className="whitespace-nowrap text-center">
                    {String(value)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomNode;
