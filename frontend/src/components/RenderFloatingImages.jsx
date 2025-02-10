import React from "react";
const RenderFloatingImages = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute w-16 h-16 transform rotate-12 -top-8 -right-8 bg-[#ffc929]/20 rounded-xl animate-float-slow"></div>
      <div className="absolute w-20 h-20 transform -rotate-12 -bottom-10 -left-10 bg-pink-500/20 rounded-xl animate-float-slower"></div>
      <div className="absolute w-12 h-12 transform rotate-45 top-1/2 -right-6 bg-purple-500/20 rounded-xl animate-float"></div>
    </div>
  );
export default RenderFloatingImages;
  