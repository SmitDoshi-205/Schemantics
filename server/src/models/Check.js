const mongoose = require('mongoose');

const diffEntrySchema = new mongoose.Schema(
  {
    path: { type: String, required: true },
    changeType: {
      type: String,
      enum: ['added', 'removed', 'type_changed'],
      required: true,
    },
    oldType: { type: String, default: null },
    newType: { type: String, default: null },
    severity: {
      type: String,
      enum: ['breaking', 'warning', 'info'],
      required: true,
    },
  },
  { _id: false }
);

const checkSchema = new mongoose.Schema(
  {
    endpointId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Endpoint',
      required: true,
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    httpStatus: {
      type: Number,
      default: null,
    },
    responseTimeMs: {
      type: Number,
      default: null,
    },
    rawResponseSample: {
      type: String,
      default: null,
    },
    ok: {
      type: Boolean,
      required: true,
    },
    error: {
      type: String,
      default: null,
    },
    diffResult: {
      type: [diffEntrySchema],
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Check', checkSchema);