/*global Hktdc, Backbone*/

Hktdc.Collections = Hktdc.Collections || {};

(function () {
  'use strict';

  Hktdc.Collections.ServiceCatagory = Backbone.Collection.extend({

    model: Hktdc.Models.ServiceCatagory,

    url: function() {
      return Hktdc.Config.apiURL + '/GetServieType';
    },

    initialize: function() {}
  });

})();
