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
    initialize: function(props) {
      try {
        _.extend(this, props);
        var serviceObjectCollection = new Hktdc.Collections.ServiceObject(this.model.toJSON().availableServiceObjectArray);
        var serviceObjectListView = new Hktdc.Views.ServiceObjectList({
          collection: serviceObjectCollection,
          serviceRequestModel: this.model,
          requestFormModel: this.requestFormModel
        });
        // console.log(serviceObjectListView);
        serviceObjectListView.render();

        setTimeout(function() {
          $('.service-object-container', this.el).append(serviceObjectListView.el);
          this.initModelChangeHandler();
        }.bind(this));
        // }
      } catch (e) {
        console.error('service request render error');
        console.log(e);
      }
    },

    events: {
      'click .btn-del': 'deleteRequestObject',
      'blur .service-notes': 'addNotesToServiceObject'
    },

    deleteRequestObject: function(ev) {
      var collection = this.model.toJSON().parentCollection;
      var self = this;
      // console.log('model', this.model.toJSON());
      console.log('serviceRequestList Collection: ', collection.toJSON());
      console.log('selectedServiceCollection collection: ', this.requestFormModel.toJSON().selectedServiceCollection.toJSON());

      // /* have GUID = (ControlFlag = 1) */
      if (this.model.toJSON().GUID || String(this.model.toJSON().ControlFlag) === '1') {
        collection.remove(this.model);
        /* insert mode use selectedRequestModel */
        /* edit mode use this.model */
        var targetModel = this.model.toJSON().selectedRequestModel ||
                          this.model;
        /* console.group('group');
        console.log('collection: ', this.requestFormModel.toJSON().selectedServiceCollection.toJSON());
        console.log('selectedRequestModel: ', this.model.toJSON().selectedRequestModel.toJSON());
        console.log('this model: ', this.model.toJSON());
        console.log('targetModel: ', targetModel.toJSON());
        console.groupEnd(); */
        /* also delete the collection */
        this.requestFormModel.toJSON().selectedServiceCollection.remove(targetModel);

      /* not have GUID = (ControlFlag = 2) */
      } else {
        // console.log('condition b');
        console.log('this.model', this.model.toJSON());
        collection.each(function(model) {
          console.log('models in serviceRequestList collection', model.toJSON());
          // when 'new' mode
          if (model.toJSON().availableServiceObjectArray) {
            _.each(model.toJSON().availableServiceObjectArray, function(service) {
              console.log('service ID: ', service.GUID);
              self.requestFormModel.toJSON().selectedServiceCollection.each(function(selectedServiceModel) {
                console.log('current: ', selectedServiceModel.toJSON().GUID);
                if (selectedServiceModel.toJSON().GUID === service.GUID) {
                  console.log('found: ', selectedServiceModel.toJSON().GUID);
                  self.requestFormModel.toJSON().selectedServiceCollection.remove(selectedServiceModel);
                }
              });
            });
          // when edit mode
          } else {
            self.requestFormModel.toJSON().selectedServiceCollection.remove(model);
          }
        });

        collection.reset();
        // console.log(collection.toJSON());
      }
      console.log('removed, new collection: ', this.requestFormModel.toJSON().selectedServiceCollection.toJSON());
    },

    addNotesToServiceObject: function(ev) {
      // console.log($(ev.target).val());
      this.model.set({
        // sl
        Notes: $(ev.target).val().trim()
      });
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
      var isActive = (this.requestFormModel.toJSON().ActionTakerServiceType === request.GUID);
      var tmpl = this.template({
        request: request,
        isActive: isActive,

        /* only 'edit' request mode will have delete button */
        needDelBtn: (this.requestFormModel.toJSON().mode !== 'read')
      });
      this.$el.html(tmpl);
    }

  });

  Hktdc.Views.ServiceRequestList = Backbone.View.extend({
    tagName: 'div',
    // template: JST['app/scripts/templates/serviceRequest.ejs'],

    initialize: function(props) {
      _.extend(this, props);
      _.bindAll(this, 'renderServiceRequest', 'addServiceRequest', 'removeServiceRequest');
      this.serviceTypeName = props.serviceTypeModel.toJSON().Name;
      this.listenTo(this.collection, 'add', this.addServiceRequest);
      this.listenTo(this.collection, 'remove', this.removeServiceRequest);
      this.listenTo(this.collection, 'reset', this.resetServiceRequest);
    },

    addServiceRequest: function(model) {
      if (model.toJSON().ControlFlag === 2) {
        // hide add button
        this.serviceTypeModel.set({ needAddBtn: false });
      }
      this.serviceCatagoryModel.set({
        selectedServiceCount: this.serviceCatagoryModel.toJSON().selectedServiceCount + 1
      });
      this.renderServiceRequest(model, this.collection.length - 1);
    },

    removeServiceRequest: function(model) {
      // console.log('removeServiceRequest in ServiceRequestList view');
      this.serviceCatagoryModel.set({
        selectedServiceCount: this.serviceCatagoryModel.toJSON().selectedServiceCount - 1
      });
      if (model.toJSON().ControlFlag === 2) {
        // hide add button
        this.serviceTypeModel.set({ needAddBtn: true });
      }
      // console.log(model.toJSON().selectedRequestModel.toJSON());
      $(this.el).empty();
      this.render();
    },

    resetServiceRequest: function(col, prevCol) {
      /* should be from ControlFlag = 2 source */
      // console.log('reset:', col);
      this.serviceCatagoryModel.set({
        selectedServiceCount: this.serviceCatagoryModel.toJSON().selectedServiceCount - prevCol.previousModels.length
      });

      this.serviceTypeModel.set({ needAddBtn: true });
      $(this.el).empty();
      this.render();
    },

    renderServiceRequest: function(model, index) {
      // console.log(this.availableServiceObjectArray.toJSON());
      // var that = this;

      model.set({
        index: index + 1,
        availableServiceObjectArray: this.availableServiceObjectArray,
        parentCollection: this.collection,
        serviceCatagoryModel: this.serviceCatagoryModel,
        serviceTypeName: this.serviceTypeName
      });

      var serviceRequestItemView = new Hktdc.Views.ServiceRequest({
        model: model,
        requestFormModel: this.requestFormModel,
        serviceCatagoryModel: this.serviceCatagoryModel
      });
      serviceRequestItemView.render();
      $(this.el).append(serviceRequestItemView.el);
    },

    renderTextServiceRequest: function() {
      console.log(this.availableServiceObjectArray);
      var model = new Hktdc.Models.ServiceRequest({
        index: 1,
        availableServiceObjectArray: _.extend(this.availableServiceObjectArray, this.collection.toJSON()),
        parentCollection: this.collection,
        serviceTypeName: this.serviceTypeName,
        serviceCatagoryModel: this.serviceCatagoryModel
      });

      var serviceRequestItemView = new Hktdc.Views.ServiceRequest({
        model: model,
        requestFormModel: this.requestFormModel
      });
      serviceRequestItemView.render();
      $(this.el).append(serviceRequestItemView.el);
    },

    renderTextServiceObjectList: function(collection) {
      var serviceObjectCollection = new Hktdc.Collections.ServiceObject(
        _.extend(this.availableServiceObjectArray, this.collection.toJSON())
      );
      // console.log('crash', serviceObjectCollection.toJSON());
      // console.log('crash', );
      var serviceObjectListView = new Hktdc.Views.ServiceObjectList({
        collection: serviceObjectCollection,
        requestFormModel: this.requestFormModel
      });
      // console.log(serviceObjectListView);
      serviceObjectListView.render();

      // setTimeout(function() {
      $(this.el).append(serviceObjectListView.el);
        // console.log(serviceObjectListView.el);
        // this.initModelChangeHandler();
      // }.bind(this));
    },

    render: function() {
      if (this.collection.toJSON().length > 0) {
        if (String(this.collection.toJSON()[0].ControlFlag) === '2') {
          // method 1
          // this.renderTextServiceObjectList(this.collection);

          // method 2
          this.renderTextServiceRequest();

          // var serviceRequestItemView = new Hktdc.Views.ServiceRequest({
          //   model: model,
          //   requestFormModel: this.requestFormModel
          // });
          // serviceRequestItemView.render();
          // $(this.el).append(serviceRequestItemView.el);
        } else {
          // console.log(this.collection.toJSON());
          this.collection.each(this.renderServiceRequest);
        }
      }
      // console.log(this.availableServiceObjectArray);
    }

  });
})();
