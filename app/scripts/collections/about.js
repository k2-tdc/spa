/*global Hktdc, Backbone*/

Hktdc.Collections = Hktdc.Collections || {};

(function () {
  'use strict';

  Hktdc.Collections.About = Backbone.Collection.extend({

    model: Hktdc.Models.About

  });

})();
