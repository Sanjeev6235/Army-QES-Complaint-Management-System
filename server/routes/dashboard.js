const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// @GET /api/dashboard/stats - Admin dashboard stats
router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const [totalComplaints, pendingComplaints, assignedComplaints, inProgressComplaints, completedComplaints] = await Promise.all([
      Complaint.countDocuments({ isDeleted: false }),
      Complaint.countDocuments({ status: 'Pending', isDeleted: false }),
      Complaint.countDocuments({ status: 'Assigned', isDeleted: false }),
      Complaint.countDocuments({ status: 'In Progress', isDeleted: false }),
      Complaint.countDocuments({ status: 'Completed', isDeleted: false })
    ]);

    const categoryStats = await Complaint.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const priorityStats = await Complaint.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    const totalUsers = await User.countDocuments({ role: 'user', isActive: true });
    const totalEngineers = await User.countDocuments({ role: 'engineer', isActive: true });

    const recentComplaints = await Complaint.find({ isDeleted: false })
      .populate('createdBy', 'name serviceNumber')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Monthly trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrend = await Complaint.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo }, isDeleted: false } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      success: true,
      stats: {
        totalComplaints, pendingComplaints, assignedComplaints,
        inProgressComplaints, completedComplaints,
        totalUsers, totalEngineers,
        categoryStats, priorityStats, recentComplaints, monthlyTrend
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @GET /api/dashboard/engineer-stats
router.get('/engineer-stats', protect, authorize('engineer'), async (req, res) => {
  try {
    const [total, inProgress, completed, assigned] = await Promise.all([
      Complaint.countDocuments({ assignedTo: req.user._id, isDeleted: false }),
      Complaint.countDocuments({ assignedTo: req.user._id, status: 'In Progress', isDeleted: false }),
      Complaint.countDocuments({ assignedTo: req.user._id, status: 'Completed', isDeleted: false }),
      Complaint.countDocuments({ assignedTo: req.user._id, status: 'Assigned', isDeleted: false })
    ]);

    const recent = await Complaint.find({ assignedTo: req.user._id, isDeleted: false })
      .populate('createdBy', 'name serviceNumber quarterNumber')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({ success: true, stats: { total, inProgress, completed, assigned, recent } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @GET /api/dashboard/user-stats
router.get('/user-stats', protect, authorize('user'), async (req, res) => {
  try {
    const [total, pending, inProgress, completed] = await Promise.all([
      Complaint.countDocuments({ createdBy: req.user._id, isDeleted: false }),
      Complaint.countDocuments({ createdBy: req.user._id, status: 'Pending', isDeleted: false }),
      Complaint.countDocuments({ createdBy: req.user._id, status: 'In Progress', isDeleted: false }),
      Complaint.countDocuments({ createdBy: req.user._id, status: 'Completed', isDeleted: false })
    ]);

    const recent = await Complaint.find({ createdBy: req.user._id, isDeleted: false })
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({ success: true, stats: { total, pending, inProgress, completed, recent } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
