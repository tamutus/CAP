/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Edge = require('./edge.model');

exports.register = function(socket) {
  Edge.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Edge.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('edge:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('edge:remove', doc);
}