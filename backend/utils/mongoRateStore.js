const mongoose = require('mongoose');
class MongoRateStore {
  constructor(prefix) { this.prefix = prefix; this.localKeys = false; }
  init(options) { this.windowMs = options.windowMs; }
  collection() { return mongoose.connection.db.collection('apiRateLimits'); }
  async increment(key) {
    const now = new Date();
    const expired = { $lte: [{ $ifNull: ['$expiresAt', new Date(0)] }, now] };
    const record = await this.collection().findOneAndUpdate({ _id: `${this.prefix}:${key}` }, [{ $set: {
      totalHits: { $cond: [expired, 1, { $add: ['$totalHits', 1] }] },
      expiresAt: { $cond: [expired, new Date(now.getTime() + this.windowMs), '$expiresAt'] }
    } }], { upsert: true, returnDocument: 'after', includeResultMetadata: false });
    return { totalHits: record.totalHits, resetTime: record.expiresAt };
  }
  async decrement(key) { await this.collection().updateOne({ _id: `${this.prefix}:${key}`, totalHits: { $gt: 0 } }, { $inc: { totalHits: -1 } }); }
  async resetKey(key) { await this.collection().deleteOne({ _id: `${this.prefix}:${key}` }); }
}
module.exports = MongoRateStore;
