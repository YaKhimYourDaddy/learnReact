const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const Property = require('../models/property.model');
const { protect, admin } = require('../middleware/auth.middleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Set up multer storage for user avatars
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/avatars';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `user-${req.user._id}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: function (req, file, cb) {
    const allowedFileTypes = /jpeg|jpg|png|webp/;
    const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedFileTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// @route   GET /api/users/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, upload.single('avatar'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update user fields if provided
    user.fullName = req.body.fullName || user.fullName;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    user.address = req.body.address || user.address;
    user.company = req.body.company || user.company;
    user.bio = req.body.bio || user.bio;
    
    // Update avatar if uploaded
    if (req.file) {
      // Delete previous avatar if exists
      if (user.avatar && user.avatar.startsWith('uploads/')) {
        try {
          fs.unlinkSync(user.avatar);
        } catch (err) {
          console.error('Error deleting previous avatar:', err);
        }
      }
      
      user.avatar = req.file.path;
    }
    
    // Update password if provided
    if (req.body.password) {
      user.password = req.body.password;
    }
    
    const updatedUser = await user.save();
    
    // Return updated user without password
    res.json({
      _id: updatedUser._id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      phone: updatedUser.phone,
      address: updatedUser.address,
      company: updatedUser.company,
      bio: updatedUser.bio,
      avatar: updatedUser.avatar,
      role: updatedUser.role,
      isVerified: updatedUser.isVerified,
      favorites: updatedUser.favorites,
      savedSearches: updatedUser.savedSearches,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/users/properties
// @desc    Get properties posted by current user
// @access  Private
router.get('/properties', protect, async (req, res) => {
  try {
    let { page = 1, limit = 10, status } = req.query;
    
    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;
    
    // Build query
    const query = { owner: req.user._id };
    
    // Filter by status if provided
    if (status) {
      query.status = status;
    }
    
    const properties = await Property.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);
    
    const total = await Property.countDocuments(query);
    
    res.json({
      properties,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/users/favorites
// @desc    Get user's favorite properties
// @access  Private
router.get('/favorites', protect, async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;
    
    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;
    
    const user = await User.findById(req.user._id);
    
    const favorites = await Property.find({ _id: { $in: user.favorites } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate('owner', 'fullName email phone avatar');
    
    const total = user.favorites.length;
    
    res.json({
      favorites,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID (public profile)
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -savedSearches');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get user's property count
    const propertyCount = await Property.countDocuments({ 
      owner: req.params.id,
      status: 'active'
    });
    
    res.json({
      ...user._doc,
      propertyCount
    });
  } catch (error) {
    console.error(error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/users/:id/properties
// @desc    Get properties posted by a specific user
// @access  Public
router.get('/:id/properties', async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;
    
    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;
    
    // Only show active properties for public user profile
    const query = { 
      owner: req.params.id,
      status: 'active'
    };
    
    const properties = await Property.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);
    
    const total = await Property.countDocuments(query);
    
    res.json({
      properties,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error(error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(500).json({ message: 'Server Error' });
  }
});

// Admin Routes

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    let { page = 1, limit = 10, keyword } = req.query;
    
    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;
    
    // Build query
    const query = {};
    
    // Search by keyword
    if (keyword) {
      query.$or = [
        { fullName: { $regex: keyword, $options: 'i' } },
        { email: { $regex: keyword, $options: 'i' } },
        { phone: { $regex: keyword, $options: 'i' } },
      ];
    }
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);
    
    const total = await User.countDocuments(query);
    
    res.json({
      users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user (admin only)
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update user fields if provided
    user.fullName = req.body.fullName || user.fullName;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    user.role = req.body.role || user.role;
    user.isVerified = req.body.isVerified !== undefined ? req.body.isVerified : user.isVerified;
    
    const updatedUser = await user.save();
    
    res.json({
      _id: updatedUser._id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role,
      isVerified: updatedUser.isVerified,
    });
  } catch (error) {
    console.error(error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user (admin only)
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Delete user's properties
    await Property.deleteMany({ owner: user._id });
    
    // Delete user avatar if exists
    if (user.avatar && user.avatar.startsWith('uploads/')) {
      try {
        fs.unlinkSync(user.avatar);
      } catch (err) {
        console.error('Error deleting user avatar:', err);
      }
    }
    
    await user.remove();
    
    res.json({ message: 'User removed' });
  } catch (error) {
    console.error(error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
