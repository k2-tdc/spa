/*global Hktdc, Backbone*/

Hktdc.Models = Hktdc.Models || {};

(function () {
  'use strict';

  Hktdc.Models.DeleteFile = Backbone.Model.extend({
    url: function() {
      return Hktdc.Config.apiURL + '/DeleteFile';
    }
  });
})();
