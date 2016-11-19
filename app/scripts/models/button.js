/*global Hktdc, Backbone*/

Hktdc.Models = Hktdc.Models || {};

(function() {
  'use strict';

  Hktdc.Models.Button = Backbone.Model.extend({


    defaults: {
      // new / edit mode button
      showSave: false,
      showSendToApplicant: false,
      showSendToApprover: false,
      showDelete: false,
      showReturn: false,
      showRecall: false,
      approverSendTo: 'Approver', // [Approver, ITS Approval]
      applicantSendTo: 'Applicant',
      returnTo: 'Preparer',

      // read mode button
      workflowButtons: [],
      // showApprove: false,
      // showReject: false,
      // showSendEmail: false,
      // showComplete: false,
      // showForward: false,
      // showCancel: false,

      showBack: false // TODO: need?
    },

    validate: function(attrs, options) {
    },

    parse: function(response, options) {
      return response;
    }
  });
})();
