const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  avatar: {
    type: String,
    default: '👥'
  }
}, {
  timestamps: true
});

// Virtual for member count
groupSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

module.exports = mongoose.model('Group', groupSchema);