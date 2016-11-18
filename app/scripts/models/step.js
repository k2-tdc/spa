/*global Hktdc, Backbone*/

Hktdc.Models = Hktdc.Models || {};

(function () {
  'use strict';

  Hktdc.Models.Step = Backbone.Model.extend({

    url: '',

    initialize: function() {
    },

    defaults: {
    },

    validate: function(attrs, options) {
    },

    parse: function(response, options)  {
      return response;
    }
  });

})();
