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
        var self = this;
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
          // console.log(serviceObjectListView.el);
          $('.service-object-container', this.el).append(serviceObjectListView.el);
          this.initModelChangeHandler();
          self.model.set({
            selectedServiceObject: !!self.model.toJSON().Notes
          });
        }.bind(this));

        this.listenTo(window.Hktdc.Dispatcher, 'serviceInvalid', function(service) {
          var $parent = self.$el.parents('.select-service');
          // console.log(this.model.toJSON());
          // console.log(service.ServiceGUID);
          if (!this.model.toJSON().Notes) {
          // if (service.ServiceGUID === this.model.toJSON().ServiceGUID) {
            $parent.find('.error-message').removeClass('hidden');
            $parent.addClass('error-input');
          } else {
            $parent.find('.error-message').addClass('hidden');
            $parent.removeClass('error-input');
          }
        });

        // this.listenTo('clearServiceRequest', this.deleteRequestObject.bind(this));
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
      // console.group('remove');
      // console.log('serviceRequestList Collection: ', collection.toJSON());
      // console.log('selectedServiceCollection collection: ', this.requestFormModel.toJSON().selectedServiceCollection.toJSON());

      // /* have GUID = (ControlFlag = 1) */
      // old: if (this.model.toJSON().ServiceGUID || String(this.model.toJSON().ControlFlag) === '1') {
      if (String(this.model.toJSON().ControlFlag) === '1') {
        // console.log(collection.toJSON());
        // console.log(this.model.toJSON());
        collection.remove(this.model);
        /* insert mode use selectedRequestModel */
        /* edit mode use this.model */
        var targetModel = this.model.toJSON().selectedRequestModel ||
                          this.model;
        // console.log('targetModel: ', targetModel.toJSON());
        var removeTarget;
        this.requestFormModel.toJSON().selectedServiceCollection.each(function(selectedModel) {
          if (selectedModel.toJSON().ServiceGUID === targetModel.toJSON().ServiceGUID) {
            removeTarget = selectedModel;
          }
        });
        // console.log('removeTarget: ', removeTarget);
        /* console.group('group');
        console.log('collection: ', this.requestFormModel.toJSON().selectedServiceCollection.toJSON());
        console.log('selectedRequestModel: ', this.model.toJSON().selectedRequestModel.toJSON());
        console.log('this model: ', this.model.toJSON());
        console.log('targetModel: ', targetModel.toJSON());
        console.groupEnd(); */
        /* also delete the collection */
        this.requestFormModel.toJSON().selectedServiceCollection.remove(removeTarget);

      /* not have ServiceGUID = (ControlFlag = 2) */
      } else {
        // console.log('condition b');
        // console.log('this.model', this.model.toJSON());
        // console.group('remove flag 2');
        collection.each(function(model) {
          // console.log('models in serviceRequestList collection', model.toJSON());
          // when 'new' mode
          if (model.toJSON().availableServiceObjectArray) {
            var removeTargets = [];
            _.each(model.toJSON().availableServiceObjectArray, function(service) {
              // console.log('service ID: ', service.GUID);
              self.requestFormModel.toJSON().selectedServiceCollection.each(function(selectedServiceModel) {
                // use GUID here because items in ControlFlag 2 are delete at the same time
                if (selectedServiceModel && selectedServiceModel.toJSON().GUID === service.GUID) {
                  // console.log('found: ', selectedServiceModel.toJSON().Name);
                  // self.requestFormModel.toJSON().selectedServiceCollection.remove(selectedServiceModel);
                  removeTargets.push(selectedServiceModel);
                  // console.log(self.requestFormModel.toJSON().selectedServiceCollection.toJSON());
                }
              });
            });
            _.each(removeTargets, function(removeTarget) {
              self.requestFormModel.toJSON().selectedServiceCollection.remove(removeTarget);
            });
          // when edit mode
          } else {
            self.requestFormModel.toJSON().selectedServiceCollection.remove(model);
          }
        });

        collection.reset();
        // console.groupEnd();

        // console.log(collection.toJSON());
      }
      // console.groupEnd();
      console.log('removed, new collection: ', this.requestFormModel.toJSON().selectedServiceCollection.toJSON());
    },

    addNotesToServiceObject: function(ev) {
      var selectedServiceModel = this.requestFormModel.toJSON().selectedServiceCollection.get(this.model.toJSON().ServiceGUID);
      this.model.set({
        Notes: $(ev.target).val().trim()
      });
      if (selectedServiceModel) {
        selectedServiceModel.set({
          Notes: $(ev.target).val().trim()
        });
      }
    },

    initModelChangeHandler: function() {
      var self = this;
      this.model.on('change:selectedRequestModel', function(selectedReq, newModel) {
        $('.selectleve2sub', self.el).text(newModel.toJSON().Name);
      });
      this.model.on('change:selectedServiceObject', function(selectedReq, isSelected) {
        $('.service-notes', self.el).prop('disabled', !isSelected);
      });
      this.listenTo(self.model.toJSON().serviceCatagoryModel, 'clearServiceRequest', self.deleteRequestObject.bind(this));

      this.listenTo(self.model, 'changeServiceSelect', function(selectServiceModel) {
        // console.log(selectServiceModel.toJSON());
        // console.log(selectServiceModel.toJSON().Placeholder);
        // console.log($('.service-notes', self.el).find('textarea'));
        $('.service-notes', self.el).attr('placeholder', selectServiceModel.toJSON().Placeholder);
        $('.service-notes', self.el).val('');
      });
    },

    render: function() {
      var request = this.model.toJSON();
      var isActive = (
        this.requestFormModel.toJSON().ActionTakerServiceType &&
        this.requestFormModel.toJSON().ActionTakerServiceType === request.GUID
      );
      var tmpl = this.template({
        request: request,
        isActive: isActive,

        /* only 'edit' request mode will have delete button */
        needDelBtn: (this.requestFormModel.toJSON().mode !== 'read')
      });
      // console.log(tmpl);
      this.$el.html(tmpl);
    }
  });

  Hktdc.Views.ServiceRequestReadOnly = Backbone.View.extend({

    template: JST['app/scripts/templates/serviceRequestReadOnly.ejs'],
    tagName: 'div',
    className: 'Headleve2sub',
    initialize: function(props) {
      _.extend(this, props);
      try {
        var serviceObjectCollection = new Hktdc.Collections.ServiceObject(this.model.toJSON().availableServiceObjectArray);
        var serviceObjectListView = new Hktdc.Views.ServiceObjectList({
          collection: serviceObjectCollection,
          serviceRequestModel: this.model,
          requestFormModel: this.requestFormModel
        });
        // console.log(serviceObjectListView);
        serviceObjectListView.render();

        setTimeout(function() {
          // console.log(serviceObjectListView.el);
          $('.service-object-container', this.el).append(serviceObjectListView.el);
        }.bind(this));
      } catch (e) {
        console.error('service request render error');
        console.log(e);
      }
    },

    render: function() {
      var request = this.model.toJSON();
      var isActive = (
        this.requestFormModel.toJSON().ActionTakerServiceType &&
        this.requestFormModel.toJSON().ActionTakerServiceType === request.GUID
      );
      // console.log(request);
      var tmpl = this.template({
        request: request,
        isActive: isActive
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
      console.log('add request');
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
      var data = {
        index: index + 1,
        availableServiceObjectArray: this.availableServiceObjectArray,
        parentCollection: this.collection,
        serviceCatagoryModel: this.serviceCatagoryModel,
        serviceTypeName: this.serviceTypeName,
        readonly: (this.requestFormModel.toJSON().mode === 'read')
      };
      if (!model.toJSON().ServiceGUID) {
        data.ServiceGUID = utils.makeId(10);
      }
      model.set(data);

      if (this.requestFormModel.toJSON().mode === 'read') {
        var serviceRequestItemView = new Hktdc.Views.ServiceRequestReadOnly({
          model: model,
          requestFormModel: this.requestFormModel,
          serviceCatagoryModel: this.serviceCatagoryModel
        });
      } else {
        var serviceRequestItemView = new Hktdc.Views.ServiceRequest({
          model: model,
          requestFormModel: this.requestFormModel,
          serviceCatagoryModel: this.serviceCatagoryModel
        });
      }
      serviceRequestItemView.render();
      $(this.el).append(serviceRequestItemView.el);
    },

    renderTextServiceRequest: function() {
      // console.log(this.availableServiceObjectArray);
      var model = new Hktdc.Models.ServiceRequest({
        index: 1,
        availableServiceObjectArray: _.extend(this.availableServiceObjectArray, this.collection.toJSON()),
        parentCollection: this.collection,
        serviceTypeName: this.serviceTypeName,
        serviceCatagoryModel: this.serviceCatagoryModel,
        readonly: (this.requestFormModel.toJSON().mode === 'read')
      });
      if (this.requestFormModel.toJSON().mode === 'read') {
        var serviceRequestItemView = new Hktdc.Views.ServiceRequestReadOnly({
          model: model,
          requestFormModel: this.requestFormModel,
          serviceCatagoryModel: this.serviceCatagoryModel
        });
      } else {
        var serviceRequestItemView = new Hktdc.Views.ServiceRequest({
          model: model,
          requestFormModel: this.requestFormModel,
          serviceCatagoryModel: this.serviceCatagoryModel
        });
      }
      serviceRequestItemView.render();
      $(this.el).append(serviceRequestItemView.el);
    },

    render: function() {
      // console.log(this.collection.toJSON());
      if (this.collection.toJSON().length > 0) {
        if (String(this.collection.toJSON()[0].ControlFlag) === '2') {
          this.renderTextServiceRequest();
        } else {
          this.collection.each(this.renderServiceRequest);
        }
      }
      // console.log(this.availableServiceObjectArray);
    }

  });
})();
