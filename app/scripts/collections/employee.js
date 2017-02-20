/* global Hktdc, Backbone */

Hktdc.Collections = Hktdc.Collections || {};

(function() {
  'use strict';

  Hktdc.Collections.Employee = Backbone.Collection.extend({

    model: Hktdc.Models.Employee,

    url: function() {
      // return Hktdc.Config.apiURL + '/GetEmployee?' + qsArr.join('&');
      return Hktdc.Config.apiURL + '/workers/' + Hktdc.Config.userID + '/owners?rule=' + Hktdc.Config.RuleCode;
    }
  });
})();
