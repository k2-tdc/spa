/*global Hktdc, Backbone, JST*/

Hktdc.Views = Hktdc.Views || {};

(function() {
  'use strict';

  Hktdc.Views.NewRequest = Backbone.View.extend({

    template: JST['app/scripts/templates/newRequest.ejs'],

    el: '#mainContent',

    initialize: function() {
      // this.listenTo(this.model, 'change', this.render);
      var self = this;
      this.render();

      /* create service collections */
      var serviceCatagoryCollections = new Hktdc.Collections.ServiceCatagory();
      serviceCatagoryCollections.fetch({
        // headers: {
        //   "Authorization": 'Bearer ' + Hktdc.Config.accessToken
        // },
        success: function() {
          try {
            console.debug('[views/newRequest.js] - onLoadData');
            var serviceCatagoryListView = new Hktdc.Views.ServiceCatagoryList({
              collection: serviceCatagoryCollections,
            });
            serviceCatagoryListView.render();
            $('#service-container').html(serviceCatagoryListView.el);

          } catch (e) {
            console.error('error on rendering service level1::', e);
          }
        },

        error: function(model, response) {
          console.error(JSON.stringify(response, null, 2));
        }
      });


      /* common component */
      // $('.divApplicant', this.el).append(new Hktdc.Views.ApplicantList().el);

    },

    render: function() {
      this.$el.html(this.template());
    }

  });

})();
