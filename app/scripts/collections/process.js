/* global Hktdc, Backbone */

Hktdc.Collections = Hktdc.Collections || {};

(function() {
  'use strict';

  Hktdc.Collections.Process = Backbone.Collection.extend({

    url: function() {
      return Hktdc.Config.apiURL + '/api/request/GetProcessList?UserId=' + Hktdc.Config.userID;
    },

    model: Hktdc.Models.Process

  });
})();
