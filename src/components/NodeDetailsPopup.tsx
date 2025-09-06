import { BsX } from "react-icons/bs";

const NodeDetailsPopup = ({
  data,
  onClose,
}: {
  data: Record<string, unknown>;
  onClose: () => void;
}) => {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
      <div
        className="relative z-50 w-[400px] h-[300px] p-4 rounded-lg shadow-lg transition-all duration-300 bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-1 right-1 text-gray-500 hover:text-black"
          onClick={onClose}
        >
          <BsX size={30} />
        </button>

        <div className="text-xs overflow-y-auto h-full pt-6">
          <table className="table-fixed w-full">
            <tbody>
              {Object.entries(data.nodeData as Record<string, unknown>).map(
                ([key, value]) => (
                  <tr key={key}>
                    <td className="font-medium whitespace-nowrap pr-2">
                      {key}
                    </td>
                    <td className="whitespace-nowrap">{String(value)}</td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default NodeDetailsPopup;
