/* global Hktdc, Backbone */
/* this list is including all employee except self */

Hktdc.Collections = Hktdc.Collections || {};
(function () {
  'use strict';

  Hktdc.Collections.Colleague = Backbone.Collection.extend({

    model: Hktdc.Models.Employee,

    getQueryParams: function() {
      return {
        // RuleID: Hktdc.Config.RuleCode,
        // WorkId: Hktdc.Config.userID,
        UserId: Hktdc.Config.userID
      };
    },

    url: function() {
      var qsArr = _.map(this.getQueryParams(), function(val, key) {
        return key + '=' + val;
      });

      return Hktdc.Config.apiURL + '/GetForwardEmployee?' + qsArr.join('&');
    }

  });

})();
