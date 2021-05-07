var express = require('express');
var router = express.Router();

const indexController = require('../controllers/indexController');
const operaController = require('../controllers/operaController');

/* GET home page. */
router.get('/', indexController.index_get);

module.exports = router;
