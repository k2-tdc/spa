/*global Hktdc, Backbone*/

Hktdc.Collections = Hktdc.Collections || {};

(function () {
  'use strict';

  Hktdc.Collections.ShareUser = Backbone.Collection.extend({
    url: function() {
      return Hktdc.Config.apiURL + '/users/' + Hktdc.Config.userID + '/share-user?process=CHSW';
    },

    model: Hktdc.Models.User

  });

})();
