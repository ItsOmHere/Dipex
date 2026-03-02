const User = require('../models/User');
const Subscription = require('../models/Subscription');
const DailyMenu = require('../models/DailyMenu');
const Announcement = require('../models/Announcement');


exports.getDailyDeliveryList = async (req, res) => {
  try {
    const vendorId = req.vendor.id; // From your auth middleware
    
    // Get today's date in YYYY-MM-DD format (to match how you saved skippedDates)
    // We use a slight timezone adjustment to ensure it matches Indian Standard Time (IST) if needed
    const today = new Date();
    const todayDateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // 1. Fetch all ACTIVE subscriptions for this vendor
    // We populate the customer data so we know their name, location, and room number
    const allActiveSubs = await Subscription.find({ 
      vendorId: vendorId, 
      status: 'active' 
    }).populate('customerId', 'name phone location roomNumber');

    // 2. The Filter: Remove anyone who has marked today as a holiday
    const deliveriesToday = allActiveSubs.filter(sub => {
      // If skippedDates doesn't exist or today is NOT in the array, they get food!
      return !sub.skippedDates || !sub.skippedDates.includes(todayDateString);
    });

    // 3. Smart Grouping: Group the remaining students by their Hostel/Location
    const groupedDeliveries = deliveriesToday.reduce((acc, sub) => {
      // Handle cases where the customer might have deleted their account but sub remains
      if (!sub.customerId) return acc; 

      const location = sub.customerId.location || 'Unspecified Location';
      
      if (!acc[location]) {
        acc[location] = [];
      }
      
      acc[location].push({
        subscriptionId: sub._id,
        customerName: sub.customerId.name,
        roomNumber: sub.customerId.roomNumber || 'N/A',
        phone: sub.customerId.phone,
        planType: sub.planType,
        mealType: sub.mealType // Veg, Non-Veg
      });
      
      return acc;
    }, {});

    res.status(200).json({ 
      date: todayDateString,
      totalDeliveries: deliveriesToday.length,
      groupedList: groupedDeliveries 
    });

  } catch (error) {
    console.error("Error fetching delivery list:", error);
    res.status(500).json({ error: "Server error fetching delivery list" });
  }
};
// GET PROFILE
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password'); 
    if (!user) return res.status(404).json({ error: "User not found" });
    
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Server error fetching profile" });
  }
};

