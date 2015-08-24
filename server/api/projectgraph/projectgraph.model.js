'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ProjectgraphSchema = new Schema({
  type: String,
  order: String,
  root: Schema.Types.ObjectId,
  edges: [{ type: Schema.Types.ObjectId, ref: 'Project'}],
  active: Boolean
});

module.exports = mongoose.model('Projectgraph', ProjectgraphSchema);