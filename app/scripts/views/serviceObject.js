/* global Hktdc, Backbone, JST, $, _, utils */
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
    editServiceHandler: function(ev) {
      //console.log('#lastnosub blur; ', $(ev.target).val().trim() );
      //console.log($(ev.target).val().trim());
      if ($(ev.target).val().trim().length > 0) {
        this.model.set({
          Notes: $('textarea', this.el).val().trim()
        });
        this.requestFormModel.toJSON().selectedServiceCollection.add(this.model);
        //console.log('add service request, new collection: ', this.requestFormModel.toJSON().selectedServiceCollection.toJSON());

      }
	  //done by gaurav
	  //else {
        //this.requestFormModel.toJSON().selectedServiceCollection.remove(this.model);
      //}
      // console.log(this.requestFormModel.selectedServiceCollection.toJSON());
    },
    initialize: function(props) {
      _.extend(this, props);
    },
    render: function() {
      // console.log(this.model.toJSON());
      this.model.set({
        readonly: (this.requestFormModel.toJSON().mode === 'read')
      });
      var tmpl = this.template({ serviceObject: this.model.toJSON()});
      this.$el.html(tmpl);
    }
  });

  Hktdc.Views.ServiceObjectSelect = Backbone.View.extend({
    template: JST['app/scripts/templates/serviceObjectSelect.ejs'],
    tagName: 'li',
    className: 'anclevel3',
    events: {
      'click': 'selectServiceHandler'
    },

    selectServiceHandler: function(ev) {		
      /* save the selected request to the upper level so that can delete request form collection by selected model */
      // this.serviceRequestModel.set();
      //console.log('selectServiceHandler');

      this.serviceRequestModel.set({
        selectedRequestModel: this.model,
        selectedServiceObject: true
      });
      var data = {
        Notes: ''
      };
      if (!this.model.toJSON().ServiceGUID) {
        data.ServiceGUID = utils.makeId(10);
		  }
      this.model.set(data);

      //get and remove the previous selection logic Starts..
	    var _existSelServiceId=null;
      if($(ev.target))
        {
          _existSelServiceId=$(ev.target).closest( "ul" ).attr("prevSelectedGuid");
        }
      if(_existSelServiceId && _existSelServiceId!=null && _existSelServiceId.length>0)
      {
	      	var removeTarget=null;
        this.requestFormModel.toJSON().selectedServiceCollection.each(function(selectedModel) {
          if (selectedModel.toJSON().ServiceGUID === _existSelServiceId) {
			        removeTarget = selectedModel;
          }
        });
        if(removeTarget){
          removeTarget.set({
          IsServiceChanged:1
          });
		  //console.log('call to removeTarget after:-',removeTarget.toJSON());
          this.requestFormModel.toJSON().selectedServiceCollection.remove(removeTarget);
        }
      }
      //get and remove the previous selection logic ends...  

      this.requestFormModel.toJSON().selectedServiceCollection.remove(this.serviceRequestModel.toJSON().ServiceGUID);
      this.requestFormModel.toJSON().selectedServiceCollection.add(this.model);
      this.serviceRequestModel.trigger('changeServiceSelect', this.model);
      
      //set the previous selection..
	    $(ev.target).closest( "ul" ).attr("prevSelectedGuid",this.model.toJSON().ServiceGUID);

      //console.log('selectServiceHandler ends');
      // console.log(this.requestFormModel.selectedServiceCollection.toJSON());
    },

    initialize: function(props) {
      var self = this;
      _.extend(this, props);
	  //console.log('initialize notes');
      this.serviceRequestModel.on('change:Notes', function(a, newNotes) {
        /* the requestFormModel.selectedServiceCollection will auto update */
		 //console.log('initialize newNotes',newNotes)
         self.model.set({ Notes: newNotes });
      });
    },

    render: function() {
      this.model.set({
        readonly: (this.requestFormModel.toJSON().mode === 'read')
      });
      var tmpl = this.template({ serviceObject: this.model.toJSON()});
      this.$el.html(tmpl);
    }
  });

  Hktdc.Views.ServiceObjectList = Backbone.View.extend({

    tagName: function() {
      var col = this.collection.toJSON();
      return (col[0] && (String(col[0].ControlFlag) === '1')) ? 'ul' : 'div';
    },

    className: function() {
      var col = this.collection.toJSON();
      return (col[0] && (String(col[0].ControlFlag) === '1')) ? 'dropdown-menu' : 'text-request-object';
    },

    initialize: function(props) {
      _.extend(this, props);
      _.bindAll(this, 'renderServiceObjectItem');
    },

    renderServiceObjectItem: function(model) {
      // console.log(model.toJSON());
      var self = this;
      model.set({
        serviceTypeName: this.serviceRequestModel.toJSON().serviceTypeName
      });
      if (String(model.toJSON().ControlFlag) === '1') {
        var serviceObjectItemView = new Hktdc.Views.ServiceObjectSelect({
          model: model,
          requestFormModel: this.requestFormModel,
          serviceRequestModel: this.serviceRequestModel
        });
        serviceObjectItemView.render();
        $(this.el).append(serviceObjectItemView.el);
      } else {
        var objNames = (model.toJSON().Name) ? model.toJSON().Name.split('#*#') : '';
        var objValues = (model.toJSON().SValue) ? model.toJSON().SValue.split('#*#') : '';
        // console.log();
        _.each(objNames, function(objName, idx) {
          var newModel = new Hktdc.Models.ServiceObject(_.extend(model.toJSON(), {
            Name: objName,
            SValue: objValues[idx],
            index: idx
          }));
          // console.log(newModel.toJSON());
          var serviceObjectItemView = new Hktdc.Views.ServiceObjectText({
            model: newModel,
            requestFormModel: self.requestFormModel,
            serviceRequestCollection: self.serviceRequestCollection
          });
          serviceObjectItemView.render();
          $(self.el).append(serviceObjectItemView.el);
        });
      }
    },

    render: function() {
      this.collection.each(this.renderServiceObjectItem);
    }

  });
})();