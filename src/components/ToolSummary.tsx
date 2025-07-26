import toolSummary from "../data/toolSummary.json";

const ToolSummary = () => {
  return (
    <div className="flex flex-col items-center">
      {/* <div
        className="text-2xl text-[var(--tool-name-color)]"
        style={{ letterSpacing: "2px", fontFamily: "Roboto, sans-serif" }}
      >
        {toolSummary.title}
      </div> */}
      <div className="max-w-3xl text-md text-[var(--tool-content-color)]">
        {toolSummary.summary}
      </div>
    </div>
  );
};

export default ToolSummary;
