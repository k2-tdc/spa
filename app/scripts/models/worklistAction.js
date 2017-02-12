/*global Hktdc, Backbone*/

Hktdc.Models = Hktdc.Models || {};

(function() {
  'use strict';

  Hktdc.Models.WorklistAction = Backbone.Model.extend({

    url: function(action) {
      return Hktdc.Config.apiURL + '/users/' + Hktdc.Config.userID + '/work-list/computer-app/' + action;
    },

    initialize: function() {},

    defaults: {
      UserId: Hktdc.Config.userID,
      SN: '',
      ActionName: '',
      Remark: '',
      Forward_To_ID: ''
    },

    validate: function(attrs, options) {},

    parse: function(response, options) {
      return response;
    }
  });
})();
