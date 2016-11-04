/* global Hktdc, Backbone, JST, $, _ */

Hktdc.Views = Hktdc.Views || {};

(function() {
  'use strict';

  Hktdc.Views.Header = Backbone.View.extend({

    template: JST['app/scripts/templates/header.ejs'],

    el : '#header',
    /*
    tagName: 'div',

    id: '',

    className: '',

    events: {},
    */

    initialize: function() {
      // this.listenTo(this.model, 'change', this.render);
      this.render();

    },

    render: function() {
      // var data = this.model.toJSON() || ;
      this.$el.html(this.template());
    }

  });

})();
