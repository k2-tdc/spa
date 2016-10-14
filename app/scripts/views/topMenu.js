/*global Hktdc, Backbone, JST*/

Hktdc.Views = Hktdc.Views || {};

(function () {
  'use strict';

  Hktdc.Views.TopMenu = Backbone.View.extend({

    template: JST['app/scripts/templates/topMenu.ejs'],

    el : '#header_top',
    /*
    tagName: 'div',

    id: '',

    className: '',

    events: {},
    */

    initialize: function () {
      // this.listenTo(this.model, 'change', this.render);
      this.render();
    },

    render: function () {
      // var data = this.model.toJSON() || ;
      this.$el.html(this.template());
    }

  });

})();
