import BottomBar from "./components/BottomBar"
import NavigationBar from "./components/NavigationBar"
import MonacoEditor from "./components/MonacoEditor"
import { MonacoEditorProvider } from "./contexts/EditorContext"
import './App.css'
import ToolSummary from "./components/ToolSummary"

function App() {
  return (
    <>
      <MonacoEditorProvider>
        <NavigationBar/>
        <ToolSummary/>
        <MonacoEditor/>
      </MonacoEditorProvider>
      <BottomBar />
    </>
  )
      
}
export default App
