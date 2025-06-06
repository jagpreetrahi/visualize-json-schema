import { BsLinkedin } from "react-icons/bs";
import { BsSlack } from "react-icons/bs";
import { BsGithub } from "react-icons/bs";
import { BsTwitterX } from "react-icons/bs";

function BottomBar(){

    return (
        <div className="w-full p-4  bg-blue-600 ">
            <div className="flex flex-col md:flex-row justify-content: space-around">
                 
               <div className="w-full">
                  <span className="px-4 py-1 mt-1  text-white">Copyright © 2025 JSON Schema. <br className="md:hidden"/> All rights reserved.</span>
               </div>

                



                <ul className="flex flex-row gap-1 px-2 sm:gap-2 md:gap-4 list-none  mb-2">
                         
                        <li className="mt-2">
                            <a href="https://github.com/jagpreetrahi/visualize-json-schema" target="_blank" rel="noopener noreferrer" className="w-full  flex flex-row  items-center gap-1 sm:gap-2 sm:px-2 md:px-4 md:py-2 sm:py-1 text-sm sm:text-md  md:text-base    px-2 py-1  text-white">
                                <BsGithub />  
                                Github
                             </a>
                        </li>
                         <li className="mt-2">
                            <a href="https://github.com/jagpreetrahi/visualize-json-schema" target="_blank" rel="noopener noreferrer" className="w-full  flex flex-row  items-center gap-1 sm:gap-2 sm:px-2 md:px-4 md:py-2 sm:py-1 text-sm sm:text-md  md:text-base  bg-blue-600  px-2 py-1  text-white ">
                                <BsSlack />
                                Slack
                            </a>
                        </li>
                         <li className="mt-2">
                            <a href="https://x.com/jsonschema" target="_blank" rel="noopener noreferrer" className="w-full  flex flex-row  items-center gap-1 sm:gap-2 sm:px-2 md:px-4 md:py-2 sm:py-1 text-sm sm:text-md  md:text-base  bg-blue-600  px-2 py-1  text-white">
                                <BsTwitterX />
                                X
                            </a>
                        </li>
                         <li className="mt-2">
                            <a href="https://www.linkedin.com/company/jsonschema/posts/?feedView=all" target="_blank" rel="noopener noreferrer" className="w-full  flex flex-row  items-center gap-1 sm:gap-2 sm:px-2 md:px-4 md:py-2 sm:py-1 text-sm sm:text-md  md:text-base  bg-blue-600  px-2 py-1  text-white ">
                                <BsLinkedin />
                                Linkedin
                            </a>
                        </li>
                </ul>

            </div>

        </div>
    )

}

export default BottomBar