/* global Hktdc, Backbone, JST */

Hktdc.Views = Hktdc.Views || {};

(function() {

  'use strict';

  Hktdc.Views.Footer = Backbone.View.extend({

    template: JST['app/scripts/templates/footer.ejs'],

    // set auto bind to existing #header
    el: '#footer',

    initialize: function(props) {
      this.render();
    },

    render: function() {
      // var data = this.model.toJSON() || ;
      this.$el.html(this.template());
    }

  });
})();
