/* global Hktdc, Backbone, JST */

Hktdc.Views = Hktdc.Views || {};

(function() {
  'use strict';

  Hktdc.Views.AlertDialog = Backbone.View.extend({

    template: JST['app/scripts/templates/alertDialog.ejs'],

    tagName: 'div',

    attributes: {
      role: 'dialog',
      'aria-labelledby': 'mySmallModalLabel'
    },

    className: 'modal fade bs-example-modal-sm',

    events: {},

    initialize: function() {
      var self = this;
      self.render();

      self.$el.modal({
        backdrop: true,
        show: false
      });

      self.$el.on('shown.bs.modal', function() {
        console.log(self.$el.height());
      });

      self.$el.on('hidden.bs.modal', function() {
        self.model.set({open: false});
      });
      // self.$el.modal('show');

      this.model.on('change', function(model) {
        if (model.toJSON().open) {
          self.$el.modal('show');
          self.render();
        }
      });
    },

    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
    }

  });
})();
