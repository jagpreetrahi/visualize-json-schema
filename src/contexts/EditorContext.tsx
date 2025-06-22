import { createContext , useState , useRef , useCallback , useEffect} from "react";
import * as monaco from 'monaco-editor';
import { BsArrowsFullscreen } from "react-icons/bs"

interface MonacoEditorContextType {
  editorRef: React.RefObject<monaco.editor.IStandaloneCodeEditor | null>;
  isEditorFullScreen: boolean;
  editorHeight: string;
  editorWidth: string;
  toggleScreen: () => void;
  toggleButton : React.ReactNode
}

export const MonacoEditorContext = createContext({} as MonacoEditorContextType);

export const MonacoEditorProvider = ({children } : any) => {
  const editorRef =  useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [isEditorFullScreen , setIsEditorFullScreen] = useState(false);
  const editorHeight : string = '80vh'
  const editorWidth : string = '40vw'

  const toggleScreen = useCallback(() => {
    setIsEditorFullScreen(prev => !prev);
  }, []);

  const toggleButton = (
     <button onClick={toggleScreen} className="cursor-pointer"><BsArrowsFullscreen size={25}/></button>
  )

  useEffect(() => {
    function handleScreen(){
      if(editorRef.current){
        editorRef.current.layout()
      }
    }
    window.addEventListener('resize' , handleScreen)
    return  () => window.removeEventListener('resize' , handleScreen)
  }, [])

  const value = {
    editorRef,
    isEditorFullScreen,
    editorHeight,
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



