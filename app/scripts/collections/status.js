/*global Hktdc, Backbone*/

Hktdc.Collections = Hktdc.Collections || {};

(function () {
  'use strict';

  Hktdc.Collections.Status = Backbone.Collection.extend({

    url: function() {
      return Hktdc.Config.apiURL + '/GetStatus'
    },

    model: Hktdc.Models.Status

    

  });

})();
