var express = require('express');
const async = require('async');
const { body, validationResult } = require('express-validator');

const Aria = require('../models/ariaSchema');
const Opera = require('../models/operaSchema');
const Composer = require('../models/composerSchema');

exports.list_get = (req, res) => {
    async.parallel({

        aria_list: function(callback) {
            Aria.find({})
            .populate('opera')
            .exec(callback);
        }, 

        opera_list: function(callback) {
            Opera.find({})
            .populate('composer')
            .exec(callback);
        }
    }, function(err, results) {
        if (err) { return next(err); }

        // Successful async data retrieval
        // Loop through aria list, replacing composer id with 
        // corresponding info from opera list
        let aria_list_with_composers = [];

        results.aria_list.forEach(aria => {
            let newAriaObj = aria;
            let ariaOperaId = aria.opera._id;
            let opera_list = results.opera_list;
            let ariasOpera = opera_list.find(opera => opera._id.toString() === ariaOperaId.toString());
            newAriaObj.opera = ariasOpera;

            aria_list_with_composers.push(newAriaObj);
        });

        // Render aria list page
        res.render('aria_list', { aria_list: aria_list_with_composers});
    });
};

exports.detail_get = (req, res) => {

    async.parallel({

        aria: function(callback) {
            Aria.findById(req.params.id).exec(callback);
        },

        opera_list: function(callback) {
            Opera.find({})
            .populate('composer')
            .exec(callback);
        }

    }, function(err, results) {
        if (err) { return next(err); }

        // Successful data retrieval
        // Replace aria's opera prop with 
        // opera info containing composer info from opera list
        
        let aria_with_composer = results.aria;
        let ariaOperaId = results.aria.opera._id;
        let ariasOpera = 
          results.opera_list.find(opera => opera._id.toString() === ariaOperaId.toString());
        aria_with_composer.opera = ariasOpera;
        
        // Render detail page
        res.render('aria_detail', { aria: aria_with_composer});
    });
};