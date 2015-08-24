'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var CommentSchema = new Schema({
  active: Boolean,
  author: {type: Schema.Types.ObjectId, ref: 'User'},
  page: {type: Schema.Types.ObjectId, ref: 'Talkpage'},
  date: {type: Date, default: Date.now},
  header: String,
  body: String,
});

module.exports = mongoose.model('Comment', CommentSchema);