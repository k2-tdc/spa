/*global Hktdc, Backbone*/

Hktdc.Collections = Hktdc.Collections || {};

(function () {
  'use strict';

  Hktdc.Collections.Service = Backbone.Collection.extend({

    model: Hktdc.Models.Service,

    url: function() {
      return Hktdc.Config.apiURL + '/GetServieType';
    },

    initialize: function() {}
  });

})();
