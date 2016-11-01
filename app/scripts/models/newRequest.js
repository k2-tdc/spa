/*global Hktdc, Backbone*/

Hktdc.Models = Hktdc.Models || {};

(function () {
  'use strict';

  Hktdc.Models.NewRequest = Backbone.Model.extend({

    initialize: function() {
      console.log(this.toJSON().selectedApplicantModel.toJSON());
      // TODO: The change event should place in view??
    },

    defaults: {
      preparedBy: null,
      department: null,
      createDate: null,
      selectedApplicantModel: null,
      selectedRecommentModel: null,
      selectedCCCollection: null,
      selectedServiceCollection: null,
      currentCC: null,
      requestService: [],
      justification: null,
      deliveryDate: null,
      frequency: null,
      cost: null,
      budget: null,
      budgetSum: null,
      recommend: null,
      remark: null

    },

    validate: function(attrs, options) {
    },

    parse: function(response, options)  {
      return response;
    }
  });

})();
