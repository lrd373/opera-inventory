var express = require('express');
const async = require('async');
const { body, validationResult } = require('express-validator');

const Opera = require('../models/operaSchema');
const Aria = require('../models/ariaSchema');
const Composer = require('../models/composerSchema');

exports.list_get = (req, res) => {
    Opera.find({})
    .populate('composer')
    .exec((err, opera_list) => {
        if (err) { return next(err); }

        // Successful opera and aria queries, so render
        res.render('opera_list', { opera_list: opera_list });
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
        }

    }, function(err, results) {
        if (err) { return next(err); }

        // Successful opera and aria queries, so render
        res.render('opera_detail', { opera: results.opera, aria_list: results.aria_list });
    });
};

exports.create_get = (req, res, next) => {
    Composer.find({}).exec((err, composer_list) => {
        if (err) { return next(err); }
        console.log(composer_list);

        res.render('opera_form', { title: 'Add Opera', action: "/create/opera", composer_list: composer_list });
    });
};

exports.create_post = [
    
    // Validate and sanitize request body
    body('operaName')
    .trim()
    .isLength({min: 1})
    .escape()
      .withMessage("Please enter opera name")
    .isAlphanumeric()
      .withMessage("Opera name must include only alphanumeric characters"),
    
      body('composer')
    .trim()
    .isLength({min: 1})
    .escape()
      .withMessage("Please select a composer"),
    
    body('premiereDate')
    .optional({ checkFalsy: true })
    .escape()
    .isISO8601()
    .toDate(),

    body('language')
    .trim()
    .optional({ checkFalsy: true })
    .escape()
    .isAlphanumeric()
      .withMessage("Language must include only alphanumeric characters"),
    
    body('numberActs')
    .trim()
    .optional({ checkFalsy: true })
    .escape()
    .isNumeric()
      .withMessage("Number of acts must be an integer"),
    
    body('synopsis')
    .trim()
    .optional({ checkFalsy: true })
    .escape(),
    
    (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // There were errors in the request body! Oh no!
            // Re-render the form with sanitized values filling in inputs
            Composer.find({}).exec((err, composer_list) => {
                if (err) { return next(err); }
                console.log(composer_list);
        
                res.render('opera_form', { title: 'Add Opera', action: "/create/opera", composer_list: composer_list, inputs: req.body, errors: errors.array() });
            });
        } else {
            // Form inputs were valid, woohoo!
            // Create opera object based on form input
            const opera = new Opera({
                name: req.body.operaName,
                composer: req.body.composer,
                premiere_date: req.body.premiereDate,
                language: req.body.language,
                number_of_acts: req.body.numberActs,
                synopsis: req.body.synopsis,
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

        res.render('opera_delete', {opera: results.opera, aria_list: results.aria_list});
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
            res.render('opera_delete', {opera: results.opera, aria_list: results.aria_list});
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
        }
    }, (err, results) => {
        if (err) { return next(err); }
        console.log(results.opera);

        res.render('opera_form', { 
            title: "Update Opera", 
            action: "/update/opera/"+req.params.id, 
            inputs: results.opera, 
            composer_list: results.composer_list 
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
    .isAlphanumeric()
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
    

   // Process request after validation and sanitization.
   (req, res, next) => {

       // Extract the validation errors from a request.
       const errors = validationResult(req);

       if (!errors.isEmpty()) {
           // There are errors. Render form again with sanitized values/errors messages.
           res.render('composer_form', { title: 'Update Composer', action: "/update/composer/"+req.params.id, inputs: req.body, errors: errors.array() });
           return;
       }
       else {
           // Data from form is valid.

           // Create a Composer object with escaped and trimmed data based on MongoDB schema.
           const composer = new Composer(
               {
                   first_name: req.body.first_name,
                   last_name: req.body.last_name,
                   birth_date: req.body.birth_date,
                   death_date: req.body.death_date,
                   _id: req.params.id
               });
            Composer.findByIdAndUpdate(req.params.id, composer, {}, function (err, theComposer) {
                if (err) { return next(err); }
                   // Successful - redirect to author detail page.
                   res.redirect(theComposer.url);
                }
            );
       }
   }
];