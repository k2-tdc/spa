/*global Hktdc, Backbone*/

Hktdc.Collections = Hktdc.Collections || {};

(function () {
  'use strict';

  Hktdc.Collections.Colleague = Backbone.Collection.extend({

    model: Hktdc.Models.Employee,

    getQueryParams: function() {
      return {
        RuleID: Hktdc.Config.RuleCode,
        UserId: '',
        WorkId: Hktdc.Config.userID
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
