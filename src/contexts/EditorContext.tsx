import { createContext} from "react";
import * as monaco from 'monaco-editor';

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




