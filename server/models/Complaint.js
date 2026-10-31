const mongoose = require('mongoose');

const remarkSchema = new mongoose.Schema({
  text: { type: String, required: true },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  addedAt: { type: Date, default: Date.now }
});

const complaintSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  category: {
    type: String,
    required: true,
    enum: ['Water', 'Electricity', 'Furniture', 'Infrastructure', 'Other']
  },
  location: {
    type: String,
    required: [true, 'Quarter number is required'],
    trim: true
  },
  priority: {
    type: String,
    required: true,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Pending', 'Assigned', 'In Progress', 'Completed'],
    default: 'Pending'
  },
  images: [{
    filename: String,
    path: String,
    originalName: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  afterImages: [{
    filename: String,
    path: String,
    originalName: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  assignedAt: Date,
  completedAt: Date,
  remarks: [remarkSchema],
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for better query performance
complaintSchema.index({ createdBy: 1, status: 1 });
complaintSchema.index({ assignedTo: 1, status: 1 });

module.exports = mongoose.model('Complaint', complaintSchema);
