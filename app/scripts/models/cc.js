/*global Hktdc, Backbone*/

Hktdc.Models = Hktdc.Models || {};

(function() {
  'use strict';

  Hktdc.Models.CC = Backbone.Model.extend({

    initialize: function() {
    },

    defaults: {
      EMPLOYEEID: '',
      FULLNAME: '',
      USERID: ''
    },

    validate: function(attrs, options) {
    },

    parse: function(response, options)  {
      return response;
    }
  });

})();
