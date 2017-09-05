/*global Hktdc, Backbone*/

Hktdc.Models = Hktdc.Models || {};

(function() {
  'use strict';

  Hktdc.Models.ServiceObject = Backbone.Model.extend({

    url: '',

    initialize: function() {
    },

    defaults: {
		IsServiceChanged: '',
    },

    validate: function(attrs, options) {
    },

    parse: function(response, options)  {
      return response;
    }
  });

})();
