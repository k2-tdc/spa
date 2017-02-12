/* global Hktdc, Backbone */
/* this list is including all employee except self */

Hktdc.Collections = Hktdc.Collections || {};
(function() {
  'use strict';

  Hktdc.Collections.Colleague = Backbone.Collection.extend({

    model: Hktdc.Models.Employee,

    getQueryParams: function() {
      return {
        UserId: Hktdc.Config.userID
      };
    },

    url: function() {
      // return Hktdc.Config.apiURL + '/GetForwardEmployee?' + qsArr.join('&');
      // TODO: new api change to:
      return Hktdc.Config.apiURL + '/admin/users';
    }

  });
})();
