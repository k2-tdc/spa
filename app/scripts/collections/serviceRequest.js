/*global Hktdc, Backbone*/

Hktdc.Collections = Hktdc.Collections || {};

(function () {
  'use strict';

  Hktdc.Collections.ServiceRequest = Backbone.Collection.extend({

    model: Hktdc.Models.ServiceRequest

  });

})();
