/*global Hktdc, Backbone*/

Hktdc.Models = Hktdc.Models || {};

(function () {
  'use strict';

  Hktdc.Models.NewRequest = Backbone.Model.extend({

    initialize: function() {
      console.log(this.toJSON().selectedApplicant.toJSON());
      // this.attributes.selectedApplicant = {}
      // TODO: The change event should place in view??
    },

    defaults: {
      preparedBy: null,
      department: null,
      createDate: null,
      selectedApplicant: null,
      selectedCCCollection: null,
      currentCC: null,
      requestService: [],
      notes: null,
      deliveryDate: null,
      duration: null,
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
