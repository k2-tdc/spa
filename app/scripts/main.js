/* global Hktdc, Backbone, utils, _, $, Q, NProgress */

window.Hktdc = {
  Models: {},
  Collections: {},
  Views: {},
  Routers: {},
  Dispatcher: _.extend({}, Backbone.Events),
  Config: {
    procId: 1,
    isAppWebView: false,
    apiURL: false,
    refreshTokenInterval: 2,  // in minutes
    gettingToken: false,
    accessToken: '',
    refreshToken: '',
    OAuthLoginUrl: '',
    OAuthGetTokenUrl: '',
    logoutURL: '',
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
        logoutURL: 'https://corpsso.tdc.org.hk/adfs/ls/?wa=wsignout1.0',
        // needAuthHeader: true,
        projectPath: '/',
        SPAHomePath: '/'
      },
      // REAL UAT VM - dev test
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
        logoutURL: 'https://corpsso.tdc.org.hk/adfs/ls/?wa=wsignout1.0',
        OAuthLoginPath: '/workflow/oauth2/login',
        OAuthGetTokenPath: '/workflow/oauth2/token',
        OAuthGetUserIDPath: '/workflow/oauth2/tokeninfo'
      },

      // REAL UAT VM - uat test
      chsw: {
        api: {
          protocol: 'https',
          host: 'api.uat.hktdc.org',
          base: '/workflow/api/request'
        },
        needAuthHeader: true,
        projectPath: '/chsw/',
        SPAHomePath: '/chsw/',
        SPADomain: 'https://workflowuat.tdc.org.hk',
        logoutURL: 'https://corpsso.tdc.org.hk/adfs/ls/?wa=wsignout1.0',
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
    var Hktdc = window.Hktdc;
    Hktdc.Config.environment = env;
    try {
      var self = this;
      utils.setURL(env);
      NProgress.configure({
        parent: '#page',
        showSpinner: false
      });

      // if (true) {
      if (env === 'uat' || env === 'chsw') {
        // TODO: prevent user make request when getting token
        $(document).ajaxStart(function(event) {
          // console.log(event);
          NProgress.start();
        });
        $(document).ajaxComplete(function() {
          NProgress.done();
          // NProgress.remove();
        });

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
            self.setupMasterPageComponent(function(menuModel) {
              var mainRouter = new self.Routers.Main();
              mainRouter.on('route', function(route, params) {
                // console.log(route);
                menuModel.set('activeTab', Backbone.history.getHash());
              });
              Backbone.history.start();
            });

            /* to prevent token expiry when using the SPA */
            setInterval(function() {
              Hktdc.Config.gettingToken = true;
              utils.getAccessToken(function(accessToken) {
                Hktdc.Config.gettingToken = false;
                Hktdc.Config.accessToken = accessToken;
                console.log('refreshed the access token: ', accessToken);
              });
            }, 1000 * 60 * Hktdc.Config.refreshTokenInterval);
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
        self.setupMasterPageComponent(function(menuModel) {
          var mainRouter = new self.Routers.Main();
          mainRouter.on('route', function(route, params) {
            menuModel.set('activeTab', Backbone.history.getHash());
          });

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
    var self = this;
    var headerModel = new Hktdc.Models.Header();
    var footerModel = new Hktdc.Models.Footer();

    // TODO: webview custom user-agent
    Hktdc.Config.isAppWebView = utils.getParameterByName('intraapp') && utils.getParameterByName('intraapp') === 'yes';
    // Hktdc.Config.isAppWebView = true;
    // Hktdc.Config.isAppWebView = false;

    var headerView = new Hktdc.Views.Header({
      model: headerModel
    });
    var footerView = new Hktdc.Views.Footer({
      model: footerModel
    });

    if (Hktdc.Config.isAppWebView) {
      // process switch
      $('#header_main .nav-header-main').addClass('app-web-view');

      // web view show current page
      $('#header_main .subheader-menu-container').addClass('app-web-view');

      // tdc logo
      $('#header').addClass('app-web-view');

      // content subheader
      $('#content').addClass('app-web-view');
    }

    this.initAlertDialog();
    this.initConfirmDialog();

    this.loadMenu()
      .then(function(menuModel) {
        var menu = menuModel.toJSON();
        Hktdc.Config.userName = menu.UserName;
        Hktdc.Config.employeeID = menu.EmployeeNo;
        menuModel.set({
          Menu: menu.Menu,
          PList: menu.PList,
          User: { UserName: menu.UserName, UserID: menu.UserID }
        });

        var menuView = new Hktdc.Views.Menu({
          model: menuModel
        });

        $('#menu').html(menuView.el);
        menuView.listenTo(window.Hktdc.Dispatcher, 'reloadMenu', function() {
          self.loadMenu()
            .then(function(newMenuModel) {
              var newMenu = newMenuModel.toJSON();
              newMenuModel.set({
                Menu: newMenu.Menu,
                PList: newMenu.PList,
                User: { UserName: newMenu.UserName, UserID: newMenu.UserID }
              });
              var menuView = new Hktdc.Views.Menu({
                model: newMenuModel
              });
              newMenuModel.set('activeTab', Backbone.history.getHash());
              $('#menu').html(menuView.el);
            });
        });
        // console.log(Hktdc.Config.environments[Hktdc.Config.environment].SPAHomePath);
        var userView = new Hktdc.Views.User({
          model: new Hktdc.Models.User({
            UserName: menu.UserName,
            UserID: menu.UserID,
            HomePath: Hktdc.Config.environments[Hktdc.Config.environment].SPAHomePath
          })
        });

        headerModel.set({
          processList: menuModel.toJSON().PList
        });

        onSuccess(menuModel);
      });
  },

  loadMenu: function() {
    var deferred = Q.defer();
    var menuModel = new Hktdc.Models.Menu();
    menuModel.fetch({
      beforeSend: utils.setAuthHeader,
      success: function(menuModel) {
        // menuModel.set('activeTab', Backbone.history.getHash());
        // onSuccess(menuModel);
        deferred.resolve(menuModel);
      },
      error: function(error) {
        console.log('error on rendering menu');
        deferred.reject(error);
      }
    });
    return deferred.promise;
  },

  initAlertDialog: function() {
    var alertDialogView = new Hktdc.Views.AlertDialog({
      model: new Hktdc.Models.AlertDialog()
    });

    $('body').append(alertDialogView);

    alertDialogView.listenTo(window.Hktdc.Dispatcher, 'openAlert', function(data) {
      alertDialogView.model.set({
        message: data.message,
        title: data.title,
        type: data.type,
        open: true
      });
    });
  },

  initConfirmDialog: function() {
    var confirmDialogView = new Hktdc.Views.ConfirmDialog({
      model: new Hktdc.Models.ConfirmDialog()
    });

    $('body').append(confirmDialogView);

    confirmDialogView.listenTo(window.Hktdc.Dispatcher, 'openConfirm', function(data) {
      confirmDialogView.model.set({
        message: data.message,
        title: data.title,
        onConfirm: data.onConfirm,
        open: true
      });
    });
    confirmDialogView.listenTo(window.Hktdc.Dispatcher, 'closeConfirm', function(data) {
      confirmDialogView.model.set({
        open: false
      });
    });
    confirmDialogView.listenTo(window.Hktdc.Dispatcher, 'toggleLockButton', function(isLock) {
      confirmDialogView.model.set({
        lockConfirmBtn: isLock
      });
    });
  }
};

$(document).ready(function() {
  'use strict';
  Hktdc.init('localDev');
  // Hktdc.init('uat');
  // Hktdc.init('chsw');
});
