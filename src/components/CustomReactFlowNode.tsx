import { Handle } from "@xyflow/react";
import type { RFNodeData } from "../utils/processAST";
import { useContext } from "react";
import { AppContext } from "../contexts/AppContext";

const CustomNode = ({ data }: { data: RFNodeData }) => {
  const { theme } = useContext(AppContext);

  return (
    <div
      className={`
        ${
          data.isBooleanNode
            ? "rounded-2xl text-center overflow-hidden"
            : "rounded"
        }
        relative transition-shadow duration-300 text-sm bg-[var(--node-bg-color)] text-[var(--text-color)]
        min-w-[100px] max-w-[400px] hover:shadow-[0_0_10px_var(--color)]
      `}
      style={{
        ["--color" as string]: data.nodeStyle.color,
        border:
          theme === "dark"
            ? `1px solid ${data.nodeStyle.color}`
            : `1px solid color-mix(in srgb, ${data.nodeStyle.color} 80%, black)`,
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
        className="px-2 font-semibold"
        style={{
          background: `${data.nodeStyle.color}50`,
          borderBottom: `1px solid ${data.nodeStyle.color}`,
          color:
            theme === "dark"
              ? data.nodeStyle.color
              : `color-mix(in srgb, ${data.nodeStyle.color} 60%, black)`,
        }}
      >
        {data.nodeLabel}
      </div>

      <div className="flex flex-col">
        {Object.entries(data.nodeData).map(([key, value]) => {
          const isArray = Array.isArray(value);

          return (
            <div
              key={key}
              className={`${data.isBooleanNode && "text-center"} flex`}
              style={{
                border: `1px solid ${data.nodeStyle.color}40`,
                padding: "4px",
                background: data.isBooleanNode
                  ? `${data.nodeStyle.color}50`
                  : "",
              }}
            >
              <span className="font-semibold mr-2 whitespace-nowrap text-[var(--node-key-color)]">
                {!data.isBooleanNode && `${key}:`}
              </span>

              {isArray ? (
                <div className="flex-col w-full">
                  {(value as string[]).map((item, index) => (
                    <div
                      key={index}
                      className="px-2 py-[2px] bg-[var(--node-value-bg-color)]"
                      style={{ border: `1px solid ${data.nodeStyle.color}30` }}
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
