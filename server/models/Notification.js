const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['complaint_assigned', 'status_updated', 'complaint_completed', 'remark_added', 'complaint_created'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  complaint: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint'
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
