/* global Hktdc, Backbone, JST, $, _ */

Hktdc.Views = Hktdc.Views || {};

(function() {
  'use strict';

  Hktdc.Views.User = Backbone.View.extend({

    template: JST['app/scripts/templates/user.ejs'],

    el: '#user-profile-menu',

    events: {
      'click #logout': 'doLogout'
    },

    doLogout: function() {
      // console.log(Cookies.get());
      Cookies.remove('ACCESS-TOKEN');
      Cookies.remove('REFRESH-TOKEN');
      var oauthUrl = window.Hktdc.Config.OAuthLoginUrl + '?redirect_uri=' + encodeURI(window.Hktdc.Config.SPAHomeUrl);
      window.location.href = oauthUrl;
    },

    initialize: function() {
      this.render();
    },

    render: function() {
      this.$el.html(this.template({
        user: this.model.toJSON()
      }));
    }

  });

})();
