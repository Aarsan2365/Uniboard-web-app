const mongoose = require('mongoose');

const noticeReadSchema = new mongoose.Schema(
  {
    noticeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Notice', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    readAt: { type: Date, default: Date.now, required: true },
  },
  {
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret._id;
        return ret;
      },
    },
  }
);

noticeReadSchema.index({ noticeId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('NoticeRead', noticeReadSchema);
