import { createContext, type Ref } from "react";

type AppContextType = {
  containerRef: Ref<HTMLDivElement>;
  isFullScreen: boolean;
  toggleFullScreen: () => void;

  theme: string;
  toggleTheme: () => void;
};

export const AppContext = createContext<AppContextType>({} as AppContextType);
