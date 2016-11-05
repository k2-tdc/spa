/* global Hktdc, Backbone, JST, $, _ */
/**
 * This file contains:
 * ServiceObjectList
 * ServiceObjectItem
 */
Hktdc.Views = Hktdc.Views || {};

(function() {
  'use strict';

  Hktdc.Views.ServiceObjectText = Backbone.View.extend({
    template: JST['app/scripts/templates/serviceObjectText.ejs'],
    tagName: 'div',
    events: {
      'blur #lastnosub': 'editServiceHandler'
    },
    editServiceHandler: function() {
      if ($('textarea', this.el).val().trim().length > 0) {
        this.model.set({
          Notes: $('textarea', this.el).val().trim()
        });
        this.requestFormModel.selectedServiceCollection.add(this.model);
      } else {
        this.requestFormModel.selectedServiceCollection.remove(this.model);
      }
      // console.log(this.requestFormModel.selectedServiceCollection.toJSON());
    },
    initialize: function(props) {
      this.requestFormModel = props.requestFormModel;
    },
    render: function() {
      var tmpl = this.template({ serviceObject: this.model.toJSON()});
      this.$el.html(tmpl);
    }
  });

  Hktdc.Views.ServiceObjectSelect = Backbone.View.extend({
    template: JST['app/scripts/templates/serviceObjectSelect.ejs'],
    tagName: 'li',
    events: {
      'click .anclevel3': 'selectServiceHandler'
    },
    selectServiceHandler: function() {
      /* save the selected request to the upper level so that can delete request form collection by selected model */
      // this.serviceRequestModel.set();
      this.serviceRequestModel.set({
        selectedRequestModel: this.model,
        selectedServiceObject: true
      });
      this.requestFormModel.selectedServiceCollection.add(this.model);
      // console.log(this.model.toJSON());
      // console.log(this.requestFormModel.selectedServiceCollection.toJSON());
    },

    initialize: function(props) {
      var self = this;
      this.requestFormModel = props.requestFormModel;
      this.serviceRequestModel = props.serviceRequestModel;
      this.serviceRequestModel.on('change:Notes', function(a, newNotes) {
        /* the requestFormModel.selectedServiceCollection will auto update */
        self.model.set({ Notes: newNotes });
      });
    },

    render: function() {
      var tmpl = this.template({ serviceObject: this.model.toJSON()});
      this.$el.html(tmpl);
    }
  });

  Hktdc.Views.ServiceObjectList = Backbone.View.extend({

    tagName: function() {
      var col = this.collection.toJSON();
      return (col[0] && col[0].ControlFlag == 1) ? 'ul' : 'div';
    },

    className: function() {
      var col = this.collection.toJSON();
      return (col[0] && col[0].ControlFlag == 1) ? 'dropdown-menu' : 'text-request-object';
    },

    initialize: function(props) {
      this.requestFormModel = props.requestFormModel;
      this.serviceRequestModel = props.serviceRequestModel;
      // console.log(this.serviceRequestModel.toJSON());
      _.bindAll(this, 'renderServiceObjectItem');
    },

    renderServiceObjectItem: function(model) {
      // console.log(model.toJSON());
      model.set({
        serviceTypeName: this.serviceRequestModel.toJSON().serviceTypeName
      });

      if (String(model.toJSON().ControlFlag) === '1') {
        var serviceObjectItemView = new Hktdc.Views.ServiceObjectSelect({
          model: model,
          requestFormModel: this.requestFormModel,
          serviceRequestModel: this.serviceRequestModel
        });
      } else {
        console.log(model.toJSON());
        var serviceObjectItemView = new Hktdc.Views.ServiceObjectText({
          model: model,
          requestFormModel: this.requestFormModel,
          serviceRequestModel: this.serviceRequestModel
        });
      }

      serviceObjectItemView.render();
      $(this.el).append(serviceObjectItemView.el);
    },

    render: function() {
      this.collection.each(this.renderServiceObjectItem);
    }

  });
})();
