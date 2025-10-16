import { createContext, type Ref } from "react";

type AppContextType = {
  containerRef: Ref<HTMLDivElement>;
  isFullScreen: boolean;
  theme: "light" | "dark",
  toggleFullScreen: () => void;
  toggleTheme: () => void;
};

export const AppContext = createContext<AppContextType>({} as AppContextType);
