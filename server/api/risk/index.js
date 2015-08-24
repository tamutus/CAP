'use strict';

var express = require('express');
var controller = require('./risk.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/id/:id', controller.show);
router.get('/:path', controller.navigate);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;