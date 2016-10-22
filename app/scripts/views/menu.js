/*global Hktdc, Backbone, JST*/

Hktdc.Views = Hktdc.Views || {};

(function () {
  'use strict';

  Hktdc.Views.Menu = Backbone.View.extend({

    template: JST['app/scripts/templates/menu.ejs'],

    el : '#menu',

    linkMap: {
      'NEW_REQUEST': '/#new_request',
      'DRAFT_LIST': '/#draft',
      'ALL_TASKS': '/#',
      'APPROVAL_TASKS': '/#',
      'CHECK_STATUS': '/#check_status',
      'USAGE_REPORT': '/#',
      'QUICK_USER_GUIDE': '/#'
    },

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
      console.log(this.model);
      var rawMenu = this.model.toJSON();
      var menu = (_.isArray(rawMenu)) ? rawMenu[0].Menu : rawMenu.Menu;
      console.log(menu);
      var self = this;
      /* map the name, the server should return the route later */
      _.each(menu, function(raw){
        if (raw.sumenu) {
          _.each(raw.sumenu, function(subMenuRaw){
            var upperLodash = subMenuRaw.Name.trim().toUpperCase().replace(' ','_');
            // console.log(upperLodash);
            subMenuRaw.Route = self.linkMap[upperLodash] || '#';
            subMenuRaw.RouteName = upperLodash || 'HOME';
          });
        } else {
          var upperLodash = raw.Name.trim().toUpperCase().replace(' ','_');
          raw.Route = self.linkMap[upperLodash] || '#';
          raw.RouteName = upperLodash || 'HOME';

        }
        // console.log(upperLodash);
        raw.Route = self.linkMap[upperLodash] || '#';
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
