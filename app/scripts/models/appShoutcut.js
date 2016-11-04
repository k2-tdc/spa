/*global Hktdc, Backbone*/

Hktdc.Models = Hktdc.Models || {};

(function() {
  'use strict';

  Hktdc.Models.AppShoutcut = Backbone.Model.extend({

    initialize: function() {
    },

    defaults: {
      PList: [

      ],
      ActiveApp: false
    },

    validate: function(attrs, options) {
    },

    parse: function(response, options)  {
      return response;
    }
  });

})();
