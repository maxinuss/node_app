'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SearchOrder = new Schema({
  "query": { type: String  },
  "options": { type: Array },
  "callbackUrl": { type: String },
  "provider": { type: String },
  "status": { type: String },
  "created": { type: Date, default: Date.now, index: true }
});

SearchOrder.statics.findById = function(id){
  return this.findOne({_id: id});
};

SearchOrder.statics.findAll = function(){
  return this.find();
};

// create the model
const model = mongoose.model('SearchOrder', SearchOrder);

module.exports = model;