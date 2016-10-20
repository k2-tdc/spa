/*global Hktdc, Backbone, JST*/

Hktdc.Views = Hktdc.Views || {};

(function() {
  'use strict';

  Hktdc.Views.NewRequest = Backbone.View.extend({

    template: JST['app/scripts/templates/newRequest.ejs'],

    el: '#mainContent',

    initialize: function() {
      // this.listenTo(this.model, 'change', this.render);
      this.render();

      /* create service collections */
      var serviceCollections = new Hktdc.Collections.Service();

      serviceCollections.fetch({
        // headers: {
        //   "Authorization": 'Bearer ' + Hktdc.Config.accessToken
        // },
        success: function() {
          try {
            console.debug('[views/newRequest.js] - onLoadData');
            serviceCollections.each(function(serviceModel, idx){
              var serviceView = new Hktdc.Views.Service({model: serviceModel});
              console.log(serviceView.el);
              $('#divservice').append(serviceView.el);

            });

          } catch (e) {
            console.error('error on rendering service level1', e);
          }
        },
        error: function(model, response) {
          console.error(JSON.stringify(response, null, 2));
        }
      });
    },

    render: function() {
      this.$el.html(this.template());
    }

  });

})();
