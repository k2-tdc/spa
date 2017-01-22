/* global Hktdc, Backbone */

Hktdc.Models = Hktdc.Models || {};

(function() {
  'use strict';

  Hktdc.Models.Report = Backbone.Model.extend({

    initialize: function() {},

    defaults: {
      refid: '',
      deptcode: '',
      'applicantemployeeid': '',
      'createdatestart': '',
      'createdateend': '',
      'completiondatestart': '',
      'completiondateend': '',
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
