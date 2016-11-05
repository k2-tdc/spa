/*global Hktdc, Backbone*/

Hktdc.Collections = Hktdc.Collections || {};

(function() {
  'use strict';

  Hktdc.Collections.SelectedAttachment = Backbone.Collection.extend({

    model: Hktdc.Models.Attachment

  });
})();
