/*global Hktdc, Backbone*/

Hktdc.Models = Hktdc.Models || {};

(function () {
  'use strict';

  Hktdc.Models.NewRequest = Backbone.Model.extend({

    initialize: function() {
      this.on('change:selectedApplicant', function(model, value, options) {
      })
    },

    defaults: {
      preparedBy: null,
      department: null,
      createDate: new Date,
      selectedApplicant: null,
      requestService: [],
      notes: null,
      deliveryDate: null,
      duration: null,
      cost: null,
      budget: null,
      budgetSum: null,
      recommend: null,
      remark: null,

    },

    validate: function(attrs, options) {
    },

    parse: function(response, options)  {
      return response;
    }
  });

})();
