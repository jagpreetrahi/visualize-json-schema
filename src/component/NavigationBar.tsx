import { IoIosSunny } from "react-icons/io";
import { FaGithub } from "react-icons/fa";
 

function Navbar() {
  return (

    
    <nav className="w-full  p-3 flex justify-between items-center bg-white shadow ">
        <div className=" mx-4 flex items-center space-x-2">
            <img src="json-icon.png" alt="JSON Logo" className="w-12 h-12  sm:w-14 sm:h-14 md:w-16 md:h-16 object-contain mt-1" />
             <span className="text-xl sm:text-xl md:text-2xl font-semibold text-gray-800">JSON<br />Schema</span>
        </div>
        <ul className="flex gap-1 sm:gap-2 md:gap-4 list-none mr-2 sm:mr-4 md:mr-9">
          
          <li className="text-xl sm:text-xl md:text:2xl mr-6 mt-1">
                <button aria-label="Toggle Theme" className="text-xl sm:text-2xl md:text-3xl mr-6 hover:text-yellow-500 transition-colors">
                    <IoIosSunny/>
                </button>
           </li>
          <li className="mt-1">
                
              <a href="" target="_blank" className="w-full  flex flex-row  items-center gap-1 sm:gap-2 sm:px-2 md:px-4 md:py-2 sm:py-1 text-sm sm:text-md  md:text-base  bg-blue-600  px-2 py-1  text-white rounded-md hover:bg-blue-700 transition-colors">
                    <FaGithub size={20}/>
                    Star on Github
              </a>
            </li>
        </ul>
    </nav>
  );
}

export default Navbar;
