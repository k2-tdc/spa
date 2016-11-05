/*global Hktdc, Backbone*/

Hktdc.Models = Hktdc.Models || {};

(function() {
  'use strict';

  Hktdc.Models.Attachment = Backbone.Model.extend({

    idAttribute: 'name',

    initialize: function() {
    },

    defaults: {
      file: null
    },

    validate: function(attrs, options) {
    },

    parse: function(response, options)  {
      return response;
    }
  });

})();
