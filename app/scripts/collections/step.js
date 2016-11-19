/* global Hktdc, Backbone, _ */

Hktdc.Collections = Hktdc.Collections || {};

(function() {
  'use strict';

  Hktdc.Collections.Step = Backbone.Collection.extend({

    url: function(procId) {
      procId = _.isNull(procId) ? '' : procId;
      return Hktdc.Config.apiURL + '/GetProcessStepList?ProId=' + procId;
    },

    model: Hktdc.Models.Step
  });
})();
