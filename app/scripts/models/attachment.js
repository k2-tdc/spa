/* global Hktdc, Backbone */

Hktdc.Models = Hktdc.Models || {};

(function() {
  'use strict';

  Hktdc.Models.Attachment = Backbone.Model.extend({

    idAttribute: 'id',

    initialize: function() {},

    defaults: {
      // new add:
      file: null,

      // existing
      AttachmentGUID: '',
      FileName: '',
      FormID: '',
      UploadedByDeptName: '',
      UploadedByEmployeeID: '',
      UploadedByFullName: '',
      UploadedByUserID: '',
      UploadedDate: '',
	  id:''
    },

    validate: function(attrs, options) {},

    parse: function(response, options) {
      return response;
    }
  });

})();
