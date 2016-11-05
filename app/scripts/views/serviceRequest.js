/* global Hktdc, Backbone, JST, $, _ */
/**
 * This file contains:
 * = level3
 * ServiceRequestList
 * ServiceRequestItem
 */
Hktdc.Views = Hktdc.Views || {};

(function() {
  'use strict';

  Hktdc.Views.ServiceRequest = Backbone.View.extend({

    template: JST['app/scripts/templates/serviceRequest.ejs'],
    tagName: 'div',
    className: 'Headleve2sub',
    events: {
      'click .btn-del': 'deleteRequestObject',
      'blur .service-notes': 'addNotesToServiceObject'
    },
    deleteRequestObject: function(ev) {
      var collection = this.model.get('parentCollection');
      collection.remove(this.model);

      /* also delete the collection */
      this.requestFormModel.selectedServiceCollection.remove(this.model.toJSON().selectedRequestModel);
      // console.log(this.requestFormModel.selectedServiceCollection.toJSON());
    },
    addNotesToServiceObject: function(ev) {
      // console.log($(ev.target).val());
      this.model.set({
        Notes: $(ev.target).val().trim()
      });
    },
    initialize: function(props) {
      try {
        this.requestFormModel = props.requestFormModel;
        var serviceObjectCollection = new Hktdc.Collections.ServiceObject(this.model.toJSON().serviceObjectData);
        var serviceObjectListView = new Hktdc.Views.ServiceObjectList({
          collection: serviceObjectCollection,
          serviceRequestModel: this.model,
          requestFormModel: props.requestFormModel
        });
        // console.log(serviceObjectListView);
        serviceObjectListView.render();
        setTimeout(function() {
          $('.service-object-container', this.el).append(serviceObjectListView.el);
          this.initModelChangeHandler();
        }.bind(this));
      } catch (e) {
        console.error('service request render error');
      }
    },

    initModelChangeHandler: function() {
      var self = this;
      this.model.on('change:selectedRequestModel', function(selectedReq, newModel) {
        $('.selectleve2sub', self.el).text(newModel.toJSON().Name);
      });
      this.model.on('change:selectedServiceObject', function(selectedReq, isSelected) {
        console.log('selectedServiceObject: ', isSelected);
        $('.service-notes', self.el).prop('disabled', !isSelected);
      });
    },

    render: function() {
      var request = this.model.toJSON();
      var tmpl = this.template({
        request: request,

        /* only 'edit' request mode will have delete button */
        needDelBtn: (this.requestFormModel.toJSON().mode === 'edit')
      });
      this.$el.html(tmpl);
    }

  });

  Hktdc.Views.ServiceRequestList = Backbone.View.extend({
    tagName: 'div',

    initialize: function(options) {
      _.bindAll(this, 'renderServiceRequest', 'addServiceRequest', 'removeServiceRequest');
      this.serviceObjectData = options.serviceObjectData;
      this.requestFormModel = options.requestFormModel;
      this.serviceTypeName = options.serviceTypeModel.toJSON().Name;
      this.serviceTypeModel = options.serviceTypeModel;
      this.listenTo(this.collection, 'add', this.addServiceRequest);
      this.listenTo(this.collection, 'remove', this.removeServiceRequest);
    },

    addServiceRequest: function(model) {
      // console.log('add service request');
      if (model.toJSON().ControlFlag === 2) {
        // hide add button
        this.serviceTypeModel.set({ needAddBtn: false });
      }
      this.renderServiceRequest(model, this.collection.length - 1);
    },

    removeServiceRequest: function(model) {
      // console.log('removeServiceRequest in ServiceRequestList view');
      // console.log(this.collection.toJSON());
      if (model.toJSON().ControlFlag === 2) {
        // hide add button
        this.serviceTypeModel.set({ needAddBtn: true });
      }
      $(this.el).empty();
      this.render();
    },

    renderServiceRequest: function(model, index) {
      // console.log(this.serviceObjectData.toJSON());
      // var that = this;

      model.set('index', index + 1);
      model.set('serviceObjectData', this.serviceObjectData);
      model.set('parentCollection', this.collection);
      model.set('serviceTypeName', this.serviceTypeName);
      var serviceRequestItemView = new Hktdc.Views.ServiceRequest({
        model: model,
        requestFormModel: this.requestFormModel
      });
      serviceRequestItemView.render();
      $(this.el).append(serviceRequestItemView.el);
    },

    render: function() {
      // console.log(this.collection.toJSON());
      this.collection.each(this.renderServiceRequest);
    }

  });
})();
