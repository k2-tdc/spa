/*global Hktdc, Backbone*/

Hktdc.Collections = Hktdc.Collections || {};

(function () {
  'use strict';

  Hktdc.Collections.SelectedCC = Backbone.Collection.extend({

    model: Hktdc.Models.CC

  });

})();
