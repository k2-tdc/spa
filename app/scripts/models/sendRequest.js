/*global Hktdc, Backbone*/

Hktdc.Models = Hktdc.Models || {};

(function() {
  'use strict';

  Hktdc.Models.SendRequest = Backbone.Model.extend({

    url: function(refId) {
      return Hktdc.Config.apiURL + '/applications/computer-app?process=CHSW&refid=' + refId;
      // return Hktdc.Config.apiURL + '/SubmitRequests';
    },

    initialize: function() {},

    defaults: {
      // TODO: pass to applicant => "Review"
      // TODO: pass to approver => "Approval"
      Req_Status: '',
      Prepared_By: '',
      Preparer_ID: '',
      Ref_Id: '',
      Created_Date: '',
      Applicant: '',
      Applicant_ID: '',
      Title: '',
      Office: '',
      Department: '',
      Forward_To_ID: '',

      Service_AcquireFor: {
        Hardware_Software_IT_Service: {
          Software_Service: [],
          Hardware_Service: [],
          Maintenance_Service: [],
          IT_Service: []
        },
        General_Support_StandBy_Service: {
          General_Support: [],
          Onsite_StandBy_Service: []
        },
        Justification_Importand_Notes: '',
        Expected_Dalivery_Date: '',
        Frequency_Duration_of_Use: '',
        Estimated_Cost: '',
        Budget_Provided: '',
        // Budgeted_Sum: '',
        Recommend_By: '',
        Recommend_By_ID: '',
        cc: [],
        Remark: '',
        Attachments: [],
        ActionTakerRuleCode: '',
        // run time use applicant submittedTo or approver submittedTo
        SubmittedTo: ''
      }
    },

    validate: function(attrs, options) {},

    parse: function(response, options) {
      return response;
    }
  });
})();
