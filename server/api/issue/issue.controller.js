'use strict';

var _ = require('lodash');
var Issue = require('./issue.model');

// Get list of issues
exports.index = function(req, res) {
  Issue.find(function (err, issues) {
    if(err) { return handleError(res, err); }
    return res.status(200).json(issues);
  });
};

// Get a single issue by id
exports.show = function(req, res) {
  Issue.findById(req.params.id, function (err, issue) {
    if(err) { return handleError(res, err); }
    if(!issue) { return res.status(404).send('Not Found'); }
    return res.json(issue);
  });
};

// Get a single issue by path name
exports.navigate = function(req, res) {
  Issue.findOne({path : req.params.path} , function (err, issue) {
    if(err) { return handleError(res, err); }
    if(!issue) { return res.status(404).send('Not Found'); }
    return res.json(issue);
  });
};

// Search for issues that contain a string
exports.search = function(req, res) {
  var re = new RegExp(req.params.name);
  Issue.find({name : {$regex: re, $options: 'i'}}, function (err, issues) {
    if(err) { return handleError(res, err); }
    if(issues.length===0) { return res.status(404).send('No issues found'); }
    return res.status(200).json(issues);
  });
};

// Creates a new issue in the DB.
exports.create = function(req, res) {
  Issue.create(req.body, function(err, issue) {
    if(err) { return handleError(res, err); }
    return res.status(201).json(issue);
  });
};

// Updates an existing issue in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Issue.findById(req.params.id, function (err, issue) {
    if (err) { return handleError(res, err); }
    if(!issue) { return res.status(404).send('Not Found'); }
    var updated = _.merge(issue, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.status(200).json(issue);
    });
  });
};

// Deletes a issue from the DB.
exports.destroy = function(req, res) {
  Issue.findById(req.params.id, function (err, issue) {
    if(err) { return handleError(res, err); }
    if(!issue) { return res.status(404).send('Not Found'); }
    issue.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.status(204).send('No Content');
    });
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}