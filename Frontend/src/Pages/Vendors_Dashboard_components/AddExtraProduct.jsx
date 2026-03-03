import React, { useState, useRef } from 'react';
import { 
  ArrowLeft, UploadCloud, Save, X, 
  Image as ImageIcon, CheckCircle, Package 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
const AddExtraProduct = ({onBack}) => {
    const navigate = useNavigate();
  // Form State          
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('Pickle');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('per jar');
  const [description, setDescription] = useState('');
  const [inStock, setInStock] = useState(true);
              
  // Image Upload State    
  const [imagePreview, setImagePreview] = useState(null);         
  const fileInputRef = useRef(null);         
              
  // Handle Image Selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create a temporary URL to preview the selected image
      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);
    }
  };
                 
  // Remove Image
  const handleRemoveImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Handle Form Submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!productName || !price) {
      alert("Please fill in the Product Name and Price.");
      return;
    }
    
    // Here you would typically send this data to your backend API
    console.log("Publishing Product:", { 
      productName, category, price, unit, description, inStock, imagePreview 
    });
    
    alert(`Successfully published ${productName} to your store!`);
    onBack(); // Go back to dashboard after saving
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* --- Header --- */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={()=>navigate("/Ven_Dashboard")}
              className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors shadow-sm"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
              <p className="text-gray-500 text-sm">Create a listing for your homemade extras</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Image Upload */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ImageIcon className="text-orange-500" size={20} />
                Product Image
              </h2>
              
              {/* Image Upload Box */}
              <div 
                className={`relative border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 transition-all ${
                  imagePreview ? 'border-orange-500 bg-orange-50/30' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                }`}
              >
                {imagePreview ? (
                  // Show Preview
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden shadow-sm">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-1.5 bg-white/90 text-red-600 rounded-lg shadow-md hover:bg-red-50 transition-colors"
                      title="Remove Image"
                    >
                      <X size={16} strokeWidth={3} />
                    </button>
                  </div>
                ) : (
                  // Show Upload Prompt
                  <div className="text-center cursor-pointer py-8" onClick={() => fileInputRef.current?.click()}>
                    <div className="w-16 h-16 bg-white border border-gray-200 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <UploadCloud size={28} />
                    </div>
                    <p className="text-sm font-bold text-gray-700 mb-1">Click to upload photo</p>
                    <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
                  </div>
                )}
                
                {/* Hidden File Input */}
                <input 
                  type="file" 
                  accept="image/png, image/jpeg, image/jpg" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleImageChange}
                />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Product Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
              
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-4">
                <Package className="text-blue-500" size={20} />
                Product Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="e.g., Spicy Mango Pickle"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 font-medium"
                  >
                    <option>Pickle</option>
                    <option>Papad / Fryums</option>
                    <option>Traditional Sweets</option>
                    <option>Dry Snacks (Chivda, Sev)</option>
                    <option>Beverages / Syrups</option>
                  </select>
                </div>

                {/* Price & Unit (Combined visually) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Price & Unit <span className="text-red-500">*</span></label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
                      <input 
                        type="number" 
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="150"
                        className="w-full pl-8 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                        required
                      />
                    </div>
                    <select 
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 font-medium"
                    >
                      <option>per jar (500g)</option>
                      <option>per pack (250g)</option>
                      <option>per kg</option>
                      <option>per piece</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description / Ingredients (Optional)</label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell your customers about this item. e.g., Made with pure mustard oil and grandma's secret spices."
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 h-28 resize-none text-gray-900"
                  />
                </div>

                {/* Stock Toggle */}
                <div className="md:col-span-2 p-4 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900">Product Status</h3>
                    <p className="text-xs text-gray-500 mt-1">Is this item currently available for purchase?</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setInStock(!inStock)}
                    className={`relative w-14 h-7 rounded-full transition-colors flex items-center shadow-inner ${
                      inStock ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`absolute w-5 h-5 bg-white rounded-full transition-all shadow-sm ${
                      inStock ? 'left-8' : 'left-1'
                    }`} />
                  </button>
                </div>
              </div>

            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button 
                type="button"
                onClick={onBack}
                className="flex-1 py-3.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="flex-[2] py-3.5 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-colors shadow-md shadow-orange-200 flex items-center justify-center gap-2"
              >
                <CheckCircle size={20} />
                Publish Product to Store
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddExtraProduct;