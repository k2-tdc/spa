/* global Hktdc, Backbone */

Hktdc.Collections = Hktdc.Collections || {};

(function() {
  'use strict';

  Hktdc.Collections.NewRequest = Backbone.Collection.extend({

    url: function(refId, type, procId, sn) {
      var qsArr = [];

      if (type === 'Approval' || type === 'Worklist') {
        qsArr.push('refid=' + refId);
        return Hktdc.Config.apiURL + '/users/' + Hktdc.Config.userID + '/work-list/computer-app/' + sn + '?' + qsArr.join('&');
      } else if (type === 'Draft') {
        qsArr.push('referid=' + refId);
        return Hktdc.Config.apiURL + '/users/' + Hktdc.Config.userID + '/draft-list/computer-app/' + refId + '?' + qsArr.join('&');
      } else if (type === 'History') {
        qsArr.push('ProInstID=' + procId);
        return Hktdc.Config.apiURL + '/users/' + Hktdc.Config.userID + '/approval-history/computer-app/' + refId + '?' + qsArr.join('&');
      } else {
        qsArr.push('ProInstID=' + procId);
        return Hktdc.Config.apiURL + '/applications/computer-app/' + refId + '?' + qsArr.join('&');
      }
    },

    model: Hktdc.Models.NewRequest

  });
})();
