var express = require('express');
const async = require('async');
const { body, validationResult } = require('express-validator');
const unescape = require('./unescape');
const sort = require('./sort');

const Composer = require('../models/composerSchema');
const Opera = require('../models/operaSchema');

exports.list_get = (req, res, next) => {
    Composer.find({})
    .exec((err, composer_list) => {
        if (err) { return next(err); }
        
        // Sort composer list by last name
        let alpha_list = composer_list;
        alpha_list.sort(sort.byLastName);

        // Successful composer query, so render
        res.render('composer_list', { composer_list: alpha_list });
    }); 
}

exports.detail_get = (req, res, next) => {
    async.parallel({

        composer: function(callback) {
            Composer.findById(req.params.id)
            .exec(callback);
        },

        opera_list: function(callback) {
            Opera.find({'composer': req.params.id})
            .exec(callback);
        }

    }, function(err, results) {
        if (err) { return next(err) };

        // Sort opera list by name
        let alpha_opera_list = results.opera_list;
        alpha_opera_list.sort(sort.byName);

        // Successful async data retrieval
        // render composer detail page
        res.render('composer_detail', { composer: results.composer, opera_list: alpha_opera_list});
    });
    
};


exports.create_get = (req, res) => {
    res.render('composer_form', { title: 'Add Composer', action: "/create/composer"});
};

exports.create_post = [

    // Validate and sanitize request info.
    body('first_name')
      .trim()
      .isLength({ min: 1 })
      .escape()
        .withMessage('First name must be specified.')
        .matches(/[À-ÿa-z0-9 .,!"'-]|\r\n|\r|\n/gmi)
        .withMessage('First name must include only alphanumeric characters.'),
    body('last_name')
      .trim()
      .isLength({ min: 1 })
      .escape()
        .withMessage('Last name must be specified.')
        .matches(/[À-ÿa-z0-9 .,!"'-]|\r\n|\r|\n/gmi)
        .withMessage('Last name must include only alphanumeric characters.'),
    body('birth_date', 'Invalid date of birth')
      .optional({ checkFalsy: true })
      .isISO8601()
      .toDate(),
    body('death_date', 'Invalid date of death')
      .optional({ checkFalsy: true })
      .isISO8601()
      .toDate(), 
    body('bio')
        .escape(),

    // Replace escaped HTML entities with characters
    unescape('&#38;', '&'),
    unescape('&#x26;', '&'),
    unescape('&amp;', '&'),

    unescape('&#34;', '"'),
    unescape('&ldquo;', '"'),
    unescape('&rdquo;', '"'),
    unescape('&#8220; ', '"'),
    unescape('&#8221;', '"'),

    unescape('&#39;', "'"),
    unescape('&#x27;', "'"),
    unescape('&lsquo;', "'"),
    unescape('&rsquo;', "'"),
    unescape('&#8216;', "'"),
    unescape('&#8217;', "'"),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.render('composer_form', { title: 'Add Composer', action: "/create/composer", inputs: req.body, errors: errors.array() });
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
                    bio: req.body.bio
                });
            composer.save(function (err) { // add to database
                if (err) { return next(err); }
                // Successful - redirect to new author record.
                res.redirect(composer.url);
            });
        }
    }
];

exports.delete_get = (req, res, next) => {
    async.parallel({
        composer: function(callback) {
            Composer.findById(req.params.id).exec(callback);
        },
        opera_list: function(callback) {
            Opera.find({'composer': req.params.id}).exec(callback);
        }
    }, (err, results) => {
        if (err) { return next(err); }

        // Sort opera list by name
        let alpha_opera_list = results.opera_list;
        alpha_opera_list.sort(sort.byName);

        res.render('composer_delete', {composer: results.composer, opera_list: alpha_opera_list });
    });
};

exports.delete_post = (req, res, next) => {
    async.parallel({
        composer: function(callback) {
            Composer.findById(req.body.composerId).exec(callback);
        },
        opera_list: function(callback) {
            Opera.find({'composer': req.body.composerId}).exec(callback);
        }
    }, (err, results) => {
        if (err) { return next(err); }
        else if (results.opera_list && results.opera_list.length > 0) {
            // Sort opera list by name
            let alpha_opera_list = results.opera_list;
            alpha_opera_list.sort(sort.byName);

            res.render('composer_delete', {composer: results.composer, opera_list: alpha_opera_list });
        } else {
            Composer.findByIdAndRemove(req.body.composerId, (err) => {
                if (err) { return next(err); }
                console.log("Composer deleted succesfully");
                res.redirect('/composers');
            });
        }
    });
};

exports.update_get = (req, res, next) => {
    Composer.findById(req.params.id).exec((err, composer) => {
        if (err) { return next(err); }

        res.render('composer_form', { title: 'Update Composer', action: "/update/composer/"+req.params.id, inputs: composer });
    });
};

exports.update_post = [
    // Validate and sanitize request info.
    body('first_name')
    .trim()
    .isLength({ min: 1 })
    .escape()
      .withMessage('First name must be specified.')
    .matches(/[À-ÿa-z0-9 .,!"'-]|\r\n|\r|\n/gmi)
      .withMessage('First name must include only alphanumeric characters.'),
    body('last_name')
     .trim()
     .isLength({ min: 1 })
     .escape()
       .withMessage('Last name must be specified.')
    .matches(/[À-ÿa-z0-9 .,!"'-]|\r\n|\r|\n/gmi)
       .withMessage('Last name must include only alphanumeric characters.'),
    body('birth_date', 'Invalid date of birth')
     .optional({ checkFalsy: true })
     .isISO8601()
     .toDate(),
    body('death_date', 'Invalid date of death')
     .optional({ checkFalsy: true })
     .isISO8601()
     .toDate(), 
    body('bio')
        .escape(),

    // Replace escaped HTML entities with characters
    unescape('&#38;', '&'),
    unescape('&#x26;', '&'),
    unescape('&amp;', '&'),

    unescape('&#34;', '"'),
    unescape('&ldquo;', '"'),
    unescape('&rdquo;', '"'),
    unescape('&#8220; ', '"'),
    unescape('&#8221;', '"'),

    unescape('&#39;', "'"),
    unescape('&#x27;', "'"),
    unescape('&lsquo;', "'"),
    unescape('&rsquo;', "'"),
    unescape('&#8216;', "'"),
    unescape('&#8217;', "'"),

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
                   bio: req.body.bio,
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