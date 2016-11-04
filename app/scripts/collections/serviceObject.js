/*global Hktdc, Backbone*/

Hktdc.Collections = Hktdc.Collections || {};

(function() {
  'use strict';

  Hktdc.Collections.ServiceObject = Backbone.Collection.extend({

    model: Hktdc.Models.ServiceObject

  });

})();
