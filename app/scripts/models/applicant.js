/*global Hktdc, Backbone*/

Hktdc.Models = Hktdc.Models || {};

(function() {
  'use strict';

  Hktdc.Models.Applicant = Backbone.Model.extend({
    // idAttribute: "Id",
    defaults: {
      UserId: '',
      UserFullName: ''
    },
    
    url: function() {
      return Hktdc.Config.apiURL + '/GetApplicant?UserId=' + this.attributes.UserId;
    }

  });

})();
