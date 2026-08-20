const mongoose = require('mongoose');

const baselineSchema = new mongoose.Schema(
  {
    endpointId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Endpoint',
      required: true,
      unique: true,
      index: true,
    },
    schema: {
      type: Object,
      required: true,
    },
    capturedAt: {
      type: Date,
      default: Date.now,
    },
    sampleResponse: {
      type: Object,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Baseline', baselineSchema);