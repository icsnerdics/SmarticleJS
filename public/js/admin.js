_.templateSettings = {
    interpolate : /\{\{(.+?)\}\}/g
};

$(function() {

    var Smarticle = {};

    Smarticle.ArticleMenuItemView = Backbone.View.extend({
        tagName: 'li',
        template: _.template($('#menu-article-template').html()),
        events: {
            'click': 'loadArticle'
        },
        initialize: function(obj) {
            this.listenTo(this.model, 'change', this.render);
            this.listenTo(this.model, 'destroy', this.remove);
            this.editor = obj.editor;
        },
        render: function() {
            $(this.el).html(this.template(this.model.toJSON()));
            return this;
        },
        remove: function(a,b,xhr) {
            if(xhr.status == 200)
                $(this.el).remove();
            else
                alert('Error removing the selected entry');
        },
        loadArticle: function() {
            this.editor.setModel(this.model);
            $('ul.articles li button').removeClass('btn-warning');
            $('button', this.el).addClass('btn-warning');
        }
    });

    Smarticle.ArticleMenuView = Backbone.View.extend({
        initialize: function(obj) {
            this.menuItemViews = [];
            this.listenTo(this.model, 'add', this.add);
            this.editor = obj.editor;
        },
        add: function(model, collection, opts) {
            var miv = new Smarticle.ArticleMenuItemView({ model: model, editor: this.editor });
            this.menuItemViews.push(miv);
            miv.render();
            $(this.el).append(miv.el);
        }
    });

    Smarticle.ArticleEditorView = Backbone.View.extend({
        template: _.template($('#article-editor-template').html()),
        events: {
            'keyup input.article-title': 'titleKeyPress',
            'keyup .article-text': 'textKeyPress',
            'keyup .article-url': 'urlKeyPress',
            'keyup .thumburl': 'thumbChange',
            'click button.save': 'saveClick',
            'click button.remove': 'removeClick'
        },
        initialize: function() {
        },
        setModel: function(model) {
            this.model = model;
            //this.listenTo(this.model, 'change', this.render);
            this.listenTo(this.model, 'change:title', this.titleChange);
            this.listenTo(this.model, 'change:id', this.idChange);
            this.render();
        },
        render: function() {
            $(this.el).html(this.template($.extend({id:''}, this.model.toJSON())));
            return this;
        },
        titleKeyPress: function() {
            var title = $('input.article-title', this.el).val();
            this.model.set('title', title);
        },
        textKeyPress: function() {
            this.model.set('text', $('.article-text', this.el).val());
        },
        urlKeyPress: function() {
            this.model.set('url', $('.article-url', this.el).val());
        },
        thumbChange: function() {
            this.model.set('thumbnail', $('.thumburl', this.el).val());
            $('.thumbnail img', this.el).attr('src', $('.thumburl', this.el).val());
        },
        saveClick: function() {
            if(confirm('Save "' + this.model.get('title') + '"?'))
                this.model.save({}, {
                    success: function() {
                        alert('Saved successfully');
                    },
                    error: function() {
                        alert('Error');
                    }
                });
        },
        removeClick: function() {
            var c = confirm('Delete "' + this.model.get('title') + '"?');
            if(c) {
                this.model.destroy({
                    success: (function(that, articlesCollection) { return function() {
                        that.setModel(articlesCollection.at(0));
                    }}(this,articlesCollection)) // or how I learned to stop worrying and love the variable hoisting
                });
            }
        },
        titleChange: function() {
            $('h1.article-title', this.el).text(this.model.get('title'));
        },
        idChange: function() {
            $('a.article-preview', this.el).attr('href', '/' + this.model.get('id'));
        }
    });

    Smarticle.ArticleModel = Backbone.Model.extend({
        urlRoot: '/admin/rest/article',
        defaults: {
            title: 'New article...',
            text: '',
            url: '',
            thumbnail: '',
            categories: []
        }
    });

    Smarticle.ArticleCollection = Backbone.Collection.extend({
        model: Smarticle.ArticleModel,
        url: '/admin/rest/article'
    });

    var articlesCollection = new Smarticle.ArticleCollection();
    var editorView = new Smarticle.ArticleEditorView({
        el: $('#editor')
    });

    var menuView = new Smarticle.ArticleMenuView({
        model: articlesCollection,
        el: $('#sidebar ul.articles'),
        editor: editorView
    });

    articlesCollection.fetch({
        success: function(a,b,c) {
            //editorView.setModel(a.models[0]);
            $('ul.articles li:first button').click();
        },
        error: function(a,b,c) {
        }
    });

    $('#create-new-article').on('click', function() {
        articlesCollection.add(new Smarticle.ArticleModel());
    });

    $('#filterArticles').on('keyup', function() {
        var values = $(this).val().split(/\s+/);

        if(values.length == 0)
            $('ul.articles li').show();

        else {
            $('ul.articles li').hide();
            $('ul.articles li').each(function() {
                var t = $('button', this).text();
                var matches = true;
                for(i in values)
                    if(!t.match(new RegExp(values[i], 'gi')))
                        matches = false;
                if(matches)
                    $(this).show();
            });
        }
    });

});