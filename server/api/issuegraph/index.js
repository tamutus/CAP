'use strict';

var express = require('express');
var controller = require('./issuegraph.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.post('/edge/:id/:vertex', controller.addEdge);
router.put('/:id', controller.update);
router.put('/edge/:id/:vertex/:direction', controller.editEdge);
router.patch('/:id', controller.update);
router.delete('/id/:id', controller.destroy);
router.delete('/edge/:id/:vertex', controller.removeEdge);

module.exports = router;