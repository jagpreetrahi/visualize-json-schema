import BottomBar from "./components/BottomBar"
import NavigationBar from "./components/NavigationBar"
import MonacoEditor from "./components/MonacoEditor"
import { MonacoEditorProvider } from "./contexts/EditorContext"
import './App.css'

function App() {
  return (
    <>
      <MonacoEditorProvider>
        <NavigationBar/>
        <MonacoEditor/>
        </MonacoEditorProvider>
      <BottomBar />
    </>
  )
      
}
export default App
