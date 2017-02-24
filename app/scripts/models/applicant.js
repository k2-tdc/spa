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
      return Hktdc.Config.apiURL + '/users/' + this.attributes.UserId;
    }

  });
})();
