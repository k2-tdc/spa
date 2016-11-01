/*global Hktdc, Backbone, JST*/
/**
 * This file contains:
 * ServiceRequestList
 * ServiceRequestItem
 */
Hktdc.Views = Hktdc.Views || {};

(function () {
  'use strict';

  Hktdc.Views.ServiceRequest = Backbone.View.extend({

    template: JST['app/scripts/templates/serviceRequest.ejs'],
    tagName: 'div',
    className: 'Headleve2sub',
    events: {
      'click .btn-del': 'deleteRequestObject'
    },
    deleteRequestObject: function(ev) {
      var collection = this.model.get('parentCollection');
      collection.remove(this.model);

      /* also delete the collection */
      this.requestFormModel.selectedServiceCollection.remove(this.model.toJSON().selectedRequestModel);
      // console.log(this.requestFormModel.selectedServiceCollection.toJSON());
    },

    initialize: function (props) {
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
      })
    },

    render: function () {
      var request = this.model.toJSON();
      var tmpl = this.template({request: request});
      this.$el.html(tmpl);
    }

  });

  Hktdc.Views.ServiceRequestList = Backbone.View.extend({
    tagName: 'div',

    initialize: function (options) {
      _.bindAll(this, 'renderServiceRequest', 'addServiceRequest', 'removeServiceRequest');
      this.serviceObjectData = options.serviceObjectData;
      this.requestFormModel = options.requestFormModel;
      this.listenTo(this.collection, 'add', this.addServiceRequest);
      this.listenTo(this.collection, 'remove', this.removeServiceRequest);
    },

    addServiceRequest: function(model) {
      this.renderServiceRequest(model, this.collection.length - 1);
    },


    removeServiceRequest: function(model){
      // console.log('removeServiceRequest in ServiceRequestList view');
      // console.log(this.collection.toJSON());
      $(this.el).empty();
      this.render();
    },

    renderServiceRequest: function(model, index){
      // console.log(this.serviceObjectData.toJSON());
      // var that = this;

      model.set('index', index + 1);
      model.set('serviceObjectData', this.serviceObjectData);
      model.set('parentCollection', this.collection);
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
