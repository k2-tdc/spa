/* global Hktdc, Backbone, _ */

Hktdc.Collections = Hktdc.Collections || {};

(function() {
  'use strict';

  Hktdc.Collections.Applicant = Backbone.Collection.extend({

    model: Hktdc.Models.Applicant,

    getQueryParams: function(type) {
      return {
        RuleID: Hktdc.Config.RuleCode,
        UserId: '',
        WorkId: Hktdc.Config.userID,
        EmployeeId: Hktdc.Config.employeeID,
        Type: type || null
      };
    },

    /* This API request is deprecated as the list is get from the distinct users of the results */
    url: function(type) {
      /* type is the listing page mode */
      var validProperties = _.omit(this.getQueryParams(type), function(val, key) {
        // console.log(key, val);
        return _.isNull(val);
      });
      // console.log(validProperties);
      var qsArr = _.map(validProperties, function(val, key) {
        return key + '=' + val;
      });
	
	  //console.log('Inside the Applicatant cllection URL');
	  //console.log(Hktdc.Config.apiURL + '/GetApplicantList?' + qsArr.join('&'));
      return Hktdc.Config.apiURL + '/GetApplicantList?' + qsArr.join('&');
    }
  });
  
})();
