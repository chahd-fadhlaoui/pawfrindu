import React from "react";
import { Heart } from "lucide-react";

const HelpSection = ({ show = true, title = "How to Use This Page", children }) => {
  if (!show) return null;
  
  return (
    <div className="mt-80 rounded-xl overflow-hidden shadow-lg">
      {/* Header section with vibrant gradient */}
      <div className="bg-gradient-to-r from-pink-500 to-amber-400 p-4">
        <h4 className="font-medium text-white flex items-center gap-2">
          <Heart className="w-5 h-5 text-white" fill="white" />
          {title}
        </h4>
      </div>
      
      {/* Content section with subtle background */}
      <div className="bg-white p-6 border-l-4 border-pink-400">
        <ul className="space-y-4">
          {React.Children.map(children, (child, index) => (
            <li className="flex items-start gap-3">
              <div className="min-w-6 h-6 rounded-full bg-amber-300 flex items-center justify-center text-white font-medium text-sm">
                {index + 1}
              </div>
              <div className="text-gray-700">
                {child}
              </div>
            </li>
          ))}
        </ul>
      </div>
      
      {/* Footer accent */}
      <div className="h-1 bg-gradient-to-r from-amber-300 to-pink-300"></div>
    </div>
  );
};

export default HelpSection;