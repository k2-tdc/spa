/*global Hktdc, Backbone*/

Hktdc.Collections = Hktdc.Collections || {};

(function () {
  'use strict';

  Hktdc.Collections.ToUser = Backbone.Collection.extend({

    model: Hktdc.Models.Employee

  });

})();
