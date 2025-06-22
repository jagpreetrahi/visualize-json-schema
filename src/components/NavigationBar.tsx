import { BsBrightnessHigh } from "react-icons/bs";
import { FaGithub } from "react-icons/fa";
import { MonacoEditorContext } from "../contexts/EditorContext";
import { useContext, useState } from "react";
import exploreKeyword from './../data/basic-json-schema.json'
import { FaTimes } from "react-icons/fa";

const  NavigationBar = () => {
  const {toggleButton} = useContext(MonacoEditorContext);

  return (
    <>
      <nav className="w-full  p-3 flex justify-between items-center bg-white shadow ">
        <div className=" mx-2 flex items-center space-x-2">
          <img src="json-icon.png" alt="JSON Logo" className="w-10 h-10  sm:w-14 sm:h-14 md:w-16 md:h-16 object-contain mt-1" />
          <span className="text-md sm:text-xl md:text-2xl font-semibold text-gray-800">JSON<br />Schema</span>
        </div>
        <ul className="flex gap-2 mx-2 sm:gap-2 md:gap-5 list-none  sm:mr-4 md:mr-9">
          <li className="mt-1">
            <button aria-label="Toggle Theme" className="text-xl  md:text-2xl py-1">
              <BsBrightnessHigh />
            </button>
          </li>
          <li className="mt-2">
            <a aria-label="Toggle Screen" className="px-2 py-1 md:px-4 md:py-2 ">
              {toggleButton}
            </a>
          </li>
          <li className="mt-1">
            <ExploreNavButton content ={exploreKeyword}  trigger="Explore keywords"/>
          </li>
          <li className="mt-1">
            <a href="https://github.com/jagpreetrahi/visualize-json-schema" target="_blank" rel="noopener noreferrer" className="w-26  ml-3 md:w-full  flex flex-row  px-2 py-1  items-center gap-2  md:px-2 md:py-1  md:text-base  bg-blue-600   text-white rounded-md hover:bg-blue-700 transition-colors">
              <FaGithub size={20}/>
              Star on Github
            </a>
          </li>
        </ul>
      </nav>
       
    </>
   
  );
}

type SchemaDetails = {
  title : string,
  description?: string |undefined,
  points?: { term: string; definition: string }[] | undefined
}

const ExploreNavButton = ({content, trigger} : {content : SchemaDetails[]; trigger : string}) => {
    const [isOpen, setIsOpen] = useState(false);
   
    return (
       <div>
          <button onClick={() => setIsOpen(true)} className="explore-btn">
            {trigger}
          </button>
          {isOpen && (
            <>
              <div className="fixed inset-0 bg-neutral-700 z-50 bg-opacity-50"/>
                 {/* Popup Panel */}
                 <div className="fixed top-2 left-4 w-full  z-50 p-2">
                    <div className="flex flex-row justify-between ">
                        <span className="text-white text-2xl mx-10 ">Explore JSON Schema Keyword</span>
                        <button onClick={() => setIsOpen(false)} aria-label="Close" className="mr-10">
                          <FaTimes color="white" size={30} className="border cursor-pointer "/>
                        </button>
                        
                     </div>
                   <hr className="w-full border-t border-gray-300 my-4 mx-0 " />  
                  <ul className="mb-14">
                    {content.map((ctn , index ) => (
                      <li key={index}>
                        <div>
                          <span className="explore-title">{ctn.title}</span>
                            {"description" in ctn ? (
                              <p className="text-gray-200 text-md mx-10 text-xl mt-3 mb-8">{ctn.description}</p>
                              ) : (
                                <ul className="ml-10 mt-3  text-gray-200 text-lg space-y-1 list-none">
                                  {ctn.points?.map((point, idx) => (
                                    <li key={idx}>
                                      <strong>{point.term} :</strong> {point.definition}
                                    </li>
                                  ))}
                                </ul>
                              )}
                             
                          </div>
                          
                      </li>
                    ))}
                 </ul>
                 <div className="flex flex-row justify-between">
                    <div className="flex flex-row gap-4">
                       <span className="text-md text-white mt-2">Do you want to explore more</span>
                       <a href="https://www.learnjsonschema.com/2020-12/" target="_blank" className="w-fit relative px-4 py-2  bg-blue-800 text-white text-md rounded-md hover:bg-blue-900">Explore Keywords</a>
                       <a href="https://tour.json-schema.org/" target="_blank" className="w-fit relative px-4 py-2  bg-blue-800 text-white text-md rounded-md hover:bg-blue-900">Explore Playground</a>
                    </div>
                    <div>
                        <button onClick={() => setIsOpen(false)} className="border text-white text-md px-4 py-2 rounded-sm mr-10 cursor-pointer">Close</button>
                    </div>
                  </div>
              </div>
            </>
      )}
       </div>
    )

}

export default NavigationBar;
