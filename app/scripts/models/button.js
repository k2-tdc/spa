/*global Hktdc, Backbone*/

Hktdc.Models = Hktdc.Models || {};

(function () {
  'use strict';

  Hktdc.Models.Button = Backbone.Model.extend({

    url: '',

    initialize: function() {
    },

    defaults: {
      showBack: false,
      showRecall: false,
      showSave: false,
      showApplicant: false,
      showApprover: false
    },

    validate: function(attrs, options) {
    },

    parse: function(response, options)  {
      return response;
    }
  });

})();
