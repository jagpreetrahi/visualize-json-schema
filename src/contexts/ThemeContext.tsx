import { createContext, useEffect, useState, useContext} from "react";
type Theme = 'light' | 'dark';
interface ThemeContextType{
    theme : Theme,
    toggleTheme : () => void
}
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
export const ThemeProvider = ({children} : any) => {
    const [theme , setTheme] = useState<Theme>(() =>{
       const getTheme =  localStorage.getItem('theme') as Theme
       return getTheme || 'light'
    });

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light')
    }

    useEffect(() => {
       localStorage.setItem("theme", theme);
       //for apply the correct CSS variable
        if (theme === "dark") {
            document.documentElement.setAttribute("data-theme", "dark");
        } else {
            document.documentElement.removeAttribute("data-theme");
        }
    }, [theme])
    
    return <ThemeContext.Provider value={{theme , toggleTheme}}>
        {children}
    </ThemeContext.Provider>

}

//custom hook for checks the context for undefined
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};