/* global Hktdc, Backbone */

Hktdc.Models = Hktdc.Models || {};

(function() {
  'use strict';

  Hktdc.Models.SendAttachment = Backbone.Model.extend({
    idAttribute: 'name',
    url: function(refId) {
      // return Hktdc.Config.apiURL + '/SubmitFile?refid=' + refId + '&filename=' + filename;
      return Hktdc.Config.apiURL + '/admin/attachments?refid=' + refId + '&process=CHSW';
    }
  });
})();
