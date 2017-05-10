/*global Hktdc, Backbone*/

Hktdc.Models = Hktdc.Models || {};

(function() {
  'use strict';

  Hktdc.Models.BadgeNumber = Backbone.Model.extend({

    url: function(page) {
      return Hktdc.Config.apiURL + '/users/' + Hktdc.Config.userID + '/authorized-page-count?process=CHSW';
    },

    initialize: function() {},

    defaults: {},

    validate: function(attrs, options) {},

    parse: function(response, options) {
      return response;
    }
  });

})();
