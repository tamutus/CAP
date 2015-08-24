'use strict';

var _ = require('lodash');
var Risk = require('./risk.model');

// Get list of risks
exports.index = function(req, res) {
  Risk.find(function (err, risks) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(risks);
  });
};

// Get a single risk
exports.show = function(req, res) {
  Risk.findById(req.params.id, function (err, risk) {
    if(err) { return handleError(res, err); }
    if(!risk) { return res.status(404).send('Not Found'); }
    return res.json(risk);
  });
};

// Get a single risk by path name
exports.navigate = function(req, res) {
  Risk.findOne({path : req.params.path} , function (err, risk) {
    if(err) { return handleError(res, err); }
    if(!risk) { return res.status(404).send('Not Found'); }
    return res.json(risk);
  });
};

// Creates a new risk in the DB.
exports.create = function(req, res) {
  Risk.create(req.body, function(err, risk) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(risk);
  });
};

// Updates an existing risk in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Risk.findById(req.params.id, function (err, risk) {
    if (err) { return handleError(res, err); }
    if(!risk) { return res.status(404).send('Not Found'); }
    var updated = _.merge(risk, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(risk);
    });
  });
};

// Deletes a risk from the DB.
exports.destroy = function(req, res) {
  Risk.findById(req.params.id, function (err, risk) {
    if(err) { return handleError(res, err); }
    if(!risk) { return res.status(404).send('Not Found'); }
    risk.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}