import { BsLinkedin, BsGithub, BsSlack, BsTwitterX } from "react-icons/bs";

const BottomBar = () => {
    return (
        <div className="fixed bottom-0 left-0 w-full bg-[var(--bottom-bg-color)]  px-4 py-2 text-sm z-50 text-[var(--bottom-text-color)]">
            <div className="flex flex-col md:flex-row">
                <div className="w-full">
                    Copyright © 2025 JSON Schema. All rights reserved.
               </div>
               <ul className="flex px-2 gap-4">
                    <li>
                        <a href="https://github.com/jagpreetrahi/visualize-json-schema" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-1">
                           <BsGithub />  
                           Github
                        </a>
                    </li>
                    <li>
                        <a href="https://github.com/jagpreetrahi/visualize-json-schema" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-1">
                            <BsSlack />
                            Slack
                        </a>
                    </li>
                    <li>
                        <a href="https://x.com/jsonschema" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-1">
                            <BsTwitterX />
                            X
                        </a>
                    </li>
                    <li>
                        <a href="https://www.linkedin.com/company/jsonschema/posts/?feedView=all" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-1">
                            <BsLinkedin />
                            Linkedin
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    )
}

export default BottomBar;