import { Handle, Position } from "@xyflow/react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";
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

const NODE_HEIGHT = 80; // px
const ROW_HEIGHT = 20; // px
const AVAILABLE_HEIGHT = NODE_HEIGHT - 16;

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
  const [isOverflowing, setIsOverflowing] = useState(false);

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
  const entries = useMemo(() => {
    return Object.entries(data.nodeData).map(([key, value]) => ({
      key,
      displayValue: Array.isArray(value) ? value.length : String(value),
    }));
  }, [data.nodeData]);

  const maxVisibleRows = Math.floor(AVAILABLE_HEIGHT / ROW_HEIGHT);
  const visibleRows =
    entries.length > maxVisibleRows
      ? [...entries.slice(0, maxVisibleRows - 1)]
      : entries;

  useEffect(() => {
    if (entries.length > maxVisibleRows) {
      setIsOverflowing(true);
    } else {
      setIsOverflowing(false);
    }
  }, [entries.length, maxVisibleRows]);

  return (
    <div
      className={`relative p-3 rounded-sm shadow-sm w-[200px] h-[${NODE_HEIGHT}px]`}
      style={nodeStyle}
    >
      {!data.isLeafNode && <Handle type="source" position={Position.Right} />}
      <Handle type="target" position={Position.Left} />
      <div className="flex text-xs overflow-x-auto overflow-y-auto h-full w-full">
        <table className="table-fixed w-full">
          <tbody>
            {visibleRows.map(({ key, displayValue }) => {
              return (
                <tr key={key}>
                  {key !== "booleanSchema" && (
                    <td className="font-medium whitespace-nowrap">{key}</td>
                  )}
                  <td className="whitespace-nowrap text-ellipsis overflow-hidden text-center">
                    {displayValue}
                  </td>
                </tr>
              );
            })}
            {isOverflowing && (
              <tr>
                <td colSpan={2} className="text-gray-500 italic">
                  ...more...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomNode;
