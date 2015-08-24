'use strict';

var _ = require('lodash');
var Edge = require('./edge.model');

// Get list of edges
exports.index = function(req, res) {
  Edge.find(function (err, edges) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(edges);
  });
};

// Get a single edge
exports.show = function(req, res) {
  Edge.findById(req.params.id, function (err, edge) {
    if(err) { return handleError(res, err); }
    if(!edge) { return res.status(404).send('Not Found'); }
    return res.json(edge);
  });
};

// Creates a new edge in the DB.
exports.create = function(req, res) {
  Edge.create(req.body, function(err, edge) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(edge);
  });
};

// Updates an existing edge in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Edge.findById(req.params.id, function (err, edge) {
    if (err) { return handleError(res, err); }
    if(!edge) { return res.status(404).send('Not Found'); }
    var updated = _.merge(edge, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(edge);
    });
  });
};

// Deletes a edge from the DB.
exports.destroy = function(req, res) {
  Edge.findById(req.params.id, function (err, edge) {
    if(err) { return handleError(res, err); }
    if(!edge) { return res.status(404).send('Not Found'); }
    edge.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}