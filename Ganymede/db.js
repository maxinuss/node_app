const mongoose = require('mongoose');

const DB_NAME = process.env.DB_NAME;
const DB_HOST = process.env.DB_HOST;
const DB_PORT = process.env.DB_PORT;

// connect to MongoDB, you should disable autoIndex in production env for performance reason
const connString = 'mongodb://' + DB_HOST + ':' + DB_PORT + '/' + DB_NAME;

mongoose.connect(connString, { useNewUrlParser: true, useCreateIndex: true });

// callback after MongoDB was connected, we just show a log message here
mongoose.connection.on('connected', function () {
  console.log('Mongoose default connection open to ' + connString);
});

// callback after any error occurred by MongoDB, we just show a log message here
mongoose.connection.on('error',function (err) {
  console.log('Mongoose default connection error: ' + err);
});

// callback after MongoDB was disconnected, we just show a log message here
mongoose.connection.on('disconnected', function () {
  console.log('Mongoose default connection disconnected');
});

// close MongoDB connection after current server process was terminated
process.on('SIGINT', function() {
  mongoose.connection.close(function () {
    console.log('Mongoose default connection closed through app termination');
    process.exit(0);
  });
});

module.exports = mongoose;