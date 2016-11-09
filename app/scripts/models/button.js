/*global Hktdc, Backbone*/

Hktdc.Models = Hktdc.Models || {};

(function() {
  'use strict';

  Hktdc.Models.Button = Backbone.Model.extend({


    defaults: {
      showBack: false, // TODO: need?
      showSave: false,
      showSendToApplicant: false,
      showSendToApprover: false,
      showDelete: false,
      showReturn: false,
      showApprove: false,
      showReject: false,
      showRecall: false,
      showSendEmail: false,
      showComplete: false,
      showFoward: false,
      showCancel: false,
      approverSendTo: 'Approver', // [Approver, ITS Approval]
      applicantSendTo: 'Applicant',
      returnTo: 'Preparer'
    },

    validate: function(attrs, options) {
    },

    parse: function(response, options) {
      return response;
    }
  });
})();
