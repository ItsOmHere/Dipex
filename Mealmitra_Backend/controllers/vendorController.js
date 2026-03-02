const VendorProfile = require('../models/VendorProfile');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const Announcement = require('../models/Announcement');

// GET /api/vendor/dashboard
// Fetch dashboard data for a vendor (analytics, pending requests, etc.)
exports.getVendorDashboard = async (req, res) => {
  try {
    const vendorId = req.user.userId; // From the JWT token

    // 1. Get the vendor's profile
    const vendorProfile = await VendorProfile.findOne({ vendorId });
    
    if (!vendorProfile) {
      return res.status(404).json({ message: 'Vendor profile not found' });
    }

    // 2. Get all pending subscription requests for this vendor
    const pendingRequests = await Subscription.find({
      vendor: vendorProfile._id,
      status: 'pending'
    }).populate('customer', 'name email phone'); // Get customer details

    // 3. Get all active subscriptions for this vendor
    const activeSubscriptions = await Subscription.find({
      vendor: vendorProfile._id,
      status: 'active'
    }).populate('customer', 'name email phone');

    // 4. Calculate basic stats
    const totalCustomers = activeSubscriptions.length;
    const monthlyRevenue = activeSubscriptions.reduce((sum, sub) => sum + sub.price, 0);

    res.status(200).json({
      vendorProfile,
      pendingRequests,
      activeSubscriptions,
      stats: {
        totalCustomers,
        monthlyRevenue,
        pendingRequestsCount: pendingRequests.length
      }
    });

  } catch (error) {
    console.error("Vendor Dashboard Error:", error);
    res.status(500).json({ message: 'Server error fetching vendor dashboard' });
  }
};

// POST /api/vendor/approve-request/:subscriptionId
// Vendor approves a pending subscription request
exports.approveSubscriptionRequest = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const vendorId = req.user.userId;

    // 1. Find the subscription and verify it belongs to this vendor
    const subscription = await Subscription.findById(subscriptionId);

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription request not found' });
    }

    const vendorProfile = await VendorProfile.findOne({ vendorId });
    if (subscription.vendor.toString() !== vendorProfile._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized: This is not your request' });
    }

    // 2. Update status to 'active'
    subscription.status = 'active';
    await subscription.save();

    res.status(200).json({ message: 'Subscription approved!', subscription });

  } catch (error) {
    console.error("Approval Error:", error);
    res.status(500).json({ message: 'Server error approving request' });
  }
};

// POST /api/vendor/reject-request/:subscriptionId
// Vendor rejects a pending subscription request
exports.rejectSubscriptionRequest = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const vendorId = req.user.userId;

    const subscription = await Subscription.findById(subscriptionId);

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription request not found' });
    }

    const vendorProfile = await VendorProfile.findOne({ vendorId });
    if (subscription.vendor.toString() !== vendorProfile._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized: This is not your request' });
    }

    // Update status to 'cancelled'
    subscription.status = 'cancelled';
    await subscription.save();

    res.status(200).json({ message: 'Subscription rejected!', subscription });

  } catch (error) {
    console.error("Rejection Error:", error);
    res.status(500).json({ message: 'Server error rejecting request' });
  }
};

// --- 1. Fetch Students (Pending & Active) ---
exports.getVendorStudents = async (req, res) => {
  try {
    const userId = req.user.userId;
    const vendorProfile = await VendorProfile.findOne({ vendorId: userId });

    if (!vendorProfile) {
      return res.status(404).json({ message: 'Vendor profile not found' });
    }

    // Find all subscriptions linked to this vendor, and populate the customer's name and email!
    const students = await Subscription.find({ vendor: vendorProfile._id })
      .populate('customer', 'name email location') 
      .sort({ createdAt: -1 });

    res.status(200).json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ message: 'Server error fetching students' });
  }
};

