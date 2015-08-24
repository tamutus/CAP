'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var IssuegraphSchema = new Schema({
  type: String,
  order: String,
  root: Schema.Types.ObjectId,
  edges: [{score: Number, vertex: { type: Schema.Types.ObjectId, ref: 'Issue'}}],
  active: Boolean
});

module.exports = mongoose.model('Issuegraph', IssuegraphSchema);