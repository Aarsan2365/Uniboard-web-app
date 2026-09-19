// MongoDB/Mongoose models. Relationships are represented with ObjectId refs
// and populated when a route needs related user data.
const User = require('./User');
const Notice = require('./Notice');
const Comment = require('./Comment');
const NoticeRead = require('./NoticeRead');

module.exports = { User, Notice, Comment, NoticeRead };
