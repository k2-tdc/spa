/*global Hktdc, Backbone*/

Hktdc.Models = Hktdc.Models || {};

(function() {
  'use strict';

  Hktdc.Models.ApprovalHistory = Backbone.Model.extend({

    initialize: function() {},

    defaults: {
      canChooseStatus: true,
      showAdvanced: false,

      userid: '',
      employeeid: '',
      applicant: '',
      'approval-start-date': '',
      'approval-end-date': '',
      status: '',
      refid: '',
      'create-start-date': '',
      'create-end-date': '',
      keyword: ''
    },

    validate: function(attrs, options) {},

    parse: function(response, options) {
      return response;
    }
  });
})();
