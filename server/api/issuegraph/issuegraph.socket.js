/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Issuegraph = require('./issuegraph.model');

exports.register = function(socket) {
  Issuegraph.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Issuegraph.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('issuegraph:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('issuegraph:remove', doc);
}