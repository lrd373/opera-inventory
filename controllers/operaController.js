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