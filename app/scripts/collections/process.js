/*global Hktdc, Backbone*/

Hktdc.Collections = Hktdc.Collections || {};

(function () {
  'use strict';

  Hktdc.Collections.Process = Backbone.Collection.extend({

    model: Hktdc.Models.Process

  });

})();