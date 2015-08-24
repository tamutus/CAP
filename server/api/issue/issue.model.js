'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var IssueSchema = new Schema({
  name: String,
  info: String,
  active: Boolean,
  path: String,
  creator: String,
  creationDate: {type: Date, default: Date.now },
  origin: String,
  locations: [String],
  cost: Number,
  budget: Number,
  costNeeded: Number,
  talkPage: {type: Schema.Types.ObjectId, ref: 'Talkpage'},
  issues: {type: Schema.Types.ObjectId, ref: 'Issuegraph' },
  projects: {type: Schema.Types.ObjectId, ref: 'Projectgraph'},
  tasks: {type: Schema.Types.ObjectId, ref: 'Taskgraph' }
});

module.exports = mongoose.model('Issue', IssueSchema);