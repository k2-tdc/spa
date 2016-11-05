/*global Hktdc, Backbone*/

Hktdc.Models = Hktdc.Models || {};

(function() {
  'use strict';

  Hktdc.Models.SendAttachment = Backbone.Model.extend({
    idAttribute: 'name',
    url: function(refId, filename) {
      return 'SubmitFile?refid=' + refId + '&filename=' + filename
    }

  });

})();
