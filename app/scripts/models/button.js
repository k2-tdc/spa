/*global Hktdc, Backbone*/

Hktdc.Models = Hktdc.Models || {};

(function() {
  'use strict';

  Hktdc.Models.Button = Backbone.Model.extend({


    defaults: {
      showBack: true,
      showSave: true,
      showRecall: false,
      showApplicant: false,
      showApprover: false,
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
