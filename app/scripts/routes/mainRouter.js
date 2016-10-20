/*global Hktdc, Backbone*/

Hktdc.Routers = Hktdc.Routers || {};

(function () {
  'use strict';

  Hktdc.Routers.Main = Backbone.Router.extend({
    routes: {
      '': 'checkStatus',
      'check_status': 'checkStatus',
      'check_status/:statusId': 'statusDetail',
      'new_request': 'newRequest',
      'draft': 'draft',

    },

    initialize: function() {
      /* Set up the Views */
      console.debug('[ routes/mainRouter.js ] - Initizing Router...');
      var headerView = new Hktdc.Views.Header();
      var self = this;
      var menuModel = new Hktdc.Models.Menu();
      // var user = new Hktdc.Models['User']({
      //   UserName
      // })
      // var menuView = new Hktdc.Views['Menu']();
      // menuModel.set('activeTab', '/#check_status');
      menuModel.fetch({
        success: function(Model) {
          var jsonModel = Model.toJSON();
          var menuView = new Hktdc.Views.Menu({
            model: menuModel
          });
          var userView = new Hktdc.Views.User({
            model: new Hktdc.Models.User({
              UserName: jsonModel.UserName,
              UserID: jsonModel.UserID
            })
          });
          var appShoutcutView = new Hktdc.Views.AppShoutcut({
            model: new Hktdc.Models.AppShoutcut({
              PList: jsonModel.PList,
              ActiveApp: jsonModel.PList[0]
            })
          });
          // console.log(JSON.stringify(Backbone.history.getHash(), null, 2));
          menuModel.set('activeTab', JSON.stringify(Backbone.history.getHash()));
        }
      });
    },

    checkStatus: function() {
      console.debug('[ routes/mainRouter.js ] - checkStatus route handler');
      var checkStatus = new Hktdc.Models.CheckStatus({
        UserId: Hktdc.Config.userID
      });

      // TODO: get filter params from query string
      var csView = new Hktdc.Views.CheckStatus({
        model: checkStatus.attributes
      });
    },

    newRequest: function() {
      console.debug('[ routes/mainRouter.js ] - newRequest route handler');
      var NewRequest = new Hktdc.Models.NewRequest();
      var nrView = new Hktdc.Views.NewRequest();
    },

    statusDetail: function() {
      console.debug('[ routes/mainRouter.js ] - statusList route handler');
    },

    draft: function() {
      console.debug('[ routes/mainRouter.js ] - draft route handler');
      var draftView = new Hktdc.Views.Draft();
    }

  });

})();
