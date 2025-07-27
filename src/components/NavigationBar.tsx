import { BsBrightnessHigh } from "react-icons/bs";
import { FaGithub, FaSearch } from "react-icons/fa";
import { CgChevronDown } from "react-icons/cg";
import { MonacoEditorContext } from "../contexts/EditorContext";
import { ThemeContext } from "../contexts/ThemeContext";
import { useContext, useState } from "react";
import { Tooltip } from "react-tooltip";

const NavigationBar = () => {
  const view = ["Graph", "Tree"];
  const [isView, setIsView] = useState(false);
  const [isSelected, setIsSelected] = useState("Graph");

  const { toggleButton } = useContext(MonacoEditorContext);
  const { toggleTheme } = useContext(ThemeContext);
  return (
    <>
      <nav className="flex justify-between items-center h-[10vh] bg-amber-100">
        <div className="flex items-center">
          <img
            src="logo.png"
            alt="Visualize JSON Schema logo"
            className="w-12 h-12 md:w-16 md:h-16"
          />
          <span className="flex flex-col text-center sm:text-xl md:text-xl leading-none font-semibold text-[var(--tool-name-color)] space-y-1">
            <span>JSON Schema</span>
            <span>Visualization</span>
          </span>
        </div>
        <ul className="flex gap-5 mr-10">
          <li>
            <div className="relative">
              <button
                className="text-[var(--view-text-color)] cursor-pointer flex items-center gap-x-1"
                onClick={() => setIsView((prev) => !prev)}
              >
                View
                <CgChevronDown size={12} />
              </button>
              {isView && (
                <div className="absolute mt-2 bg-[var(--view-bg-color)] rounded-sm px-2 py-1">
                  <ul className="flex gap-x-2 text-[var(--view-text-color)]">
                    {view.map((item, idx) => (
                      <li key={idx}>
                        <button
                          onClick={() => setIsSelected(item)}
                          className={`${
                            isSelected === item
                              ? "bg-neutral-400"
                              : "bg-transparent hover:bg-neutral-400"
                          } p-1 rounded cursor-pointer`}
                        >
                          {item}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </li>
          <li>
            <button
              aria-label="Toggle Theme"
              className="text-xl cursor-pointer"
              onClick={toggleTheme}
            >
              <BsBrightnessHigh
                style={{ color: "var(--navigation-text-color)" }}
              />
            </button>
          </li>
          <li>
            <a
              href="https://github.com/jagpreetrahi/visualize-json-schema"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xl"
              data-tooltip-id="github"
              data-tooltip-content="Star on Github"
            >
              <FaGithub style={{ color: "var(--navigation-text-color)" }} />
              <Tooltip id="github" />
            </a>
          </li>
          <li>
            <a
              href="https://www.learnjsonschema.com/2020-12/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xl"
              data-tooltip-id="learn-keywords"
              data-tooltip-content="Explore Keywords"
            >
              <FaSearch style={{ color: "var(--navigation-text-color)" }} />
              <Tooltip id="learn-keywords" />
            </a>
          </li>
          <li>
            <a aria-label="Toggle Screen">{toggleButton}</a>
          </li>
        </ul>
      </nav>
    </>
  );
};

export default NavigationBar;
