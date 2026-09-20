import mongoose from 'mongoose';

export const pointSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['Point'], default: 'Point', required: true },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: (coordinates) =>
          coordinates.length === 2 &&
          coordinates[0] >= -180 &&
          coordinates[0] <= 180 &&
          coordinates[1] >= -90 &&
          coordinates[1] <= 90,
        message: 'Coordinates must be [longitude, latitude]',
      },
    },
  },
  { _id: false },
);

export const addressSnapshotSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true, maxlength: 30 },
    addressLine: { type: String, required: true, trim: true, maxlength: 180 },
    area: { type: String, required: true, trim: true, maxlength: 80 },
    city: { type: String, required: true, trim: true, default: 'Nepalgunj' },
    landmark: { type: String, required: true, trim: true, maxlength: 160 },
    instructions: { type: String, trim: true, maxlength: 300, default: '' },
    location: { type: pointSchema, required: true },
  },
  { _id: false },
);

