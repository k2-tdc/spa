/* global Hktdc, Backbone, JST, $, _ */

Hktdc.Views = Hktdc.Views || {};

(function() {
  'use strict';

  Hktdc.Views.AppShoutcut = Backbone.View.extend({

    template: JST['app/scripts/templates/appShoutcut.ejs'],

    el: '#app-switch',

    initialize: function() {
      // this.listenTo(this.model, 'change', this.render);
      this.render();
    },

    render: function() {
      // console.log(this.model);
      this.$el.html(this.template(this.model.toJSON()));
    }

  });

})();
