const express = require('express');
const async = require('async');
const { body, validationResult } = require('express-validator');

const Aria = require('../models/ariaSchema');
const Opera = require('../models/operaSchema');
const Tag = require('../models/tagSchema');

exports.list_get = (req, res, next) => {
    Tag.find({}).exec((err, tag_list) => {
        if (err) { return next(err); }

        res.render('tag_list', { tag_list: tag_list });
    });
};

exports.detail_get = (req, res, next) => {
    async.parallel({
        tag: function(callback) {
            Tag.findById(req.params.id).exec(callback);
        },
        opera_list: function(callback) {
            Opera.find({'tags': req.params.id})
            .populate('composer')
            .exec(callback);
        },
        aria_list: function(callback) {
            Aria.find({'tags': req.params.id})
            .populate('opera')
            .exec(callback);
        }
    }, (err, results) => {
        if (err) { return next(err); }

        res.render('tag_detail', { 
            tag: results.tag, 
            opera_list: results.opera_list, 
            aria_list: results.aria_list 
        });
    });
};

exports.create_get = (req, res) => {
    res.render('tag_form', { title: 'Add Tag', action: "/create/tag"});
};

exports.create_post = [

    // Validate and sanitize request info.
    body('name')
      .trim()
      .isLength({ min: 1 })
      .escape()
        .withMessage('Tag name must be specified.'),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.render('tag_form', { title: 'Add Tag', action: "/create/tag", inputs: req.body, errors: errors.array() });
            return;
        }
        else {
            // Data from form is valid.

            // Create a Composer object with escaped and trimmed data based on MongoDB schema.
            const tag = new Tag(
                {
                    name: req.body.name,
        
                });
            tag.save(function (err) { // add to database
                if (err) { return next(err); }
                // Successful - redirect to new author record.
                res.redirect(tag.url);
            });
        }
    }
];