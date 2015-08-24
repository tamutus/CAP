'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var RiskSchema = new Schema({
  name: String,
  info: String,
  active: Boolean,
  path: String,
  issues: {type: Schema.Types.ObjectId, ref: 'Issuegraph'}
});

module.exports = mongoose.model('Risk', RiskSchema);