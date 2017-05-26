/*global Hktdc, Backbone*/

Hktdc.Collections = Hktdc.Collections || {};

(function() {
  'use strict';

  Hktdc.Collections.MenuProcess = Backbone.Collection.extend({

    url: function() {
      return Hktdc.Config.apiURL + '/users/' + Hktdc.Config.userID + '/authorized-applications';
    },

    model: Hktdc.Models.MenuProcess

  });

})();
