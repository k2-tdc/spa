/* global Hktdc, Backbone, JST */

Hktdc.Views = Hktdc.Views || {};

(function() {
  'use strict';

  Hktdc.Views.NoPermission = Backbone.View.extend({

    template: JST['app/scripts/templates/noPermission.ejs'],

    tagName: 'div',

    initialize: function() {},

    render: function() {
      this.$el.html(this.template());
    }

  });
})();
