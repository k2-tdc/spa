/*global Hktdc, Backbone*/

Hktdc.Models = Hktdc.Models || {};

(function () {
  'use strict';

  Hktdc.Models.NewRequest = Backbone.Model.extend({

    // url: function(action) {
    //   switch (action) {
    //     case 'save':
    //       return Hktdc.Config.apiURL + '/SubmitRequests';
    //       break;
    //     default:
    //       return Hktdc.Config.apiURL + '/'
    //   }
    // },

    initialize: function() {
      console.log(this.toJSON().selectedApplicantModel.toJSON());
      // TODO: The change event should place in view??
    },

    defaults: {
      preparedByUserName: null,
      preparedByUserId: null,
      refId: null,
      createDate: null,

      selectedApplicantModel: null,
      // applicant department
      department: null,

      // applicant title
      title: null,

      // applicant office
      office: null,

      selectedServiceCollection: null,
      currentCC: null,
      requestService: [],

      justification: null,
      deliveryDate: null,
      frequency: null,
      cost: null,
      budget: null,
      budgetSum: null,
      recommend: null, // TODO: check this not in use?
      selectedRecommentModel: null,
      selectedCCCollection: null,
      remark: null,
      submittedTo: null


    },

    validate: function(attrs, options) {
    },

    parse: function(response, options)  {
      return response;
    }
  });

})();
