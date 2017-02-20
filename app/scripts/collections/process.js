/* global Hktdc, Backbone */

Hktdc.Collections = Hktdc.Collections || {};

(function() {
  'use strict';

  Hktdc.Collections.Process = Backbone.Collection.extend({

    url: function() {
      return Hktdc.Config.apiURL + '/users/' + Hktdc.Config.userID + '/applications?UserId=' + Hktdc.Config.userID;
    },

    model: Hktdc.Models.Process

  });
})();
