/* global Hktdc, Backbone, JST, $, _ */

Hktdc.Views = Hktdc.Views || {};

(function() {
  'use strict';

  Hktdc.Views.User = Backbone.View.extend({

    template: JST['app/scripts/templates/user.ejs'],

    el: '#user-profile-menu',

    initialize: function() {
      // console.log(this.model);
      // this.listenTo(this.model, 'change', this.render);
      this.render();
    },

    render: function() {
      this.$el.html(this.template({
        user: this.model.toJSON()
      }));
    }

  });

})();
