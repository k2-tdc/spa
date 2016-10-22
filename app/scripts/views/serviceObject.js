/*global Hktdc, Backbone, JST*/
/**
 * This file contains:
 * ServiceObjectList
 * ServiceObjectItem
 */
Hktdc.Views = Hktdc.Views || {};

(function () {
  'use strict';

  Hktdc.Views.ServiceObjectText = Backbone.View.extend({
    template: JST['app/scripts/templates/serviceObjectText.ejs'],
    tagName: 'div',
    events: {},
    initialize: function () {
      // this.listenTo(this.model, 'change', this.render);
    },
    render: function () {
      var tmpl = this.template({ serviceObject: this.model.toJSON()});
      this.$el.html(tmpl);
    }
  });


  Hktdc.Views.ServiceObjectSelect = Backbone.View.extend({
    template: JST['app/scripts/templates/serviceObjectSelect.ejs'],
    tagName: 'li',
    initialize: function () {},
    render: function () {
      var tmpl = this.template({ serviceObject: this.model.toJSON()});
      this.$el.html(tmpl);
    }
  });

  Hktdc.Views.ServiceObjectList= Backbone.View.extend({

    tagName: function(){
      var col = this.collection.toJSON();
      return (col[0] && col[0].ControlFlag == 1) ? 'ul' : 'div';
    },

    className: function (){
      var col = this.collection.toJSON();
      return (col[0] && col[0].ControlFlag == 1) ? 'dropdown-menu' : 'text-request-object';
    },

    initialize: function () {
      _.bindAll(this, 'renderServiceObjectItem');
    },

    renderServiceObjectItem: function(model){
      // console.log(model.toJSON());
      if (model.toJSON().ControlFlag == 1) {
        var serviceObjectItemView = new Hktdc.Views.ServiceObjectSelect({ model: model });
      } else {
        var serviceObjectItemView = new Hktdc.Views.ServiceObjectText({ model: model });
      }

      serviceObjectItemView.render();
      $(this.el).append(serviceObjectItemView.el);
    },

    render: function(){
      this.collection.each(this.renderServiceObjectItem);
    }

  });

})();
