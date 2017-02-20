/* global Hktdc, Backbone */

Hktdc.Collections = Hktdc.Collections || {};

(function() {
  'use strict';

  Hktdc.Collections.ReportApplicant = Backbone.Collection.extend({

    url: function() {
      return Hktdc.Config.apiURL + '/users';
    },

    model: Hktdc.Models.ReportApplicant

  });
})();
