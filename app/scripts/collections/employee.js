/*global Hktdc, Backbone*/

Hktdc.Collections = Hktdc.Collections || {};

(function () {
  'use strict';

  Hktdc.Collections.Employee = Backbone.Collection.extend({

    model: Hktdc.Models.Employee,

    queryParams: {
      RuleID: Hktdc.Config.RuleCode,
      WorkId: Hktdc.Config.userID,
      UserId: Hktdc.Config.userID
    },

    url: function() {
      var qsArr = _.map(this.queryParams, function(val, key){
        return key + '=' + val;
      });

      return Hktdc.Config.apiURL + '/GetEmployee?' + qsArr.join('&');
    },

  });

})();
