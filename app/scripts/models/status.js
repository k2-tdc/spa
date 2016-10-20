/*global Hktdc, Backbone*/

Hktdc.Models = Hktdc.Models || {};

(function () {
  'use strict';

  Hktdc.Models.Status = Backbone.Model.extend({
    idAttribute: 'id',

    url: function() {
      return Hktdc.Config.apiURL + '/GetStatus'
    },

    initialize: function() {
      // console.log('init sttus coll');
      var that = this;
      this.fetch({
        // headers: {
        //   "Authorization": 'Bearer ' + accessToken
        // },
        success: function() {
          // console.log('suee');
          that.renderStatusView();
        },
        error: function(model, response) {
          console.error(response);
          // alert(JSON.stringify(response.responseJSON.Message));
        }
      });

      // this.on("reset", this.loadStatusindex, this);
    },

    loadStatusindex: function() {
      this.renderStatusView();
    },

    renderStatusView: function() {
      console.log('ren status view in colle');
      var statusView = new Hktdc.Views.Status({ model: this });
      statusView.render();

    }

  });

})();
