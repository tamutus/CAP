/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Talkpage = require('./talkpage.model');

exports.register = function(socket) {
  Talkpage.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Talkpage.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('talkpage:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('talkpage:remove', doc);
}