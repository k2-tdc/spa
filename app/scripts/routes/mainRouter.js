/*global Hktdc, Backbone*/

Hktdc.Routers = Hktdc.Routers || {};

(function () {
  'use strict';

  Hktdc.Routers.Main = Backbone.Router.extend({
    routes: {
      '': 'statusList',
      '/checkStatus': 'statusList',
      '/checkStatus/:statusId': 'statusDetail',
      '/newRequest': 'newRequest'
    },
    initialize: function() {
      console.log('main router initialized');
    },
    statusList: function() {
      console.log('statusList route handler');
    },
    checkStatus: function() {
      console.log('checkStatus route handler');
      // if (!Hktdc.Views.StatusListView) {
      //   Hktdc.Views.StatusListView = new StatusListView();
      // }

    },
    statusDetail: function() {},
    newRequest: function() {}
  });

})();
