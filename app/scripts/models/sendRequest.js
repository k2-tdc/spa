/*global Hktdc, Backbone*/

Hktdc.Models = Hktdc.Models || {};

(function () {
  'use strict';

  Hktdc.Models.SendRequest = Backbone.Model.extend({

    url: function(){
      return Hktdc.Config.apiURL + '/SubmitRequests';
    },

    initialize: function() {
    },

    defaults: {
      Req_Status: null,
      Prepared_By: null,
      Preparer_ID: null,
      Ref_Id: null,
      Created_Date: null,
      Applicant: null,
      Applicant_ID: null,
      Title: null,
      Office: null,
      Department: null,
      Service_AcquireFor: {
        Hardware_Software_IT_Service: {
          Software_Service: null,
          Hardware_Service: null,
          Maintenance_Service: null,
          IT_Service: null
        },
        General_Support_StandBy_Service: {
          General_Support: null,
          Onsite_StandBy_Service: null
        },
        Justification_Importand_Notes: null,
        Expected_Dalivery_Date: null,
        Frequency_Duration_of_Use: null,
        Estimated_Cost: null,
        Budget_Provided: null,
        Budgeted_Sum: null,
        Recommend_By: null,
        Recommend_By_ID: null,
        cc: null,
        Remark: null,
        Attachments: null,
        ActionTakerRuleCode: null,
        SubmittedTo: null
      }
    },

    validate: function(attrs, options) {
    },

    parse: function(response, options)  {
      return response;
    }
  });

})();
