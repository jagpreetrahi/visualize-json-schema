import BottomBar from "./components/BottomBar";
import NavigationBar from "./components/NavigationBar";
import MonacoEditor from "./components/MonacoEditor";
import { MonacoEditorProvider } from "./provider/MonacoEditorProvider";
import { ThemeProvider } from "./provider/ThemeProvider";
import "./style/theme.css";
import "./App.css";

function App() {
  return (
    <>
      <ThemeProvider>
        <MonacoEditorProvider>
          <NavigationBar />
          <MonacoEditor />
        </MonacoEditorProvider>
        <BottomBar />
      </ThemeProvider>
    </>
  );
}
export default App;
