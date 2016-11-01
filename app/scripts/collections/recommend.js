/*global Hktdc, Backbone*/

Hktdc.Collections = Hktdc.Collections || {};

(function () {
  'use strict';

  Hktdc.Collections.Recommend = Backbone.Collection.extend({

    model: Hktdc.Models.Recommend

  });

})();
