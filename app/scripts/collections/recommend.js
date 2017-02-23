/* global Hktdc, Backbone */

Hktdc.Collections = Hktdc.Collections || {};

(function() {
  'use strict';

  Hktdc.Collections.Recommend = Backbone.Collection.extend({
    model: Hktdc.Models.Recommend,

    url: function(ApproverRuleCode, applicantUserId, cost) {
      return Hktdc.Config.apiURL + '/users/' + applicantUserId + '/workers/computer-app?' +
        'rule=' + ApproverRuleCode +
        '&cost=' + cost;
      // return Hktdc.Config.apiURL + '/GetEmployee?RuleID=' + ApproverRuleCode + '&WorkId=&UserId=' + $('#divapplicant').attr("eid") + '&EstCost=' + $('#txtestimatedcost').val() + ''
    }
  });
})();
