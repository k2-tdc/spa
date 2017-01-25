/* global Hktdc, Backbone */

Hktdc.Models = Hktdc.Models || {};

(function() {
  'use strict';

  Hktdc.Models.DatePicker = Backbone.Model.extend({

    initialize: function() {},

    defaults: {
      placeholder: '',
      value: '',
      field: ''
    },

    validate: function(attrs, options) {},

    parse: function(response, options) {
      return response;
    }
  });
})();
