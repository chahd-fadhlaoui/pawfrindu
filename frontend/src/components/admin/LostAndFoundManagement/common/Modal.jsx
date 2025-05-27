import { X } from "lucide-react";
import PropTypes from "prop-types";

const Modal = ({ isOpen, onClose, title, report, children, className, isActionLoading, onMatchAction }) => {
  console.log("Modal props:", { isOpen, title, report, hasChildren: !!children, isActionLoading });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-blue-500/90 p-4">
      <div
        className={`bg-white rounded-lg shadow-lg w-full max-w-7xl h-[90vh] overflow-y-auto ${className || ""}`}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 rounded-full hover:text-gray-700 focus:ring-2 focus:ring-pink-400"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex flex-col lg:flex-row h-[calc(100%-5rem)]">
          {/* Left Panel: Selected Report */}
          {report && (
            <div className="p-6 overflow-y-auto border-r border-gray-200 lg:w-1/3">
              <h4 className="mb-4 text-lg font-semibold text-gray-800">
                Selected Report: {report.name || "Unnamed"} ({report.type})
              </h4>
              <div className="space-y-4">
                {/* Primary Photo */}
                <div className="relative">
                  <img
                    src={report.photos?.[0] || "/images/default-pet.png"}
                    alt={report.name || "Pet"}
                    className="object-cover w-full h-48 rounded-lg ring-1 ring-pink-300"
                    onError={(e) => (e.target.src = "/images/default-pet.png")}
                  />
                  {report.photos?.length > 1 && (
                    <span className="absolute px-2 py-1 text-xs font-medium text-white rounded-full top-2 right-2 bg-black/50 backdrop-blur-sm">
                      {report.photos.length} photos
                    </span>
                  )}
                </div>
                {/* Basic Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-600">Species:</span>
                    <span className="text-gray-600">{report.species || "N/A"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-600">Family:</span>
                    <span className="text-gray-600">{report.breed || "N/A"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-600">Colors:</span>
                    <span className="text-gray-600">
                      {Array.isArray(report.color) && report.color.length > 0
                        ? report.color.join(", ")
                        : "Not specified"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-600">Location:</span>
                    <span className="text-gray-600">{report.location?.governorate || "Unknown"}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Right Panel: Potential Matches */}
          <div className={`${report ? "lg:w-2/3" : "w-full"} p-6 overflow-y-auto`}>
            {children || <p className="text-gray-500">No potential matches provided.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  report: PropTypes.object,
  children: PropTypes.node,
  className: PropTypes.string,
  isActionLoading: PropTypes.bool,
  onMatchAction: PropTypes.func,
};

export default Modal;