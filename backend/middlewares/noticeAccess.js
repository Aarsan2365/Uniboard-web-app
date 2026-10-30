// Legacy notices without an audience were broadcast notices. Explicit cohorts remain restricted.
const audienceFilter = user => user.role === 'admin' ? {} : {
  $and: [{ $or: [
    { targetBatch: { $in: ['All', user.batch || 'N/A'] } },
    { targetBatch: { $exists: false } },
    { targetBatch: null },
    { targetBatch: '' }
  ] }]
};
const findVisibleNotice = async (req, noticeId) => {
  const { Notice } = require('../models');
  return Notice.findOne({ _id: noticeId, ...audienceFilter(req.user) });
};
module.exports = { audienceFilter, findVisibleNotice };
