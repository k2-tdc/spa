/*global hktdc, $*/


window.Hktdc = {
  Models: {},
  Collections: {},
  Views: {},
  Routers: {},
  Config: {
    apiURL: false,
    accessToken: 'testing',
    userID: "aachen",
    RuleCode: "IT0008;IT0009",
    environments: {
      dev: {
        api: {
          host: '192.168.100.238',
          port: '84',
          base: '/api/request'
        }
      },
      dev12: {
        api: {
          host: 'hktdc.api.vicosys.com.hk',
          port: '80',
          base: '/api/request'
        }
      },
      localDev: {
        api: {
          host: 'localhost',
          port: '9999',
          base: '/api/request'
        }
      },
      uat: {
        api: {
          host: 'api.uat.hktdc.org',
          port: '84',
          base: '/api/request'
        }
      }
    }
  },

  init: function (env) {
    'use strict';
    window.utils.setApiURL(env);
    console.debug('[ main.js ] - Initiating HKTDC Workflow Applicaiton...');

    /* TODO: check auth */

      /* TODO: if auth ed */

        /* TODO: then Get Menu items from remote */

        /* then initialize the application */
        console.debug('[ main.js ] - setting up application...');

        /* - Router */
        new this.Routers['Main']();
        Backbone.history.start();


      /* else */

        /* TODO: redirect to auth page */



  }
};

$(document).ready(function () {
  'use strict';
  Hktdc.init();

});
