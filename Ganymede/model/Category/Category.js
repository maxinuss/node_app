'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Category = new Schema({
  "name": { type: String, index: true },
});

// create the model
const model = mongoose.model('Category', Category);

module.exports = model;