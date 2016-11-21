/* global Hktdc, Backbone */

Hktdc.Models = Hktdc.Models || {};

(function() {
  'use strict';

  Hktdc.Models.FileRule = Backbone.Model.extend({

    url: function() {
      return Hktdc.Config.apiURL + '/GetFileType?UserId=' + Hktdc.Config.userID;
    }

  });
})();
