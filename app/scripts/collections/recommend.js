/*global Hktdc, Backbone*/

Hktdc.Collections = Hktdc.Collections || {};

(function () {
  'use strict';

  Hktdc.Collections.Recommend = Backbone.Collection.extend({
    model: Hktdc.Models.Recommend,

    url: function(ApproverRuleCode, applicantUserId, cost) {
      return Hktdc.Config.apiURL + '/GetEmployee?RuleID=' + ApproverRuleCode + '&WorkId=&UserId=' + applicantUserId + '&EstCost=' + cost
      // return Hktdc.Config.apiURL + '/GetEmployee?RuleID=' + ApproverRuleCode + '&WorkId=&UserId=' + $('#divapplicant').attr("eid") + '&EstCost=' + $('#txtestimatedcost').val() + ''
    }
  });

})();
