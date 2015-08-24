'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var TalkpageSchema = new Schema({
  title: String,
  info: String,
  active: Boolean,
  comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}]
});

module.exports = mongoose.model('Talkpage', TalkpageSchema);