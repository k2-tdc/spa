/*global Hktdc, Backbone, JST*/
/**
 * This file contains:
 * ServiceTypeList
 * ServiceTypeItem
 */
Hktdc.Views = Hktdc.Views || {};

(function() {
  'use strict';

  Hktdc.Views.ServiceType = Backbone.View.extend({

    template: JST['app/scripts/templates/serviceType.ejs'],

    className: 'group-details',

    tagName: 'div',

    events: {
      "click .btn-add": 'addServiceRequest'
    },

    defaultServiceRequestObject: {},

    initialize: function(props) {
      this.requestFormModel = props.requestFormModel;
      this.renderServiceObject();
    },

    renderServiceObject: function() {
      /* initialize level 3 service */
      try {
        var serviceObjectData = this.model.toJSON().Level3;
        /* service request list in new request default is empty object of array */
        this.defaultServiceRequestObject = { ControlFlag: serviceObjectData[0].ControlFlag };
        var serviceRequestList = [];
        if (serviceObjectData[0].ControlFlag == 2) {
          serviceRequestList.push(this.defaultServiceRequestObject);
        }
        this.childServiceRequestCollection = new Hktdc.Collections.ServiceRequest(serviceRequestList);

        // childServiceRequestCollection.on('add', function(srModel) {
        //   console.log('add service request');
        // });

        var serviceRequestListView = new Hktdc.Views.ServiceRequestList({
          collection: this.childServiceRequestCollection,
          serviceObjectData: serviceObjectData,
          requestFormModel: this.requestFormModel
        });
        serviceRequestListView.render();


        setTimeout(function() {
          $('.service-request-container', this.el).html(serviceRequestListView.el);
        }.bind(this));
      } catch (e) {
        // TODO: pop up alert dialog
        console.error('render level 3 - service request error');
      }

    },

    addServiceRequest: function() {
      // console.log('addServiceRequest in serviceType.js');
      this.childServiceRequestCollection.add(this.defaultServiceRequestObject);
    },

    render: function() {
      // console.log(JSON.stringify(this.model.toJSON(), null, 2));
      var tmpl = this.template({
        serviceType: this.model.toJSON()
      });
      $(this.el).html(tmpl);
    }

  });

  Hktdc.Views.ServiceTypeList = Backbone.View.extend({

    initialize: function(props) {
      /* requestFormModel is new request model */
      this.requestFormModel = props.requestFormModel;
      /* important to use bindAll as directly use this.renderItem in render */
      _.bindAll(this, 'renderServiceTypeItem');
    },

    renderServiceTypeItem: function(model, index) {
      var needAddBtn = (model.toJSON().Level3[0].ControlFlag == 1);
      model.set('needAddBtn', needAddBtn);
      var serviceTypeItemView = new Hktdc.Views.ServiceType({
        model: model,
        requestFormModel: this.requestFormModel
      });
      serviceTypeItemView.render();
      $(this.el).append(serviceTypeItemView.el);

    },

    render: function() {
      this.collection.each(this.renderServiceTypeItem);
    }

  });

})();
