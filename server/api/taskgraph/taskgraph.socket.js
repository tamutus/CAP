/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Taskgraph = require('./taskgraph.model');

exports.register = function(socket) {
  Taskgraph.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Taskgraph.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('taskgraph:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('taskgraph:remove', doc);
}