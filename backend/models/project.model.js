const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    developer: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['planning', 'under-construction', 'completed'],
      default: 'planning',
    },
    type: {
      type: String,
      required: true,
      enum: ['residential', 'commercial', 'mixed', 'industrial', 'other'],
    },
    propertyTypes: {
      type: [String],
      enum: ['apartment', 'house', 'villa', 'land', 'office', 'commercial', 'other'],
      default: [],
    },
    startDate: {
      type: Date,
    },
    completionDate: {
      type: Date,
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
    totalArea: {
      type: Number,
      required: true,
    },
    buildingCount: {
      type: Number,
      default: 0,
    },
    floorCount: {
      type: Number,
      default: 0,
    },
    unitCount: {
      type: Number,
      default: 0,
    },
    priceMin: {
      type: Number,
    },
    priceMax: {
      type: Number,
    },
    priceUnit: {
      type: String,
      enum: ['VND', 'billion', 'million', 'per-m2'],
      default: 'VND',
    },
    images: {
      type: [String],
      default: [],
    },
    videos: {
      type: [String],
      default: [],
    },
    masterplan: {
      type: String,
    },
    amenities: {
      type: [String],
      default: [],
    },
    features: {
      type: [String],
      default: [],
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
    views: {
      type: Number,
      default: 0,
    },
    website: {
      type: String,
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
  },
  {
    timestamps: true,
  }
);

// Create index for location-based queries
ProjectSchema.index({ location: '2dsphere' });

// Create index for text search
ProjectSchema.index(
  { 
    name: 'text', 
    description: 'text',
    developer: 'text',
    address: 'text',
    province: 'text',
    district: 'text',
    ward: 'text'
  },
  {
    weights: {
      name: 10,
      description: 5,
      developer: 7,
      address: 7,
      province: 3,
      district: 3,
      ward: 2
    }
  }
);

const Project = mongoose.model('Project', ProjectSchema);

module.exports = Project;
