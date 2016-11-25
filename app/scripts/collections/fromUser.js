/*global Hktdc, Backbone*/

Hktdc.Collections = Hktdc.Collections || {};

(function () {
  'use strict';

  Hktdc.Collections.FromUser = Backbone.Collection.extend({

    url: function() {
      return Hktdc.Config.apiURL + '/GetFromUser?WorkId=' + Hktdc.Config.userID + '&RuleID=' + Hktdc.Config.RuleCode
    },

    model: Hktdc.Models.Employee

  });

})();
