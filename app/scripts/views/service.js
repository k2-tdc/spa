/*global Hktdc, Backbone, JST*/
/**
 *
 * service top level
 *
 */
Hktdc.Views = Hktdc.Views || {};

(function () {
  'use strict';

  Hktdc.Views.Service = Backbone.View.extend({

    template: JST['app/scripts/templates/service.ejs'],

    el: '#service',

    initialize: function () {
      // this.listenTo(this.model, 'change', this.render);
      // var that = this;
      /* 1) render level1 */
      this.render();

      /* 2) initialize level2 service : set model and view */
      // var level1 = this.model.toJSON();
      // var level2Collection = new Hktdc.Collection.ServiceLevel2(this.model.Level2);
      // try {
      //   // TODO: clear the container first?
      //   level2Collection.each(function(level2Model) {
      //     var level2View = new Hktdc.Views.ServiceLevel2({
      //       model: level2Model
      //     });
      //   });
      // } catch (e) {
      //   // TODO: pop up alert dialog
      //   console.error('render level 2 error');
      // }
      // this.attachClickEvent();
    },

    events: {
      'click .toplevel': 'onCheckboxChange',
      'click .group-header': 'onToggleCollapse'
    },
    // $('.toplevel1').click(function() {
    // });

    onCheckboxChange: function(ev){
      console.log($(ev.currentTarget).is(':checked'));
      if ($(ev.currentTarget).is(":checked")) {
        this.open();
      } else {
        this.close();
      }
    },

    onToggleCollapse: function(ev) {
      if ($(ev.currentTarget).hasClass('glyphicon-menu-down')) {
          $('div.group-details1').show();
          $(ev.currentTarget).removeClass('glyphicon-menu-down').addClass('glyphicon-menu-up');
      } else {
          $('div.group-details1').hide();
          $(ev.currentTarget).removeClass('glyphicon-menu-up').addClass('glyphicon-menu-down');
      }
    },

    close: function(){
      $('div.group-details1').hide();
      $('div.group-header1 .glyphicon').removeClass('glyphicon-menu-up').addClass('glyphicon-menu-down');
      $('div.group-header1').parent().removeClass('panel-active');
    },

    open: function(){
      $('div.group-details1').show();
      $('div.group-header1 .glyphicon').removeClass('glyphicon-menu-down').addClass('glyphicon-menu-up');
      $('div.group-header1').parent().addClass('panel-active');
    },
    // //General Support/ Stand-by Services div hide and  show when clicked check box
    // $('#toplevel2').change(function() {
    //     if ($(this).is(":checked")) {
    //         $('div.group-details2').show();
    //         $('div.group-header2 .glyphicon').removeClass('glyphicon-menu-down').addClass('glyphicon-menu-up')
    //         $('div.group-header2').parent().addClass('panel-active');
    //     } else {
    //         $('div.group-details2').hide();
    //         $('div.group-header2 .glyphicon').removeClass('glyphicon-menu-up').addClass('glyphicon-menu-down')
    //         $('div.group-header2').parent().removeClass('panel-active');
    //     }
    // });
    //
    // $('div.group-header2 .glyphicon').click(function() {
    //     if ($(this).hasClass('glyphicon-menu-down')) {
    //         $('div.group-details2').show();
    //         $(this).removeClass('glyphicon-menu-down').addClass('glyphicon-menu-up');
    //     } else {
    //         $('div.group-details2').hide();
    //         $(this).removeClass('glyphicon-menu-up').addClass('glyphicon-menu-down');
    //     }
    // });

    render: function () {
      console.log(this.$el);
      this.$el.html(this.template({ service: this.model.toJSON() }));
    }

  });

})();
