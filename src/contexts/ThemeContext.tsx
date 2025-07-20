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
       // fallback for invalid data
       return (getTheme === 'light' || getTheme === 'dark') ? getTheme : 'light';
    });

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light')
    }
    useEffect(() => {
       localStorage.setItem("theme", theme);
       //for apply the correct CSS variable
       document.documentElement.setAttribute("data-theme", theme);
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