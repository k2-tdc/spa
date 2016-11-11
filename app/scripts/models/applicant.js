/* global Hktdc, Backbone */

Hktdc.Models = Hktdc.Models || {};

(function() {
  'use strict';

  Hktdc.Models.Applicant = Backbone.Model.extend({
    // idAttribute: "Id",
    defaults: {
      UserId: '',
      UserFullName: '',
      Applicant: ''
    },

    url: function() {
      return Hktdc.Config.apiURL + '/GetApplicant?UserId=' + Hktdc.Config.userID + '&Applicant=' + this.attributes.UserId;
    }

  });
})();
