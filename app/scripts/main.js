/*global hktdc, $*/


window.Hktdc = {
  Models: {},
  Collections: {},
  Views: {},
  Routers: {},
  Dispatcher: _.extend({}, Backbone.Events),
  Config: {
    apiURL: false,
    accessToken: '',
    refreshToken: '',
    OAuthLoginUrl: '',
    OAuthGetTokenUrl: '',
    needAuthHeader: false,
    projectPath: '',
    SPAHomeUrl: '',
    userID: "aachen",
    RuleCode: "IT0008;IT0009",
    environments: {
      // local dev VM
      dev: {
        api: {
          host: 'localhost',
          port: '84',
          base: '/api/request'
        },
        needAuthHeader: false,
        SPADomain: 'https://workflowuat.tdc.org.hk',
        OAuthLoginPath: '/workflow/oauth2/login',
        OAuthGetTokenPath: '/workflow/oauth2/token',
        OAuthGetUserIDPath: '/workflow/oauth2/tokeninfo',
        projectPath: '/',
        SPAHomePath: '/vicosysspa/'
      },
      // local host
      localDev: {
        api: {
          protocol: 'http',
          host: 'localhost',
          port: '9999',
          // host: '192.168.100.238',
          // port: '84',
          base: '/api/request'
        },
        needAuthHeader: false,
        // needAuthHeader: true,
        projectPath: '/',
        SPAHomePath: '/'
      },
      // REAL UAT VM
      uat: {
        api: {
          protocol: 'https',
          host: 'api.uat.hktdc.org',
          base: '/workflow/api/request'
        },
        needAuthHeader: true,
        projectPath: '/vicosysspa/',
        SPAHomePath: '/vicosysspa/',
        SPADomain: 'https://workflowuat.tdc.org.hk',
        OAuthLoginPath: '/workflow/oauth2/login',
        OAuthGetTokenPath: '/workflow/oauth2/token',
        OAuthGetUserIDPath: '/workflow/oauth2/tokeninfo'
      }
    }

  },

  init: function (env) {
    'use strict';
    console.debug('[ main.js ] - Initiating HKTDC Workflow Applicaiton...');
    try {
      var self = this;
      window.utils.setURL(env);

      // if (true) {
      if (env === 'uat') {
        /* check auth */
        window.utils.getAccessToken(function (accessToken) {
          console.debug('[ main.js ] - setting up application...');
          /* if auth ed */
          window.Hktdc.Config.accessToken = accessToken;
          /* get user id by access token */
          window.utils.getLoginUserIdByToken(accessToken, function(userID){
            /* initialize the application */
            window.Hktdc.Config.userID = userID;
            var mainRouter = new self.Routers.Main();
            Backbone.history.start();
          }, function (error) {
            alert('Error on getting userID');
          });

        }, function(error){
          /* else */
          alert('OAuth Error');
        });
      } else {
        var mainRouter = new self.Routers.Main();
        Backbone.history.start();
      }
    } catch (e) {
      console.log(e);
      console.log('init application error!', e);
    }
  }
};

$(document).ready(function () {
  'use strict';
  // Hktdc.init('dev');
  // Hktdc.init('uat');
  Hktdc.init('localDev');
});
