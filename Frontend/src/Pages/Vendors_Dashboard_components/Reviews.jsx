import React, { useState } from 'react';
import { 
  ArrowLeft, Star, Eye, EyeOff, MessageSquare, 
  ThumbsUp, ShieldAlert, Globe, Lock 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom'; 
const Reviews = () => {
    const Navigate = useNavigate();
  // --- GLOBAL STATE: Controls if the Reviews Section is visible on the Profile ---
  const [isPublicProfile, setIsPublicProfile] = useState(true);

  // Mock Data
  const [reviews, setReviews] = useState([
    { 
      id: 1, 
      student: "Rohan Sharma", 
      date: "2 Days ago", 
      rating: 5, 
      text: "The paneer butter masala was absolutely delicious! Tasted just like home.", 
      reply: "" 
    },
    { 
      id: 2, 
      student: "Priya Patel", 
      date: "1 Week ago", 
      rating: 3, 
      text: "Food is good but the dal was a bit too spicy today. Please reduce chili.", 
      reply: "Noted Priya, we will reduce spice levels next time!" 
    },
    { 
      id: 3, 
      student: "Amit Verma", 
      date: "3 Weeks ago", 
      rating: 4, 
      text: "Great quantity for the price. Roti was soft.", 
      reply: "" 
    }
  ]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* --- Header with GLOBAL SWITCH --- */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button  onClick={()=> Navigate("/Ven_Dashboard")} className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors">
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Reputation Manager</h1>
              <p className="text-gray-500 text-sm">Manage how customers see your ratings</p>
            </div>
          </div>

          {/* --- THE MASTER SWITCH --- */}
          <button 
            onClick={() => setIsPublicProfile(!isPublicProfile)}
            className={`flex items-center gap-3 px-5 py-3 rounded-xl border shadow-sm transition-all ${
              isPublicProfile 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-gray-100 border-gray-200 text-gray-500'
            }`}
          >
            <div className={`p-2 rounded-full ${isPublicProfile ? 'bg-green-200 text-green-700' : 'bg-gray-200 text-gray-400'}`}>
              {isPublicProfile ? <Globe size={20} /> : <Lock size={20} />}
            </div>
            <div className="text-left">
              <span className="block text-xs font-bold uppercase tracking-wider">
                Public Visibility
              </span>
              <span className="block font-bold text-sm">
                {isPublicProfile ? "Reviews are Visible" : "Hidden (Private)"}
              </span>
            </div>
            {/* Toggle Switch UI */}
            <div className={`w-10 h-5 rounded-full relative transition-colors ml-2 ${isPublicProfile ? 'bg-green-500' : 'bg-gray-300'}`}>
              <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all shadow-sm ${isPublicProfile ? 'left-6' : 'left-1'}`}></div>
            </div>
          </button>
        </div>

        {/* --- Reputation Summary Card --- */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
            <h3 className="text-4xl font-bold text-gray-900">4.8</h3>
            <div className="flex justify-center my-2 gap-1 text-yellow-400">
              <Star fill="currentColor" size={20} />
              <Star fill="currentColor" size={20} />
              <Star fill="currentColor" size={20} />
              <Star fill="currentColor" size={20} />
              <Star fill="currentColor" size={20} />
            </div>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide">Average Rating</p>
          </div>

          <div className="col-span-2 bg-orange-50 p-6 rounded-2xl border border-orange-100 flex items-center justify-between">
             <div>
                <h3 className="font-bold text-orange-900 mb-1">Impact on Sales</h3>
                <p className="text-sm text-orange-700/80">
                  {isPublicProfile 
                    ? "Your reviews are helping you get +15% more orders!" 
                    : "Make reviews public to build trust and increase orders."}
                </p>
             </div>
             <div className="bg-white/50 p-3 rounded-full text-orange-600">
               <ThumbsUp size={24} />
             </div>
          </div>
        </div>

        {/* --- Reviews List --- */}
        <div className={`space-y-6 transition-opacity ${!isPublicProfile ? 'opacity-50 grayscale-[0.5]' : ''}`}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Recent Feedback</h2>
            {!isPublicProfile && (
              <span className="flex items-center gap-1 text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded">
                <ShieldAlert size={12} />
                Currently Hidden from Students
              </span>
            )}
          </div>

          {reviews.map((review) => (
            <div key={review.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              {/* Review Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center text-orange-700 font-bold">
                    {review.student.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{review.student}</h3>
                    <p className="text-xs text-gray-400">{review.date}</p>
                  </div>
                </div>
              </div>

              {/* Rating Stars */}
              <div className="flex gap-1 mb-3 text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={16} 
                    fill={i < review.rating ? "currentColor" : "none"} 
                    className={i < review.rating ? "" : "text-gray-300"}
                  />
                ))}
              </div>

              {/* Review Text */}
              <p className="text-gray-700 text-sm leading-relaxed mb-4">
                "{review.text}"
              </p>

              {/* Vendor Actions */}
              <div className="flex items-center gap-4 pt-4 border-t border-gray-50">
                <button className="flex items-center gap-2 text-gray-500 text-xs font-semibold hover:text-orange-600 transition-colors">
                  <MessageSquare size={16} />
                  Reply to Student
                </button>
                <button className="flex items-center gap-2 text-gray-500 text-xs font-semibold hover:text-blue-600 transition-colors">
                  <ThumbsUp size={16} />
                  Helpful
                </button>
              </div>
              
              {/* Reply Section */}
              {review.reply && (
                <div className="mt-4 p-3 bg-orange-50 rounded-xl border border-orange-100 text-sm">
                  <span className="font-bold text-orange-800 text-xs block mb-1">Your Reply:</span>
                  <p className="text-gray-700">{review.reply}</p>
                </div>
              )}

            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Reviews;