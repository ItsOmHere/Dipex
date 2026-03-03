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
// In controllers/customerController.js
exports.getCustomerDashboard = async (req, res) => {
  try {
    const customerId = req.user.userId || req.user.id;

    // Fetch the active subscription
    const activeSubscription = await Subscription.findOne({ 
        customer: customerId, // ensure this matches your schema (customer vs customerId)
        status: 'active' 
    }).populate('vendor');

    let vendorAnnouncements = [];
    let isUnpaid = false;

    if (activeSubscription) {
      // 1. Fetch announcements
      vendorAnnouncements = await Announcement.find({ 
          vendorId: activeSubscription.vendor._id 
      }).sort({ createdAt: -1 }).limit(3);
      
      // 2. NEW: Check if the vendor marked them as unpaid!
      // If it's explicitly 'unpaid', or if the field is missing (old data), flag it.
      if (activeSubscription.paymentStatus === 'unpaid' || !activeSubscription.paymentStatus) {
        isUnpaid = true;
      }
    }

    res.status(200).json({
      user: req.user,
      subscription: activeSubscription,
      announcements: vendorAnnouncements,
      hasPendingBill: isUnpaid, // Send the flag to the frontend!
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

// In controllers/customerController.js

// --- Get Customer Payment Details ---
exports.getCustomerPayments = async (req, res) => {
  try {
    const customerId = req.user.userId || req.user.id;

    // Fetch the active subscription for this customer
    const activeSub = await Subscription.findOne({
      customer: customerId,
      status: 'active' 
    }).populate('vendor', 'businessName');

    if (!activeSub) {
        return res.status(200).json({
            pendingAmount: 0,
            totalPaid: 0,
            thisMonth: 0,
            transactions: []
        });
    }

    const today = new Date();
    let baseDuration = 30;
    if (activeSub.planType.includes('weekly') || activeSub.planType.includes('7_days')) baseDuration = 7;
    if (activeSub.planType.includes('15_days')) baseDuration = 15;

    const skippedDaysCount = activeSub.skippedDates ? activeSub.skippedDates.length : 0;
    const totalSpan = baseDuration + skippedDaysCount;

    const startDate = new Date(activeSub.startDate || activeSub.createdAt);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + totalSpan);

    const diffTime = endDate.getTime() - today.getTime();
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let pendingAmount = 0;
    let transactions = [];

    // Determine Pending Amount
    if (activeSub.paymentStatus === 'unpaid' || daysLeft <= 5) {
        pendingAmount = activeSub.price;
        // Add a "Pending" transaction record
        transactions.push({
            id: `pending-${activeSub._id}`,
            vendorName: activeSub.vendor.businessName,
            type: 'Subscription',
            status: 'pending',
            date: 'Due Now',
            method: 'Pending',
            amount: activeSub.price
        });
    }

    // Determine Total Paid & This Month (Simplification: Assuming if paid, they paid the price)
    // In a real app, you'd have a separate 'Transactions' table. Here we infer from the subscription state.
    let totalPaid = 0;
    let thisMonthPaid = 0;

    if (activeSub.paymentStatus === 'paid') {
        totalPaid += activeSub.price;
        
        // Check if paid this month
        const paymentDate = activeSub.lastPaymentDate ? new Date(activeSub.lastPaymentDate) : startDate;
        if (paymentDate.getMonth() === today.getMonth() && paymentDate.getFullYear() === today.getFullYear()) {
            thisMonthPaid += activeSub.price;
        }

        // Add a "Paid" transaction record
        const formattedDate = paymentDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        transactions.push({
            id: `paid-${activeSub._id}`,
            vendorName: activeSub.vendor.businessName,
            type: 'Subscription',
            status: 'paid',
            date: formattedDate,
            method: 'UPI / Cash', // Mock method
            amount: activeSub.price
        });
    }

    res.status(200).json({
      pendingAmount,
      totalPaid,
      thisMonth: thisMonthPaid,
      transactions
    });

  } catch (error) {
    console.error("Error fetching customer payments:", error);
    res.status(500).json({ message: 'Server error fetching payments' });
  }
};
