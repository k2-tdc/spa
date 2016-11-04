/*global Hktdc, Backbone*/

Hktdc.Collections = Hktdc.Collections || {};

(function() {
  'use strict';

  Hktdc.Collections.Menu = Backbone.Collection.extend({
    
    url: function() {
      return Hktdc.Config.apiURL + '/GetMenuItems?UserId=' + Hktdc.Config.userID + '&ProcessId='
    },

    model: Hktdc.Models.Menu

  });

})();
