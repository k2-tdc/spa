/*global Hktdc, Backbone*/

Hktdc.Collections = Hktdc.Collections || {};

(function() {
  'use strict';

  Hktdc.Collections.Recommend = Backbone.Collection.extend({
    model: Hktdc.Models.Recommend,

    url: function(ApproverRuleCode, applicantUserId, cost) {
      var WorkerId = '';
      return Hktdc.Config.apiURL + '/GetApprover?RuleID=' + ApproverRuleCode +
      '&WorkId=' + WorkerId +
      '&UserId=' + Hktdc.Config.userID +
      '&Applicant=' + applicantUserId +
      '&EstCost=' + cost;
      // return Hktdc.Config.apiURL + '/GetEmployee?RuleID=' + ApproverRuleCode + '&WorkId=&UserId=' + $('#divapplicant').attr("eid") + '&EstCost=' + $('#txtestimatedcost').val() + ''
    }
  });

})();
