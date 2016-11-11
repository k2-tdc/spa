/* global Hktdc, Backbone, _ */

Hktdc.Collections = Hktdc.Collections || {};

(function() {
  'use strict';

  Hktdc.Collections.Employee = Backbone.Collection.extend({

    model: Hktdc.Models.Employee,

    getQueryParams: function() {
      return {
        RuleID: Hktdc.Config.RuleCode,
        UserId: Hktdc.Config.userID,
        WorkId: Hktdc.Config.userID
      };
    },

    url: function() {
      var qsArr = _.map(this.getQueryParams(), function(val, key) {
        return key + '=' + val;
      });

      return Hktdc.Config.apiURL + '/GetEmployee?' + qsArr.join('&');
    }

  });

})();
