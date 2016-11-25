/* global Hktdc, Backbone */

Hktdc.Collections = Hktdc.Collections || {};

(function() {
  'use strict';

  Hktdc.Collections.Delegation = Backbone.Collection.extend({

    url: function(task) {
      // TODO: all options of 'Type'
      return Hktdc.Config.apiURL + '/GetDelegationList?Type=Sharing&UserId=' + Hktdc.Config.userID;
    },

    model: Hktdc.Models.Delegation

  });
})();
