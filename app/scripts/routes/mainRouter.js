/*global Hktdc, Backbone*/

Hktdc.Routers = Hktdc.Routers || {};

(function() {
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

      var menuCollection = new Hktdc.Collections.Menu();
      // var menuModel = new Hktdc.Models.Menu();

      // var user = new Hktdc.Models['User']({
      //   UserName
      // })
      // var menuView = new Hktdc.Views['Menu']();
      // menuModel.set('activeTab', '/#check_status');
      menuCollection.fetch({
        success: function(collection) {
          var menu = collection.toJSON()[0];
          var menuModel = new Hktdc.Models.Menu({
            Menu: menu.Menu
          });
          var menuView = new Hktdc.Views.Menu({
            model: menuModel
          });
          var userView = new Hktdc.Views.User({
            model: new Hktdc.Models.User({
              UserName: menu.UserName,
              UserID: menu.UserID
            })
          });
          // var appShoutcutView = new Hktdc.Views.AppShoutcut({
          //   model: new Hktdc.Models.AppShoutcut({
          //     PList: menu.PList,
          //     ActiveApp: menu.PList[0]
          //   })
          // });
          // console.log(JSON.stringify(Backbone.history.getHash(), null, 2));
          menuModel.set('activeTab', JSON.stringify(Backbone.history.getHash()));
        },
        error: function() {
          console.log('error on rendering menu');
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
        model: checkStatus
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
