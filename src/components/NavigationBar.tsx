import { BsBrightnessHigh, BsMoon } from "react-icons/bs";
import { FaGithub, FaSearch } from "react-icons/fa";
import { MonacoEditorContext } from "../contexts/EditorContext";
import {useTheme} from "../contexts/ThemeContext"
import { useContext} from "react";
import { Tooltip } from 'react-tooltip'

const  NavigationBar = () => {
  const {toggleButton} = useContext(MonacoEditorContext);
  const {theme, toggleTheme} = useTheme();
  return (
    <>
      <nav className="p-3 flex justify-between items-center">
        <div className="flex space-x-2">
          <img src="json-icon.png" alt="JSON Schema logo" className="w-15 h-15 md:w-16 md:h-16" />
          <span className="text-md sm:text-xl md:text-2xl font-semibold text-gray-600">JSON<br />Schema</span>
        </div>
        <ul className="flex gap-5 mr-10">
          <li>
            <a href="https://www.learnjsonschema.com/2020-12/" target="_blank" rel="noopener noreferrer" className="text-xl" data-tooltip-id="learn-keywords" data-tooltip-content="Explore Keywords">
              <FaSearch />
              <Tooltip id="learn-keywords" />
            </a>
          </li>
          <li>
            <a href="https://github.com/jagpreetrahi/visualize-json-schema" target="_blank" rel="noopener noreferrer" className="text-xl" data-tooltip-id="github" data-tooltip-content="Star on Github">
              <FaGithub/>
              <Tooltip id="github"/>
            </a>
          </li>
          <li>
            <button aria-label="Toggle Theme" className="text-xl cursor-pointer" onClick={toggleTheme}>
              {theme === 'light' ? <BsMoon/> : <BsBrightnessHigh />}
            </button>
          </li>
          <li>
            <a aria-label="Toggle Screen">
              {toggleButton}
            </a>
          </li>
        </ul>
      </nav>
    </>
   
  );
}
export default NavigationBar;
