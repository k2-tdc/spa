/* global Hktdc, Backbone, JST, $, _ */

Hktdc.Views = Hktdc.Views || {};

(function() {
  'use strict';

  Hktdc.Views.Menu = Backbone.View.extend({

    template: JST['app/scripts/templates/menu.ejs'],


    // getLinkMap: function() {
    //   return {
    //     'NEW_REQUEST': Hktdc.Config.projectPath + '/#new_request',
    //     'DRAFT_LIST': Hktdc.Config.projectPath + '/#draft',
    //     'ALL_TASKS': Hktdc.Config.projectPath + '/#',
    //     'APPROVAL_TASKS': Hktdc.Config.projectPath + '/#',
    //     'CHECK_STATUS': Hktdc.Config.projectPath + '/#check_status',
    //     'USAGE_REPORT': Hktdc.Config.projectPath + '/#usage_report',
    //     'QUICK_USER_GUIDE': Hktdc.Config.projectPath + '/#'
    //   };
    // },

    initialize: function() {
      console.debug('Initiating side menu');
      this.render();
      // var this.model = new this.Models['Menu']();
      // this.listenTo(this.model, 'change', this.render);
      // console.log(JSON.stringify(this.model, null, 2));

      this.model.on('change:activeTab', this.setActiveMenu.bind(this));
    },

    setActiveMenu: function(currentRoute, route) {
      // console.log(currentRoute.toJSON().activeTab);
      // console.log(this.model.toJSON().activeTab);
      var routeMap = {
        ALL: 'ALLTASK',
        APPROVAL: 'APPROVALTASK',
        DRAFT: 'DRAFT',
        CHECK: 'HOME'
      };

      try {
        // var routename = currentRoute.toJSON().activeTab;
        // console.log(route.split('/')[1].toUpperCase());
        var routeName = (route.indexOf('request/') >= 0) ? routeMap[route.split('/')[1].toUpperCase()] : route.toUpperCase();
        var routeBase = routeName.split('?')[0] || 'HOME';
        // console.log('routeName', routeName);
        // console.log('routeBase', routeBase);
        setTimeout(function() {
          // console.log($('li[routename="' + routeBase + '"]'));
          if ($('li[routename="' + routeBase + '"]')) {
            $('nav#menu').data('mmenu').setSelected($('li[routename="' + routeBase + '"]'));
          }
        });
      } catch (e) {
        // TODO: pop the error box
        console.log(e);
      }
    },

    render: function() {
      // console.log(this.model.toJSON());
      var rawMenu = this.model.toJSON();
      var menu = rawMenu.Menu;
      // var self = this;
      /* add PList and User into menu for mobile version */
      var PListMenu = {
        Mlink: '#',
        Name: 'PROCESS LIST',
        Route: '/#',
        RouteName: 'Process List',
        Scount: null,
        onlyMobileAndTablet: true,
        sumenu: _.map(rawMenu.PList, function(Process) {
          return {
            Mlink: '#',
            Name: Process.ProcessDisplayName,
            onlyMobileAndTablet: true,
            Route: '/#',
            Scount: null,
            RouteName: Process.ProcessName
          };
        })
      };
      // console.log('logouturl: ', Hktdc.Config.logoutURL);
      var UserMenu = {
        Mlink: '#',
        Name: rawMenu.User.UserName,
        Route: '/#',
        RouteName: rawMenu.User.UserID,
        Scount: null,
        onlyMobileAndTablet: true,
        sumenu: [{
          Mlink: '#delegation',
          Name: 'Delegation (under construct)',
          onlyMobileAndTablet: true,
          Route: '/#delegation',
          // Route: '/#',
          Scount: null,
          RouteName: 'delegation'
        }, {
          Mlink: '#logout',
          onlyMobileAndTablet: true,
          Name: 'Logout',
          Route: '/#logout',
          Scount: null,
          RouteName: 'logout'
        }]
      };
      menu.push(UserMenu);
      // menu.push(PListMenu, UserMenu);
      // console.log(menu);
      /* map the name, the server should return the route later */
      _.each(menu, function(raw) {
        if (raw.sumenu) {
          _.each(raw.sumenu, function(subMenuRaw) {
            var upperLodash = subMenuRaw.Mlink.trim().toUpperCase().replace('#', '');
            // var upperLodash = subMenuRaw.Name.trim().toUpperCase().replace(' ', '_');
            // console.log(upperLodash);
            subMenuRaw.Route = Hktdc.Config.projectPath + subMenuRaw.Mlink || '/#';
            subMenuRaw.RouteName = upperLodash || 'HOME';
          });
        } else {
          var upperLodash = raw.Mlink.trim().toUpperCase().replace('#', '');
          // var upperLodash = raw.Name.trim().toUpperCase().replace(' ', '_');
          raw.Route = Hktdc.Config.projectPath + raw.Mlink || '/#';
          raw.RouteName = upperLodash || 'HOME';
        }
        // console.log(upperLodash);
        // raw.Route = Hktdc.Config.projectPath + raw.Mlink || '/#';
        // raw.RouteName = upperLodash || 'HOME';
      });

      // console.log(menu);

      this.$el.html(this.template({
        data: menu
      }));

      $('nav#menu').mmenu({
        // options
        slidingSubmenus: false
        // offCanvas: false
      });
      // console.log($('nav#menu'));
      if ($(window).width() <= 991) {
      // if ($(window).width() <= 767) {
        $('nav#menu').data('mmenu').close();
      } else {
        $('nav#menu').data('mmenu').open();
      }

      // console.log('rendered menu.js');
    }

  });
})();
