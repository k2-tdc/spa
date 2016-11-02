/*global Hktdc, Backbone, JST*/

/**
 * This file contains:
 * = level 1
 * ServiceCatagoryList
 * ServiceCatagoryItem
 */

 Hktdc.Views = Hktdc.Views || {};

(function () {
  'use strict';

  Hktdc.Views.ServiceCatagory = Backbone.View.extend({

    template: JST['app/scripts/templates/serviceCatagory.ejs'],

    className: 'service-catagory-item',

    tag: 'div',

    initialize: function (props) {
      this.requestFormModel = props.requestFormModel;
    },

    events: {
      'click .toplevelCheckBox': 'onCheckboxChange',
      'click .group-header': 'onToggleCollapse'
    },

    onCheckboxChange: function(ev){
      ev.stopPropagation();
      if ($(ev.currentTarget).is(":checked")) {
        this.open();
      } else {
        this.close();
      }
    },

    onToggleCollapse: function(ev) {
      if (this.model.get('open')) {
        this.close();
      } else {
        this.open();
      }
    },

    close: function(){
      $('div.group-header .glyphicon', this.el)
        .removeClass('glyphicon-menu-up')
        .addClass('glyphicon-menu-down');
      $('div.group-details', this.el).hide();
      $('div.group-header', this.el).parent().removeClass('panel-active');
      this.model.set('open', false);
    },

    open: function(){
      $('div.group-header .glyphicon', this.el)
        .removeClass('glyphicon-menu-down')
        .addClass('glyphicon-menu-up');
      $('div.group-details', this.el).show();
      $('div.group-header', this.el).parent().addClass('panel-active');
      this.model.set('open', true);
    },

    renderServiceTypeList: function(){
      /* initialize level2 service type */
      var Catagory = this.model.toJSON();
      var serviceTypeCollection = new Hktdc.Collections.ServiceType(Catagory.Level2);
      try {
        var serviceTypeListView = new Hktdc.Views.ServiceTypeList({
          collection: serviceTypeCollection,
          requestFormModel: this.requestFormModel
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

    render: function ($container) {
      var tmpl = this.template({
        serviceCatagory: this.model.toJSON()
      });

      $(this.el).append(tmpl);
      this.renderServiceTypeList();
    }

  });

  Hktdc.Views.ServiceCatagoryList = Backbone.View.extend({
    tagName: 'div',

    initialize: function(props) {
      // this.parent
      this.requestFormModel = props.requestFormModel;
      /* important to use bindAll as directly use this.renderCatagoryItem in render */
      _.bindAll(this, "renderCatagoryItem");

    },

    renderCatagoryItem: function(model){
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

    },
  })

})();
