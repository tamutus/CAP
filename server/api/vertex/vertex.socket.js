/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Vertex = require('./vertex.model');

exports.register = function(socket) {
  Vertex.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Vertex.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('vertex:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('vertex:remove', doc);
}