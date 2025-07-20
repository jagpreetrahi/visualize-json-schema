import ToolData from './../data/tool-title-data.json'
const ToolSummary = () => {
    return (
        <div className='w-full mx-auto mt-5'>
           <div className='flex flex-col items-center'>
               <div className='text-2xl text-[var(--tool-name-color)]' style={{letterSpacing : '2px', fontFamily : 'Roboto, sans-serif' }}>
                   {ToolData.title}
               </div>
               <div className='max-w-3xl text-md text-[var(--tool-content-color)]'>
                  {ToolData.content}
               </div>
            </div>
       </div>
    )
}
export default ToolSummary