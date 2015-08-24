/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Risk = require('./risk.model');

exports.register = function(socket) {
  Risk.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Risk.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('risk:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('risk:remove', doc);
}