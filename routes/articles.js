var crypto = require('crypto');

// TODO replace with a mongodb url
var mongolabDB = '<CHANGEME>';
var db = require('mongoose').connect(mongolabDB);

var ArticleModel = require('../data/article.js');

module.exports = function(app) {

    app.get('/login', function(req, res) {
        res.render('login');
    });

    app.post('/login', function(req, res, next) {
        var pwd = crypto.createHash('md5').update(req.body.password + '@&^$32').digest('hex');

		// TODO calculate salted hash and replace here
        if(pwd == '<CHANGEME>')
            req.session.loggedin = true;

        res.redirect('/admin');
    });

    app.get('/list', function(req, res){
        res.render('articles', { title: 'Smarticle - List', articles: articles });
    });

    app.get('/admin', function(req, res) {
        if(req.session.loggedin) {
            res.render('admin', { siteurl: req.headers.host });
        }
        else
            res.redirect('/login');
    });

    app.get('/admin/rest/article', function(req, res) {

        if(!req.session.loggedin)
            res.redirect('/login');
        else {
            ArticleModel.find({}, function(err, articles) {
                if(err)
                    return next(err);
                res.send(articles);
            });
        }
    });

    app.post('/admin/rest/article', function(req, res, next) {

        if(!req.session.loggedin)
            res.send({}, 404);
        else {
            ArticleModel.findOne({ id: req.body.id }, function(err, article) {
                if(err)
                    return next(err);
                if(article)
                    return res.send('Conflict', 409);
                req.body.id = req.body.title
                    .replace(/[^a-zA-Z\s]/g, '')
                    .replace(/\s+/g, '-')
                    .toLowerCase();

                ArticleModel.create(req.body, function(err, article) {
                    if(err)
                        return next(err);
                    res.send(article, 201);
                });
            });
        }
    });

    app.put('/admin/rest/article/:id', function(req, res) {

        if(!req.session.loggedin)
            res.send({}, 404);
        else {
            ArticlesModel.findOneAndUpdate({ id: req.body.id }, req.body, function(err, article) {
                if(err)
                    return next(err);
                if(!article)
                    return res.send('Not found', 404);
                res.send(article, 200);
            });
        }
    });

    app.delete('/admin/rest/article/:id', function(req, res) {

        if(!req.session.loggedin)
            res.send({}, 404);
        else {
            ArticleModel.findOne({ id: req.params.id }, function(err, article) {
                if(err)
                    return next(err);
                if(!article)
                    return res.send('Not found', 404);
                article.remove(function(err) {
                    if(err)
                        return next(err);
                    res.send('', 200);
                });
            });
        }
    });

    app.get('/admin/rest/article/:id', function(req, res, next) {
        ArticleModel.findOne({ id: req.body.id }, function(err, article) {
            if(err)
                return next(err);
            if(!article)
                return res.send('Not found', 404);
            res.send(article, 200);
        });
    });

    app.get('/:id', function(req, res) {
        ArticleModel.findOne({ id: req.params.id }, function(err, article) {
            if(err)
                return next(err);
            if(!article)
                return res.send('Not found', 404);
            res.render('article', article);
        });
    });
};