/* global Hktdc, Backbone */

Hktdc.Collections = Hktdc.Collections || {};

(function() {
  'use strict';

  Hktdc.Collections.ShareUser = Backbone.Collection.extend({
    url: function(type) {
      var typePath = type ? '&type=' + type : '';
      return Hktdc.Config.apiURL + '/users/' + Hktdc.Config.userID + '/share-user?process=CHSW' + typePath;
    },

    model: Hktdc.Models.Employee

  });
})();
