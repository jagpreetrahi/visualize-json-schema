import { createContext, type ReactNode, type Ref } from "react";

type AppContextType = {
  containerRef: Ref<HTMLDivElement>;
  isFullScreen: boolean;
  toggleButton: ReactNode;

  theme: string;
  toggleTheme: () => void;
};

export const AppContext = createContext<AppContextType>({} as AppContextType);
