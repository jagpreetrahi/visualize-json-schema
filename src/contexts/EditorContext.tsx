import { createContext , useState , useRef , useCallback , useEffect} from "react";
import * as monaco from 'monaco-editor';
import { BsArrowsFullscreen } from "react-icons/bs"

interface MonacoEditorContextType {
  editorRef: React.RefObject<monaco.editor.IStandaloneCodeEditor | null>;
  containerRef : React.RefObject<HTMLDivElement | null>;
  isFullScreen: boolean;
  editorHeight: string;
  editorWidth: string;
  toggleScreen: () => void;
  toggleButton : React.ReactNode
}

export const MonacoEditorContext = createContext({} as MonacoEditorContextType);

export const MonacoEditorProvider = ({children } : any) => {
  const editorRef =  useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [isFullScreen , setIsFullScreen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const editorHeight : string = '80vh';
  const editorWidth : string = '40vw';
  const toggleScreen = useCallback(() => {
    if(!document.fullscreenElement){
        containerRef.current?.requestFullscreen();
     }
     else{
        document.exitFullscreen();
     }
  }, []);

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement)
    }
    document.addEventListener("fullscreenchange" , handleFullScreenChange);
    return () => {
      document.removeEventListener("fullscreenchange" , handleFullScreenChange)
    }
  }, [])

  const toggleButton = (
     <button  id="btn-toggle" onClick={toggleScreen} className="cursor-pointer" style={{ color: 'var(--navigation-text-color)' }}><BsArrowsFullscreen/></button>
  )
  const value = {
    editorRef,
    isFullScreen,
    editorHeight,
    containerRef,
    editorWidth,
    toggleScreen,
    toggleButton
  };

  return (
    <MonacoEditorContext.Provider value={value}>
      {children}
    </MonacoEditorContext.Provider>
  )
}