// --- 2. Update Request Status (Accept/Decline) ---
exports.updateRequestStatus = async (req, res) => {
  try {
    const { subscriptionId, status } = req.body; // status will be 'active' or 'cancelled'

    // Find the subscription and update its status
    const updatedSubscription = await Subscription.findByIdAndUpdate(
      subscriptionId,
      { status: status },
      { new: true }
    ).populate('customer', 'name');

    if (!updatedSubscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    res.status(200).json({ 
      message: `Request successfully marked as ${status}`, 
      subscription: updatedSubscription 
    });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ message: 'Server error updating status' });
  }
};
// --- Fetch Menu & Announcements ---
exports.getCommunicationData = async (req, res) => {
  try {
    const vendorProfile = await VendorProfile.findOne({ vendorId: req.user.userId });
    if (!vendorProfile) return res.status(404).json({ message: 'Profile not found' });

    const announcements = await Announcement.find({ vendorId: vendorProfile._id })
      .sort({ createdAt: -1 })
      .limit(20);
    
    res.status(200).json({
      weeklyMenu: vendorProfile.weeklyMenu,
      announcements
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// --- Update Weekly Menu ---
exports.updateWeeklyMenu = async (req, res) => {
  try {
    const { weeklyMenu } = req.body;
    
    const updatedProfile = await VendorProfile.findOneAndUpdate(
      { vendorId: req.user.userId },
      { weeklyMenu: weeklyMenu },
      { new: true }
    );

    res.status(200).json({ message: 'Menu updated successfully!', weeklyMenu: updatedProfile.weeklyMenu });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating menu' });
  }
};

// --- Post Announcement ---
exports.postAnnouncement = async (req, res) => {
  try {
    const { type, text, date } = req.body;
    if (!text || !String(text).trim()) {
      return res.status(400).json({ message: 'Announcement text is required.' });
    }

    const vendorProfile = await VendorProfile.findOne({ vendorId: req.user.userId });
    if (!vendorProfile) {
      return res.status(404).json({ message: 'Vendor profile not found' });
    }

    await Announcement.create({
      vendorId: vendorProfile._id,
      type: type || 'General',
      text: String(text).trim(),
      date
    });

    const announcements = await Announcement.find({ vendorId: vendorProfile._id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(201).json({ message: 'Announcement posted!', announcements });
  } catch (error) {
    console.error("Error posting announcement:", error);
    res.status(500).json({ message: 'Server error posting announcement' });
  }
};

// --- Get Daily Delivery List (Smart Grouping & Holiday Filter) ---
exports.getDailyDeliveryList = async (req, res) => {
  try {
    // 1. Get the Vendor Profile using your specific auth setup
    const vendorProfile = await VendorProfile.findOne({ vendorId: req.user.userId });
    if (!vendorProfile) {
      return res.status(404).json({ message: 'Vendor profile not found' });
    }

    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    const todayDateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // 2. Fetch all ACTIVE subscriptions for this vendor
    // We populate the 'customer' field to get their name, phone, location, and roomNumber
    const allActiveSubs = await Subscription.find({ 
      vendor: vendorProfile._id, 
      status: 'active' 
    }).populate('customer', 'name phone location roomNumber');

    // 3. The Filter: Remove anyone who has marked today as a holiday
    const deliveriesToday = allActiveSubs.filter(sub => {
      // If skippedDates doesn't exist or today is NOT in the array, they get food!
      return !sub.skippedDates || !sub.skippedDates.includes(todayDateString);
    });

    // 4. Smart Grouping: Group the remaining students by their Hostel/Location
    const groupedDeliveries = deliveriesToday.reduce((acc, sub) => {
      // Safety check in case the customer account was deleted
      if (!sub.customer) return acc; 

      const location = sub.customer.location || 'Unspecified Location';
      
      if (!acc[location]) {
        acc[location] = [];
      }
      
      acc[location].push({
        subscriptionId: sub._id,
        customerName: sub.customer.name,
        roomNumber: sub.customer.roomNumber || 'N/A',
        phone: sub.customer.phone,
        planType: sub.planType,
        mealType: sub.mealType // Veg, Non-Veg
      });
      
      return acc;
    }, {});

    // 5. Send it back to the React frontend
    res.status(200).json({ 
      date: todayDateString,
      totalDeliveries: deliveriesToday.length,
      groupedList: groupedDeliveries 
    });

  } catch (error) {
    console.error("Error fetching delivery list:", error);
    res.status(500).json({ message: 'Server error fetching delivery list' });
  }
};

// --- 1. Fetch Students (Pending & Active) ---
exports.getVendorStudents = async (req, res) => {
  try {
    const userId = req.user.userId;
    const vendorProfile = await VendorProfile.findOne({ vendorId: userId });

    if (!vendorProfile) {
      return res.status(404).json({ message: 'Vendor profile not found' });
    }

    // UPDATE THIS LINE to include phone and roomNumber
    const students = await Subscription.find({ vendor: vendorProfile._id })
      .populate('customer', 'name email phone location roomNumber') 
      .sort({ createdAt: -1 });

    res.status(200).json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ message: 'Server error fetching students' });
  }
};