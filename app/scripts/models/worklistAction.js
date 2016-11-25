/*global Hktdc, Backbone*/

Hktdc.Models = Hktdc.Models || {};

(function () {
  'use strict';

  Hktdc.Models.WorklistAction = Backbone.Model.extend({

    url: function() {
      return Hktdc.Config.apiURL + '/WorklistAction';
    },

    initialize: function() {
    },

    defaults: {
      UserId: Hktdc.Config.userID,
      SN: '',
      ActionName: '',
      Comment: '',
      Forward_To_ID: ''
    },

    validate: function(attrs, options) {
    },

    parse: function(response, options)  {
      return response;
    }
  });

})();
