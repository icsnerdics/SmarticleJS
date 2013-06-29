var mongoose = require('mongoose');

var ArticleSchema = new mongoose.Schema({
    id: String,
    title: String,
    text: String,
    thumbnail: String,
    url: String
});

module.exports = mongoose.model('Article', ArticleSchema);