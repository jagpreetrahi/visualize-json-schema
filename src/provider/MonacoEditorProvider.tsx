import {useState, useRef, useCallback, useEffect} from "react";
import * as monaco from 'monaco-editor';
import { BsArrowsFullscreen } from "react-icons/bs"
import {MonacoEditorContext} from "../contexts/EditorContext"
export const MonacoEditorProvider = ({children } : any) => {
  const editorRef =  useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [isFullScreen , setIsFullScreen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const editorHeight : string = '90%';
  const editorWidth : string = '100%';
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