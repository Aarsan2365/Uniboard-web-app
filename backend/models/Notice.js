const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    body: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['Exam Schedules', 'Sports', 'General', 'Events', 'Academic'],
      default: 'General',
      required: true,
    },
    imageUrl: { type: String, default: null },
    targetBatch: {
      type: String,
      enum: ['All', '2021', '2022', '2023', '2024', '2025'],
      default: 'All',
      required: true,
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        if (ret.author && ret.author._id) {
          ret.author.id = ret.author._id.toString();
          delete ret.author._id;
        }
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

noticeSchema.index({ category: 1, targetBatch: 1, createdAt: -1 });
noticeSchema.index({ title: 'text', body: 'text' });

module.exports = mongoose.model('Notice', noticeSchema);
