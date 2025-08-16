import { useRef, useContext } from "react";
import { BsArrowsFullscreen } from "react-icons/bs";
import { AppContext } from "../contexts/AppContext";

const FullscreenToggleButton = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { toggleFullScreen } = useContext(AppContext);

  return (
    <div ref={wrapperRef}>
      <button
        onClick={toggleFullScreen}
        className="cursor-pointer"
        style={{ color: "var(--navigation-text-color)" }}
      >
        <BsArrowsFullscreen />
      </button>
    </div>
  );
};

export default FullscreenToggleButton;
