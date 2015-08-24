'use strict';

var express = require('express');
var controller = require('./issue.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/:path', controller.navigate);
router.get('/search/:name', controller.search);
router.get('/id/:id', controller.show);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;