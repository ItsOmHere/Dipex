const VendorProfile = require('../models/VendorProfile');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const Announcement = require('../models/Announcement');
const Review = require('../models/Review');

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

// GET /api/vendor/reviews
exports.getVendorReviews = async (req, res) => {
  try {
    const vendorProfile = await VendorProfile.findOne({ vendorId: req.user.userId });
    if (!vendorProfile) {
      return res.status(404).json({ message: 'Vendor profile not found' });
    }

    const reviews = await Review.find({ vendor: vendorProfile._id })
      .populate('customer', 'name')
      .sort({ createdAt: -1 });

    const formattedReviews = reviews.map((review) => ({
      _id: review._id,
      student: review.customer?.name || 'Unknown',
      rating: review.rating,
      text: review.text,
      createdAt: review.createdAt
    }));

    res.status(200).json({
      averageRating: Number(vendorProfile.rating || 0),
      totalReviews: Number(vendorProfile.totalReviews || 0),
      reviews: formattedReviews
    });
  } catch (error) {
    console.error("Error fetching vendor reviews:", error);
    res.status(500).json({ message: 'Server error fetching reviews' });
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

// --- Get Vendor Profile Settings ---
exports.getVendorProfileSettings = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get base user info (Name, Phone, Email)
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Get specific vendor business info
    const vendorProfile = await VendorProfile.findOne({ vendorId: userId });
    if (!vendorProfile) return res.status(404).json({ message: 'Vendor profile not found' });

    // Combine them into one clean object for the frontend
    res.status(200).json({
      name: user.name,
      email: user.email,
      phone: user.phone,
      businessName: vendorProfile.businessName,
      serviceArea: vendorProfile.serviceArea,
      serviceType: vendorProfile.serviceType,
      foodType: vendorProfile.foodType,
      deliveryType: vendorProfile.deliveryType,
      monthlyFee: vendorProfile.monthlyFee,
      halfTiffinMonthlyPrice: vendorProfile.halfTiffinMonthlyPrice,
      singleTiffinPrice: vendorProfile.singleTiffinPrice
    });

  } catch (error) {
    console.error("Error fetching vendor profile settings:", error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
};

// --- Update Vendor Profile Settings ---
exports.updateVendorProfileSettings = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { 
      name, phone, businessName, serviceArea, serviceType, 
      foodType, deliveryType, monthlyFee, halfTiffinMonthlyPrice, singleTiffinPrice 
    } = req.body;

    // 1. Update base user details
    await User.findByIdAndUpdate(userId, { name, phone });

    // 2. Update vendor business details
    const updatedProfile = await VendorProfile.findOneAndUpdate(
      { vendorId: userId },
      { 
        businessName, serviceArea, serviceType, foodType, 
        deliveryType, monthlyFee, halfTiffinMonthlyPrice, singleTiffinPrice 
      },
      { new: true } // Returns the updated document
    );

    res.status(200).json({ message: 'Profile updated successfully!', profile: updatedProfile });

  } catch (error) {
    console.error("Error updating vendor profile:", error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

// --- Get Payment Status (Unpaid vs Paid) ---
exports.getPaymentRecords = async (req, res) => {
  try {
    const vendorProfile = await VendorProfile.findOne({ vendorId: req.user.userId });
    if (!vendorProfile) return res.status(404).json({ message: 'Vendor profile not found' });

    const activeSubs = await Subscription.find({ 
      vendor: vendorProfile._id, 
      status: 'active' 
    }).populate('customer', 'name phone location roomNumber');

    const unpaidCustomers = [];
    const paidCustomers = [];
    const today = new Date();

    activeSubs.forEach(sub => {
      if (!sub.customer) return;

      let baseDuration = 30; 
      if (sub.planType.includes('weekly') || sub.planType.includes('7_days')) baseDuration = 7;
      if (sub.planType.includes('15_days')) baseDuration = 15;

      const skippedDaysCount = sub.skippedDates ? sub.skippedDates.length : 0;
      const totalSpan = baseDuration + skippedDaysCount;

      const startDate = new Date(sub.startDate || sub.createdAt);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + totalSpan);

      const diffTime = endDate.getTime() - today.getTime();
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Format the Exact Date and Time for the Receipt!
      const formattedPaymentDate = sub.lastPaymentDate 
        ? new Date(sub.lastPaymentDate).toLocaleString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: true
          }) 
        : 'Not Paid Yet';

      const customerData = {
        id: sub._id,
        name: sub.customer.name,
        amount: sub.price,
        hostel: sub.customer.location || 'N/A',
        room: sub.customer.roomNumber || '',
        phone: sub.customer.phone || '',
        plan: `${sub.planType.replace('_', ' ')} (${sub.mealType})`,
        leaves: skippedDaysCount,
        daysLeft: daysLeft,
        exactPaymentDate: formattedPaymentDate // Send the exact time to React
      };

      // NEW LOGIC: If they explicitly have 'unpaid' status OR they have 5 or fewer days left
      if (sub.paymentStatus === 'unpaid' || daysLeft <= 5) {
        let dueText = "Due soon";
        
        if (sub.paymentStatus === 'unpaid') dueText = "New Request (Unpaid)";
        else if (daysLeft < 0) dueText = `Overdue by ${Math.abs(daysLeft)} Days`;
        else if (daysLeft === 0) dueText = "Today";
        else dueText = `In ${daysLeft} Days`;

        unpaidCustomers.push({ ...customerData, due: dueText });
      } else {
        // They are Paid, Active, and have plenty of days left
        paidCustomers.push({ 
          ...customerData, 
          date: customerData.exactPaymentDate, // This now contains Date + Time
          method: "Cash / UPI" 
        });
      }
    });

    res.status(200).json({ unpaidCustomers, paidCustomers });
  } catch (error) {
    console.error("Error fetching payment records:", error);
    res.status(500).json({ message: 'Server error fetching payments' });
  }
};

// --- Mark Student as Paid (Renew Subscription) ---
exports.markAsPaid = async (req, res) => {
  try {
    const { subscriptionId } = req.params;

    const vendorProfile = await VendorProfile.findOne({ vendorId: req.user.userId });
    if (!vendorProfile) {
      return res.status(404).json({ message: 'Vendor profile not found' });
    }

    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    if (String(subscription.vendor) !== String(vendorProfile._id)) {
      return res.status(403).json({ message: 'Unauthorized payment update request' });
    }

    if (subscription.status !== 'active') {
      return res.status(400).json({ message: 'Only active subscriptions can be marked as paid' });
    }

    // Update payment status and renew plan window from now.
    subscription.startDate = new Date();
    subscription.skippedDates = [];
    subscription.paymentStatus = 'paid';
    subscription.lastPaymentDate = new Date();
    const updatedSub = await subscription.save();

    if (!updatedSub) return res.status(404).json({ message: 'Subscription not found' });

    res.status(200).json({ message: 'Payment recorded successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating payment' });
  }
};
