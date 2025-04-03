import React from "react";
import { Heart } from "lucide-react";

const HelpSection = ({ show = true, title = "How to Use This Page", children }) => {
  if (!show) return null;

  return (
    <div className="overflow-hidden shadow-lg mt-28 rounded-xl">
      <div className="p-4 bg-gradient-to-r from-pink-500 to-amber-400">
        <h4 className="flex items-center gap-2 font-medium text-white">
          <Heart className="w-5 h-5 text-white" fill="white" />
          {title}
        </h4>
      </div>
      <div className="p-6 bg-white border-l-4 border-pink-400">
        <ul className="space-y-4">
          {React.Children.map(children, (child, index) => (
            <li key={index} className="flex items-start gap-3">
              <div className="flex items-center justify-center h-6 text-sm font-medium text-white rounded-full min-w-6 bg-amber-300">
                {index + 1}
              </div>
              <div className="text-gray-700">{child}</div>
            </li>
          ))}
        </ul>
      </div>
      <div className="h-1 bg-gradient-to-r from-amber-300 to-pink-300"></div>
    </div>
  );
};

export default HelpSection;