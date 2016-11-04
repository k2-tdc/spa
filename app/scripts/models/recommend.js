/*global Hktdc, Backbone*/

Hktdc.Models = Hktdc.Models || {};

(function() {
  'use strict';

  Hktdc.Models.Recommend = Backbone.Model.extend({
    idAttribute: 'UserId',

    defaults: {
    },

    validate: function(attrs, options) {
    },

    parse: function(response, options) {
      return response;
    }
  });

})();
