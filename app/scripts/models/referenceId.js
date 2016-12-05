/*global Hktdc, Backbone*/

Hktdc.Models = Hktdc.Models || {};

(function() {
  'use strict';

  Hktdc.Models.ReferenceId = Backbone.Model.extend({

    url: function() {
      return Hktdc.Config.apiURL + '/GetReferenceID?UserId=' + Hktdc.Config.userID;
    },

    defaults: {
      ReferenceID: ''
    },

    validate: function(attrs, options) {
    },

    parse: function(response, options) {
      return response;
    }
  });
})();
