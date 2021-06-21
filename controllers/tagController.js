const express = require('express');
const async = require('async');
const { body, validationResult } = require('express-validator');
const sort = require('./sort');

const Aria = require('../models/ariaSchema');
const Opera = require('../models/operaSchema');
const Tag = require('../models/tagSchema');

exports.list_get = (req, res, next) => {
    Tag.find({}).exec((err, tag_list) => {
        if (err) { return next(err); }

        // Sort tag list by name
        let alpha_list = tag_list;
        alpha_list.sort(sort.byName);

        res.render('tag_list', { tag_list: alpha_list });
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

        // Sort opera and aria lists by name
        let alpha_opera_list = results.opera_list;
        alpha_opera_list.sort(sort.byName);
        let alpha_aria_list = results.aria_list;
        alpha_aria_list.sort(sort.byName);

        res.render('tag_detail', { 
            tag: results.tag, 
            opera_list: alpha_opera_list, 
            aria_list: alpha_aria_list 
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
    body('description')
    .trim()
    .optional({ checkFalsy: true })
    .matches(/[À-ÿa-z0-9 _.,!"'-]|\r\n|\r|\n/gmi)
    .escape(),

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
                    description: req.body.description
                });
            tag.save(function (err) { // add to database
                if (err) { return next(err); }
                // Successful - redirect to new author record.
                res.redirect(tag.url);
            });
        }
    }
];

exports.delete_get = (req, res, next) => {
    async.parallel({
        tag: function(callback) {
            Tag.findById(req.params.id).exec(callback);
        },
        opera_list: function(callback) {
            Opera.find({'tags': req.params.id}).exec(callback);
        }, 
        aria_list: function(callback) {
            Aria.find({'tags': req.params.id}).exec(callback);
        }
    }, (err, results) => {
        if (err) { return next(err); }

        // Sort opera and aria lists by name
        let alpha_opera_list = results.opera_list;
        alpha_opera_list.sort(sort.byName);
        let alpha_aria_list = results.aria_list;
        alpha_aria_list.sort(sort.byName);

        res.render('tag_delete', {
            tag: results.tag, 
            opera_list: alpha_opera_list,
            aria_list: alpha_aria_list 
        });
    });
};

exports.delete_post = (req, res, next) => {
    async.parallel({
        tag: function(callback) {
            Tag.findById(req.body.tagId).exec(callback);
        },
        opera_list: function(callback) {
            Opera.find({'tags': req.body.tagId}).exec(callback);
        },
        aria_list: function(callback) {
            Aria.find({'tags': req.body.tagId}).exec(callback);
        }
    }, (err, results) => {
        if (err) { return next(err); }
        else if ((results.opera_list && results.opera_list.length > 0) ||
                 (results.aria_list && results.aria_list.length >0 )) {

            // Sort opera and aria lists by name
            let alpha_opera_list = results.opera_list;
            alpha_opera_list.sort(sort.byName);
            let alpha_aria_list = results.aria_list;
            alpha_aria_list.sort(sort.byName);

            res.render('tag_delete', {
                tag: results.tag, 
                opera_list: alpha_opera_list,
                aria_list: alpha_aria_list
            });
        } else {
            Tag.findByIdAndRemove(req.body.tagId, (err) => {
                if (err) { return next(err); }
                console.log("Tag deleted succesfully");
                res.redirect('/tags');
            });
        }
    });
};

exports.update_get = (req, res, next) => {
    Tag.findById(req.params.id).exec((err, tag) => {
        if (err) { return next(err); }

        res.render('tag_form', { title: 'Update Tag', action: "/update/tag/"+tag._id, inputs: tag});
    });
};

exports.update_post = [

    // Validate and sanitize request info.
    body('name')
      .trim()
      .isLength({ min: 1 })
      .escape()
        .withMessage('Tag name must be specified.'),
    body('description')
    .trim()
    .optional({ checkFalsy: true })
    .matches(/[À-ÿa-z0-9 _.,!"'-]|\r\n|\r|\n/gmi)
    .escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.render('tag_form', { title: 'Update Tag', action: "/update/tag"+req.params.id, inputs: req.body, errors: errors.array() });
            return;
        }
        else {
            // Data from form is valid.

            // Create a Composer object with escaped and trimmed data based on MongoDB schema.
            const tag = new Tag(
                {
                    name: req.body.name,
                    description: req.body.description,
                    _id: req.params.id
                });
            Tag.findByIdAndUpdate(req.params.id, tag, {}, function (err) { // add to database
                if (err) { return next(err); }
                // Successful - redirect to new author record.
                res.redirect(tag.url);
            });
        }
    }
];