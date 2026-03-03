import React, { useState } from 'react';
import { Star, X } from 'lucide-react';

const ReviewsPage = () => {
  // --- STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rating, setRating] = useState(0); // For the star rating in modal
  const [hoverRating, setHoverRating] = useState(0); // For hover effect on stars

  // --- HANDLERS ---
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setRating(0); // Reset rating on close
  };

  return (
    <>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Reviews</h1>
          <p className="text-gray-500 mt-1">Share your experience with vendors</p>
        </div>
        <button 
          onClick={openModal}
          className="bg-[#EA580C] hover:bg-orange-700 text-white px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-colors shadow-sm"
        >
          <Star size={18} className="fill-white" />
          Write Review
        </button>
      </div>

      {/* My Review Section (Existing Code) */}
      <div className="mb-10">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-bold text-lg text-gray-900">Mumbai Dabba Wala</h3>
              <div className="flex items-center gap-2 mt-1 mb-3">
                <div className="flex text-yellow-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={16} className="fill-current" />
                  ))}
                </div>
                <span className="text-gray-400 text-xs">25 Jan 2026</span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">kjkk</p>
            </div>
            
            <div className="flex flex-col gap-2">
              <button className="px-4 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:text-black transition-colors">
                Edit
              </button>
              <button className="px-4 py-1.5 border border-red-100 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Existing Review 2 */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-bold text-lg text-gray-900">Maharaja Tiffin Service</h3>
              <div className="flex items-center gap-2 mt-1 mb-3">
                <div className="flex text-yellow-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={16} className="fill-current" />
                  ))}
                </div>
                <span className="text-gray-400 text-xs">3 Jan 2026</span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                Excellent service and delicious food! Always on time and very fresh.
              </p>
            </div>
            
            <div className="flex flex-col gap-2">
              <button className="px-4 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:text-black transition-colors">
                Edit
              </button>
              <button className="px-4 py-1.5 border border-red-100 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* All Reviews Section (Existing Code) */}
      <div className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-6">All Reviews</h2>
        <p className="text-gray-500 text-sm mb-4 -mt-4">See what others are saying</p>

        <div className="space-y-4">
          <ReviewCard 
            name="Jane Smith"
            vendor="South Indian Express"
            initial="J"
            bg="bg-orange-100"
            textColor="text-orange-600"
            date="4 Jan 2026"
            rating={4}
            text="Good authentic South Indian taste. Delivery could be faster."
          />
          <ReviewCard 
            name="Mike Johnson"
            vendor="Maharaja Tiffin Service"
            initial="M"
            bg="bg-orange-100"
            textColor="text-orange-600"
            date="5 Jan 2026"
            rating={5}
            text="Best tiffin service in the area. Highly recommended!"
          />
        </div>
      </div>

      {/* ================= MODAL OVERLAY ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all">
          
          {/* Modal Content */}
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Write a Review</h2>
              <button 
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              
              {/* Select Vendor */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Select Vendor</label>
                <select className="w-full bg-gray-50 border border-gray-200 text-gray-600 text-sm rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-300 transition-all appearance-none cursor-pointer">
                  <option value="" disabled selected>Choose a vendor</option>
                  <option value="maharaja">Maharaja Tiffin Service</option>
                  <option value="south">South Indian Express</option>
                  <option value="mumbai">Mumbai Dabba Wala</option>
                </select>
              </div>

              {/* Star Rating */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="transition-transform hover:scale-110 focus:outline-none"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                    >
                      <Star 
                        size={32} 
                        className={`transition-colors ${
                          star <= (hoverRating || rating) 
                            ? "fill-yellow-400 text-yellow-400" 
                            : "text-gray-300 fill-gray-100"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Text */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Your Review</label>
                <textarea 
                  rows="4"
                  placeholder="Share your experience..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-300 transition-all resize-none"
                ></textarea>
              </div>

              {/* Submit Button */}
              <button className="w-full bg-[#EA580C] hover:bg-orange-700 text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-orange-100">
                Submit Review
              </button>

            </div>
          </div>
        </div>
      )}

    </>
  );
};

// --- Helper Component (Existing) ---
const ReviewCard = ({ name, vendor, initial, bg, textColor, date, rating, text }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex gap-4">
    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${bg} ${textColor}`}>
      {initial}
    </div>
    <div className="flex-1">
      <div className="flex justify-between items-start mb-1">
        <div>
          <h4 className="font-bold text-gray-900 text-sm">{name}</h4>
          <p className="text-gray-400 text-xs">{vendor}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex text-yellow-400">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star} 
                size={14} 
                className={star <= rating ? "fill-current" : "text-gray-200 fill-gray-200"} 
              />
            ))}
          </div>
          <span className="text-gray-400 text-xs">{date}</span>
        </div>
      </div>
      <p className="text-gray-600 text-sm mt-2">{text}</p>
    </div>
  </div>
);

export default ReviewsPage;