const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// @GET /api/users - Admin: get all users
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    let query = {};
    if (role) query.role = role;
    if (search) {
      const safeSearch = String(search).slice(0, 80).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { name: { $regex: safeSearch, $options: 'i' } },
        { email: { $regex: safeSearch, $options: 'i' } },
        { serviceNumber: { $regex: safeSearch, $options: 'i' } }
      ];
    }

    const pageNumber = Math.max(1, Number.parseInt(page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, Number.parseInt(limit, 10) || 20));
    const skip = (pageNumber - 1) * pageSize;
    const total = await User.countDocuments(query);
    const users = await User.find(query).sort({ createdAt: -1 }).skip(skip).limit(pageSize).select('-password');

    res.json({ success: true, users, pagination: { total, page: pageNumber, limit: pageSize, pages: Math.ceil(total / pageSize) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @GET /api/users/engineers - Get engineers list (admin)
router.get('/engineers', protect, authorize('admin'), async (req, res) => {
  try {
    const engineers = await User.find({ role: 'engineer', isActive: true }).select('name email serviceNumber unit');
    res.json({ success: true, engineers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @PUT /api/users/:id/role - Update user role
router.put('/:id/role', protect, authorize('admin'), async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'engineer', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true, runValidators: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @PUT /api/users/:id - Update user (admin)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, email, role, serviceNumber, unit, quarterNumber, phone, isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email: email?.trim().toLowerCase(), role, serviceNumber, unit, quarterNumber, phone, isActive },
      { new: true, runValidators: true }
    ).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @DELETE /api/users/:id - Admin delete user
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    }
    const deactivated = await User.findByIdAndUpdate(req.params.id, { isActive: false });
    if (!deactivated) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User deactivated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @PUT /api/users/profile/update - Update own profile
router.put('/profile/update', protect, async (req, res) => {
  try {
    const { name, serviceNumber, unit, quarterNumber, phone } = req.body;
    const updates = {};
    for (const [key, value] of Object.entries({ name, serviceNumber, unit, quarterNumber, phone })) {
      if (value !== undefined) updates[key] = value;
    }
    const user = await User.findByIdAndUpdate(
      req.user._id, updates, { new: true, runValidators: true }
    ).select('-password');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @POST /api/users/create - Admin create user
router.post('/create', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, email, password, role, serviceNumber, unit, quarterNumber, phone } = req.body;
    if (!name?.trim() || !email?.trim() || !password || password.length < 8 || !['user', 'engineer', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Name, email, password (minimum 8 characters), and a valid role are required' });
    }
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) return res.status(400).json({ success: false, message: 'Email already exists' });

    const user = await User.create({ name: name.trim(), email: normalizedEmail, password, role, serviceNumber, unit, quarterNumber, phone });
    const safeUser = await User.findById(user._id).select('-password');
    res.status(201).json({ success: true, user: safeUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
