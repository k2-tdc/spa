/* global Hktdc, Backbone, Hktdc */

Hktdc.Models = Hktdc.Models || {};

(function() {
  'use strict';

  Hktdc.Models.ServiceCatagory = Backbone.Model.extend({
    idAttribute: 'GUID',
    default: {
      checked: false,
      open: false,
      selectedServiceCount: 0
    }
  });
})();
