/*global Hktdc, Backbone, JST*/

Hktdc.Views = Hktdc.Views || {};

(function () {
  'use strict';

  Hktdc.Views.Attachment = Backbone.View.extend({

    template: JST['app/scripts/templates/attachment.ejs'],

    tagName: 'tr',

    events: {},

    initialize: function () {
      // this.listenTo(this.model, 'change', this.render);
    },

    render: function () {
      console.log(this.model.toJSON());
      this.$el.html(this.template({file: this.model.toJSON()}));
    }
  });

  Hktdc.Views.AttachmentList = Backbone.View.extend({

    template: JST['app/scripts/templates/attachmentList.ejs'],

    tagName: 'div',

    events: {
      'click #ancfilelog': 'clickToggleButton'
    },

    initialize: function(props) {
      var self = this;
      _.bindAll(this, 'renderWrokflowLogItem', 'clickToggleButton');
      this.requestFormModel = props.requestFormModel;
      this.requestFormModel.on('change:showFileLog', function(model, isShow) {
        if (isShow) {
          self.open();
        } else {
          self.close();
        }
      });
    },

    clickToggleButton: function() {
      this.requestFormModel.set({ showFileLog: !this.requestFormModel.toJSON().showFileLog });
    },

    open: function() {
      $('.headdivfilelog', this.el).show();

      $('#ancfilelog', this.el)
        .removeClass('glyphicon glyphicon-menu-down')
        .addClass('glyphicon glyphicon-menu-up')
        .attr('arrow', 'glyphicon-menu-up');
    },

    close: function(){
      $('.headdivfilelog', this.el).hide();
      $('#ancfilelog')
        .attr('arrow', 'glyphicon-menu-down')
        .removeClass('glyphicon glyphicon-menu-up')
        .addClass('glyphicon glyphicon-menu-down');
    },

    renderWrokflowLogItem: function(model) {
      var attachmentItemView = new Hktdc.Views.Attachment({
        model: model
      });
      attachmentItemView.render();
      $('tbody', this.el).append(attachmentItemView.el);
    },

    render: function () {
      var isInsert = false;
      this.$el.html(this.template({insertMode: isInsert}));
      // console.log(this.model);
      this.collection.each(this.renderWrokflowLogItem)
      $('.attachmentTable', this.el).DataTable({
        paging: false,
        searching: false,
        pageLength: false
      });

    }

  });

})();
