const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/chat', {useMongoClient: true});
exports.User = mongoose.model('User', require('./user'));