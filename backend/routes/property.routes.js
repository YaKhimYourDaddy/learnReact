const express = require('express');
const router = express.Router();
const Property = require('../models/property.model');
const { protect, agentOrAdmin } = require('../middleware/auth.middleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Set up multer storage for property images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/properties';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `property-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
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

// @route   GET /api/properties
// @desc    Get all properties with filtering and pagination
// @access  Public
router.get('/', async (req, res) => {
  try {
    let {
      page = 1,
      limit = 12,
      status,
      type,
      province,
      district,
      ward,
      priceMin,
      priceMax,
      areaMin,
      areaMax,
      bedrooms,
      bathrooms,
      direction,
      keyword,
      sort
    } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    // Build query
    const query = {};

    // Filter by status (for-sale, for-rent)
    if (status) {
      query.status = status;
    }

    // Filter by property type
    if (type) {
      query.type = type;
    }

    // Filter by location
    if (province) {
      query.province = province;
    }
    if (district) {
      query.district = district;
    }
    if (ward) {
      query.ward = ward;
    }

    // Filter by price range
    if (priceMin || priceMax) {
      query.price = {};
      if (priceMin) query.price.$gte = parseFloat(priceMin);
      if (priceMax) query.price.$lte = parseFloat(priceMax);
    }

    // Filter by area range
    if (areaMin || areaMax) {
      query.area = {};
      if (areaMin) query.area.$gte = parseFloat(areaMin);
      if (areaMax) query.area.$lte = parseFloat(areaMax);
    }

    // Filter by bedrooms
    if (bedrooms) {
      query.bedrooms = { $gte: parseInt(bedrooms) };
    }

    // Filter by bathrooms
    if (bathrooms) {
      query.bathrooms = { $gte: parseInt(bathrooms) };
    }

    // Filter by direction
    if (direction) {
      query.direction = direction;
    }

    // Filter by keyword (search)
    if (keyword) {
      query.$text = { $search: keyword };
    }

    // Only show active listings
    query.status = 'active';

    // Define sort options
    const sortOptions = {};
    if (sort) {
      switch (sort) {
        case 'price_asc':
          sortOptions.price = 1;
          break;
        case 'price_desc':
          sortOptions.price = -1;
          break;
        case 'date_desc':
          sortOptions.createdAt = -1;
          break;
        case 'area_asc':
          sortOptions.area = 1;
          break;
        case 'area_desc':
          sortOptions.area = -1;
          break;
        default:
          sortOptions.createdAt = -1;
      }
    } else {
      // Default sort by most recent
      sortOptions.createdAt = -1;
    }

    // Execute query with pagination
    const properties = await Property.find(query)
      .sort(sortOptions)
      .limit(limit)
      .skip(skip)
      .populate('owner', 'fullName email phone avatar');

    // Get total count for pagination
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

// @route   GET /api/properties/:id
// @desc    Get property by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('owner', 'fullName email phone avatar company address bio');
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Increment view count
    property.views += 1;
    await property.save();

    res.json(property);
  } catch (error) {
    console.error(error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/properties
// @desc    Create a new property listing
// @access  Private
router.post('/', protect, upload.array('images', 10), async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      status,
      price,
      priceUnit,
      area,
      address,
      province,
      district,
      ward,
      street,
      bedrooms,
      bathrooms,
      floors,
      direction,
      legalDocuments,
      furniture,
      features,
      amenities,
      contactName,
      contactPhone,
      contactEmail,
      projectId
    } = req.body;

    // Process uploaded images
    const images = req.files ? req.files.map(file => file.path) : [];

    // Create new property
    const property = new Property({
      title,
      description,
      type,
      status,
      price,
      priceUnit,
      area,
      address,
      province,
      district,
      ward,
      street,
      bedrooms,
      bathrooms,
      floors,
      direction,
      legalDocuments,
      furniture,
      features: features ? features.split(',') : [],
      amenities: amenities ? amenities.split(',') : [],
      images,
      contactName,
      contactPhone,
      contactEmail,
      owner: req.user._id,
      projectId: projectId || null
    });

    const savedProperty = await property.save();
    res.status(201).json(savedProperty);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT /api/properties/:id
// @desc    Update property listing
// @access  Private (only owner, agent, or admin)
router.put('/:id', protect, upload.array('images', 10), async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check if user is authorized to update
    if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this property' });
    }

    const {
      title,
      description,
      type,
      status,
      price,
      priceUnit,
      area,
      address,
      province,
      district,
      ward,
      street,
      bedrooms,
      bathrooms,
      floors,
      direction,
      legalDocuments,
      furniture,
      features,
      amenities,
      contactName,
      contactPhone,
      contactEmail,
      removeImages,
      projectId
    } = req.body;

    // Process uploaded images
    const newImages = req.files ? req.files.map(file => file.path) : [];
    
    // Handle image removal if specified
    let currentImages = property.images;
    if (removeImages) {
      const imagesToRemove = removeImages.split(',');
      currentImages = property.images.filter(img => !imagesToRemove.includes(img));
    }

    // Combine current and new images
    const images = [...currentImages, ...newImages];

    // Update property fields
    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      {
        title: title || property.title,
        description: description || property.description,
        type: type || property.type,
        status: status || property.status,
        price: price || property.price,
        priceUnit: priceUnit || property.priceUnit,
        area: area || property.area,
        address: address || property.address,
        province: province || property.province,
        district: district || property.district,
        ward: ward || property.ward,
        street: street || property.street,
        bedrooms: bedrooms || property.bedrooms,
        bathrooms: bathrooms || property.bathrooms,
        floors: floors || property.floors,
        direction: direction || property.direction,
        legalDocuments: legalDocuments || property.legalDocuments,
        furniture: furniture || property.furniture,
        features: features ? features.split(',') : property.features,
        amenities: amenities ? amenities.split(',') : property.amenities,
        images,
        contactName: contactName || property.contactName,
        contactPhone: contactPhone || property.contactPhone,
        contactEmail: contactEmail || property.contactEmail,
        projectId: projectId || property.projectId
      },
      { new: true }
    );

    res.json(updatedProperty);
  } catch (error) {
    console.error(error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   DELETE /api/properties/:id
// @desc    Delete property listing
// @access  Private (only owner or admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check if user is authorized to delete
    if (property.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this property' });
    }

    // Delete property images from storage
    property.images.forEach(imagePath => {
      try {
        fs.unlinkSync(imagePath);
      } catch (err) {
        console.error(`Failed to delete image: ${imagePath}`, err);
      }
    });

    await property.remove();
    res.json({ message: 'Property listing removed' });
  } catch (error) {
    console.error(error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/properties/:id/favorite
// @desc    Add/remove property from user's favorites
// @access  Private
router.post('/:id/favorite', protect, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const user = req.user;
    const isFavorite = user.favorites.includes(req.params.id);

    if (isFavorite) {
      // Remove from favorites
      user.favorites = user.favorites.filter(id => id.toString() !== req.params.id);
      await user.save();
      res.json({ isFavorite: false });
    } else {
      // Add to favorites
      user.favorites.push(req.params.id);
      await user.save();
      res.json({ isFavorite: true });
    }
  } catch (error) {
    console.error(error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
