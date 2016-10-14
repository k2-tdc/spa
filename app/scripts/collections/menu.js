/*global Hktdc, Backbone*/

Hktdc.Collections = Hktdc.Collections || {};

(function () {
  'use strict';

  Hktdc.Collections.Menu = Backbone.Collection.extend({

    model: Hktdc.Models.Menu

  });

})();
