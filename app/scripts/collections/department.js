/* global Hktdc, Backbone, _ */

Hktdc.Collections = Hktdc.Collections || {};

(function() {
  'use strict';

  Hktdc.Collections.Department = Backbone.Collection.extend({

    url: function() {
      return Hktdc.Config.apiURL + '/departments';
    },

    model: Hktdc.Models.Department

  });
})();
