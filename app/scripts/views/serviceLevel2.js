/*global Hktdc, Backbone, JST*/

Hktdc.Views = Hktdc.Views || {};

(function () {
  'use strict';

  Hktdc.Views.ServiceLevel2 = Backbone.View.extend({

    template: JST['app/scripts/templates/serviceLevel2.ejs'],

    el: '.group-details',

    events: {},

    initialize: function () {
      /* 1) render level 2 service */
      this.render();
      // this.listenTo(this.model, 'change', this.render);
      /* 2) initialize level 3 service */
      var level3Collection = new Hktdc.Collection.ServiceLevel3(this.model.Level3);
      try {
        // TODO: clear the container first?
        level3Collection.each(function(level3Model) {
          var level3View = new Hktdc.Views.ServiceLevel3({
            model: level3Model
          });
        });
      } catch (e) {
        // TODO: pop up alert dialog
        console.error('render level 3 error');
      }

    },

    render: function () {
      this.$el.append(this.template({
        data: this.model.toJSON()
      }));
    }

  });

})();
