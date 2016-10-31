/*global Hktdc, Backbone, JST*/

Hktdc.Views = Hktdc.Views || {};

(function () {
  'use strict';

  Hktdc.Views.Menu = Backbone.View.extend({

    template: JST['app/scripts/templates/menu.ejs'],

    el : '#menu',

    // getLinkMap: function () {
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

    initialize: function () {
      console.debug('Initiating side menu');
      this.render();
      // var this.model = new this.Models['Menu']();
      // this.listenTo(this.model, 'change', this.render);
      // console.log(JSON.stringify(this.model, null, 2));

      this.model.on('change:activeTab', this.setActiveMenu.bind(this));

    },


    render: function () {
      // console.log(this.model.toJSON());
      var rawMenu = this.model.toJSON();
      var menu = (_.isArray(rawMenu)) ? rawMenu[0].Menu : rawMenu.Menu;
      var self = this;
      /* map the name, the server should return the route later */
      _.each(menu, function(raw){
        if (raw.sumenu) {
          _.each(raw.sumenu, function(subMenuRaw){
            var upperLodash = subMenuRaw.Name.trim().toUpperCase().replace(' ', '_');
            // console.log(upperLodash);
            subMenuRaw.Route = Hktdc.Config.projectPath + subMenuRaw.Mlink || '/#';
            subMenuRaw.RouteName = upperLodash || 'HOME';
          });
        } else {
          var upperLodash = raw.Name.trim().toUpperCase().replace(' ', '_');
          raw.Route = Hktdc.Config.projectPath + raw.Mlink || '/#';
          raw.RouteName = upperLodash || 'HOME';
        }
        // console.log(upperLodash);
        raw.Route = Hktdc.Config.projectPath + raw.Mlink || '/#';
        raw.RouteName = upperLodash || 'HOME';
      });

      // console.log(JSON.stringify(menu, null, 2));
      this.$el.html(this.template({
        data: menu
      }));

      $('nav#menu').mmenu({
        // options
        "slidingSubmenus": false,
         //offCanvas: false
      });
      // console.log($('nav#menu'));
      $('nav#menu').data("mmenu").open();
      // console.log('rendered menu.js');
    },

    setActiveMenu: function(currentRoute) {

      try {
        var routename = this.model.toJSON().activeTab.toUpperCase();
        $('nav#menu').data("mmenu").setSelected($('li[routename='+routename+']'));
      } catch (e) {
        // TODO: pop the error box

      }
      // console.log(Backbone.history.getFragment());
    }

  });

})();
