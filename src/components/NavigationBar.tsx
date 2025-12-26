import { BsGithub, BsMoonStars, BsBook, BsSun } from "react-icons/bs";
import { useContext } from "react";
import { Tooltip } from "react-tooltip";
import { AppContext } from "../contexts/AppContext";
import FullscreenToggleButton from "./FullscreenToggleButton";

const NavigationBar = () => {
  const { theme, toggleTheme } = useContext(AppContext);

  return (
    <nav className="h-[8vh] flex justify-between items-center shadow-lg relative z-10">
      <div className="flex items-center">
        <img
          src={theme === "dark" ? "logo-dark.svg" : "logo-light.svg"}
          alt="Visualize JSON Schema logo"
          className="w-12 h-12 md:w-16 md:h-16"
          draggable="false"
        />
        <span className="flex flex-col text-center text-lg leading-none font-semibold text-[var(--tool-name-color)] space-y-1">
          <span>JSON Schema</span>
          <span>Visualization </span>
        </span>
      </div>
      <ul className="flex gap-5 mr-10">
        <li>
          <button className="text-xl cursor-pointer" onClick={toggleTheme}>
            {theme === "light" ? (
              <BsSun className="text-[var(--navigation-text-color)]" />
            ) : (
              <BsMoonStars className="text-[var(--navigation-text-color)]" />
            )}
          </button>
        </li>
        <li>
          <a
            href="https://github.com/jagpreetrahi/visualize-json-schema"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xl"
            data-tooltip-id="github"
          >
            <BsGithub className="text-[var(--navigation-text-color)]" />
            <Tooltip
              id="github"
              content="Star on Github"
              style={{ fontSize: "10px" }}
            />
          </a>
        </li>
        <li>
          <a
            href="https://github.com/jagpreetrahi/visualize-json-schema?tab=readme-ov-file#json-schema-visualizer"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xl"
            data-tooltip-id="learn-keywords"
          >
            <BsBook className="text-[var(--navigation-text-color)]" />
            <Tooltip
              id="learn-keywords"
              content="Docs"
              style={{ fontSize: "10px" }}
            />
          </a>
        </li>
        <li>
          <FullscreenToggleButton />
        </li>
      </ul>
    </nav>
  );
};

export default NavigationBar;
