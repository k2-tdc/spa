/*global Hktdc, Backbone*/

Hktdc.Models = Hktdc.Models || {};

(function() {
  'use strict';

  Hktdc.Models.NewRequest = Backbone.Model.extend({

    url: function(refId) {
      var qsArr = [
        'UserId=' + Hktdc.Config.userID,
        'ReferID=' + refId
      ]
      return Hktdc.Config.apiURL + '/GetRequestDetails?' + qsArr.join('&');
    },

    initialize: function() {
      // console.log(this.toJSON().selectedApplicantModel.toJSON());
      // TODO: The change event should place in view??
    },

    defaults: {
      FormStatus: null,

      PreparerFNAME: null,
      PreparerUserID: null,
      ApplicantFNAME: null,
      ApplicantUserID: null,
      ApproverFNAME: null,
      ApproverUserID: null,
      ActionTakerFNAME: null,
      ActionTakerUserID: null,
      ITSApproverFNAME: null,
      ITSApproverUserID: null,

      // refId: null,
      ReferenceID: null,
      SN: null,
      CreatedOn: null,

      // applicant department
      // department: null,
      DEPT: null,

      // applicant title
      // title: null,
      Title: null,

      // applicant office
      // office: null,
      Location: null,

      // justification: null,
      Justification: null,
      // deliveryDate: null,
      EDeliveryDate: null,
      // frequency: null,
      DurationOfUse: null,
      // cost: null,
      EstimatedCost: null,
      // budget: null,
      BudgetProvided: null,
      // budgetSum: null,
      // BudgetSum: null,
      Remark: null,

      /* the Comment field leads the /SubmitRequest fail */
      // Comment: null,

      actions: [],
      selectedServiceTree: null,
      selectedServiceCollection: null,
      selectedAttachmentCollection: null,
      deleteAttachmentCollection: null,
      selectedCCCollection: null,

      selectedApplicantModel: null,
      selectedRecommentModel: null,

      employeeList: null,
      currentCC: null,
      requestService: [],
      applicantSubmittedTo: null,
      approverSubmittedTo: null,

      showComment: false,
      showLog: false,
      showFileLog: false,

      /**
       * 'mode' options: ['read', 'new', 'edit']
       *   'new': create new request
       *   'edit': edit old request
       *   'read': readonly, for reading old request
       */
      mode: 'read',
      attachmentMode: 'read'
    },

    validate: function(attrs, options) {
    },

    parse: function(response, options) {
      return response;
    }
  });
})();
