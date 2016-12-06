/* global Hktdc, Backbone */

Hktdc.Models = Hktdc.Models || {};

(function() {
  'use strict';

  Hktdc.Models.ConfirmDialog = Backbone.Model.extend({
    initialize: function() {
    },

    defaults: {
      message: '',
      title: '',
      open: false,
      lockConfirmBtn: false,
      onConfirm: function() {},
      onCancel: function() {}
    }
  });
})();
