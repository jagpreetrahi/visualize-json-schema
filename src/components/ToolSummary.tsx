import toolSummary from "../data/toolSummary.json";

const ToolSummary = () => {
  return (
    <div className="text-[var(--tool-content-color)] text-center">
      {toolSummary.summary}
    </div>
  );
};

export default ToolSummary;
