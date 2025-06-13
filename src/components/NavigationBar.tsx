import type React from "react";
import { BsBrightnessHigh } from "react-icons/bs";
import { FaGithub } from "react-icons/fa";

interface NavigationProps{
   togglebutton : React.ReactNode
}
 

function NavigationBar({togglebutton} : NavigationProps) {
  return (

    
    <nav className="w-full  p-3 flex justify-between items-center bg-white shadow ">
        <div className=" mx-2 flex items-center space-x-2">
            <img src="json-icon.png" alt="JSON Logo" className="w-10 h-10  sm:w-14 sm:h-14 md:w-16 md:h-16 object-contain mt-1" />
             <span className="text-md sm:text-xl md:text-2xl font-semibold text-gray-800">JSON<br />Schema</span>
        </div>
        <ul className="flex gap-2 mx-2 sm:gap-2 md:gap-4 list-none  sm:mr-4 md:mr-9">
          
          <li className="mt-1">
                <button aria-label="Toggle Theme" className="text-2xl  md:text-3xl py-1">
                   <BsBrightnessHigh />
                </button>
           </li>
          <li className="mt-1">
                <button aria-label="Toggle Screen" className="relative px-2 py-1 md:px-4 md:py-2 ">
                   {togglebutton}
                </button>
           </li>
          <li className="mt-1">
                
              <a href="https://github.com/jagpreetrahi/visualize-json-schema" target="_blank" rel="noopener noreferrer" className="w-26  ml-3 md:w-full  flex flex-row  px-2 py-1  items-center gap-2 sm:px-2 md:px-4 md:py-2 sm:py-1  sm:text-md  md:text-base  bg-blue-600   text-white rounded-md hover:bg-blue-700 transition-colors">
                  <FaGithub size={20}/>
                  Star on Github
              </a>
            </li>
        </ul>
    </nav>
  );
}

export default NavigationBar;
