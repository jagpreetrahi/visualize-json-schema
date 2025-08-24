import React, { useEffect, useState } from "react";
import { CgClose } from "react-icons/cg";
import GraphView from "./GraphView";

const SchemaVisualization = ({ schema }: { schema: string }) => {
  const views = ["Graph", "Tree"];
  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorPopup, setShowErrorPopup] = useState(true);

  const [currentView, setCurrentView] = useState("Graph");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchString = event.target.value.trim();
    if (!searchString) {
      setErrorMessage("");
      return;
    }
    const searchResult = handleSearch(searchString);
    if (!searchResult) {
      setErrorMessage(`${searchString} is not in schema`);
    } else {
      setErrorMessage("");
    }
  };

  const handleSearch = (searchString: string) => {
    return searchString;
  };

  useEffect(() => {
    if (errorMessage) {
      setShowErrorPopup(true);
      const timer = setTimeout(() => {
        setShowErrorPopup(false);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setShowErrorPopup(false);
    }
  }, [errorMessage]);

  return (
    <>
      {currentView === "Graph" ? (
        <GraphView schema={schema} />
      ) : (
        <div className="flex justify-center mt-5">
          <div className="w-fit  tracking-wide text-red-600 px-4 py-2 border-2 rounded-md ">
            <span>Tree visualization is not supported at the moment</span>
          </div>
        </div>
      )}

      {/* View option*/}
      <div className="absolute top-[10px] left-[10px] rounded-md overflow-hidden border border-gray-300">
        {views.map((item, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentView(item)}
            className={`px-3 py-1 text-sm font-medium cursor-pointer
        ${
          currentView === item
            ? "bg-[var(--bottom-bg-color)] text-gray-100"
            : "bg-gray-100 text-[var(--bottom-bg-color)] hover:bg-gray-200"
        }`}
          >
            {item}
          </button>
        ))}
      </div>

      {/*Error Message */}
      {errorMessage && showErrorPopup && (
        <div className="absolute bottom-[50px] left-[100px] flex gap-2 px-2 py-1 bg-red-500 text-white rounded-md shadow-lg">
          <div className="text-sm font-medium tracking-wide font-roboto">
            {errorMessage}
          </div>
          <button
            className="cursor-pointer"
            onClick={() => setShowErrorPopup(false)}
          >
            <CgClose size={18} />
          </button>
        </div>
      )}

      <div className="absolute bottom-[10px] left-[50px]">
        <input
          type="text"
          maxLength={30}
          placeholder="search node"
          className="outline-none text-[var(--bottom-bg-color)] border-b-2 text-center"
          onChange={handleChange}
        />
      </div>
    </>
  );
};

export default SchemaVisualization;
