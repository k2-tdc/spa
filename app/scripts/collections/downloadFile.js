/*global Hktdc, Backbone*/

Hktdc.Collections = Hktdc.Collections || {};

(function () {
  'use strict';

  Hktdc.Collections.DownloadFile = Backbone.Collection.extend({

    model: Hktdc.Models.DownloadFile

  });

})();
