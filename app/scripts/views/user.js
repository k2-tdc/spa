/* global Hktdc, Backbone, JST, $, _ */

Hktdc.Views = Hktdc.Views || {};

(function() {
  'use strict';

  Hktdc.Views.User = Backbone.View.extend({

    template: JST['app/scripts/templates/user.ejs'],

    el: '#user-profile-menu',

    events: {
      'click #logout': 'goToLogout'
    },

    goToLogout: function() {
      Backbone.history.navigate('logout', {trigger: true});
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
