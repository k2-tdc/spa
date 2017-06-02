/* global Hktdc, Backbone, JST, _, $ */

Hktdc.Views = Hktdc.Views || {};

(function() {
  'use strict';

  Hktdc.Views.MenuProcessList = Backbone.View.extend({

    tagName: 'ul',

    className: 'dropdown-menu',

    initialize: function(props) {
      _.extend(this, props);
      _.bindAll(this, 'renderProcessItem');
    },

    renderProcessItem: function(model) {
      var processItemView = new Hktdc.Views.MenuProcessItem({
        model: model,
        requestFormModel: this.requestFormModel
      });

      processItemView.render();
      $(this.el).append(processItemView.el);
    },

    render: function() {
      this.collection.each(this.renderProcessItem);
    }
  });

  Hktdc.Views.MenuProcessItem = Backbone.View.extend({

    template: JST['app/scripts/templates/menuProcess.ejs'],
    tagName: 'li',
    events: {
      'click': 'clickProcessHandler'
    },
    clickProcessHandler: function(ev) {
      //ev.preventDefault();
      //ev.stopPropagation();
      //return false;
      var pagePath = '';
      var $target = $(ev.target);
      if ($(ev.target).is('a')) {
        pagePath = $target.attr('href').toLowerCase();
      }
      var currentRoute = Backbone.history.getHash();
      var isParentPath = (currentRoute.indexOf('/') === -1);
      var containQueryString = currentRoute.indexOf('?') >= 0;
      if (currentRoute.indexOf(pagePath) >= 0 && isParentPath) {
        if (containQueryString) {
          Backbone.history.navigate(pagePath, true);
        } else {
          Backbone.history.loadUrl(pagePath, { trigger: true });
        }
      } else {
        Backbone.history.navigate(pagePath, true);
      }
    },

    initialize: function(props) {
      _.extend(this, props);
      // this.listenTo(this.model, 'change', this.render);
    },

    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
    }

  });
})();
