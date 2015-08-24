'use strict';

var _ = require('lodash');
var Vertex = require('./vertex.model');

// Get list of vertexs
exports.index = function(req, res) {
  Vertex.find(function (err, vertexs) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(vertexs);
  });
};

// Get a single vertex
exports.show = function(req, res) {
  Vertex.findById(req.params.id, function (err, vertex) {
    if(err) { return handleError(res, err); }
    if(!vertex) { return res.status(404).send('Not Found'); }
    return res.json(vertex);
  });
};

// Creates a new vertex in the DB.
exports.create = function(req, res) {
  Vertex.create(req.body, function(err, vertex) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(vertex);
  });
};

// Updates an existing vertex in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Vertex.findById(req.params.id, function (err, vertex) {
    if (err) { return handleError(res, err); }
    if(!vertex) { return res.status(404).send('Not Found'); }
    var updated = _.merge(vertex, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(vertex);
    });
  });
};

// Deletes a vertex from the DB.
exports.destroy = function(req, res) {
  Vertex.findById(req.params.id, function (err, vertex) {
    if(err) { return handleError(res, err); }
    if(!vertex) { return res.status(404).send('Not Found'); }
    vertex.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}