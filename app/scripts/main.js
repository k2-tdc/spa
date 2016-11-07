
window.Hktdc = {
  Models: {},
  Collections: {},
  Views: {},
  Routers: {},
  Dispatcher: window._.extend({}, window.Backbone.Events),
  Config: {
    apiURL: false,
    accessToken: '',
    refreshToken: '',
    OAuthLoginUrl: '',
    OAuthGetTokenUrl: '',
    needAuthHeader: false,
    projectPath: '',
    SPAHomeUrl: '',
    userID: '',
    userName: '',
    RuleCode: 'IT0008;IT0009',
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
          base: '/workflowdev/api/request'
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

  init: function(env) {
    'use strict';
    console.debug('[ main.js ] - Initiating HKTDC Workflow Applicaiton...');
    var utils = window.utils;
    var Backbone = window.Backbone;
    var Hktdc = window.Hktdc;
    Hktdc.Config.environment = env;
    try {
      var self = this;
      utils.setURL(env);

      // if (true) {
      if (env === 'uat') {
        /* check auth */
        utils.getAccessToken(function(accessToken) {
          console.debug('[ main.js ] - setting up application...');
          /* if auth ed */
          Hktdc.Config.accessToken = accessToken;
          /* get user id by access token */
          utils.getLoginUserIdByToken(accessToken, function(userID) {
            /* initialize the application */
            Hktdc.Config.userID = userID;

            /* done user profile config */
            self.setupMasterPageComponent(function() {
              var mainRouter = new self.Routers.Main();
              Backbone.history.start();
            });
          }, function(error) {
            console.log('Error on getting userID', error);
          });
        }, function(error) {
          /* else */
          console.log('OAuth Error', error);
        });
      } else {
        Hktdc.Config.userID = 'aachen';
        // userName set in menu
        // Hktdc.Config.userName = 'Aaron Chen (ITS - Testing account)';
        self.setupMasterPageComponent(function() {
          var mainRouter = new self.Routers.Main();
          Backbone.history.start();
        });
      }
    } catch (e) {
      console.log(e);
      console.log('init application error!', e);
    }
  },

  setupMasterPageComponent: function(onSuccess) {
    var Hktdc = window.Hktdc;
    var utils = window.utils;
    var headerView = new Hktdc.Views.Header();

    var menuMModel = new Hktdc.Models.Menu();

    menuMModel.fetch({
      beforeSend: utils.setAuthHeader,
      success: function(menuModel) {
        var menu = menuModel.toJSON();
        Hktdc.Config.userName = menu.UserName;
        // console.log('menu.UserName', menu.UserName);
        menuMModel.set({
          Menu: menu.Menu
        });

        //  = new Hktdc.Models.Menu({
        // });
        var menuView = new Hktdc.Views.Menu({
          model: menuMModel
        });
        var userView = new Hktdc.Views.User({
          model: new Hktdc.Models.User({
            UserName: menu.UserName,
            UserID: menu.UserID
          })
        });
        menuMModel.set('activeTab', window.Backbone.history.getHash());
        onSuccess();
      },
      error: function() {
        console.log('error on rendering menu');
      }
    });
  }
};

$(document).ready(function() {
  'use strict';
  // Hktdc.init('dev');
  // window.Hktdc.init('uat');
  window.Hktdc.init('localDev');
});
