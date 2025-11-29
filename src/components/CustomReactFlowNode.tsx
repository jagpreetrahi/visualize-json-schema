import { Handle } from "@xyflow/react";
import { useCallback } from "react";
import { inferSchemaType } from "../utils/inferSchemaType";
import type { HandleConfig } from "../utils/processAST";

type NodeData = {
  label: string;
  type: string;
  nodeData: Record<string, unknown>;
  targetHandles: HandleConfig[];
  sourceHandles: HandleConfig[];
};

const neonColors = {
  string: "#00E5FF",
  number: "#12FF4B",
  boolean: "#A259FF",
  array: "#FFEA00",
  object: "#FF3B3B",
  null: "#FF9CEE",
  others: "#CCCCCC",
};

const CustomNode = ({ data }: { data: NodeData }) => {
  const getColor = useCallback((nodeData: Record<string, unknown>) => {
    const [, definedFor] = inferSchemaType(nodeData);
    return (
      neonColors[definedFor as keyof typeof neonColors] ?? neonColors.others
    );
  }, []);

  const color = getColor(data.nodeData);

  return (
    <div
      className="relative rounded transition-shadow duration-300 bg-black text-white min-w-[100px] max-w-[400px] hover:shadow-[0_0_10px_var(--color)]"
      style={{
        ["--color" as string]: color,
        border: `1px solid ${color}`,
        wordBreak: "break-word",
      }}
    >
      {data.targetHandles.map(({ handleId, position }) => (
        <Handle
          key={handleId}
          type="target"
          position={position}
          id={handleId}
        />
      ))}

      <div
        className="px-1 font-semibold"
        style={{
          background: `${color}50`,
          borderBottom: `1px solid ${color}`,
          color,
        }}
      >
        {data.label}
      </div>

      <div className="flex text-sm flex-col">
        {Object.entries(data.nodeData).map(([key, value]) => {
          const isArray = Array.isArray(value);

          return (
            <div
              key={key}
              className="flex"
              style={{
                border: `1px solid ${color}40`,
                padding: "4px",
              }}
            >
              <span
                className="font-semibold mr-2 whitespace-nowrap"
                style={{ color: "#00B7FF" }}
              >
                {key}:
              </span>

              {isArray ? (
                <div className="flex-col w-full">
                  {(value as string[]).map((item, index) => (
                    <div
                      key={index}
                      className="px-2 py-[2px] bg-[#1a1a1a]"
                      style={{ border: `1px solid ${color}30` }}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              ) : (
                <span>{String(value)}</span>
              )}
            </div>
          );
        })}
      </div>

      {data.sourceHandles.map(({ handleId, position }) => (
        <Handle
          key={handleId}
          type="source"
          position={position}
          id={handleId}
        />
      ))}
    </div>
  );
};

export default CustomNode;
