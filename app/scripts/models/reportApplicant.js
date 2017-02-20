/*global Hktdc, Backbone*/

Hktdc.Models = Hktdc.Models || {};

(function() {
  'use strict';

  Hktdc.Models.ReportApplicant = Backbone.Model.extend({

    initialize: function() {},

    idAttribute: 'UserID',

    defaults: {
      UserID: '',
      EmployeeID: '',
      FullName: ''
    },

    validate: function(attrs, options) {},

    parse: function(response, options) {
      return response;
    }
  });

})();
