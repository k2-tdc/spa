/*global Hktdc, Backbone*/

Hktdc.Models = Hktdc.Models || {};

(function () {
  'use strict';

  Hktdc.Models.DeleteRequest = Backbone.Model.extend({

    url: function(refId) {
      return Hktdc.Config.apiURL + '/DeleteDraft?ReferID=' + refId;
    }
  });
})();
