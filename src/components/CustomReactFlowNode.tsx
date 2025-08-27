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

const CustomNode = ({ data }: { data: { label: string } }) => {
  console.log(data);
  // const parsedData = JSON.parse(data.label);

  const getType = useCallback((value: unknown) => {
    return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
  }, []);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // const nodeStyle = shapeStyles[getType(parsedData.value)];
  const nodeStyle = shapeStyles[getType("string")];

  return (
    <div
      className="flex justify-center items-center w-[120px] h-[50px]"
      style={nodeStyle}
    >
      <Handle type="target" position={Position.Left} />
      <div><strong>type: </strong> {data.type}</div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

export default CustomNode;
