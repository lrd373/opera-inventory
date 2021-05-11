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
        }
    }, (err, results) => {
        if (err) { return next(err); }

        res.render('tag_detail', { tag: results.tag, opera_list: results.opera_list });
    });
}