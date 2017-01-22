/* global Hktdc, Backbone */

Hktdc.Collections = Hktdc.Collections || {};

(function() {
  'use strict';

  Hktdc.Collections.ReportApplicant = Backbone.Collection.extend({

    url: function() {
      return Hktdc.Config.apiURL.replace('/api/request', '') + '/users';
    },

    model: Hktdc.Models.Applicant

  });
})();
