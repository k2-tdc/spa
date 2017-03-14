/* global Hktdc, Backbone */

Hktdc.Collections = Hktdc.Collections || {};

(function() {
  'use strict';

  Hktdc.Collections.NewRequest = Backbone.Collection.extend({

    url: function(refId, type, procId, sn) {
      if (type === 'Approval' || type === 'Worklist') {
        return Hktdc.Config.apiURL + '/users/' + Hktdc.Config.userID + '/work-list/computer-app/' + sn;
      } else if (type === 'Draft') {
        return Hktdc.Config.apiURL + '/users/' + Hktdc.Config.userID + '/draft-list/computer-app/' + refId;
      } else if (type === 'History') {
        return Hktdc.Config.apiURL + '/users/' + Hktdc.Config.userID + '/approval-history/computer-app/' + refId + '?ProInstID=' + procId;
      } else {
        return Hktdc.Config.apiURL + '/applications/computer-app/' + refId + '?ProInstID=' + procId;
      }
    },

    model: Hktdc.Models.NewRequest

  });
})();
