var express = require('express');
const async = require('async');
const { body, validationResult } = require('express-validator');

const Aria = require('../models/ariaSchema');
const Opera = require('../models/operaSchema');
const Tag = require('../models/tagSchema');

exports.list_get = (req, res, next) => {
    async.parallel({

        aria_list: function(callback) {
            Aria.find({})
            .populate('opera')
            .exec(callback);
        }, 

        opera_list: function(callback) {
            Opera.find({})
            .populate('composer')
            .exec(callback);
        }
    }, function(err, results) {
        if (err) { return next(err); }

        // Successful async data retrieval
        // Loop through aria list, replacing composer id with 
        // corresponding info from opera list
        let aria_list_with_composers = [];

        results.aria_list.forEach(aria => {
            let newAriaObj = aria;
            let ariaOperaId = aria.opera._id;
            let opera_list = results.opera_list;
            let ariasOpera = opera_list.find(opera => opera._id.toString() === ariaOperaId.toString());
            newAriaObj.opera = ariasOpera;

            aria_list_with_composers.push(newAriaObj);
        });

        // Render aria list page
        res.render('aria_list', { aria_list: aria_list_with_composers});
    });
};

exports.detail_get = (req, res, next) => {

    async.parallel({

        aria: function(callback) {
            Aria.findById(req.params.id).exec(callback);
        },

        opera_list: function(callback) {
            Opera.find({})
            .populate('composer')
            .exec(callback);
        },

        tag_list: function(callback) {
          Tag.find({}).exec(callback);
        }

    }, function(err, results) {
        if (err) { return next(err); }

        // Successful data retrieval
        // Replace aria's opera prop with 
        // opera info containing composer info from opera list
        
        let aria_with_composer = results.aria;
        let ariaOperaId = results.aria.opera._id;
        let ariasOpera = 
          results.opera_list.find(opera => opera._id.toString() === ariaOperaId.toString());
        aria_with_composer.opera = ariasOpera;
        
        // Render detail page
        res.render('aria_detail', { aria: aria_with_composer, tag_list: results.tag_list });
    });
};

exports.create_get = (req, res, next) => {
    async.parallel({
      opera_list: function(callback) {
        Opera.find({})
        .populate('composer')
        .exec(callback);
      },
      tag_list: function(callback) {
        Tag.find({}).exec(callback);
      }
    }, (err, results) => {
      if (err) { return next(err); }

      res.render('aria_form', { 
        title: 'Add Aria', 
        action: '/create/aria',
        opera_list: results.opera_list, 
        tag_list: results.tag_list 
      });

    });

};

