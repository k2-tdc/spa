/* global Hktdc, Backbone */

Hktdc.Models = Hktdc.Models || {};

(function() {
  'use strict';

  Hktdc.Models.Applicant = Backbone.Model.extend({
    idAttribute: 'UserFullName',

    defaults: {
      UserId: '',
      UserFullName: '',
      Applicant: '',
	  EmployeeID:''
    },

    url: function() {
	 // console.log('Inside the Applicatant model URL');
	  //console.log(Hktdc.Config.apiURL + '/users/' + this.attributes.UserId);
      return Hktdc.Config.apiURL + '/users/' + this.attributes.UserId;
    }

  });
})();
