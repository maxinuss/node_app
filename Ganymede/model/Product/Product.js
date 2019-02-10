'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Product = new Schema({
  "query": { type: String, index: true  },
  "sku": { type: Array },
  "price": { type: Number },
  "price_with_discount": { type: Number },
  "category": { type: mongoose.Types.ObjectId },
  "title": { type: String },
  "description": { type: String },
  "images": { type: Array },
  "created": { type: Date, default: Date.now, index: true }
});

Product.statics.findAll = function(){
  return this.find();
};

// create the model
const model = mongoose.model('Product', Product);

module.exports = model;