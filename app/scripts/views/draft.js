/*global Hktdc, Backbone, JST*/

Hktdc.Views = Hktdc.Views || {};

(function () {
  'use strict';

  Hktdc.Views.Draft = Backbone.View.extend({

    el: '#mainContent',

    template: JST['app/scripts/templates/draft.ejs'],

    initialize: function () {
      // this.listenTo(this.model, 'change', this.render);
      this.render();
    },

    render: function () {
      this.$el.html(this.template());
      // this.$el.html(this.template(this.model.toJSON()));
    }

  });

})();
