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
    projectPath: '',
    SPAHomeUrl: '',
    userID: "aachen",
    RuleCode: "IT0008;IT0009",
    environments: {
      dev: {
        api: {
          host: 'localhost',
          port: '84',
          base: '/api/request'
        },
        projectPath: '/',
        SPADomain: 'https://workflowuat.tdc.org.hk',
        OAuthLoginPath: '/workflow/oauth2/login',
        OAuthGetTokenPath: '/workflow/oauth2/token',
        OAuthGetUserIDPath: '/workflow/oauth2/tokeninfo',
        SPAHomePath: '/vicosysspa/'
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
          protocol: 'https',
          host: 'api.uat.hktdc.org',
          base: '/workflow/api/request'
        },
        projectPath: '/vicosysspa',
        SPADomain: 'https://workflowuat.tdc.org.hk',
        OAuthLoginPath: '/workflow/oauth2/login',
        OAuthGetTokenPath: '/workflow/oauth2/token',
        OAuthGetUserIDPath: '/workflow/oauth2/tokeninfo',
        SPAHomePath: '/vicosysspa/'
      }
    }

  },

  init: function (env) {
    'use strict';
    console.debug('[ main.js ] - Initiating HKTDC Workflow Applicaiton...');
    try {
      var self = this;
      window.utils.setURL(env);

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
