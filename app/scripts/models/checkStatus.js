/*global Hktdc, Backbone*/

Hktdc.Models = Hktdc.Models || {};

(function() {
  'use strict';

  Hktdc.Models.CheckStatus = Backbone.Model.extend({

    initialize: function() {
      // url: function() { return '' + Config.DomainName + '/api/request/GetRequestDetails?CStat=' + $("#ddindexstatus").val() + '&ReferID=' + $('#txtindexrefid').val() + '&FDate=' + $('#txtIndexfromdate').val() + '&TDate=' + $('#txtIndextodate').val() + '&Appl=' + $('#ddIndexapplicant').val() + '&UserId=' + Userid; },
      // this.defaults.filters.UserId = 'Hktdc.Config.userID';
    },

    defaults: {
      canChooseStatus: true,
      searchUserType: '',

      CStat: '',
      ReferID: '',
      FDate: '',
      TDate: '',
      Appl: '',
      UserId: '',
      SUser: '',
      // for detail
      ProsIncId: ''
    },

    validate: function(attrs, options) {},

    parse: function(response, options) {
      return response;
    }
  });
})();
