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
      // console.log('parent collection', collection.toJSON());
      // console.log('model', this.model.toJSON());

      // /* have GUID = (ControlFlag = 1) */
      if (this.model.toJSON().GUID || String(this.model.toJSON().ControlFlag) === '1') {
        // collection.remove(this.model);
        /* also delete the collection */
        this.requestFormModel.toJSON().selectedServiceCollection.remove(
          /* insert mode use selectedRequestModel */
          /* edit mode use this.model */
          this.model.toJSON().selectedRequestModel || this.model
        );

      /* not have GUID = (ControlFlag = 2) */
      } else {
        collection.each(function(model) {
          self.requestFormModel.toJSON().selectedServiceCollection.remove(model);
        });

        collection.reset();
        // console.log(collection.toJSON());
      }
      console.log(this.requestFormModel.toJSON().selectedServiceCollection.toJSON());
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
      // console.log(request);
      var tmpl = this.template({
        request: request,

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
      console.log('add service request');
      if (model.toJSON().ControlFlag === 2) {
        // hide add button
        this.serviceTypeModel.set({ needAddBtn: false });
      }
      this.serverviceCatagoryModel.set({
        selectedServiceCount: this.serverviceCatagoryModel.toJSON().selectedServiceCount + 1
      });
      this.renderServiceRequest(model, this.collection.length - 1);
    },

    removeServiceRequest: function(model) {
      // console.log('removeServiceRequest in ServiceRequestList view');
      this.serverviceCatagoryModel.set({
        selectedServiceCount: this.serverviceCatagoryModel.toJSON().selectedServiceCount - 1
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
      this.serverviceCatagoryModel.set({
        selectedServiceCount: this.serverviceCatagoryModel.toJSON().selectedServiceCount - prevCol.previousModels.length
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
        serverviceCatagoryModel: this.serverviceCatagoryModel,
        serviceTypeName: this.serviceTypeName
      });

      var serviceRequestItemView = new Hktdc.Views.ServiceRequest({
        model: model,
        requestFormModel: this.requestFormModel,
        serverviceCatagoryModel: this.serverviceCatagoryModel
      });
      serviceRequestItemView.render();
      $(this.el).append(serviceRequestItemView.el);
    },

    renderTextServiceRequest: function() {
      // console.log(this.availableServiceObjectArray.toJSON());
      var model = new Hktdc.Models.ServiceRequest({
        index: 1,
        availableServiceObjectArray: _.extend(this.availableServiceObjectArray, this.collection.toJSON()),
        parentCollection: this.collection,
        serviceTypeName: this.serviceTypeName,
        serverviceCatagoryModel: this.serverviceCatagoryModel
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