exports.create_post = [
    // Validate and sanitize request body 
    body('name')
    .trim()
    .isLength({ min: 1 })
    .escape()
      .withMessage("Please add an aria name")
    .matches(/[À-ÿa-z0-9 '-]/gmi)
      .withMessage("Aria name must only include alphanumeric characters"),

    body('nickname')
    .trim()
    .optional({checkFalsy: true})
    .matches(/[À-ÿa-z0-9 '-]/gmi)
    .escape()
      .withMessage("Aria nickname must include only alphanumeric characters"),

    body('opera')
    .trim()
    .isLength({min: 1})
    .escape()
      .withMessage("Please select an opera or create a new one"),
    
    body('character_name')
    .trim()
    .optional({checkFalsy: true})
    .matches(/^[À-ÿa-z0-9 '-]+$/i)
    .escape()
      .withMessage("Character name must include only alphanumeric characters"),

    body('act_number')
    .trim()
    .optional({checkFalsy: true})
    .isNumeric()
    .escape()
      .withMessage("Act number must be an integer"),

    body('scene_number')
    .trim()
    .optional({checkFalsy: true})
    .isNumeric()
    .escape()
      .withMessage("Scene number must be an integer"),
    
    body('language')
    .trim()
    .optional({checkFalsy: true})
    .escape()
    .matches(/^[À-ÿa-z0-9 '-]+$/i)
      .withMessage("Language must include only alphabet characters"),

    body('voice_type')
    .trim()
    .optional({checkFalsy: true})
    .escape()
    .matches(/^[À-ÿa-z0-9 '-]+$/i)
      .withMessage("Voice type must include only alphanumeric characters"),

    body('description')
    .trim()
    .optional({checkFalsy: true})
    .escape(),

    // Now, process validated and sanitized form inputs
    (req, res, next) => {

        // Check if there were any errors in form input
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
          async.parallel({
            opera_list: function(callback) {
              Opera.find({})
              .populate('composer')
              .exec(callback);
            },
            tag_list: function(callback) {
              Tag.find({}).exec(callback);
            }
          }, (err, results) => {
            if (err) { return next(err); }
      
            res.render('aria_form', { 
              title: 'Add Aria', 
              action: '/create/aria',
              opera_list: results.opera_list, 
              tag_list: results.tag_list,
              inputs: req.body,
              errors: errors.array() 
            });
      
          });
        } else {
            const aria = new Aria({
                name: req.body.name,
                nickname: req.body.nickname,
                opera: req.body.opera,
                character_name: req.body.character_name,
                act_number: req.body.act_number,
                scene_number: req.body.scene_number,
                language: req.body.language,
                voice_type: req.body.voice_type,
                description: req.body.description,
                tags: req.body.tags
            });

            aria.save((err) => {
                if (err) { return next(err); }

                res.redirect(aria.url);
            });
        }
    }
];

exports.delete_get = (req, res, next) => {
  Aria.findById(req.params.id).populate('opera').exec((err, aria) => {
    if (err) { return next(err); }

    res.render('aria_delete', {aria: aria});
  });
};

exports.delete_post = (req, res, next) => {
  Aria.findById(req.body.ariaId).populate('opera').exec((err, aria) => {
    if (err) { return next(err); }

    Aria.findByIdAndRemove(aria._id, (err) => {
      if (err) { return next(err); }
      console.log("Aria " + aria._id + " deleted successfully");
      res.redirect('/arias');
    });
  });
};

exports.update_get = (req, res, next) => {
  async.parallel({
    aria: function(callback) {
      Aria.findById(req.params.id).exec(callback);
    },
    opera_list: function(callback) {
      Opera.find({})
      .populate('composer')
      .exec(callback);
    },
    tag_list: function(callback) {
      Tag.find({}).exec(callback);
    }
  }, (err, results) => {
    if (err) { return next(err); }

    res.render('aria_form', { 
      title: 'Update Aria',
      action: "/update/aria/"+req.params.id,
      inputs: results.aria,
      opera_list: results.opera_list, 
      tag_list: results.tag_list 
    });

  });

};

exports.update_post = [
  // Validate and sanitize request body 
  body('name')
  .trim()
  .isLength({ min: 1 })
  .escape()
    .withMessage("Please add an aria name")
  .matches(/[À-ÿa-z0-9 -']/gmi)
    .withMessage("Aria name must only include alphanumeric characters"),

  body('nickname')
  .trim()
  .optional({checkFalsy: true})
  .matches(/[À-ÿa-z0-9 -']/gmi)
    .withMessage("Aria nickname must include only alphanumeric characters"),

  body('opera')
  .trim()
  .isLength({min: 1})
  .escape()
    .withMessage("Please select an opera or create a new one"),
  
  body('character_name')
  .trim()
  .optional({checkFalsy: true})
  .matches(/[À-ÿa-z0-9 '-]/gmi)
  .escape()
    .withMessage("Character name must include only alphanumeric characters"),

  body('act_number')
  .trim()
  .optional({checkFalsy: true})
  .isNumeric()
  .escape()
    .withMessage("Act number must be an integer"),

  body('scene_number')
  .trim()
  .optional({checkFalsy: true})
  .isNumeric()
  .escape()
    .withMessage("Scene number must be an integer"),
  
  body('language')
  .trim()
  .optional({checkFalsy: true})
  .escape()
  .matches(/^[À-ÿa-z0-9 _.,!"'-]+$/i)
    .withMessage("Language must include only alphabet characters"),

  body('voice_type')
  .trim()
  .optional({checkFalsy: true})
  .escape()
  .matches(/^[À-ÿa-z0-9 _.,!"'-]+$/i)
    .withMessage("Voice type must include only alphanumeric characters"),

  body('description')
  .trim()
  .optional({checkFalsy: true})
  .escape(),

  // Now, process validated and sanitized form inputs
  (req, res, next) => {

      // Check if there were any errors in form input
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        async.parallel({
          opera_list: function(callback) {
            Opera.find({})
            .populate('composer')
            .exec(callback);
          },
          tag_list: function(callback) {
            Tag.find({}).exec(callback);
          }
        }, (err, results) => {
          if (err) { return next(err); }
    
          res.render('aria_form', { 
            title: 'Add Aria', 
            opera_list: results.opera_list, 
            tag_list: results.tag_list,
            inputs: req.body,
            errors: errors.array() 
          });
    
        });
      } else {
          console.log(req.body);
          const aria = new Aria({
              name: req.body.name,
              nickname: req.body.nickname,
              opera: req.body.opera,
              character_name: req.body.character_name,
              act_number: req.body.act_number,
              scene_number: req.body.scene_number,
              language: req.body.language,
              voice_type: req.body.voice_type,
              description: req.body.description,
              tags: req.body.tags,
              _id: req.params.id
          });

          Aria.findByIdAndUpdate(req.params.id, aria, {}, (err, theAria) => {
              if (err) { return next(err); }

              res.redirect(theAria.url);
          });
      }
  }
];