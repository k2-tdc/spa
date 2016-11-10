/*global Hktdc, Backbone*/

Hktdc.Collections = Hktdc.Collections || {};

(function () {
  'use strict';

  Hktdc.Collections.Status = Backbone.Collection.extend({

    url: function(task) {
      return Hktdc.Config.apiURL + '/GetStatus?task=' + task;
    },

    model: Hktdc.Models.Status



  });

})();
