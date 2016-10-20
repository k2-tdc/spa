/*global Hktdc, Backbone, JST*/

Hktdc.Views = Hktdc.Views || {};

(function () {
  'use strict';

  Hktdc.Views.ServiceLevel3 = Backbone.View.extend({

    template: JST['app/scripts/templates/serviceLevel3.ejs'],



    events: {},

    initialize: function () {
      // this.listenTo(this.model, 'change', this.render);
      this.render();

    },

    render: function () {
      this.$el.html(this.template(this.collection.models.toJSON()));
    }

  });

})();
