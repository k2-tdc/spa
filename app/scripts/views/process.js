/* global Hktdc, Backbone, JST, _ */

Hktdc.Views = Hktdc.Views || {};

(function() {
  'use strict';

  Hktdc.Views.Process = Backbone.View.extend({

    template: JST['app/scripts/templates/process.ejs'],

    tagName: 'li',

    events: {},

    initialize: function() {
      this.render();
    },

    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
    }

  });

  Hktdc.Views.ProcessList = Backbone.View.extend({

    tagName: 'ul',

    className: 'dropdown-menu ulnav-header-main',

    initialize: function() {
      _.bindAll(this, 'renderProcessItem');
      // this.listenTo(this.model, 'change', this.render);
    },

    renderProcessItem: function(model) {
      var processItemView = new Hktdc.Views.Process({model: model});
      this.$el.append(processItemView.el);
    },

    render: function() {
      this.collection.each(this.renderProcessItem);
    }

  });
})();
