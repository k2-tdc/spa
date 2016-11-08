/*global Hktdc, Backbone*/

Hktdc.Models = Hktdc.Models || {};

(function() {
  'use strict';

  Hktdc.Models.ServiceRequest = Backbone.Model.extend({
    idAttribute: 'GUID',
    defaults: {
      selectedServiceObject: true
    }
  });

})();
