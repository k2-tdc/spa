/* global Hktdc, Backbone */

Hktdc.Models = Hktdc.Models || {};

(function() {
  'use strict';

  Hktdc.Models.CheckStatus = Backbone.Model.extend({

    defaults: {
      canChooseStatus: true,
      searchUserType: '',
      showAdvanced: false,

      refid: '',
      'start-date': '',
      'end-date': '',
      offset: 0,
      limit: 999999,
      sort: '+lastactiontime',
      status: '',
      applicant: '',

      UserId: '',
      SUser: '',

      // for detail
      ProsIncId: ''
    },

    validate: function(attrs, options) {},

    parse: function(response, options) {
      return response;
    }
  });
})();
