'use strict';

var _ = require('lodash');
var Talkpage = require('./talkpage.model');

// Get list of talkpages
exports.index = function(req, res) {
  Talkpage.find(function (err, talkpages) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(talkpages);
  });
};

// Get a single talkpage
exports.show = function(req, res) {
  Talkpage.findById(req.params.id, function (err, talkpage) {
    if(err) { return handleError(res, err); }
    if(!talkpage) { return res.status(404).send('Not Found'); }
    return res.json(talkpage);
  });
};

// Creates a new talkpage in the DB.
exports.create = function(req, res) {
  Talkpage.create(req.body, function(err, talkpage) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(talkpage);
  });
};

// Updates an existing talkpage in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Talkpage.findById(req.params.id, function (err, talkpage) {
    if (err) { return handleError(res, err); }
    if(!talkpage) { return res.status(404).send('Not Found'); }
    var updated = _.merge(talkpage, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(talkpage);
    });
  });
};

// Deletes a talkpage from the DB.
exports.destroy = function(req, res) {
  Talkpage.findById(req.params.id, function (err, talkpage) {
    if(err) { return handleError(res, err); }
    if(!talkpage) { return res.status(404).send('Not Found'); }
    talkpage.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}