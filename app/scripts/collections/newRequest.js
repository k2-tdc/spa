/* global Hktdc, Backbone */

Hktdc.Collections = Hktdc.Collections || {};

(function() {
  'use strict';

  Hktdc.Collections.NewRequest = Backbone.Collection.extend({

    url: function(refId, type, procId, sn) {
      var qsArr = [
        'UserId=' + Hktdc.Config.userID
      ];

      if (type === 'Approval') {
        qsArr.push('ProsIncId=' + procId);
        qsArr.push('ReferID=' + refId);
        qsArr.push('SN=' + sn);
        return Hktdc.Config.apiURL + '/GetApproveDetails?' + qsArr.join('&');
      } else if (type === 'Worklist') {
        qsArr.push('ReferID=' + refId);
        qsArr.push('ProsIncId=' + procId);
        qsArr.push('SN=' + sn);
        return Hktdc.Config.apiURL + '/GetWorklistDetails?' + qsArr.join('&');
      } else if (type === 'Draft') {
        qsArr.push('ReferID=' + refId);
        return Hktdc.Config.apiURL + '/GetDraftDetails?' + qsArr.join('&');
      } else if (type === 'History') {
        qsArr = [];
        qsArr.push('ProInstID=' + procId);
        return Hktdc.Config.apiURL.replace('/api/request', '').replace('workflowdev', 'workflow') + '/users/' + Hktdc.Config.userID + '/approval-history/computer-app/' + refId + '?' + qsArr.join('&');
      } else {
        qsArr.push('ReferID=' + refId);
        qsArr.push('ProInstID=' + procId);
        return Hktdc.Config.apiURL + '/GetRequestDetails?' + qsArr.join('&');
      }
    },

    model: Hktdc.Models.NewRequest

  });
})();
