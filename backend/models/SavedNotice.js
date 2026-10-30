const mongoose = require('mongoose');

const savedNoticeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    noticeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Notice',
      required: true,
      index: true
    }
  },
  { timestamps: true }
);

savedNoticeSchema.index(
  { userId: 1, noticeId: 1 },
  { unique: true }
);

module.exports = mongoose.model('SavedNotice', savedNoticeSchema);