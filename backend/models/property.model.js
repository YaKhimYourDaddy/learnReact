const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['apartment', 'house', 'villa', 'land', 'office', 'commercial', 'other'],
    },
    status: {
      type: String,
      required: true,
      enum: ['for-sale', 'for-rent'],
    },
    price: {
      type: Number,
      required: true,
    },
    priceUnit: {
      type: String,
      enum: ['VND', 'billion', 'million', 'per-m2'],
      default: 'VND',
    },
    area: {
      type: Number,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    province: {
      type: String,
      required: true,
    },
    district: {
      type: String,
      required: true,
    },
    ward: {
      type: String,
      required: true,
    },
    street: {
      type: String,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
    bedrooms: {
      type: Number,
      default: 0,
    },
    bathrooms: {
      type: Number,
      default: 0,
    },
    floors: {
      type: Number,
      default: 0,
    },
    direction: {
      type: String,
      enum: ['North', 'South', 'East', 'West', 'Northeast', 'Northwest', 'Southeast', 'Southwest', ''],
      default: '',
    },
    legalDocuments: {
      type: String,
      enum: ['Red Book', 'Pink Book', 'Sales Contract', 'Other', ''],
      default: '',
    },
    furniture: {
      type: String,
      enum: ['Unfurnished', 'Partially Furnished', 'Fully Furnished', ''],
      default: '',
    },
    features: {
      type: [String],
      default: [],
    },
    amenities: {
      type: [String],
      default: [],
    },
    images: {
      type: [String],
      default: [],
    },
    videos: {
      type: [String],
      default: [],
    },
    contactName: {
      type: String,
      required: true,
    },
    contactPhone: {
      type: String,
      required: true,
    },
    contactEmail: {
      type: String,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isPromoted: {
      type: Boolean,
      default: false,
    },
    promotionExpiry: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['active', 'pending', 'sold', 'rented', 'expired', 'rejected'],
      default: 'pending',
    },
    views: {
      type: Number,
      default: 0,
    },
    expiryDate: {
      type: Date,
      default: () => new Date(+new Date() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
    },
  },
  {
    timestamps: true,
  }
);

// Create index for location-based queries
PropertySchema.index({ location: '2dsphere' });

// Create index for text search
PropertySchema.index(
  { 
    title: 'text', 
    description: 'text',
    address: 'text',
    province: 'text',
    district: 'text',
    ward: 'text',
    street: 'text'
  },
  {
    weights: {
      title: 10,
      description: 5,
      address: 7,
      province: 3,
      district: 3,
      ward: 2,
      street: 2
    }
  }
);

const Property = mongoose.model('Property', PropertySchema);

module.exports = Property;
