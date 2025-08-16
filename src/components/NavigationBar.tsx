import { BsBrightnessHigh } from "react-icons/bs";
import { FaGithub, FaSearch } from "react-icons/fa";
// import { MonacoEditorContext } from "../contexts/EditorContext";
// import { ThemeContext } from "../contexts/ThemeContext";
import { useContext } from "react";
import { Tooltip } from "react-tooltip";
import { AppContext } from "../contexts/AppContext";

const NavigationBar = () => {
  // const { toggleButton } = useContext(MonacoEditorContext);
  const { toggleButton, toggleTheme } = useContext(AppContext);
  // const { toggleTheme } = useContext(ThemeContext);
  return (
    <nav className="h-[10vh] flex justify-between items-center shadow-lg relative z-10">
      <div className="flex items-center">
        <img
          src="logo.png"
          alt="Visualize JSON Schema logo"
          className="w-12 h-12 md:w-16 md:h-16"
        />
        <span className="flex flex-col text-center text-lg leading-none font-semibold text-[var(--tool-name-color)] space-y-1">
          <span>JSON Schema</span>
          <span>Visualization </span>
        </span>
      </div>
      <ul className="flex gap-5 mr-10">
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
  );
};

export default NavigationBar;
