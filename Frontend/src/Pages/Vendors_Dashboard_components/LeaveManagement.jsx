import React, { useState } from 'react';
import { 
  ArrowLeft, CalendarOff, CalendarDays, 
  AlertTriangle, Trash2, Plus, Info 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
const LeaveManagement = ({ onBack }) => {
    const navigate = useNavigate();
  // Mock Data: Holiday History
  const [holidays, setHolidays] = useState([
    { id: 1, date: "2026-02-14", reason: "Family Function", status: "Past" },
    { id: 2, date: "2026-02-28", reason: "Kitchen Maintenance", status: "Upcoming" },
    { id: 3, date: "2026-03-25", reason: "Holi Festival", status: "Upcoming" }
  ]);

  const [newDate, setNewDate] = useState("");
  const [newReason, setNewReason] = useState("");

  // Calculate stats for the current month (February 2026 for this example)
  const currentMonthLeaves = holidays.filter(h => h.date.startsWith("2026-02")).length;

  const handleMarkLeave = (e) => {
    e.preventDefault();
    if (!newDate || !newReason) return;

    const newHoliday = {
      id: Date.now(),
      date: newDate,
      reason: newReason,
      status: "Upcoming"
    };

    // Add to list and sort by date
    const updatedHolidays = [...holidays, newHoliday].sort((a, b) => new Date(a.date) - new Date(b.date));
    setHolidays(updatedHolidays);
    
    // Reset form
    setNewDate("");
    setNewReason("");
    alert("Holiday successfully marked and students will be notified!");
  };

  const handleDelete = (id) => {
    setHolidays(holidays.filter(h => h.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* --- Header --- */}
        <div className="flex items-center gap-4">
          <button 
            onClick={()=> navigate("/Ven_Dashboard")}
            className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
            <p className="text-gray-500 text-sm">Mark holidays and track your monthly absences</p>
          </div>
        </div>

        {/* --- Stats Row --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center">
              <CalendarOff size={28} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Leaves This Month</p>
              <h2 className="text-3xl font-bold text-gray-900">{currentMonthLeaves} Days</h2>
            </div>
          </div>

          <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100 flex items-start gap-3">
            <Info className="text-orange-600 shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="font-bold text-orange-900 mb-1">Billing Reminder</h3>
              <p className="text-sm text-orange-800/80">
                For every holiday you mark, 1 day's cost will be automatically deducted from the students' next monthly bill.
              </p>
            </div>
          </div>
        </div>

        {/* --- Main Content Layout --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* LEFT: Mark Leave Form */}
          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm sticky top-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Plus className="text-orange-600" size={20} />
                Mark a Holiday
              </h2>
              
              <form onSubmit={handleMarkLeave} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Select Date</label>
                  <input 
                    type="date" 
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-700 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Reason (Optional)</label>
                  <input 
                    type="text" 
                    value={newReason}
                    onChange={(e) => setNewReason(e.target.value)}
                    placeholder="e.g., Sick leave, Festival"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-700"
                  />
                </div>

                <div className="pt-2">
                  <button 
                    type="submit"
                    className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 shadow-md transition-all flex justify-center items-center gap-2"
                  >
                    <CalendarOff size={18} />
                    Confirm Holiday
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* RIGHT: Leave History List */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <CalendarDays className="text-gray-500" size={20} />
                  Holiday Record
                </h2>
              </div>
              
              <div className="divide-y divide-gray-100">
                {holidays.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 font-medium">
                    No holidays recorded yet.
                  </div>
                ) : (
                  holidays.map((holiday) => (
                    <div key={holiday.id} className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className={`mt-1 .flex-shrink-0 w-2 h-2 rounded-full ${
                          holiday.status === 'Upcoming' ? 'bg-orange-500 animate-pulse' : 'bg-gray-300'
                        }`} />
                        <div>
                          <p className="font-bold text-gray-900 text-lg">{new Date(holiday.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric'})}</p>
                          <p className="text-sm text-gray-500">{holiday.reason || "No reason provided"}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          holiday.status === 'Upcoming' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {holiday.status}
                        </span>
                        
                        {holiday.status === 'Upcoming' && (
                          <button 
                            onClick={() => handleDelete(holiday.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Cancel Holiday"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LeaveManagement;