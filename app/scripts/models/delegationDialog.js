/*global Hktdc, Backbone*/

Hktdc.Models = Hktdc.Models || {};

(function () {
  'use strict';

  Hktdc.Models.DelegationDialog = Backbone.Model.extend({

    url: '',

    initialize: function() {
    },

    defaults: {
      DelegationId: '',
      Type: '',
      ProId: '',
      StepId: '',
      FromUserId: '',
      ToUserId: '',
      Enabled: '',
      Remark: '',

      open: false
    },

    validate: function(attrs, options) {
    },

    parse: function(response, options) {
      return response;
    }
  });
})();
