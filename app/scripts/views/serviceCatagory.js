/* global Hktdc, Backbone, JST, $, _ */

/**
 * This file contains:
 * = level 1
 * ServiceCatagoryList
 * ServiceCatagoryItem
 */

Hktdc.Views = Hktdc.Views || {};

(function() {
  'use strict';

  Hktdc.Views.ServiceCatagory = Backbone.View.extend({

    template: JST['app/scripts/templates/serviceCatagory.ejs'],

    className: 'service-catagory-item',

    tag: 'div',

    initialize: function(props) {
      var self = this;
      _.extend(this, props);
      this.model.on('change:checked', function(model, newValue) {
        $('input[type="checkbox"]', self.el).prop('checked', newValue);
      });
      this.model.on('change:open', function(model, newValue) {
        if (newValue) {
          self.open();
        } else {
          self.close();
        }
      });
      this.model.on('change:selectedServiceCount', function(model, newCount) {
        $('.selectedServiceCount', self.el).html('(' + newCount + ')');
      });
    },

    events: {
      'click input[type="checkbox"]': 'onCheckboxClick',
      'click .toggleBtn': 'onToggleButtonClick'
    },

    onCheckboxClick: function(ev) {
      console.log('onCheckboxClick');
      this.model.set({
        checked: $(ev.currentTarget).is(':checked'),
        open: $(ev.currentTarget).is(':checked')
      });
    },

    onToggleButtonClick: function(ev) {
      this.model.set({'checked': true});
      if (this.model.get('open')) {
        this.model.set({'open': false});
        // this.close();
      } else {
        this.model.set({'open': true});
      }
    },

    close: function() {
      $('div.group-header .glyphicon', this.el)
        .removeClass('glyphicon-menu-up')
        .addClass('glyphicon-menu-down');
      $('div.group-details', this.el).hide();
      $('div.group-header', this.el).parent().removeClass('panel-active');
      // this.model.set('open', false);
    },

    open: function() {
      $('div.group-header .glyphicon', this.el)
        .removeClass('glyphicon-menu-down')
        .addClass('glyphicon-menu-up');
      $('div.group-details', this.el).show();
      $('div.group-header', this.el).parent().addClass('panel-active');
      // this.model.set('open', true);
    },

    renderServiceTypeList: function() {
      /* initialize level2 service type */
      var Catagory = this.model.toJSON();
      var serviceTypeCollection = new Hktdc.Collections.ServiceType(Catagory.Level2);
      // console.log('Catagory.Name: ', Catagory.Name);
      try {
        // console.log('selectedServiceCatTree', selectedServiceCatagoryTree);
        var serviceTypeListView = new Hktdc.Views.ServiceTypeList({
          collection: serviceTypeCollection,
          selectedServiceCatagoryTree: this.selectedServiceCatagoryTree,
          requestFormModel: this.requestFormModel,
          serviceCatagoryModel: this.model
        });
        serviceTypeListView.render();
        setTimeout(function() {
          /* quick hack to let parent render on the window DOM first */
          $('.service-type-container', this.el).html(serviceTypeListView.el);
        }.bind(this));
      } catch (e) {
        // TODO: pop up alert dialog
        console.error('render level 2 error', e);
      }
    },

    render: function($container) {
      var self = this;
      var Catagory = this.model.toJSON();
      var selectedServiceCount = 0;

      /* Tree only present when edit/read mode */

      this.selectedServiceCatagoryTree = _.find(this.requestFormModel.toJSON().selectedServiceTree, function(selectedCat) {
        // console.log('selectedCat.Name: ', selectedCat.Name);
        return Catagory.Name === selectedCat.Name;
      });

      if (this.selectedServiceCatagoryTree) {
        selectedServiceCount = _.reduce(this.selectedServiceCatagoryTree.Level2, function(memo, level2Obj) {
          return memo + level2Obj.Level3.length;
        }, 0);
      }

      this.model.set({selectedServiceCount: selectedServiceCount});

      // this.model.set({selectedServiceCount: this.selectedServiceCatagoryTree.toJSON().selectedServiceCollection.toJSON().length})
      var tmpl = this.template({
        serviceCatagory: this.model.toJSON()
      });

      $(this.el).append(tmpl);

      /* only 'edit' and 'read' will open by default */
      if (this.requestFormModel.toJSON().mode === 'new') {
        self.model.set({ open: false, checked: false });
      } else {
        if (this.selectedServiceCatagoryTree) {
          self.model.set({ open: true, checked: true });
        } else {
          self.model.set({ open: false, checked: false });
        }
      }
      this.renderServiceTypeList();
    }

  });

  Hktdc.Views.ServiceCatagoryList = Backbone.View.extend({
    tagName: 'div',

    initialize: function(props) {
      // this.parent
      /* important to use bindAll as directly use this.renderCatagoryItem in render */
      _.extend(this, props);
      _.bindAll(this, 'renderCatagoryItem');
    },

    renderCatagoryItem: function(model) {
      var serviceCatagoryItemView = new Hktdc.Views.ServiceCatagory({
        model: model,
        requestFormModel: this.requestFormModel
      });
      serviceCatagoryItemView.render();
      $(this.el).append(serviceCatagoryItemView.el);
    },

    render: function() {
      // var self = this;
      // this.collection.each(function(model){
      //   self.renderCatagoryItem(model);
      // });
      this.collection.each(this.renderCatagoryItem);
    }

  });
})();
