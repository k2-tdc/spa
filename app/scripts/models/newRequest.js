/*global Hktdc, Backbone*/

Hktdc.Models = Hktdc.Models || {};

(function () {
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
      // preparedByUserName: null,
      PreparerFNAME: null,
      // preparedByUserId: null,
      PreparerUserID: null,
      // refId: null,
      ReferenceID: null,
      // createDate: null,
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
      BudgetSum: null,

      Remark: null,

      selectedApplicantModel: null,
      selectedServiceCollection: null,
      currentCC: null,
      requestService: [],
      recommend: null, // TODO: check this not in use?
      selectedRecommentModel: null,
      selectedCCCollection: null,
      remark: null,
      submittedTo: null,

      showLog: false,
      showFileLog: false,
      attachmentMode: 'read'

    },

    validate: function(attrs, options) {
    },

    parse: function(response, options)  {
      return response;
    }
  });

})();
