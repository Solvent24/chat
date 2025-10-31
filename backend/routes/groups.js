const express = require('express');
const Group = require('../models/Group');
const router = express.Router();

// Create group
router.post('/', async (req, res) => {
  try {
    const { name, members } = req.body;

    const group = new Group({
      name,
      admin: members[0], // First member is admin
      members
    });

    await group.save();
    await group.populate('members', 'username avatar');

    res.status(201).json(group);
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all groups
router.get('/', async (req, res) => {
  try {
    const groups = await Group.find()
      .populate('members', 'username avatar')
      .populate('admin', 'username');

    res.json(groups);
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;