/* global Hktdc, Backbone, JST, $, _ */

Hktdc.Views = Hktdc.Views || {};

(function() {
  'use strict';

  Hktdc.Views.Attachment = Backbone.View.extend({

    template: JST['app/scripts/templates/attachment.ejs'],

    tagName: 'tr',
    // tagName: function(mode) {
    //   console.log('tagname', mode);
    //   if (mode === 'new') {
    //     return 'div';
    //   } else {
    //     return 'tr';
    //   }
    // },
    className: 'filename-container',

    events: {
      'click .deletefile': 'clickDeleteFileBtn'
    },

    clickDeleteFileBtn: function(e) {
      // console.log(this.parentCollection.toJSON());
      // console.log(this.model.toJSON().name);
      // console.log(this.parentCollection.get(this.model.toJSON().name));
      this.parentCollection.remove(this.model);
    },

    initialize: function(props) {
      this.requestFormModel = props.requestFormModel;
      this.parentCollection = props.parentCollection;
      // console.log('initi', props.requestFormModel);
      // this.listenTo(this.model, 'change', this.render);
    },

    render: function() {
      // console.log(this.model.toJSON());
      this.$el.html(this.template({
        file: this.model.toJSON().file || this.model.toJSON(),
        insertMode: this.requestFormModel.toJSON().mode === 'new'
      }));
    }
  });

  Hktdc.Views.AttachmentList = Backbone.View.extend({

    template: JST['app/scripts/templates/attachmentList.ejs'],

    tagName: 'div',

    events: {
      'click #ancfilelog': 'clickToggleButton',
      'change input[type="file"]': 'onFileChange'
    },

    initialize: function(props) {
      var self = this;
      _.bindAll(this, 'renderAttachmentItem', 'clickToggleButton');
      this.requestFormModel = props.requestFormModel;
      this.requestFormModel.on('change:showFileLog', function(model, isShow) {
        if (isShow) {
          self.open();
        } else {
          self.close();
        }
      });
      this.collection.on('remove', function() {
        $('#divfilename', this.el).empty();
        self.collection.each(self.renderAttachmentItem);
        self.requestFormModel.selectedAttachmentCollection = self.collection;
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

    close: function() {
      $('.headdivfilelog', this.el).hide();
      $('#ancfilelog')
        .attr('arrow', 'glyphicon-menu-down')
        .removeClass('glyphicon glyphicon-menu-up')
        .addClass('glyphicon glyphicon-menu-down');
    },

    onFileChange: function(ev) {
      var newFiles = ev.target.files;
      // console.group('file change: ', newFiles);
      var modelArray = _.map(newFiles, function(file) {
        return new Hktdc.Models.Attachment({file: file});
      });
      // console.debug('this collection before: ', this.collection.toJSON());
      this.collection.set(modelArray);
      $('#divfilename', this.el).empty();
      this.collection.each(this.renderAttachmentItem);
      // console.debug('this collection after: ', this.collection.toJSON());
      // console.debug('requestFormModel collection before: ', this.requestFormModel.selectedAttachmentCollection.toJSON());
      this.requestFormModel.selectedAttachmentCollection.set(this.collection.toJSON());
      // console.debug('requestFormModel collection after: ', this.requestFormModel.selectedAttachmentCollection.toJSON());
      // console.groupEnd();
    },

    renderAttachmentItem: function(model) {
      var tagName;
      var appendTarget;
      if (this.requestFormModel.toJSON().mode === 'new'){
        tagName = 'div';
        appendTarget = '#divfilename';
      } else {
        tagName = 'tr';
        appendTarget = 'tbody';
      }
      var attachmentItemView = new Hktdc.Views.Attachment({
        tagName: tagName,
        model: model,
        parentCollection: this.collection,
        requestFormModel: this.requestFormModel
      });
      // console.log(attachmentItemView.tagName);
      attachmentItemView.render();

      $(appendTarget, this.el).append(attachmentItemView.el);
    },

    render: function() {
      var isInsert = (this.requestFormModel.toJSON().mode === 'new');
      this.$el.html(this.template({insertMode: isInsert}));
      // console.log(this.model);
      if (!isInsert) {
      //   this.bindFileChangeEvent();
      // } else {
        this.collection.each(this.renderAttachmentItem);
        $('.attachmentTable', this.el).DataTable({
          paging: false,
          searching: false,
          pageLength: false
        });
      }
    }
  });
})();
