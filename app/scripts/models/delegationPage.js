/* global Hktdc, Backbone */

Hktdc.Models = Hktdc.Models || {};

(function() {
  'use strict';

  Hktdc.Models.DelegationPage = Backbone.Model.extend({

    initialize: function() {
    },

    defaults: {
      UserId: '',
      DeleId: '',
      ProId: '',
      StepId: '',
      Type: ''
    },

    validate: function(attrs, options) {
    },

    parse: function(response, options) {
      return response;
    }
  });
})();
