/*global Hktdc, Backbone, JST*/

Hktdc.Views = Hktdc.Views || {};

(function () {
  'use strict';

  Hktdc.Views.Logout = Backbone.View.extend({
    template: JST['app/scripts/templates/logout.ejs'],

    initialize: function () {
      Cookies.remove('ACCESS-TOKEN');
      Cookies.remove('REFRESH-TOKEN');
      window.location.href = window.Hktdc.Config.logoutURL;
    }
  });

})();
