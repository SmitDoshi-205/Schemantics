const mongoose = require('mongoose');

const ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
const STATUS_VALUES = ['pending_baseline', 'stable', 'drifted', 'broken'];

const endpointSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'A display name is required, e.g. "Stripe payments API"'],
      trim: true,
    },
    url: {
      type: String,
      required: [true, 'URL is required'],
      trim: true,
    },
    method: {
      type: String,
      enum: ALLOWED_METHODS,
      default: 'GET',
      uppercase: true,
    },
    headers: {
      type: Object,
      default: {},
    },
    checkIntervalMinutes: {
      type: Number,
      default: 60,
      min: [1, 'checkIntervalMinutes must be at least 1'],
    },
    lastCheckedAt: {
      type: Date,
      default: null,
    },
    baselineSchema: {
      type: Object,
      default: null,
    },
    status: {
      type: String,
      enum: STATUS_VALUES,
      default: 'pending_baseline',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Endpoint', endpointSchema);
module.exports.ALLOWED_METHODS = ALLOWED_METHODS;