/*global Hktdc, Backbone*/

Hktdc.Models = Hktdc.Models || {};

(function () {
  'use strict';

  Hktdc.Models.DeleteFile = Backbone.Model.extend({
    url: function(guid) {
      return Hktdc.Config.apiURL + '/attachments/?process=CHSW&guid=' + guid;
    }
  });
})();
