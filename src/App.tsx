
import BottomBar from "./components/BottomBar"
import NavigationBar from "./components/NavigationBar"
import MonacoEditor from "./components/Monaco-Editor"
import { useEffect, useRef, useState } from "react";
import { BsArrowsFullscreen } from "react-icons/bs";
import * as monaco from 'monaco-editor';
 



function App() {

  const editorRef =  useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  
  const [isEditorFullScreen , setEditorFullScreen] = useState(false);

  const editorHeight : string = '80vh'
  const editorWidth : string = '100%'

  function ToggleScreen() : void{
      setEditorFullScreen((prev) => !prev);
  }

  const togglebutton = (
     <button onClick={ToggleScreen}><BsArrowsFullscreen size={25}/></button>
  )

  useEffect(() => {

    function handleScreen(){
        if(editorRef.current){
            editorRef.current.layout
        }
    }
    window.addEventListener('resize' , handleScreen)

    return  () => window.removeEventListener('resize' , handleScreen)

      
  }, [])


  return (
      isEditorFullScreen ? (
            <MonacoEditor height={editorHeight} width={editorWidth} togglebutton={togglebutton}/>
      ) : (
        <>
        <NavigationBar togglebutton={togglebutton}/>
        <MonacoEditor height={editorHeight} width={editorWidth}/>
          <BottomBar />
        </>
          
      )
    )
      
}


export default App
