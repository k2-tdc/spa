/* global Hktdc, Backbone, JST, _ */

Hktdc.Views = Hktdc.Views || {};

(function() {
  'use strict';

  Hktdc.Views.SubheaderMenu = Backbone.View.extend({

    template: JST['app/scripts/templates/subheaderMenu.ejs'],

    tagName: 'li',

    events: {},

    initialize: function() {
      // this.listenTo(this.model, 'change', this.render);
    },

    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
    }

  });


  Hktdc.Views.SubheaderMenuList = Backbone.View.extend({

    template: JST['app/scripts/templates/subheaderMenuList.ejs'],

    tagName: 'div',

    // className: 'dropdown-menu',

    initialize: function(props) {
      _.extend(this, props);
      // _.bindAll()
      // this.listenTo(this.model, 'change', this.render);
    },

    render: function() {
      // console.log(this.currentPageName);
      // console.log(this.template({title: this.currentPageName}));
      this.$el.html(this.template({title: this.currentPageName}));
    }

  });
})();
