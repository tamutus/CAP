/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Projectgraph = require('./projectgraph.model');

exports.register = function(socket) {
  Projectgraph.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Projectgraph.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('projectgraph:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('projectgraph:remove', doc);
}