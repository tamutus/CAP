/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Issue = require('./issue.model');

exports.register = function(socket) {
  Issue.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Issue.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('issue:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('issue:remove', doc);
}