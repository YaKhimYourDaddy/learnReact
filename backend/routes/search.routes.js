const express = require('express');
const router = express.Router();
const Property = require('../models/property.model');
const Project = require('../models/project.model');
const { protect } = require('../middleware/auth.middleware');
const User = require('../models/user.model');

// @route   GET /api/search
// @desc    Search for properties, projects, and locations
// @access  Public
router.get('/', async (req, res) => {
  try {
    let { keyword, type = 'all', page = 1, limit = 12 } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    // Initialize results object
    const results = {
      properties: [],
      projects: [],
      total: 0,
      pagination: {
        page,
        limit,
        pages: 0
      }
    };

    // Build base query for active listings only
    const baseQuery = { status: 'active' };

    if (keyword) {
      baseQuery.$text = { $search: keyword };
    }

    // Search in properties
    if (type === 'all' || type === 'properties') {
      results.properties = await Property.find(baseQuery)
        .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .populate('owner', 'fullName');

      results.total += await Property.countDocuments(baseQuery);
    }

    // Search in projects
    if (type === 'all' || type === 'projects') {
      results.projects = await Project.find(baseQuery)
        .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
        .limit(limit)
        .skip(skip);

      results.total += await Project.countDocuments(baseQuery);
    }

    // Calculate pagination
    results.pagination.pages = Math.ceil(results.total / limit);

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/search/locations
// @desc    Search for locations (provinces, districts, wards)
// @access  Public
router.get('/locations', async (req, res) => {
  try {
    const { keyword } = req.query;

    if (!keyword || keyword.length < 2) {
      return res.json([]);
    }

    // Search for locations in properties
    const query = {
      $or: [
        { province: { $regex: keyword, $options: 'i' } },
        { district: { $regex: keyword, $options: 'i' } },
        { ward: { $regex: keyword, $options: 'i' } },
        { street: { $regex: keyword, $options: 'i' } }
      ]
    };

    const properties = await Property.find(query)
      .select('province district ward street')
      .limit(10);

    // Extract unique locations
    const locations = new Set();
    properties.forEach(property => {
      if (property.province.match(new RegExp(keyword, 'i'))) {
        locations.add(`${property.province}`);
      }
      if (property.district.match(new RegExp(keyword, 'i'))) {
        locations.add(`${property.district}, ${property.province}`);
      }
      if (property.ward && property.ward.match(new RegExp(keyword, 'i'))) {
        locations.add(`${property.ward}, ${property.district}, ${property.province}`);
      }
      if (property.street && property.street.match(new RegExp(keyword, 'i'))) {
        locations.add(`${property.street}, ${property.ward || property.district}, ${property.province}`);
      }
    });

    res.json(Array.from(locations));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/search/save
// @desc    Save a search query
// @access  Private
router.post('/save', protect, async (req, res) => {
  try {
    const { query, name } = req.body;

    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const user = await User.findById(req.user._id);

    user.savedSearches.push({
      query,
      name: name || `Search ${user.savedSearches.length + 1}`
    });

    await user.save();

    res.status(201).json(user.savedSearches);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/search/saved
// @desc    Get user's saved searches
// @access  Private
router.get('/saved', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json(user.savedSearches);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   DELETE /api/search/saved/:id
// @desc    Delete a saved search
// @access  Private
router.delete('/saved/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Find the saved search
    const savedSearchIndex = user.savedSearches.findIndex(
      (search) => search._id.toString() === req.params.id
    );

    if (savedSearchIndex === -1) {
      return res.status(404).json({ message: 'Saved search not found' });
    }

    // Remove the saved search
    user.savedSearches.splice(savedSearchIndex, 1);
    await user.save();

    res.json(user.savedSearches);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
