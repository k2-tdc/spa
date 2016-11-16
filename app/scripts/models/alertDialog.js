/*global Hktdc, Backbone*/

Hktdc.Models = Hktdc.Models || {};

(function () {
  'use strict';

  Hktdc.Models.AlertDialog = Backbone.Model.extend({

    url: '',

    defaults: {
      message: '',
      title: '',
      type: 'info'
    },

    validate: function(attrs, options) {
    },

    parse: function(response, options)  {
      return response;
    }
  });

})();
