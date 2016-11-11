/* global Hktdc, Backbone */

Hktdc.Collections = Hktdc.Collections || {};

(function() {
  'use strict';

  Hktdc.Collections.SelectedService = Backbone.Collection.extend({

    model: Hktdc.Models.ServiceRequest

  });
})();
