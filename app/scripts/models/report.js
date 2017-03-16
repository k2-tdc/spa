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
      'applicant-employee-id': '',
      'create-date-start': '',
      'create-date-end': '',
      'completion-date-start': '',
      'completion-date-end': '',
      'keyword': '',
      'sort': '+applicant,-lastactiontime',

      departmentCollection: null,
      applicantCollection: null
    },

    validate: function(attrs, options) {},

    parse: function(response, options) {
      return response;
    }
  });
})();
