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
    clickProcessHandler: function() {
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
