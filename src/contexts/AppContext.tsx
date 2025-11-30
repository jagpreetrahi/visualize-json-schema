import { createContext, type Ref } from "react";

type AppContextType = {
  containerRef: Ref<HTMLDivElement>;
  isFullScreen: boolean;
  toggleFullScreen: () => void;

  theme: "light" | "dark";
  toggleTheme: () => void;
};

export const AppContext = createContext<AppContextType>({} as AppContextType);
