/*global Hktdc, Backbone, JST*/

Hktdc.Views = Hktdc.Views || {};

(function () {
  'use strict';

  Hktdc.Views.SideMenu = Backbone.View.extend({

    template: JST['app/scripts/templates/sideMenu.ejs'],

    el : '#menu',

    /*
    tagName: 'div',

    id: '',

    className: '',

    events: {},
    */

    initialize: function () {
      // this.listenTo(this.model, 'change', this.render);
    },

    render: function () {
      this.$el.html(this.template(this.model.toJSON()));
      $('nav#menu').mmenu({
        // options
        "slidingSubmenus": false,
         //offCanvas: false
      });
    }

  });

})();
