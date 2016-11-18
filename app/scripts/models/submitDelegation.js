/*global Hktdc, Backbone*/

Hktdc.Models = Hktdc.Models || {};

(function () {
  'use strict';

  Hktdc.Models.SubmitDelegation = Backbone.Model.extend({

    url: function() {
      return Hktdc.Config.apiURL + '/SubmitDelegation';
    },

    initialize: function() {
    },

    defaults: {
      DelegationId: '',
      Type: '',
      ProcessId: '',
      StepId: '',
      FromUserId: '',
      ToUserId: '',
      CreateUserId: '',
      Enable: '',
      Remark: ''
    },

    validate: function(attrs, options) {
    },

    parse: function(response, options) {
      return response;
    }
  });
})();
