var express = require('express');
const async = require('async');
const { body, validationResult } = require('express-validator');
const unescape = require('./unescape');
const sort = require('./sort');

const Opera = require('../models/operaSchema');
const Aria = require('../models/ariaSchema');
const Composer = require('../models/composerSchema');
const Tag = require('../models/tagSchema');

exports.list_get = (req, res) => {
    Opera.find({})
    .populate('composer')
    .exec((err, opera_list) => {
        if (err) { return next(err); }

        // Sort opera list by name
        let alpha_list = opera_list;
        alpha_list.sort(sort.byName);

        // Successful opera query, so render
        res.render('opera_list', { opera_list: alpha_list });
    });
};

exports.detail_get = (req, res) => {
    async.parallel({

        opera: function(callback) {
            Opera.findById(req.params.id)
            .populate('composer')
            .exec(callback);
        }, 

        aria_list: function(callback) {
            Aria.find({'opera': req.params.id}).exec(callback);
        },

        tag_list: function(callback) {
            Tag.find({}).exec(callback);
        }

    }, function(err, results) {
        if (err) { return next(err); }

        // Sort aria and tag lists by name
        let alpha_aria_list = results.aria_list;
        alpha_aria_list.sort(sort.byName);
        let alpha_tag_list = results.tag_list;
        alpha_tag_list.sort(sort.byName);

        // Successful opera and aria queries, so render
        res.render('opera_detail', { 
            opera: results.opera, 
            aria_list: alpha_aria_list, 
            tag_list: alpha_tag_list
        });
    });
};

exports.create_get = (req, res, next) => {
    async.parallel({
        composer_list: function(callback) {
            Composer.find({}).exec(callback);
        },
        tag_list: function(callback) {
            Tag.find({}).exec(callback);
        }
    }, function(err, results) {
        if (err) { return next(err); }

        // Sort composer list by last name
        let alpha_composer_list = results.composer_list;
        alpha_composer_list.sort(sort.byLastName);

        // Sort tag list by name
        let alpha_tag_list = results.tag_list;
        alpha_tag_list.sort(sort.byName);

        res.render('opera_form', { 
            title: 'Add Opera', 
            action: "", 
            composer_list: alpha_composer_list,
            tag_list: alpha_tag_list
        });
    });
};

