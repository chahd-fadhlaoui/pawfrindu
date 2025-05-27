import { AlertTriangle, PawPrint, MapPin, Clock, Camera, Heart, ArrowRight, Shield, Users, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate} from "react-router-dom";

const PawIcon = ({ className, style }) => (
  <svg viewBox="0 0 24 24" className={className} style={style} fill="currentColor">
    <path d="M12,17.5c2.33,2.33,5.67,2.33,8,0s2.33-5.67,0-8s-5.67-2.33-8,0S9.67,15.17,12,17.5z M7.5,14.5 c-1.96,1.96-1.96,4.04,0,6s4.04,1.96,6,0s1.96-4.04,0-6S9.46,12.54,7.5,14.5z M18.5,3.5c-1.96-1.96-4.04-1.96-6,0s-1.96,4.04,0,6 s4.04,1.96,6,0S20.46,5.46,18.5,3.5z M3.5,9.5c-1.96,1.96-1.96,4.04,0,6s4.04,1.96,6,0s1.96-4.04,0-6S5.46,7.54,3.5,9.5z" />
  </svg>
);

export default function LostAndFound() {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const PawBackground = () =>
    Array(12)
      .fill(null)
      .map((_, index) => (
        <PawIcon
          key={`paw-${index}`}
          className={`absolute w-4 h-4 opacity-10 animate-float ${
            index % 2 === 0 ? "text-[#ffc929]" : "text-pink-300"
          }`}
          style={{
            animationDelay: `${index * 0.6}s`,
            transform: `rotate(${index * 30}deg)`,
            left: `${8 + (index % 4) * 22}%`,
            top: `${15 + Math.floor(index / 4) * 25}%`,
          }}
        />
      ));

  const handleCardClick = (route) => {
    if (navigator.vibrate) {
      navigator.vibrate([50, 20, 50]);
    }
    console.log(`Navigating to: ${route}`);
    navigate(route);
  };

  return (
    <section className="relative min-h-screen px-4 py-12 overflow-hidden bg-gradient-to-br from-white via-pink-50/50 to-amber-50/30 sm:py-20 sm:px-6 lg:px-8">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <PawBackground />
        <div className="absolute rounded-full top-1/4 right-1/4 w-96 h-96 bg-gradient-radial from-pink-200/20 to-transparent blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-radial from-[#ffc929]/15 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
      
      <div className="relative mx-auto space-y-12 max-w-7xl">
        
        {/* Header */}
        <div className={`pt-16 space-y-6 text-center animate-fadeIn ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="inline-flex items-center px-4 py-2 text-sm font-semibold text-pink-500 bg-white border border-[#ffc929]/20 rounded-full shadow-sm">
            <AlertTriangle className="w-4 h-4 mr-2 text-[#ffc929]" />
            Lost & Found Pet Reports
          </div>
          
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            <span className="block">Lost & Found</span>
            <span className="block text-pink-500">Reuniting Pets</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg leading-relaxed text-gray-600">
            Help reunite lost pets with their families. Every report counts.
          </p>
        </div>
        <div className={`grid grid-cols-1 gap-8 md:grid-cols-2 transition-all duration-800 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          {/* Lost Pet Card */}
          <div 
            className={`relative overflow-hidden transition-all duration-500 transform bg-white/95 backdrop-blur-sm shadow-xl group rounded-3xl hover:shadow-2xl cursor-pointer border border-red-100/60 ${
              hoveredCard === 'lost' ? 'scale-105 shadow-red-200/60' : 'hover:scale-102'
            }`}
            onMouseEnter={() => setHoveredCard('lost')}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => handleCardClick("/report-lost-pet")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleCardClick("/report-lost-pet")}
          >
            <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-12 -translate-y-12 rounded-full bg-gradient-to-br from-red-200/40 to-pink-200/25"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 transform -translate-x-8 translate-y-8 rounded-full bg-red-100/25"></div>
            
            <div className="relative p-8">
              <div className={`flex items-center justify-center mx-auto mb-6 transition-all duration-300 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl w-20 h-20 shadow-lg ${
                hoveredCard === 'lost' ? 'scale-110 rotate-12 shadow-red-200/50' : 'group-hover:scale-105'
              }`}>
                <AlertTriangle className="text-red-600 w-9 h-9" />
              </div>
              
              <h3 className="mb-6 text-2xl font-bold text-center text-red-700">Lost Your Pet?</h3>
              
              <div className="mb-8 space-y-3">
                <div className="flex items-center p-3.5 text-sm text-gray-700 transition-all duration-300 bg-red-50/60 border border-red-100/50 rounded-xl hover:bg-red-50 hover:border-red-200/50 hover:shadow-sm">
                  <Camera className="flex-shrink-0 w-5 h-5 mr-4 text-red-500" />
                  <span>Upload clear photos and detailed descriptions</span>
                </div>
                <div className="flex items-center p-3.5 text-sm text-gray-700 transition-all duration-300 bg-red-50/60 border border-red-100/50 rounded-xl hover:bg-red-50 hover:border-red-200/50 hover:shadow-sm">
                  <MapPin className="flex-shrink-0 w-5 h-5 mr-4 text-red-500" />
                  <span>Pin exact location with our smart mapping</span>
                </div>
                <div className="flex items-center p-3.5 text-sm text-gray-700 transition-all duration-300 bg-red-50/60 border border-red-100/50 rounded-xl hover:bg-red-50 hover:border-red-200/50 hover:shadow-sm">
                  <Clock className="flex-shrink-0 w-5 h-5 mr-4 text-red-500" />
                  <span>Report immediately for maximum visibility</span>
                </div>
              </div>
              
              <button className="w-full px-8 py-4 text-lg font-bold text-white transition-all duration-300 shadow-lg bg-gradient-to-r from-red-500 to-red-600 rounded-2xl hover:from-red-600 hover:to-red-700 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-red-500/30 group-hover:scale-105 active:scale-95">
                <span className="flex items-center justify-center gap-3">
                  <AlertTriangle size={20} />
                  Report Lost Pet
                  <ArrowRight className={`w-5 h-5 transition-all duration-300 ${hoveredCard === 'lost' ? 'translate-x-2' : 'group-hover:translate-x-1'}`} />
                </span>
              </button>
            </div>
          </div>

          {/* Found Pet Card */}
          <div 
            className={`relative overflow-hidden transition-all duration-500 transform bg-white/95 backdrop-blur-sm shadow-xl group rounded-3xl hover:shadow-2xl cursor-pointer border border-green-100/60 ${
              hoveredCard === 'found' ? 'scale-105 shadow-green-200/60' : 'hover:scale-102'
            }`}
            onMouseEnter={() => setHoveredCard('found')}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => handleCardClick("/report-found-pet")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleCardClick("/report-found-pet")}
          >
            <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-12 -translate-y-12 rounded-full bg-gradient-to-br from-green-200/40 to-emerald-200/25"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 transform -translate-x-8 translate-y-8 rounded-full bg-green-100/25"></div>
            
            <div className="relative p-8">
              <div className={`flex items-center justify-center mx-auto mb-6 transition-all duration-300 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl w-20 h-20 shadow-lg ${
                hoveredCard === 'found' ? 'scale-110 rotate-12 shadow-green-200/50' : 'group-hover:scale-105'
              }`}>
                <PawPrint className="text-green-600 w-9 h-9" />
              </div>
              
              <h3 className="mb-6 text-2xl font-bold text-center text-green-700">Found a Pet?</h3>
              
              <div className="mb-8 space-y-3">
                <div className="flex items-center p-3.5 text-sm text-gray-700 transition-all duration-300 bg-green-50/60 border border-green-100/50 rounded-xl hover:bg-green-50 hover:border-green-200/50 hover:shadow-sm">
                  <Camera className="flex-shrink-0 w-5 h-5 mr-4 text-green-500" />
                  <span>Take photos from multiple angles</span>
                </div>
                <div className="flex items-center p-3.5 text-sm text-gray-700 transition-all duration-300 bg-green-50/60 border border-green-100/50 rounded-xl hover:bg-green-50 hover:border-green-200/50 hover:shadow-sm">
                  <MapPin className="flex-shrink-0 w-5 h-5 mr-4 text-green-500" />
                  <span>Mark location on our interactive map</span>
                </div>
                <div className="flex items-center p-3.5 text-sm text-gray-700 transition-all duration-300 bg-green-50/60 border border-green-100/50 rounded-xl hover:bg-green-50 hover:border-green-200/50 hover:shadow-sm">
                  <Heart className="flex-shrink-0 w-5 h-5 mr-4 text-green-500" />
                  <span>Your kindness reunites families</span>
                </div>
              </div>
              
              <button className="w-full px-8 py-4 text-lg font-bold text-white transition-all duration-300 shadow-lg bg-gradient-to-r from-green-500 to-green-600 rounded-2xl hover:from-green-600 hover:to-green-700 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-green-500/30 group-hover:scale-105 active:scale-95">
                <span className="flex items-center justify-center gap-3">
                  <PawPrint size={20} />
                  Report Found Pet
                  <ArrowRight className={`w-5 h-5 transition-all duration-300 ${hoveredCard === 'found' ? 'translate-x-2' : 'group-hover:translate-x-1'}`} />
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Tips */}
        <div className={`bg-white/95 backdrop-blur-sm border border-[#ffc929]/50 shadow-2xl rounded-3xl p-8 transition-all duration-800 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="mb-8 space-y-4 text-center">
            <div className="inline-flex items-center px-4 py-2 text-sm font-medium text-[#ffc929] bg-amber-50/80 border border-amber-200/50 rounded-full">
              <Star className="w-4 h-4 mr-2" />
              Pro Tips
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Quick Tips for Success</h2>
            <p className="text-lg text-gray-600">Simple guidelines that make all the difference</p>
          </div>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="p-6 transition-all duration-300 border group rounded-2xl hover:scale-105 hover:shadow-lg bg-gradient-to-br from-white via-pink-50/40 to-amber-50/25 border-pink-200/60 hover:border-pink-300/60">
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center w-12 h-12 mb-4 bg-gradient-to-br from-pink-100 to-pink-200 rounded-xl">
                  <Camera className="w-6 h-6 text-pink-600" />
                </div>
                <h3 className="mb-3 text-lg font-bold text-gray-900">Clear Photos</h3>
                <p className="text-sm leading-relaxed text-gray-600">Multiple angles with good lighting help identify pets quickly</p>
              </div>
            </div>
            
            <div className="p-6 transition-all duration-300 border group rounded-2xl hover:scale-105 hover:shadow-lg bg-gradient-to-br from-white via-pink-50/40 to-amber-50/25 border-pink-200/60 hover:border-pink-300/60">
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center w-12 h-12 mb-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="mb-3 text-lg font-bold text-gray-900">Precise Location</h3>
                <p className="text-sm leading-relaxed text-gray-600">Pin exact spot on our smart map for targeted searches</p>
              </div>
            </div>
            
            <div className="p-6 transition-all duration-300 border group rounded-2xl hover:scale-105 hover:shadow-lg bg-gradient-to-br from-white via-pink-50/40 to-amber-50/25 border-pink-200/60 hover:border-pink-300/60">
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center justify-center w-12 h-12 mb-4 bg-gradient-to-br from-green-100 to-green-200 rounded-xl">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="mb-3 text-lg font-bold text-gray-900">Act Quickly</h3>
                <p className="text-sm leading-relaxed text-gray-600">Time is critical - immediate reports yield best results</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 mt-8 text-center border bg-gradient-to-r from-pink-50/80 to-rose-50/80 rounded-2xl border-pink-200/60 backdrop-blur-sm">
            <div className="flex items-center justify-center mb-1">
              <Heart className="w-6 h-6 mr-3 text-pink-500" />
              <span className="text-lg font-semibold text-gray-800">Join Our Community</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}