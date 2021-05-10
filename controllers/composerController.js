var express = require('express');
const async = require('async');
const { body, validationResult } = require('express-validator');

const Composer = require('../models/composerSchema');
const Opera = require('../models/operaSchema');

exports.list_get = (req, res) => {
    Composer.find({})
    .exec((err, composer_list) => {
        if (err) { return next(err); }

        // Successful composer query, so render
        res.render('composer_list', { composer_list: composer_list });
    }); 
}

exports.detail_get = (req, res) => {
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