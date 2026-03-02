import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, MapPin, Package, Navigation, 
  ChevronDown, ChevronUp, Leaf, Drumstick, Loader
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LocationSummary = () => {
  const navigate = useNavigate();
  
  const [locations, setLocations] = useState([]);
  const [totalDeliveriesToday, setTotalDeliveriesToday] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // --- FETCH DATA FROM BACKEND ---
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/login');

        const response = await fetch('http://localhost:5000/api/vendor/deliveries/today', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setTotalDeliveriesToday(data.totalDeliveries);

          // Format backend data to match your UI structure
          const formattedLocations = Object.entries(data.groupedList).map(([locationName, students], index) => {
            
            // Calculate Veg vs Non-Veg breakdown
            let vegCount = 0;
            let nonVegCount = 0;
            students.forEach(s => {
              if (s.mealType && s.mealType.toLowerCase().includes('non')) nonVegCount++;
              else vegCount++;
            });

            return {
              id: index, // unique ID for toggling
              name: locationName,
              type: "Delivery Area",
              totalTiffins: students.length,
              breakdown: { veg: vegCount, nonVeg: nonVegCount },
              isExpanded: false, // Default closed
              students: students.map(s => ({
                name: s.customerName,
                room: s.roomNumber || "N/A",
                type: s.mealType || "Veg",
                phone: s.phone
              }))
            };
          });

          setLocations(formattedLocations);
        }
      } catch (error) {
        console.error("Error fetching locations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocations();
  }, [navigate]);

  // Toggle dropdown for student list
  const toggleExpand = (id) => {
    setLocations(locations.map(loc => 
      loc.id === id ? { ...loc, isExpanded: !loc.isExpanded } : loc
    ));
  };

  if (isLoading) {
    return <div className="flex flex-col items-center justify-center min-h-screen text-orange-600"><Loader className="animate-spin mb-4" size={48} /><p className="font-bold">Loading routes...</p></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* --- Header --- */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
               onClick={()=> navigate("/dashboard")}
              className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Location Summary</h1>
              <p className="text-gray-500 text-sm">Pack and route your deliveries</p>
            </div>
          </div>
          
          <div className="bg-orange-100 text-orange-800 px-4 py-2 rounded-xl font-bold flex items-center gap-2 border border-orange-200 w-full sm:w-auto justify-center">
            <Package size={20} />
            {totalDeliveriesToday} Total Tiffins
          </div>
        </div>

        {/* --- Location Cards --- */}
        <div className="space-y-4">
          {locations.length > 0 ? locations.map((loc) => (
            <div key={loc.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
              
              {/* Card Header (Clickable to expand) */}
              <div 
                onClick={() => toggleExpand(loc.id)}
                className="p-5 cursor-pointer hover:bg-gray-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">{loc.name}</h2>
                    <p className="text-sm text-gray-500 font-medium">{loc.type}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 self-end md:self-auto">
                  {/* Delivery Breakdown Badges */}
                  <div className="flex gap-2">
                    {loc.breakdown.veg > 0 && (
                      <span className="flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 px-2 py-1 rounded text-xs font-bold">
                        <Leaf size={12} /> {loc.breakdown.veg} Veg
                      </span>
                    )}
                    {loc.breakdown.nonVeg > 0 && (
                      <span className="flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 px-2 py-1 rounded text-xs font-bold">
                        <Drumstick size={12} /> {loc.breakdown.nonVeg} Non-Veg
                      </span>
                    )}
                  </div>

                  {/* Total Drop-offs */}
                  <div className="text-right flex items-center gap-3 border-l border-gray-200 pl-4">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Drop-offs</p>
                      <p className="text-2xl font-black text-gray-900">{loc.totalTiffins}</p>
                    </div>
                    {loc.isExpanded ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
                  </div>
                </div>
              </div>

              {/* Card Body (Expanded Student List) */}
              {loc.isExpanded && (
                <div className="border-t border-gray-100 bg-gray-50 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-gray-700">Detailed Packing List</h3>
                    <button className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline">
                      <Navigation size={14} /> Navigate
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {loc.students.map((student, index) => (
                      <div key={index} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex justify-between items-center group">
                        <div>
                          <p className="font-bold text-gray-900 text-sm">{student.room}</p>
                          <p className="text-xs text-gray-500">{student.name}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${
                          student.type.toLowerCase().includes('non') 
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800' 
                        }`}>
                          {student.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )) : (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
              <Package size={48} className="mx-auto text-gray-300 mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">No Deliveries Today</h2>
              <p className="text-gray-500 text-sm">Everyone must be on holiday!</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default LocationSummary;