// UPDATE PROFILE
exports.updateProfile = async (req, res) => {
  try {
    // Extracting exactly what matches your schema
    const { name, phone, location, roomNumber } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { name, phone, location, roomNumber },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) return res.status(404).json({ error: "User not found" });

    res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Server error updating profile" });
  }
};
exports.updateHolidays = async (req, res) => {
  try {
    const subscriptionId = req.params.id;
    const customerId = req.user.userId || req.user.id;
    const { skippedDates } = req.body;

    if (!Array.isArray(skippedDates)) {
      return res.status(400).json({ error: "skippedDates must be an array." });
    }

    // Normalize to YYYY-MM-DD and deduplicate
    const normalizedDates = [...new Set(
      skippedDates
        .map((d) => String(d).trim())
        .map((d) => (d.includes('T') ? d.slice(0, 10) : d))
        .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d))
    )].sort();

    // Update only if this subscription belongs to logged-in customer
    const updatedSubscription = await Subscription.findByIdAndUpdate(
      { _id: subscriptionId, customer: customerId },
      { skippedDates: normalizedDates },
      { new: true }
    );

    if (!updatedSubscription) {
      return res.status(404).json({ error: "Subscription not found for this customer." });
    }

    res.status(200).json({ 
      message: "Holidays updated successfully!", 
      subscription: updatedSubscription 
    });

  } catch (error) {
    console.error("Error updating holidays:", error);
    res.status(500).json({ error: "Server error while saving holidays" });
  }
};
exports.getCustomerDashboard = async (req, res) => {
  try {
    const customerId = req.user.userId || req.user.id; 

    // 1. Fetch the customer's active subscription (You probably already have this logic)
    const activeSubscription = await Subscription.findOne({ 
        customerId: customerId, 
        status: 'active' 
    }).populate('vendorId');

    let vendorAnnouncements = [];

    // 2. If they are subscribed to someone, fetch that vendor's announcements
    if (activeSubscription) {
      vendorAnnouncements = await Announcement.find({ 
          vendorId: activeSubscription.vendorId._id 
      })
      .sort({ createdAt: -1 })
      .limit(3); // Only grab the latest 3 so the ticker doesn't get ridiculously long
    }

    // 3. Send everything back to the frontend
    res.status(200).json({
      user: req.user,
      subscription: activeSubscription,
      announcements: vendorAnnouncements, // <-- Add this to your existing response!
      // ... stats, todaysMenu, etc.
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Dashboard fetch failed" });
  }
};

exports.getDashboardData = async (req, res) => {
  try {
    const customerId = req.user.userId || req.user.id;
    const allSubscriptions = await Subscription.find({ customer: customerId }).select('status endDate');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const activeSubscriptionsCount = allSubscriptions.filter(
      (sub) => String(sub.status || '').trim().toLowerCase() === 'active' && new Date(sub.endDate) > today
    ).length;

    // 1. Get the customer's basic details
    const customer = await User.findById(customerId).select('name email location');

    // 2. Look for an active subscription for this customer
    // We use .populate('vendor') to fetch the vendor's business details at the same time!
    const activeSubscription = await Subscription.findOne({ 
      customer: customerId, 
      status: 'active' 
    }).populate('vendor');

    let todaysMenu = null;
    let announcements = [];

    // 3. If they have a subscription, check what that vendor is cooking today
    if (activeSubscription) {
      // Get today's date (starting at midnight) to search the DB
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      todaysMenu = await DailyMenu.findOne({
        vendor: activeSubscription.vendor._id,
        date: { $gte: today }
      });

      announcements = await Announcement.find({
        vendorId: activeSubscription.vendor._id
      })
      .sort({ createdAt: -1 })
      .limit(5);
    }

    // 4. Send it all back to React in one neat package
    res.status(200).json({
      user: customer,
      subscription: activeSubscription || null,
      todaysMenu: todaysMenu || null,
      announcements,
      stats: {
        activeSubscriptions: activeSubscriptionsCount,
        totalOrders: 0, // We will calculate these later when we build the Orders model
        monthlySpend: 0
      }
    });

  } catch (error) {
    console.error("Dashboard Data Error:", error);
    res.status(500).json({ message: 'Server error fetching dashboard data' });
  }
};

const VendorProfile = require('../models/VendorProfile'); // Make sure this is imported at the top!

exports.getAllVendors = async (req, res) => {
  try {
    // Find all vendor profiles in the database
    const vendors = await VendorProfile.find();
    
    res.status(200).json(vendors);
  } catch (error) {
    console.error("Error fetching vendors:", error);
    res.status(500).json({ message: 'Server error fetching vendors' });
  }
};

// Get a single vendor by ID
exports.getVendorById = async (req, res) => {
  try {
    // req.params.id grabs the ID directly from the URL!
    const vendor = await VendorProfile.findById(req.params.id);
    
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    
    res.status(200).json(vendor);
  } catch (error) {
    console.error("Error fetching vendor details:", error);
    res.status(500).json({ message: 'Server error fetching vendor details' });
  }
};

// Create a new Subscription Request
exports.createSubscriptionRequest = async (req, res) => {
  try {
    const { vendorId, planType, price, specialRequests } = req.body;
    const customerId = req.user.userId || req.user.id; // From the JWT token

    // 1. Check if they already have a pending or active request with this vendor
    const existingSub = await Subscription.findOne({
      customer: customerId,
      vendor: vendorId,
      status: { $in: ['pending', 'active'] }
    });

    if (existingSub) {
      return res.status(400).json({ message: "You already have a request or active subscription with this vendor." });
    }

    // 2. Create the new pending subscription
    // Since we don't know the exact end date until the vendor accepts, we will just set a placeholder or leave it blank for now. We can set it to 30 days from today as a baseline.
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    const newSubscription = new Subscription({
      customer: customerId,
      vendor: vendorId,
      planType: planType,
      mealType: 'mix', // You can make this dynamic later based on what they select
      price: price,
      endDate: endDate,
      status: 'pending',
      // You can add specialRequests to your DB schema later if you want to save them!
    });

    await newSubscription.save();

    res.status(201).json({ message: "Request sent successfully! Waiting for vendor approval.", subscription: newSubscription });

  } catch (error) {
    console.error("Subscription Error:", error);
    res.status(500).json({ message: "Server error while sending request." });
  }
};
// Get all subscriptions for the logged-in customer
exports.getMySubscriptions = async (req, res) => {
  try {
    const customerId = req.user.userId || req.user.id;

    // Find all subscriptions for this user and populate the vendor's business name
    const subscriptions = await Subscription.find({ customer: customerId })
      .populate('vendor', 'businessName') 
      .sort({ createdAt: -1 }); // Shows the newest requests at the top!

    res.status(200).json(subscriptions);
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    res.status(500).json({ message: 'Server error fetching subscriptions' });
  }
};
