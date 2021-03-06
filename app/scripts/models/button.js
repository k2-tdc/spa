/*global Hktdc, Backbone*/

Hktdc.Models = Hktdc.Models || {};

(function() {
  'use strict';

  Hktdc.Models.Button = Backbone.Model.extend({
    defaults: {
	  showBack: true,		
      showSave: false,
      showSendToApplicant: false,
      showSendToApprover: false,
      showDelete: false,
      showReturn: false,
      showRecall: false,
      showResend: false,
      approverSendTo: 'Approver', // [Approver, ITS Approval]
      applicantSendTo: 'Applicant',
      returnTo: 'Preparer',
      workflowButtons: [],
      noButton: false
    },

    validate: function(attrs, options) {
    },

    parse: function(response, options) {
      return response;
    }
  });
})();
