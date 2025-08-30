import { Handle, Position } from "@xyflow/react";
import { useCallback } from "react";

const shapeStyles = {
  string: { background: "#FFB6C1", borderRadius: "20px" },
  number: { background: "#FFA500", borderRadius: "50%" },
  boolean: {
    background: "#90EE90",
    clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
  },
  array: { background: "#ADD8E6", borderRadius: "50% 30%" },
  object: { background: "#9370DB", borderRadius: "5%" },
  null: {
    background: "#D3D3D3",
    clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
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
  console.log(data);

  const getType = useCallback((value: unknown) => {
    return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
  }, []);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // const nodeStyle = shapeStyles[getType(parsedData.value)];
  const nodeStyle = shapeStyles[getType("string")];

  return (
    <div
      className="flex justify-center items-center p-4 w-[200px] h-[80px]"
      style={nodeStyle}
    >
      {!data.isLeafNode && <Handle type="source" position={Position.Right} />}
      <Handle type="target" position={Position.Left} />
      <div className="text-xs overflow-x-auto w-full max-h-[60px]">
        <table className="table-fixed w-full">
          <tbody>
            {Object.entries(data.nodeData).map(([key, value]) => (
              <tr key={key}>
                <td className="pr-2 font-medium break-words">{key}</td>
                <td className="break-words">{String(value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomNode;
