import { Handle } from "@xyflow/react";
import type { RFNodeData } from "../utils/processAST";

const CustomNode = ({ data }: { data: RFNodeData }) => {
  return (
    <div
      className={`
        ${
          data.isBooleanNode
            ? "rounded-2xl text-center overflow-hidden"
            : "rounded"
        }
        relative transition-shadow duration-300 text-sm bg-black text-white
        min-w-[100px] max-w-[400px] hover:shadow-[0_0_10px_var(--color)]
      `}
      style={{
        ["--color" as string]: data.nodeStyle.color,
        border: `1px solid ${data.nodeStyle.color}`,
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
          color: data.nodeStyle.color,
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
              <span
                className="font-semibold mr-2 whitespace-nowrap"
                style={{ color: "#00B7FF" }}
              >
                {!data.isBooleanNode && `${key}:`}
              </span>

              {isArray ? (
                <div className="flex-col w-full">
                  {(value as string[]).map((item, index) => (
                    <div
                      key={index}
                      className="px-2 py-[2px] bg-[#1a1a1a]"
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
