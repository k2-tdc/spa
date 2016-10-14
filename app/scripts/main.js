/*global hktdc, $*/


window.Hktdc = {
  Models: {},
  Collections: {},
  Views: {},
  Routers: {},
  init: function () {
    'use strict';
    console.debug('Initiating HKTDC Workflow Applicaiton...');

    /* TODO: check auth */

      /* TODO: if auth ed */

        /* TODO: then Get Menu items from remote */

        /* then Set Menu */
        console.debug('setting up application...');

        /* - Router */
        new this.Routers['Main']();
        Backbone.history.start();

        /* - Common Views */
        new this.Views['TopMenu']();
        new this.Views['SideMenu']();

        // new this.Views['SideMenu']();

      /* else */

        /* TODO: redirect to auth page */



  }
};

$(document).ready(function () {
  'use strict';
  Hktdc.init();

});