exports.create_post = [
    // Validate and sanitize request body
    body('name')
    .trim()
    .isLength({min: 1})
    .escape()
      .withMessage("Please enter opera name")
    .matches(/[À-ÿa-z0-9 _.,!"'-]|\r\n|\r|\n/gmi)
      .withMessage("Opera name must include only alphanumeric characters and spaces"),
    
    body('composer')
    .trim()
    .isLength({min: 1})
    .escape()
      .withMessage("Please select a composer"),
    
    body('premiere_date')
    .optional({ checkFalsy: true })
    .escape()
    .isISO8601()
    .toDate(),

    body('language')
    .trim()
    .optional({ checkFalsy: true })
    .matches(/[À-ÿa-z0-9 _.,!"'-]|\r\n|\r|\n/gmi)
    .escape()
      .withMessage("Language must include only alphanumeric characters"),
    
    body('number_of_acts')
    .trim()
    .optional({ checkFalsy: true })
    .escape()
    .isNumeric()
      .withMessage("Number of acts must be an integer"),
    
    body('synopsis')
    .trim()
    .optional({ checkFalsy: true })
    .matches(/[À-ÿa-z0-9 _.,!"'-]|\r\n|\r|\n/gmi)
    .escape(),
    
    body('tags.*').escape(),

    (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // There were errors in the request body! Oh no!
            // Re-render the form with sanitized values filling in inputs
            async.parallel({
                composer_list: function(callback) {
                    Composer.find({}).exec(callback);
                },
                tag_list: function(callback) {
                    Tag.find({}).exec(callback);
                }
            }, (err, results) => {
               if (err) { return next(err); }

                // Sort composer list by last name
                let alpha_composer_list = results.composer_list;
                alpha_composer_list.sort(sort.byLastName);

                // Sort tag list by name
                let alpha_tag_list = results.tag_list;
                alpha_tag_list.sort(sort.byName);

                res.render('opera_form', { 
                  title: "Add Opera", 
                  action: "", 
                  inputs: req.body,
                  composer_list: alpha_composer_list,
                  tag_list: alpha_tag_list,
                  errors: errors.array() 
               });
            });
        } else {
            // Form inputs were valid, woohoo!
            // Create opera object based on form input
            console.log('form inputs were valid!');

            const opera = new Opera({
                name: req.body.name,
                composer: req.body.composer,
                premiere_date: req.body.premiere_date,
                language: req.body.language,
                number_of_acts: req.body.number_of_acts,
                synopsis: req.body.synopsis,
                tags: req.body.tags
            });

            // Save opera to database and redirect to its detail page
            opera.save(function (err) { 
                if (err) { return next(err); }
                // Successful - redirect to new opera record.
                res.redirect(opera.url);
            });
        }
    }
];

exports.delete_get = (req, res, next) => {
    async.parallel({
        opera: function(callback) {
            Opera.findById(req.params.id)
            .populate('composer')
            .exec(callback);
        },
        aria_list: function(callback) {
            Aria.find({'opera': req.params.id}).exec(callback);
        }

    }, (err, results) => {
        if (err) { return next(err); }

        // Sort aria list by name
        let alpha_aria_list = results.aria_list;
        alpha_aria_list.sort(sort.byName);

        res.render('opera_delete', {opera: results.opera, aria_list: alpha_aria_list});
    });
};

exports.delete_post = (req, res, next) => {
    async.parallel({
        opera: function(callback) {
            Opera.findById(req.body.operaId)
            .populate('composer')
            .exec(callback);
        },
        aria_list: function(callback) {
            Aria.find({'opera': req.body.operaId}).exec(callback);
        }

    }, (err, results) => {
        if (err) {return next(err);}
        else if (results.aria_list.length > 0) {
            // Sort aria list by name
            let alpha_aria_list = results.aria_list;
            alpha_aria_list.sort(sort.byName);

            res.render('opera_delete', {opera: results.opera, aria_list: alpha_aria_list});
        } else {
            Opera.findByIdAndRemove(req.body.operaId, (err) => {
                if (err) { return next(err); }
                // Success - go to opera list
                res.redirect('/operas');
            });
        }
    });
};

exports.update_get = (req, res, next) => {
    async.parallel({
        opera: function(callback) {
            Opera.findById(req.params.id)
            .exec(callback);
        },
        composer_list: function(callback) {
            Composer.find({}).exec(callback);
        },
        tag_list: function(callback) {
            Tag.find({}).exec(callback);
        }
    }, (err, results) => {
        if (err) { return next(err); }

        // Sort composer list by last name
        let alpha_composer_list = results.composer_list;
        alpha_composer_list.sort(sort.byLastName);

        // Sort tag list by name
        let alpha_tag_list = results.tag_list;
        alpha_tag_list.sort(sort.byName);

        res.render('opera_form', { 
            title: "Update Opera", 
            action: "/update/opera/"+req.params.id, 
            inputs: results.opera, 
            composer_list: alpha_composer_list,
            tag_list: alpha_tag_list
        });
    });
};

exports.update_post = [
     // Validate and sanitize request info.
    body('name')
    .trim()
    .isLength({ min: 1 })
    .escape()
      .withMessage('Opera name must be specified.')
      .matches(/[À-ÿa-z0-9 _.,!"'-]|\r\n|\r|\n/gmi)
      .withMessage('Name must include only alphanumeric characters.'),
    
    body('composer')
    .trim()
    .isLength({min: 1})
    .escape()
      .withMessage("Composer must be specified"),

    body('premiere_date', 'Invalid premiere date')
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate(),

    body('language', 'Invalid language, must include only alphabet characters')
    .trim()
    .optional({ checkFalsy: true })
    .matches(/[À-ÿa-z0-9 _.,!"'-]|\r\n|\r|\n/gmi)
    .escape(),

    body('number_of_acts', 'Invalid, please include only numbers')
    .trim()
    .optional({ checkFalsy: true })
    .isNumeric()
    .escape(),

    body('synopsis', 'Invalid synopsis, please try again')
    .trim()
    .optional({ checkFalsy: true })
    .matches(/[À-ÿa-z0-9 _.,!"'-]|\r\n|\r|\n/gmi),

    body('tags.*').escape(),
    

   // Process request after validation and sanitization.
   (req, res, next) => {

       // Extract the validation errors from a request.
       const errors = validationResult(req);

       if (!errors.isEmpty()) {
           // There are errors. Render form again with sanitized values/errors messages.
           async.parallel({
               opera: function(callback) {
                   Opera.findById(req.params.id)
                   .populate('composer')
                   .exec(callback);
               },
               composer_list: function(callback) {
                   Composer.find({}).exec(callback);
               },
               tag_list: function(callback) {
                   Tag.find({}).exec(callback);
               }
            }, (err, results) => {
              if (err) { return next(err); }

              // Sort composer list by last name
              let alpha_composer_list = results.composer_list;
              alpha_composer_list.sort(sort.byLastName);

              // Sort tag list by name
              let alpha_tag_list = results.tag_list;
              alpha_tag_list.sort(sort.byName);

              res.render('opera_form', { 
                title: "Update Opera", 
                action: "/update/opera/"+req.params.id, 
                inputs: results.opera, 
                composer_list: alpha_composer_list,
                tag_list: alpha_tag_list,
                errors: errors.array() 
              });
            });
       } else {
           // Data from form is valid.

           // Create an Opera object with escaped and trimmed data based on MongoDB schema.
           const opera = new Opera (
               {
                   name: req.body.name,
                   composer: req.body.composer,
                   premiere_date: req.body.premiere_date,
                   language: req.body.language,
                   number_of_acts: req.body.number_of_acts,
                   synopsis: req.body.synopsis,
                   tags: req.body.tags,
                   _id: req.params.id
               });
            Opera.findByIdAndUpdate(req.params.id, opera, {}, function (err, theOpera) {
                if (err) { return next(err); }
                // Successful - redirect to opera detail page.
                res.redirect(theOpera.url);
                }
            );
       }
   }
];