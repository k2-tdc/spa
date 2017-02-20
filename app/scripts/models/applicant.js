/* global Hktdc, Backbone */

Hktdc.Models = Hktdc.Models || {};

(function() {
  'use strict';

  Hktdc.Models.Applicant = Backbone.Model.extend({
    idAttribute: 'UserId',

    defaults: {
      UserId: '',
      UserFullName: '',
      Applicant: ''
    },

    url: function() {
      return Hktdc.Config.apiURL + '/users/' + Hktdc.Config.userID +
        '?Applicant=' + this.attributes.UserId;
      // return Hktdc.Config.apiURL + '/GetApplicant?UserId=' + Hktdc.Config.userID + '&Applicant=' + this.attributes.UserId;
    }

  });
})();
