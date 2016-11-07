/* global Hktdc, Backbone, JST, $, _, Blob, XMLHttpRequest, BlobBuilder */

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
      'click .deletefile': 'clickDeleteFileBtn',
      'click .filedownload': 'clickDownloadFile'
    },

    clickDeleteFileBtn: function(e) {
      // console.log(this.parentCollection.toJSON());
      // console.log(this.model.toJSON().name);
      // console.log(this.parentCollection.get(this.model.toJSON().name));
      this.parentCollection.remove(this.model);
    },

    clickDownloadFile: function() {
      // console.log(this.model.toJSON());
      if (this.requestFormModel.toJSON().mode === 'new') {
        return false;
      }
      var filename = this.model.toJSON().FileName;
      var fGID = this.model.toJSON().AttachmentGUID;
      var fID = this.requestFormModel.toJSON().ReferenceID;
      var url = Hktdc.Config.apiURL + '/DownloadFile?fileName=' + filename + '&FormID=' + fID + '&AttachmentGUID=' + fGID;
      // console.log(url);
      this.downloadFile(url, filename);
    },

    initialize: function(props) {
      this.requestFormModel = props.requestFormModel;
      this.parentCollection = props.parentCollection;
      // console.log('initi', props.requestFormModel);
      // this.listenTo(this.model, 'change', this.render);
    },

    downloadFile: function(url, filename) {
      var xhr = new XMLHttpRequest();

      xhr.open('GET', url, true);
      xhr.setRequestHeader('Authorization', 'Bearer ' + Hktdc.Config.accessToken);
      xhr.responseType = 'blob';
      xhr.onreadystatechange = function() {
        var anchorLink;
        if (xhr.readyState === 4 && xhr.status === 200) {
          if (typeof window.navigator.msSaveBlob !== 'undefined') {
            var blob;
            try {
              blob = new Blob([xhr.response], {
                type: 'application/octet-stream'
              });
            } catch (e) {
              // Old browser, need to use blob builder
              window.BlobBuilder = window.BlobBuilder ||
                                   window.WebKitBlobBuilder ||
                                   window.MozBlobBuilder ||
                                   window.MSBlobBuilder;
              if (window.BlobBuilder) {
                var bb = new BlobBuilder();
                bb.append(xhr.response);
                blob = bb.getBlob('application/octet-stream');
              }
            }
            if (blob) {
              window.navigator.msSaveBlob(blob, filename);
              // saveAs(blob, filename);
            }
            // if (typeof cb === 'function') {
            //   cb();
            // }
          } else {
            // Trick for making downloadable link
            anchorLink = document.createElement('a');
            anchorLink.href = window.URL.createObjectURL(xhr.response);
            // Give filename you wish to download
            anchorLink.download = filename;
            anchorLink.style.display = 'none';
            document.body.appendChild(anchorLink);
            anchorLink.click();
          }
        }
      };
      xhr.send(null);
    },

    render: function() {
      console.log(this.model.toJSON());
      this.$el.html(this.template({
        file: this.model.toJSON().file || this.model.toJSON(),
        insertMode: this.requestFormModel.toJSON().mode !== 'read'
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
        self.requestFormModel.set({selectedAttachmentCollection: self.collection});
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
      // console.debug('requestFormModel collection before: ', this.requestFormModel.toJSON().selectedAttachmentCollection.toJSON());
      this.requestFormModel.toJSON().selectedAttachmentCollection.set(this.collection.toJSON());
      // console.debug('requestFormModel collection after: ', this.requestFormModel.toJSON().selectedAttachmentCollection.toJSON());
      // console.groupEnd();
    },

    renderAttachmentItem: function(model) {
      var tagName;
      var appendTarget;
      if (this.requestFormModel.toJSON().mode !== 'read') {
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
      var isInsert = (this.requestFormModel.toJSON().mode !== 'read');
      this.$el.html(this.template({ insertMode: isInsert }));
      // console.log(this.collection.toJSON());
      this.collection.each(this.renderAttachmentItem);
      if (!isInsert) {
      //   this.bindFileChangeEvent();
      // } else {
        $('.attachmentTable', this.el).DataTable({
          paging: false,
          searching: false,
          pageLength: false
        });
      }
    }
  });
})();
