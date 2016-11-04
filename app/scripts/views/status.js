/* global Hktdc, Backbone, JST, $, _ */

Hktdc.Views = Hktdc.Views || {};

(function() {
  'use strict';

  Hktdc.Views.Status = Backbone.View.extend({

    template: JST['app/scripts/templates/status.ejs'],

    el: '#ddindexstatus',

    initialize: function() {
      // this.listenTo(this.model, 'change', this.render);
      this.render();

    },

    render: function() {

      this.$el.html(this.template({ data: this.model.toJSON() }));
    }

  });

})();
