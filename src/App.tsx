import BottomBar from "./components/BottomBar"
import NavigationBar from "./components/NavigationBar"
import MonacoEditor from "./components/MonacoEditor"
import { MonacoEditorProvider } from "./contexts/EditorContext"
import { ThemeProvider } from "./contexts/ThemeContext"
import './style/theme.css'
import './App.css'
import ToolSummary from "./components/ToolSummary"

function App() {
  return (
    <>
      <ThemeProvider>
          <MonacoEditorProvider>
            <NavigationBar/>
            <ToolSummary/>
            <MonacoEditor/>
          </MonacoEditorProvider>
          <BottomBar />
      </ThemeProvider>
    </>
  )
      
}
export default App
