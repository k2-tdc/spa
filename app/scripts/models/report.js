/* global Hktdc, Backbone */

Hktdc.Models = Hktdc.Models || {};

(function() {
  'use strict';

  Hktdc.Models.Report = Backbone.Model.extend({

    initialize: function() {},

    defaults: {
      refid: '',
      department: '',
      'applicant': '',
      'create-date-start': '',
      'create-date-end': '',
      'completion-date-start': '',
      'completion-date-end': '',
      'keyword': '',
      'sort': '+dept,+applicant',

      departmentCollection: null,
      applicantCollection: null
    },

    validate: function(attrs, options) {},

    parse: function(response, options) {
      return response;
    }
  });
})();
