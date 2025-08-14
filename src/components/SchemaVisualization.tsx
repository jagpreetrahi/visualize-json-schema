import cytoscape from "cytoscape";
import dagre from "cytoscape-dagre";
import React, { useEffect, useRef, useState } from "react";
import { CgMaximize, CgMathPlus, CgMathMinus, CgClose } from "react-icons/cg";
import { Graph } from "./Graph";
import { CgChevronDown } from "react-icons/cg";

// use the dagre layout
cytoscape.use(dagre);
const SchemaVisualization = ({ schema }: { schema: string }) => {
  const cyRef = useRef<cytoscape.Core | null>(null);
  // view option for  visualization
  const view = ["Graph", "Tree"];
  const [errorMessage, setErrorMessage] = useState("");
  const [zoomlevel, setZoomlevel] = useState(1);
  const [debouncedValue, setDebouncedValue] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [closeError, setCloseError] = useState(false);
  const [isView, setIsView] = useState(false);
  const [isSelected, setIsSelected] = useState("Graph");
  // deeply find the key in the schema
  const RecursivelyKeys = (
    schema: any,
    findkey: string
  ): string | undefined => {
    if (!schema || typeof schema !== "object") return;
    if (schema.properties && typeof schema.properties === "object") {
      for (const key of Object.keys(schema.properties)) {
        if (key === findkey) return key;
        const result = RecursivelyKeys(schema.properties[key], findkey);
        if (result) return result;
      }
    }
    // for an array
    if (schema?.items) {
      if (Array.isArray(schema.items)) {
        for (const item of schema.items) {
          const findItem = RecursivelyKeys(item, findkey);
          if (findItem) return findItem;
        }
      } else {
        return RecursivelyKeys(schema.items, findkey);
      }
    }
    return;
  };

  // track the real type value
  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newInput = event.target.value;
    setInputValue(newInput);
    setErrorMessage("");
    if (newInput) {
      handlePointValue(newInput);
    }
  };
  // change the color after or before matches
  const handlePointValue = (input: any) => {
    const cy = cyRef.current;
    if (!cy) return;
    let found = false;
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

  // debouncing the input value
  useEffect(() => {
    const delayValue = setTimeout(() => {
      setDebouncedValue(inputValue);
    }, 1500);
    return () => clearTimeout(delayValue);
  }, [inputValue]);

  // Validates the value only after the user stop to search
  useEffect(() => {
    if (!debouncedValue) {
      // don't validate it on the empty value;
      setErrorMessage("");
      return;
    }
    try {
      const parsedSchema = JSON.parse(schema);
      // check whether the value is found or not
      const isFound = RecursivelyKeys(parsedSchema, debouncedValue);
      if (!isFound) {
        setErrorMessage(`${debouncedValue} not in properties`);
      } else {
        setErrorMessage("");
        handlePointValue(debouncedValue);
      }
    } catch (error) {
      console.error("Error parsing JSON Schema:", error);
      setErrorMessage("Invalid schema format");
    }
  }, [debouncedValue]);

  useEffect(() => {
    if (errorMessage) {
      setCloseError(false);
    }
  }, [errorMessage]);

  const handleCenter = () => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.zoom(zoomlevel);
    // Center all elements (without changing zoom)
    cy.center(cy.elements());
  };
  // increase  the zoom
  const handleZoomIn = () => {
    const cy = cyRef.current;
    if (!cy) return;
    const currentZoom = cy.zoom();
    const newZoom = Math.min(currentZoom + 0.1, cy.maxZoom());
    const center = { x: cy.width() / 2, y: cy.height() / 2 };
    cy.zoom({ level: newZoom, renderedPosition: center });
    setZoomlevel(newZoom);
  };
  const handleZoomOut = () => {
    const cy = cyRef.current;
    if (!cy) return;
    const currentZoom = cy.zoom();
    const newZoom = Math.max(currentZoom - 0.1, 0.1);
    const center = { x: cy.width() / 2, y: cy.height() / 2 };
    cy.zoom({ level: newZoom, renderedPosition: center });
    setZoomlevel(newZoom);
  };

  return (
    <>
      {/* Cytoscape  */}
      <Graph schema={schema} exposeInstances={cyRef} />

      {/* View option*/}
      <div className="absolute top-[10px] left-[10px] rounded-md overflow-hidden border border-gray-300">
        {view.map((item, idx) => (
          <button
            key={idx}
            onClick={() => setIsSelected(item)}
            className={`px-3 py-1 text-sm font-medium transition-colors duration-200
        ${
          isSelected === item
            ? "bg-[var(--bottom-bg-color)] text-gray-100"
            : "bg-gray-100 text-[var(--bottom-bg-color)] hover:bg-gray-100"
        }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div>
        {/*Error Message */}
        <div className="absolute top-0 right-10 mt-2 w-auto">
          <div>
            {errorMessage && !closeError && (
              <div className="flex flex-row gap-x-2 px-2 py-1 bg-red-400 rounded-sm">
                <p
                  style={{
                    letterSpacing: "1px",
                    color: "white",
                    fontFamily: "Roboto, sans-serif",
                  }}
                >
                  {errorMessage}
                </p>
                <button
                  className="cursor-pointer"
                  onClick={() => setCloseError(true)}
                >
                  <CgClose color="white" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Below controls */}
      <div className="absolute bottom-[10px] left-[10px] visualize flex flex-row">
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
            onChange={handleInput}
          />
        </div>
      </div>
    </>
  );
};

export default React.memo(SchemaVisualization);
