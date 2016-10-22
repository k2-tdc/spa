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
    deleteRequestObject: function(){
      var collection = this.model.get('parentCollection');
      collection.remove(this.model);
    },
    initialize: function () {
      try {
        var serviceObjectCollection = new Hktdc.Collections.ServiceObject(this.model.toJSON().serviceObjectData);
        var serviceObjectListView = new Hktdc.Views.ServiceObjectList({
          collection: serviceObjectCollection
        });
        // console.log(serviceObjectListView);
        serviceObjectListView.render();
        setTimeout(function() {
          $('.service-object-container', this.el).append(serviceObjectListView.el);
        }.bind(this));
      } catch (e) {
        console.error('service request render error');
      }
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
        model: model
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
