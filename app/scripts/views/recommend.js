/* global Hktdc, Backbone, JST, $, _ */

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
      _.extend(this, props);
    },
    clickRecommendHandler: function() {
      /* if select the approver */
      this.requestFormModel.set({
        selectedRecommentModel: this.model
      }, {validate: true, field: 'selectedRecommentModel'});
    },

    render: function() {
      this.$el.html(this.template({user: this.model.toJSON()}));
    }
  });

  Hktdc.Views.RecommendOption = Backbone.View.extend({

    template: JST['app/scripts/templates/recommendOption.ejs'],

    tagName: 'option',

    initialize: function(props) {
      _.extend(this, props);
    },

    render: function() {
      this.$el.html(this.template({user: this.model.toJSON()}));
      this.$el.attr('value', this.model.toJSON().WorkerId);
      if (this.selectedRecommend === this.model.toJSON().UserId) {
        this.$el.prop('selected', true);
      }
    }

  });

  Hktdc.Views.RecommendList = Backbone.View.extend({

    tagName: 'ul',

    className: 'dropdown-menu recommend-list',

    initialize: function(props) {
      _.extend(this, props);
      _.bindAll(this, 'renderRecommendItem', 'renderRecommendOption');
      this.render();
    },

    events: {
      'change': 'selectRecommendHandler'
    },

    selectRecommendHandler: function() {
      // console.log($('option:selected', this.el).val());
      // console.log(this.collection.get($('option:selected', this.el).val()));
      this.requestFormModel.set({
        selectedRecommentModel: this.collection.get($('option:selected', this.el).val())
      });
    },

    renderRecommendItem: function(model) {
      // console.log(model);
      // model.set({})
      var recommendItemView = new Hktdc.Views.Recommend({
        model: model,
        requestFormModel: this.requestFormModel,
        selectedRecommend: this.selectedRecommend
      });

      recommendItemView.render();
      $(this.el).append(recommendItemView.el);
    },

    renderRecommendOption: function(model) {
      var applicantOptionView = new Hktdc.Views.RecommendOption({
        model: model,
        requestFormModel: this.requestFormModel,
        selectedRecommend: this.selectedRecommend
      });

      applicantOptionView.render();
      // console.log(applicantOptionView.el);
      $(this.el).append(applicantOptionView.el);
    },



    render: function() {
      // this.$el.html(this.template(this.model.toJSON()));
      // console.log(this.collection.toJSON());
      if (this.tagName === 'ul') {
        this.collection.each(this.renderRecommendItem);
      } else {
        $(this.el).append('<option value="">-- Select --</option>');
        this.collection.each(this.renderRecommendOption);
      }

    }
  });


})();
