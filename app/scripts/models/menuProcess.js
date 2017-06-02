/* global Hktdc, Backbone */

Hktdc.Models = Hktdc.Models || {};

(function() {
  'use strict';

  Hktdc.Models.MenuProcess = Backbone.Model.extend({

    idAttribute: 'ProcessID',

    initialize: function() {},

    defaults: {
      ProcessID: '',
      ProcessName: '',
      ProcessDisplayName: '',
      IsDefault: '',
      SPANav:''
    },

    validate: function(attrs, options) {},

    parse: function(response, options) {
      return response;
    }
  });
})();
