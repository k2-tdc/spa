/* global Hktdc, Backbone */

Hktdc.Models = Hktdc.Models || {};

(function() {
  'use strict';

  Hktdc.Models.Status = Backbone.Model.extend({
    idAttribute: 'id',

    initialize: function() {},

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
