/*global Hktdc, Backbone, JST*/

Hktdc.Views = Hktdc.Views || {};

(function() {
  'use strict';

  Hktdc.Views.Recommend = Backbone.View.extend({

    template: JST['app/scripts/templates/recommend.ejs'],
    tagName: 'li',
    events: {
      'click': 'clickRecommendHandler'
    },
    initialize: function(props) {
      this.requestFormModel = props.requestFormModel;
    },
    clickRecommendHandler: function() {
      /* if select the  */
      this.requestFormModel.set({
        selectedRecommentModel: this.model
      });
    },

    render: function() {
      this.$el.html(this.template({user: this.model.toJSON()}));
    }
  });

  Hktdc.Views.RecommendList = Backbone.View.extend({

    tagName: 'ul',

    className: 'dropdown-menu recommend-list',

    initialize: function(props) {
      this.requestFormModel = props.requestFormModel;
      _.bindAll(this, 'renderRecommendItem');
      this.render();
    },

    renderRecommendItem: function(model) {
      // console.log(model);
      // model.set({})
      var recommendItemView = new Hktdc.Views.Recommend({
        model: model,
        requestFormModel: this.requestFormModel
      });

      recommendItemView.render();
      $(this.el).append(recommendItemView.el);
    },

    render: function() {
      // this.$el.html(this.template(this.model.toJSON()));
      // console.log(this.collection.toJSON());
      this.collection.each(this.renderRecommendItem);
    }
  });


})();
