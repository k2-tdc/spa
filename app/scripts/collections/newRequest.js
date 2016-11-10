/*global Hktdc, Backbone*/

Hktdc.Collections = Hktdc.Collections || {};

(function() {
  'use strict';

  Hktdc.Collections.NewRequest = Backbone.Collection.extend({

    url: function(refId, procId) {
      var qsArr = [
        'UserId=' + Hktdc.Config.userID,
        'ReferID=' + refId
      ];

      if (procId) {
        qsArr.push('ProsIncId=' + procId);
      }
      return Hktdc.Config.apiURL + '/GetRequestDetails?' + qsArr.join('&');
    },

    model: Hktdc.Models.NewRequest

  });

})();
