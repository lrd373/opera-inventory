var express = require('express');
var router = express.Router();

const indexController = require('../controllers/indexController');
const composerController = require('../controllers/composerController');
const operaController = require('../controllers/operaController');
const ariaController = require('../controllers/ariaController');

/* GET home page. */
router.get('/', indexController.index_get);

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ OPERAS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// GET opera list page
router.get('/operas', operaController.list_get);

// GET opera detail page
router.get('/opera/:id', operaController.detail_get);

// GET opera form page
router.get('/create/opera', operaController.create_get);

// POST opera form page
router.post('/create/opera', operaController.create_post);

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ COMPOSERS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// GET composer list page
router.get('/composers', composerController.list_get);

// GET composer detail page
router.get('/composer/:id', composerController.detail_get);

// GET composer form page
router.get('/create/composer', composerController.create_get);

// POST composer form page
router.post('/create/composer', composerController.create_post);


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ ARIAS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// GET Aria list page
router.get('/arias', ariaController.list_get);

// GET Aria detail page
router.get('/aria/:id', ariaController.detail_get);

module.exports = router;
