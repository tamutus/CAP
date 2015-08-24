'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var EdgeSchema = new Schema({
  name: String,
  info: String,
  active: Boolean
});

module.exports = mongoose.model('Edge', EdgeSchema);