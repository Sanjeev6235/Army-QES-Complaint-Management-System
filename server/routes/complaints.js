const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { createNotification } = require('../config/notificationHelper');

// @POST /api/complaints - Create complaint
router.post('/', protect, authorize('user', 'admin'), upload.array('images', 5), async (req, res) => {
  try {
    const { title, description, category, location, priority } = req.body;

    const images = req.files ? req.files.map(f => ({
      filename: f.filename,
      path: `/uploads/${f.filename}`,
      originalName: f.originalname
    })) : [];

    const complaint = await Complaint.create({
      title, description, category, location, priority,
      images,
      createdBy: req.user._id
    });

    await complaint.populate('createdBy', 'name email role serviceNumber quarterNumber');

    // Notify admins
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await createNotification(req.app, {
        recipient: admin._id,
        type: 'complaint_created',
        message: `New complaint "${title}" submitted by ${req.user.name}`,
        complaint: complaint._id
      });
    }

    res.status(201).json({ success: true, complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @GET /api/complaints - Get complaints (role-based)
router.get('/', protect, async (req, res) => {
  try {
    const { status, category, priority, search, page = 1, limit = 10 } = req.query;
    const pageNumber = Math.max(1, Number.parseInt(page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, Number.parseInt(limit, 10) || 10));
    let query = { isDeleted: false };

    if (req.user.role === 'user') {
      query.createdBy = req.user._id;
    } else if (req.user.role === 'engineer') {
      query.assignedTo = req.user._id;
    }

    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (search) {
      query.$or = [
        { title: { $regex: String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } },
        { description: { $regex: String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } },
        { location: { $regex: String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } }
      ];
    }

    const skip = (pageNumber - 1) * pageSize;
    const total = await Complaint.countDocuments(query);
    const complaints = await Complaint.find(query)
      .populate('createdBy', 'name email serviceNumber quarterNumber unit')
      .populate('assignedTo', 'name email serviceNumber')
      .populate('remarks.addedBy', 'name role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    res.json({
      success: true,
      complaints,
      pagination: { total, page: pageNumber, limit: pageSize, pages: Math.ceil(total / pageSize) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @GET /api/complaints/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('createdBy', 'name email serviceNumber quarterNumber unit phone')
      .populate('assignedTo', 'name email serviceNumber unit phone')
      .populate('remarks.addedBy', 'name role');

    if (!complaint || complaint.isDeleted) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Access control
    if (req.user.role === 'user' && complaint.createdBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (req.user.role === 'engineer' && complaint.assignedTo?._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @PUT /api/complaints/:id - Update complaint (multi-purpose)
router.put('/:id', protect, upload.array('afterImages', 5), async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint || complaint.isDeleted) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    const { status, assignedTo, remark, title, description, category, location, priority } = req.body;
    const validStatuses = ['Pending', 'Assigned', 'In Progress', 'Completed'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid complaint status' });
    }

    // Admin: assign engineer
    if (req.user.role === 'admin' && assignedTo) {
      if (complaint.status === 'Completed') {
        return res.status(400).json({ success: false, message: 'Completed complaints cannot be reassigned' });
      }
      const engineer = await User.findOne({ _id: assignedTo, role: 'engineer', isActive: true });
      if (!engineer) {
        return res.status(400).json({ success: false, message: 'Invalid engineer' });
      }
      complaint.assignedTo = assignedTo;
      complaint.status = 'Assigned';
      complaint.assignedAt = new Date();

      await createNotification(req.app, {
        recipient: assignedTo,
        type: 'complaint_assigned',
        message: `Complaint "${complaint.title}" has been assigned to you`,
        complaint: complaint._id
      });
      await createNotification(req.app, {
        recipient: complaint.createdBy,
        type: 'complaint_assigned',
        message: `Your complaint "${complaint.title}" has been assigned to ${engineer.name}`,
        complaint: complaint._id
      });
    }

    // Engineer: update status
    if (req.user.role === 'engineer') {
      if (complaint.assignedTo?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }
      if (assignedTo || title || description || category || location || priority) {
        return res.status(403).json({ success: false, message: 'Engineers can only update complaint status and repair images' });
      }
      if (status) {
        const allowedTransitions = { Assigned: ['In Progress'], 'In Progress': ['Completed'] };
        if (!allowedTransitions[complaint.status]?.includes(status)) {
          return res.status(400).json({ success: false, message: `Invalid status transition: ${complaint.status} → ${status}` });
        }
        complaint.status = status;
        if (status === 'Completed') complaint.completedAt = new Date();

        // Upload after-repair images
        if (req.files && req.files.length > 0) {
          complaint.afterImages = req.files.map(f => ({
            filename: f.filename,
            path: `/uploads/${f.filename}`,
            originalName: f.originalname
          }));
        }

        await createNotification(req.app, {
          recipient: complaint.createdBy,
          type: 'status_updated',
          message: `Your complaint "${complaint.title}" status updated to ${status}`,
          complaint: complaint._id
        });
      }
    }

    // Add remark (admin or engineer)
    if (remark && ['admin', 'engineer'].includes(req.user.role)) {
      complaint.remarks.push({ text: remark, addedBy: req.user._id });
      await createNotification(req.app, {
        recipient: complaint.createdBy,
        type: 'remark_added',
        message: `A remark was added to your complaint "${complaint.title}"`,
        complaint: complaint._id
      });
    }

    // User edit own complaint (only if pending)
    if (req.user.role === 'user') {
      if (complaint.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }
      if (complaint.status !== 'Pending') {
        return res.status(400).json({ success: false, message: 'Cannot edit complaint after it is assigned' });
      }
      if (title) complaint.title = title;
      if (description) complaint.description = description;
      if (category) complaint.category = category;
      if (location) complaint.location = location;
      if (priority) complaint.priority = priority;
    }

    // Admin general status update
    if (req.user.role === 'admin' && status && !assignedTo) {
      if (!['Pending', 'Assigned', 'In Progress', 'Completed'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid complaint status' });
      }
      complaint.status = status;
      if (status === 'Completed') complaint.completedAt = new Date();
    }

    await complaint.save();
    await complaint.populate([
      { path: 'createdBy', select: 'name email serviceNumber quarterNumber unit phone' },
      { path: 'assignedTo', select: 'name email serviceNumber unit phone' },
      { path: 'remarks.addedBy', select: 'name role' }
    ]);

    res.json({ success: true, complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @DELETE /api/complaints/:id
router.delete('/:id', protect, authorize('admin', 'user'), async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    if (req.user.role === 'user' && complaint.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (req.user.role === 'user' && complaint.status !== 'Pending') {
      return res.status(400).json({ success: false, message: 'Cannot delete complaint after assignment' });
    }

    complaint.isDeleted = true;
    await complaint.save();
    res.json({ success: true, message: 'Complaint deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
