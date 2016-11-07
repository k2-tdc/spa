/*global Hktdc, Backbone*/

Hktdc.Models = Hktdc.Models || {};

(function() {
  'use strict';

  Hktdc.Models.Button = Backbone.Model.extend({


    defaults: {
      showBack: false,
      showSave: false,
      showRecall: false,
      showSendToApplicant: false,
      showSendToApprover: false,
      showApprove: false,
      showReject: false,
      showReturn: false,
      approverSendTo: 'Approver',
      applicantSendTo: 'Applicant'
    },

    validate: function(attrs, options) {
    },

    parse: function(response, options)  {
      return response;
    }
  });

})();
