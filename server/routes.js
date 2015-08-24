/**
 * Main application routes
 */

'use strict';

var errors = require('./components/errors');
var path = require('path');

module.exports = function(app) {

  // Insert routes below
  app.use('/api/projectgraphs', require('./api/projectgraph'));
  app.use('/api/issuegraphs', require('./api/issuegraph'));
  app.use('/api/taskgraphs', require('./api/taskgraph'));
  app.use('/api/risks', require('./api/risk'));
  app.use('/api/tasks', require('./api/task'));
  app.use('/api/comments', require('./api/comment'));
  app.use('/api/talkpages', require('./api/talkpage'));
  app.use('/api/vertices', require('./api/vertex'));
  app.use('/api/edges', require('./api/edge'));
  app.use('/api/projects', require('./api/project'));
  app.use('/api/issues', require('./api/issue'));
  app.use('/api/things', require('./api/thing'));
  app.use('/api/users', require('./api/user'));

  app.use('/auth', require('./auth'));
  
  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get(function(req, res) {
      res.sendFile(path.resolve(app.get('appPath') + '/index.html'));
    });
};
