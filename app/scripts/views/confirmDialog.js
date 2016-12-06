/* global Hktdc, Backbone, JST, $ */

Hktdc.Views = Hktdc.Views || {};

(function () {
  'use strict';

  Hktdc.Views.ConfirmDialog = Backbone.View.extend({

    template: JST['app/scripts/templates/confirmDialog.ejs'],

    tagName: 'div',

    attributes: {
      role: 'dialog',
      'aria-labelledby': 'confirm dialog'
    },

    className: 'modal fade bs-example-modal-md',

    events: {
      'click .confirm-btn': 'confirmHandler'
    },

    initialize: function() {
      var self = this;
      this.render();

      this.$el.modal({
        backdrop: true,
        show: false
      });

      this.$el.on('hidden.bs.modal', function() {
        self.model.set({ open: false });
      });

      this.model.on('change:open', function(model, isOpen) {
        if (isOpen) {
          self.$el.modal('show');
          self.render();
        } else {
          self.$el.modal('hide');
        }
      });
      this.model.on('change:lockConfirmBtn', function(model, isLock) {
        console.log('change lockConfirmBtn: ', isLock);
        if (isLock) {
          $('.confirm-btn', self.el).prop('disabled', true);
        } else {
          $('.confirm-btn', self.el).prop('disabled', false);
        }
      });
    },

    confirmHandler: function() {
      this.model.toJSON().onConfirm();
    },

    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
    }

  });

})();
