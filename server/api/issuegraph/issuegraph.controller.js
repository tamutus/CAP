'use strict';

var _ = require('lodash');
var Issuegraph = require('./issuegraph.model');
var ObjectId = require('mongoose').Types.ObjectId; 

// Get list of issuegraphs
exports.index = function(req, res) {
  Issuegraph.find(function (err, issuegraphs) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(issuegraphs);
  });
};

// Get a single issuegraph
exports.show = function(req, res) {
  Issuegraph.findById(req.params.id, function (err, issuegraph) {
    if(err) { return handleError(res, err); }
    if(!issuegraph) { return res.status(404).send('Not Found'); }
    return res.json(issuegraph);
  });
};

// Creates a new issuegraph in the DB.
exports.create = function(req, res) {
  Issuegraph.create(req.body, function(err, issuegraph) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(issuegraph);
  });
};

// Updates an existing issuegraph in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Issuegraph.findById(req.params.id, function (err, issuegraph) {
    if (err) { return handleError(res, err); }
    if(!issuegraph) { return res.status(404).send('Not Found'); }
    var updated = _.merge(issuegraph, req.body);
    updated.edges.sort(function(a, b){
      return b.score-a.score;
    });
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(issuegraph);
    });
  });
};

// Deletes a issuegraph from the DB.
exports.destroy = function(req, res) {
  Issuegraph.findById(req.params.id, function (err, issuegraph) {
    if(err) { return handleError(res, err); }
    if(!issuegraph) { return res.status(404).send('Not Found'); }
    issuegraph.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

// Adds a vertex to the edges of an issuegraph
exports.addEdge = function(req, res) {
  Issuegraph.findById(req.params.id, function (err, issuegraph) {
    if(err) {return handleError(res, err); }
    if(!issuegraph) { return res.status(404).send('issuegraph Not Found'); }
    issuegraph.edges.push(req.body);
    issuegraph.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(issuegraph);
    });
  });
}

// Remove a vertex from the edges of an issuegraph
exports.removeEdge = function(req, res) {
  Issuegraph.findById(req.params.id, function (err, issuegraph) {
    if(err) { return handleError(res, err); }
    if(!issuegraph) { return res.status(404).send('issuegraph Not Found'); }
    var toPull = _.findIndex(issuegraph.edges, function(edge){
        return edge.vertex == req.params.vertex;
    });
    console.log('Splicing out item ');
    console.log(issuegraph.edges[toPull]);
    console.log('at position');
    console.log(toPull);
    console.log('from issuegraph.edges: ')
    console.log(issuegraph.edges);
    issuegraph.edges.splice(toPull, 1);
    console.log('Splice complete.  Issuegraph after removal: ')
    console.log(issuegraph.edges);
    issuegraph.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(issuegraph);
    });
  });
};

// Edit the score of an edge in an issuegraph
exports.editEdge = function(req, res) { 
  Issuegraph.findById(req.params.id, function (err, issuegraph) {
    if(err) { return handleError(res, err); }
    if(!issuegraph) { return res.status(404).send('issuegraph Not Found'); }
    var toEdit = _.findIndex(issuegraph.edges, function(edge) {
      return edge.vertex == req.params.vertex;
    });
    console.log(toEdit);
    if(req.params.direction === 'up') { issuegraph.edges[toEdit].score++; }
    if(req.params.direction === 'down') { issuegraph.edges[toEdit].score--; }
    issuegraph.edges.sort(function(a, b){
      return b.score-a.score;
    });
    issuegraph.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(issuegraph);
    });
  });
}

function handleError(res, err) {
  return res.status(500).send(err);
}