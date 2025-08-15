import cytoscape from "cytoscape";
import dagre from "cytoscape-dagre";
import React, { useEffect, useRef, useState } from "react";
import { CgMaximize, CgMathPlus, CgMathMinus, CgClose } from "react-icons/cg";
import { Graph } from "./Graph";

// use the dagre layout
cytoscape.use(dagre);
const SchemaVisualization = ({ schema }: { schema: string }) => {
  const views = ["Graph", "Tree"];
  const cyRef = useRef<cytoscape.Core | null>(null);

  const [errorMessage, setErrorMessage] = useState("");
  const [showErrorPopup, setShowErrorPopup] = useState(true);

  const [currentView, setCurrentView] = useState("Graph");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchString = event.target.value;
    if(!searchString){
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

  // change color of the node if there's a match
  const handleSearch = (input: string) => {
    let found = false;
    const cy = cyRef.current;
    if (!cy) return;

    cy.nodes().forEach((node) => {
      const label = node.data("label");
      if (label === input) {
        node.data("matched", true);
        found = true;
      } else {
        node.data("matched", false);
      }
    });
    return found;
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

  const handleCenter = () => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.center(cy.elements());
  };

  const handleZoomIn = () => {
    const cy = cyRef.current;
    if (!cy) return;
    const currentZoomLevel = cy.zoom();
    const newZoomLevel = parseFloat(
      Math.min(currentZoomLevel + 0.1, cy.maxZoom()).toFixed(2)
    );
    const center = { x: cy.width() / 2, y: cy.height() / 2 };
    cy.zoom({ level: newZoomLevel, renderedPosition: center });
  };

  const handleZoomOut = () => {
    const cy = cyRef.current;
    if (!cy) return;
    const currentZoomLevel = cy.zoom();
    const newZoomLevel = parseFloat(
      Math.max(currentZoomLevel - 0.1, 0.1).toFixed(2)
    );
    const center = { x: cy.width() / 2, y: cy.height() / 2 };
    cy.zoom({ level: newZoomLevel, renderedPosition: center });
  };

  return (
    <>
      {/* Cytoscape  */}
      {currentView === "Graph" ? (
        <Graph schema={schema} exposeInstances={cyRef} />
      ) : (
        <></>
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

      {/* Bottom controls */}
      <div className="absolute bottom-[10px] left-[10px] flex flex-row">
        <ul className="flex gap-2 rounded mr-5 px-2 py-1 bg-gray-300">
          <li>
            <button className="cursor-pointer" onClick={handleCenter}>
              <CgMaximize size={15} />
            </button>
          </li>
          <li>
            <button className="cursor-pointer" onClick={handleZoomIn}>
              <CgMathPlus size={15} />
            </button>
          </li>
          <li>
            <button className="cursor-pointer" onClick={handleZoomOut}>
              <CgMathMinus size={15} />
            </button>
          </li>
        </ul>
        <div>
          <input
            type="text"
            maxLength={30}
            placeholder="search node"
            className="outline-none text-[var(--bottom-bg-color)] border-b-2 text-center"
            onChange={handleChange}
          />
        </div>
      </div>
    </>
  );
};

export default React.memo(SchemaVisualization);
