'use strict';

var _ = require('lodash');
var Projectgraph = require('./projectgraph.model');

// Get list of projectgraphs
exports.index = function(req, res) {
  Projectgraph.find(function (err, projectgraphs) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(projectgraphs);
  });
};

// Get a single projectgraph
exports.show = function(req, res) {
  Projectgraph.findById(req.params.id, function (err, projectgraph) {
    if(err) { return handleError(res, err); }
    if(!projectgraph) { return res.status(404).send('Not Found'); }
    return res.json(projectgraph);
  });
};

// Creates a new projectgraph in the DB.
exports.create = function(req, res) {
  Projectgraph.create(req.body, function(err, projectgraph) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(projectgraph);
  });
};

// Updates an existing projectgraph in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Projectgraph.findById(req.params.id, function (err, projectgraph) {
    if (err) { return handleError(res, err); }
    if(!projectgraph) { return res.status(404).send('Not Found'); }
    var updated = _.merge(projectgraph, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(projectgraph);
    });
  });
};

// Deletes a projectgraph from the DB.
exports.destroy = function(req, res) {
  Projectgraph.findById(req.params.id, function (err, projectgraph) {
    if(err) { return handleError(res, err); }
    if(!projectgraph) { return res.status(404).send('Not Found'); }
    projectgraph.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}