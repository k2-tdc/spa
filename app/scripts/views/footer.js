/*global Hktdc, Backbone, JST*/

Hktdc.Views = Hktdc.Views || {};

(function() {
  'use strict';

  Hktdc.Views.Footer = Backbone.View.extend({

    template: JST['app/scripts/templates/footer.ejs'],

    el: '#footer',

    initialize: function() {
      console.log('crash');
      this.render();
    },

    render: function() {
      this.$el.html(this.template());
    }

  });
})();
