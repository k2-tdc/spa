/* global Hktdc, Backbone, JST, $, _ */
/**
 * This file contains:
 * = level 2
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
      'click .btn-add': 'addServiceRequest'
    },

    defaultServiceRequestObject: {},

    initialize: function(props) {
      this.requestFormModel = props.requestFormModel;
      this.selectedServiceCatagoryTree = props.selectedServiceCatagoryTree;
      this.renderServiceObject();
      this.model.on('change:needAddBtn', function(model, isNeed) {
        // console.log('change on needAddBtn');
        if (isNeed) {
          $('.btn-add', this.el).show();
        } else {
          $('.btn-add', this.el).hide();
        }
      }.bind(this));
    },

    renderServiceObject: function() {
      /* initialize level 3 service */
      // console.group('group');
      // console.log(this.model.toJSON());
      try {
        var selectedServiceRequestList = null;
        var availableServiceObjectArray = this.model.toJSON().Level3;
        this.defaultServiceRequestObject = { ControlFlag: availableServiceObjectArray[0].ControlFlag };

        switch (this.requestFormModel.toJSON().mode) {
          case 'new':
            // console.log('new');
            /* service request list in 'new' request mode default is empty array */
            selectedServiceRequestList = [];
            break;
          case 'read':
            /* service request list in 'read' request mode default is only from RequestDetail data */
            /* because read mode availableServiceObjectArray direct use the RequestList from API call */
            // console.log('this.selectedServiceCatagoryTree.Level2', this.selectedServiceCatagoryTree.Level2);
            if (!this.selectedServiceCatagoryTree) {
              selectedServiceRequestList = [];
            } else {
              var selectedServiceTypeTree = _.filter(this.selectedServiceCatagoryTree.Level2, function(selectedType) {
                // TODO: change to GUID
                return selectedType.Name === this.model.toJSON().Name;
              }.bind(this));
              // console.log('selectedServiceTypeTree: ', selectedServiceTypeTree);

              selectedServiceRequestList = _.flatten(_.pluck(selectedServiceTypeTree, 'Level3'));
            }

            break;
          case 'edit':
            /* service request list in 'edit' request mode same as 'read' mode */
            // console.log(this.model.toJSON().Name);
            // console.log(this.selectedServiceCatagoryTree);
            if (!this.selectedServiceCatagoryTree) {
              selectedServiceRequestList = [];
            } else {
              var selectedServiceTypeTree = _.filter(this.selectedServiceCatagoryTree.Level2, function(selectedType) {
                // TODO: change to GUID
                return selectedType.Name === this.model.toJSON().Name;
              }.bind(this));
              // console.log(selectedServiceTypeTree);
              selectedServiceRequestList = _.flatten(_.pluck(selectedServiceTypeTree, 'Level3'));
              // console.log(selectedServiceRequestList);
              // serviceRequestList = this.requestFormModel.selectedServiceCollection.toJSON();
            }
            break;

          default:
            selectedServiceRequestList = [];

        }
        // console.log(selectedServiceRequestList);
        this.childServiceRequestCollection = new Hktdc.Collections.ServiceRequest(selectedServiceRequestList);
        var serviceRequestListView = new Hktdc.Views.ServiceRequestList({
          collection: this.childServiceRequestCollection,
          availableServiceObjectArray: availableServiceObjectArray,
          requestFormModel: this.requestFormModel,

          /* the serviceTypeName is used to mapping the service object to it's service type when saving request */
          serviceTypeModel: this.model
        });
        serviceRequestListView.render();

        setTimeout(function() {
          $('.service-request-container', this.el).html(serviceRequestListView.el);
        }.bind(this));
      } catch (e) {
        // TODO: pop up alert dialog
        console.error('render level 3 - service request error');
        console.error(e);
      }
      // console.groupEnd();
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
      this.selectedServiceCatagoryTree = props.selectedServiceCatagoryTree;
      /* important to use bindAll as directly use this.renderItem in render */
      _.bindAll(this, 'renderServiceTypeItem');
    },

    renderServiceTypeItem: function(model, index) {
      // var needAddBtn = (model.toJSON().Level3[0].ControlFlag == 1);
      // console.log(this.requestFormModel.toJSON().mode);

      /* only 'edit' and 'read' will have add btn by default */
      // console.log(this.selectedServiceCatagoryTree);
      if (
        this.requestFormModel.toJSON().mode === 'read' ||
        String(model.toJSON().Level3[0].ControlFlag) === '2' && this.selectedServiceCatagoryTree
      ) {
        model.set('needAddBtn', false);
      } else {
        model.set('needAddBtn', true);
      }
      var serviceTypeItemView = new Hktdc.Views.ServiceType({
        model: model,
        requestFormModel: this.requestFormModel,
        selectedServiceCatagoryTree: this.selectedServiceCatagoryTree
      });
      serviceTypeItemView.render();

      $(this.el).append(serviceTypeItemView.el);
    },

    render: function() {
      this.collection.each(this.renderServiceTypeItem);
    }

  });
})();
