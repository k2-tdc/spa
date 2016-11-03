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
      Req_Status: '',
      Prepared_By: '',
      Preparer_ID: '',
      // TODO: refid
      Ref_Id: '',
      Created_Date: '',
      Applicant: '',
      Applicant_ID: '',
      Title: '',
      Office: '',
      Department: '',
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
        Budgeted_Sum: '',
        Recommend_By: '',
        Recommend_By_ID: '',
        cc: [],
        Remark: '',
        Attachments: [],
        ActionTakerRuleCode: '',
        SubmittedTo: ''
      }
    },

    validate: function(attrs, options) {
    },

    parse: function(response, options)  {
      return response;
    }
  });

})();
