import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, Search, MapPin, Key } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Floating Property Elements Background */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute text-slate-200 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              fontSize: `${Math.random() * 10 + 8}px`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${Math.random() * 2 + 3}s`,
            }}
          >
            {['🏠', '🏢', '🏘️', '🏗️', '🗝️'][Math.floor(Math.random() * 5)]}
          </div>
        ))}
      </div>

      {/* City Skyline Silhouette */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-slate-300 to-transparent opacity-30">
        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center space-x-2">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="bg-slate-400 opacity-50"
              style={{
                width: `${Math.random() * 30 + 10}px`,
                height: `${Math.random() * 60 + 20}px`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-2xl mx-auto">
          {/* Floating House with "SOLD" Banner */}
          <div className="relative mb-8">
            <div className="text-8xl animate-float mb-4">
              🏠
            </div>
            {/* "SOLD" Banner */}
            <div className="absolute top-4 right-4 transform rotate-12">
              <div className="bg-red-500 text-white px-3 py-1 rounded-md font-bold text-sm animate-pulse shadow-lg">
                SOLD
              </div>
            </div>
            {/* Dangling Keys */}
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
              <div className="w-0.5 h-16 bg-gradient-to-b from-amber-600 to-amber-400 animate-sway" />
              <div className="text-2xl animate-bounce">🗝️</div>
            </div>
          </div>

          {/* 404 Text with Property Listing Style */}
          <div className="mb-6 relative">
            <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 animate-pulse mb-2">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <h1 className="text-9xl font-bold text-emerald-400 opacity-20 blur-xl animate-pulse">
                404
              </h1>
            </div>
            {/* Property Status Badge */}
            <div className="absolute -top-4 -right-4 bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold border border-red-200 animate-bounce">
              Not Listed
            </div>
          </div>

          {/* Property Listing Description */}
          <div className="space-y-4 mb-8 bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-slate-200">
            <h2 className="text-3xl font-semibold text-slate-800 animate-fade-in">
              🏠 Property Not Found
            </h2>
            <div className="flex items-center justify-center space-x-2 text-slate-600 animate-fade-in animation-delay-200">
              <MapPin className="h-5 w-5 text-red-500" />
              <span className="text-lg">
                Address: <code className="bg-slate-100 px-2 py-1 rounded">{location.pathname}</code>
              </span>
            </div>
            <p className="text-lg text-slate-600 animate-fade-in animation-delay-500">
              Sorry! This property seems to have been moved or doesn't exist in our listings.
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm text-slate-500 animate-fade-in animation-delay-700">
              <div className="text-center">
                <div className="font-semibold">Status</div>
                <div className="text-red-500">❌ Unavailable</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">Listing ID</div>
                <div>ERROR-404</div>
              </div>
            </div>
          </div>

          {/* Floating Real Estate Elements */}
          <div className="absolute top-20 left-20 text-3xl animate-float opacity-60">
            🏢
          </div>
          <div className="absolute top-40 right-20 text-2xl animate-bounce opacity-50">
            📋
          </div>
          <div className="absolute bottom-40 left-40 text-2xl animate-pulse opacity-40">
            🏘️
          </div>
          <div className="absolute top-60 right-40 text-xl animate-spin opacity-30" style={{ animationDuration: '10s' }}>
            🗝️
          </div>

          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in animation-delay-1000">
            <Button 
              onClick={() => window.location.href = '/'}
              className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white px-8 py-3 rounded-full font-semibold text-lg transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Home className="mr-2 h-5 w-5" />
              Browse Properties
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/search'}
              className="border-slate-400 text-slate-700 hover:bg-slate-100 px-8 py-3 rounded-full font-semibold text-lg transform hover:scale-105 transition-all duration-300"
            >
              <Search className="mr-2 h-5 w-5" />
              Search Listings
            </Button>
          </div>

          {/* MLS Style Footer */}
          <div className="mt-12 text-center animate-fade-in animation-delay-1200">
            <div className="bg-slate-800 text-white px-4 py-2 rounded-lg inline-block">
              <p className="text-sm font-mono">
                MLS ID: 404-NOT-FOUND | Error Code: {location.pathname}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Construction Barriers */}
      <div className="absolute bottom-10 left-10 text-4xl animate-bounce opacity-70">
        🚧
      </div>
      <div className="absolute bottom-10 right-10 text-4xl animate-bounce opacity-70" style={{ animationDelay: '0.5s' }}>
        🚧
      </div>

      {/* Additional Floating Dots (Property Markers) */}
      <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
      <div className="absolute top-3/4 right-1/3 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
      <div className="absolute top-1/2 left-1/6 w-4 h-4 bg-purple-500 rounded-full animate-bounce opacity-60" />
    </div>
  );
};

export default NotFound;
