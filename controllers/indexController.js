var express = require('express');
const async = require('async');
const { body, validationResult } = require('express-validator');

exports.index_get = (req, res) => {
    res.render('index');
};