/*global Hktdc, Backbone*/

Hktdc.Collections = Hktdc.Collections || {};

(function() {
  'use strict';

  Hktdc.Collections.WorkflowLog = Backbone.Collection.extend({

    model: Hktdc.Models.WorkflowLog

  });

})();
