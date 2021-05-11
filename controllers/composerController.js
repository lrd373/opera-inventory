var express = require('express');
const async = require('async');
const { body, validationResult } = require('express-validator');

const Composer = require('../models/composerSchema');
const Opera = require('../models/operaSchema');

exports.list_get = (req, res, next) => {
    Composer.find({})
    .exec((err, composer_list) => {
        if (err) { return next(err); }

        // Successful composer query, so render
        res.render('composer_list', { composer_list: composer_list });
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

        // Successful async data retrieval
        // render composer detail page
        res.render('composer_detail', { composer: results.composer, opera_list: results.opera_list})
    });
    
};


exports.create_get = (req, res) => {
    res.render('composer_form', { title: 'Add Composer'});
};

exports.create_post = [

    // Validate and sanitize request info.
    body('firstName')
      .trim()
      .isLength({ min: 1 })
      .escape()
        .withMessage('First name must be specified.')
      .isAlphanumeric()
        .withMessage('First name must include only alphanumeric characters.'),
    body('lastName')
      .trim()
      .isLength({ min: 1 })
      .escape()
        .withMessage('Last name must be specified.')
      .isAlphanumeric()
        .withMessage('Last name must include only alphanumeric characters.'),
    body('birthDate', 'Invalid date of birth')
      .optional({ checkFalsy: true })
      .isISO8601()
      .toDate(),
    body('deathDate', 'Invalid date of death')
      .optional({ checkFalsy: true })
      .isISO8601()
      .toDate(), // comma to daisy chain these functions with the (req, res) function that follows

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.render('composer_form', { title: 'Add Composer', composer: req.body, errors: errors.array() });
            return;
        }
        else {
            // Data from form is valid.

            // Create a Composer object with escaped and trimmed data based on MongoDB schema.
            const composer = new Composer(
                {
                    first_name: req.body.firstName,
                    last_name: req.body.lastName,
                    birth_date: req.body.birthDate,
                    death_date: req.body.deathDate
                });
            composer.save(function (err) { // add to database
                if (err) { return next(err); }
                // Successful - redirect to new author record.
                res.redirect(composer.url);
            });
        }
    }
];
