/* global Hktdc, Backbone, JST, $ */

Hktdc.Views = Hktdc.Views || {};

(function() {
  'use strict';

  Hktdc.Views.NoPermission = Backbone.View.extend({

    template: JST['app/scripts/templates/noPermission.ejs'],

    tagName: 'div',

    initialize: function() {
      var self = this;
      self.listenTo(window.Hktdc.Dispatcher, 'noPermission', function() {
        self.render();
        $('#mainContent').empty().html(self.el);
      });
    },

    render: function() {
      this.$el.html(this.template());
    }

  });
})();
