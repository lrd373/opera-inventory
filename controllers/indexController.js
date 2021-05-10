var express = require('express');
const async = require('async');
const { body, validationResult } = require('express-validator');

const Composer = require('../models/composerSchema');
const Opera = require('../models/operaSchema');
const Aria = require('../models/ariaSchema');

exports.index_get = (req, res) => {
    async.parallel({
      
        opera_list: function(callback) {
            Opera.find({})
            .populate('composer')
            .exec(callback);
        },
        
        composer_list: function(callback) {
            Composer.find({})
            .exec(callback);
        },

        aria_list: function(callback) {
            Aria.find({})
            .exec(callback);
        }

    }, function(err, results){
        if (err) {return next(err); }

        // Successful async data retrieval, so render
        res.render('index', { opera_list: results.opera_list, composer_list: results.composer_list, aria_list: results.aria_list });
    });
};