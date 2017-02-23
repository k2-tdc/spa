/*global Hktdc, Backbone*/

Hktdc.Models = Hktdc.Models || {};

(function() {
  'use strict';

  Hktdc.Models.Menu = Backbone.Model.extend({

    url: function(page) {
      var pageQS = page ? '&page=' + page : '';
      return Hktdc.Config.apiURL + '/users/' + Hktdc.Config.userID + '/applications/authorized-pages?process=CHSW' + pageQS;
    },

    initialize: function() {},

    defaults: {
      activeTab: false
    },

    validate: function(attrs, options) {},

    parse: function(response, options) {
      return response;
    }
  });

})();
