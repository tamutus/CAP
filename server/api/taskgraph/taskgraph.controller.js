'use strict';

var _ = require('lodash');
var Taskgraph = require('./taskgraph.model');

// Get list of taskgraphs
exports.index = function(req, res) {
  Taskgraph.find(function (err, taskgraphs) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(taskgraphs);
  });
};

// Get a single taskgraph
exports.show = function(req, res) {
  Taskgraph.findById(req.params.id, function (err, taskgraph) {
    if(err) { return handleError(res, err); }
    if(!taskgraph) { return res.status(404).send('Not Found'); }
    return res.json(taskgraph);
  });
};

// Creates a new taskgraph in the DB.
exports.create = function(req, res) {
  Taskgraph.create(req.body, function(err, taskgraph) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(taskgraph);
  });
};

// Updates an existing taskgraph in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Taskgraph.findById(req.params.id, function (err, taskgraph) {
    if (err) { return handleError(res, err); }
    if(!taskgraph) { return res.status(404).send('Not Found'); }
    var updated = _.merge(taskgraph, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(taskgraph);
    });
  });
};

// Deletes a taskgraph from the DB.
exports.destroy = function(req, res) {
  Taskgraph.findById(req.params.id, function (err, taskgraph) {
    if(err) { return handleError(res, err); }
    if(!taskgraph) { return res.status(404).send('Not Found'); }
    taskgraph.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}