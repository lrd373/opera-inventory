var express = require('express');
var router = express.Router();

const indexController = require('../controllers/indexController');
const composerController = require('../controllers/composerController');
const operaController = require('../controllers/operaController');
const ariaController = require('../controllers/ariaController');
const tagController = require('../controllers/tagController');

/* GET home page. */
router.get('/', indexController.index_get);

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ OPERAS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// GET opera list page
router.get('/operas', operaController.list_get);

// GET opera detail page
router.get('/opera/:id', operaController.detail_get);

// GET opera delete page
router.get('/delete/opera/:id', operaController.delete_get);

// POST to opera delete page
router.post('/delete/opera/:id', operaController.delete_post);

// GET opera form page
router.get('/create/opera', operaController.create_get);

// POST opera form page
router.post('/create/opera', operaController.create_post);

// GET opera update page
router.get('/update/opera/:id', operaController.update_get);

// POST to opera update page
router.post('/update/opera/:id', operaController.update_post);

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ COMPOSERS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// GET composer list page
router.get('/composers', composerController.list_get);

// GET composer detail page
router.get('/composer/:id', composerController.detail_get);

// GET composer create page
router.get('/create/composer', composerController.create_get);

// POST composer create page
router.post('/create/composer', composerController.create_post);

// GET composer delete page
router.get('/delete/composer/:id', composerController.delete_get);

// POST to composer delete page
router.post('/delete/composer/:id', composerController.delete_post);

// GET composer update page
router.get('/update/composer/:id', composerController.update_get);

// POST to composer update page
router.post('/update/composer/:id', composerController.update_post);


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ ARIAS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// GET Aria list page
router.get('/arias', ariaController.list_get);

// GET Aria detail page
router.get('/aria/:id', ariaController.detail_get);

// GET aria form page
router.get('/create/aria', ariaController.create_get);

// POST aria form page
router.post('/create/aria', ariaController.create_post);

// GET aria delete page
router.get('/delete/aria/:id', ariaController.delete_get);

// POST to aria delete page
router.post('/delete/aria/:id', ariaController.delete_post);

// GET aria update page
router.get('/update/aria/:id', ariaController.update_get);

// POST to aria update page
router.post('/update/aria/:id', ariaController.update_post);

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ TAGS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// GET Tag list page
router.get('/tags', tagController.list_get);

// GET Tag detail page
router.get('/tag/:id', tagController.detail_get);

// GET tag create page
router.get('/create/tag', tagController.create_get);

// POST tag create page
router.post('/create/tag', tagController.create_post);

// GET tag delete page
router.get('/delete/tag/:id', tagController.delete_get);

// POST to tag delete page
router.post('/delete/tag/:id', tagController.delete_post);

// GET tag update page
router.get('/update/tag/:id', tagController.update_get);

// POST to tag update page
router.post('/update/tag/:id', tagController.update_post);

module.exports = router;
