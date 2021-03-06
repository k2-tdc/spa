/*global Hktdc, Backbone*/

Hktdc.Collections = Hktdc.Collections || {};

(function () {
  'use strict';

  Hktdc.Collections.ForwardUser = Backbone.Collection.extend({

    model: Hktdc.Models.Employee,

    url: function(applicant) {
      return Hktdc.Config.apiURL + '/applications/computer-app/service-providers?applicant=' + (applicant || '');
    }

  });
})();
