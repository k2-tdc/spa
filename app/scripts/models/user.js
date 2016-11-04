/*global Hktdc, Backbone*/

Hktdc.Models = Hktdc.Models || {};

(function() {
  'use strict';

  Hktdc.Models.User = Backbone.Model.extend({

    initialize: function() {
    },

    defaults: {
      UserName: 'Guest',
      UserId: 'guest'
    },

    validate: function(attrs, options) {
    },

    parse: function(response, options)  {
      return response;
    }
  });

})();
