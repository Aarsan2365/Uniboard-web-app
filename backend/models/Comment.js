const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    body: { type: String, required: true, trim: true, maxlength: 500 },
    noticeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Notice', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
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

commentSchema.index({ noticeId: 1, createdAt: 1 });

module.exports = mongoose.model('Comment', commentSchema);
