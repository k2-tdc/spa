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
      var fID = this.requestFormModel.toJSON().FormID;
      var url = Hktdc.Config.apiURL + '/DownloadFile?fileName=' + filename + '&FormID=' + fID + '&AttachmentGUID=' + fGID;
      // console.log(url);
      this.downloadFile(url, filename);
    },

    initialize: function(props) {
      _.extend(this, props);
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
      // console.log(this.model.toJSON());
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
      _.extend(this, props);
      this.requestFormModel.on('change:showFileLog', function(model, isShow) {
        if (isShow) {
          self.open();
        } else {
          self.close();
        }
      });
      this.collection.on('remove', function(model, collection, options) {
        console.log('on remove file collectin', model.toJSON());
        $('#divfilename', self.el).empty();
        self.collection.each(self.renderAttachmentItem);
        self.requestFormModel.set({
          selectedAttachmentCollection: self.collection
        });
        // console.log(model.toJSON());
        if (model.toJSON().AttachmentGUID) {
          self.requestFormModel.toJSON().deleteAttachmentIdArray.push(model.toJSON().AttachmentGUID);
          // console.log(self.requestFormModel.toJSON().deleteAttachmentIdArray);
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

    close: function() {
      $('.headdivfilelog', this.el).hide();
      $('#ancfilelog')
        .attr('arrow', 'glyphicon-menu-down')
        .removeClass('glyphicon glyphicon-menu-up')
        .addClass('glyphicon glyphicon-menu-down');
    },

    onFileChange: function(ev) {
      var newFiles = ev.target.files;
      // console.log('file change: ', newFiles);
      var validateFilesObj = this.doValidateFiles(newFiles);
      var self = this;
      if (validateFilesObj.valid) {
        _.each(newFiles, function(file) {
          self.collection.add(new Hktdc.Models.Attachment({
            file: file,
            FileName: file.name
          }));
        });
        // console.debug('this collection before: ', this.collection.toJSON());
        $('#divfilename', self.el).empty();
        // console.log($('#divfilename', this.el));
        this.collection.each(self.renderAttachmentItem);
        // console.debug('this collection after: ', this.collection.toJSON());
        // console.debug('requestFormModel collection before: ', this.requestFormModel.toJSON().selectedAttachmentCollection.toJSON());
        this.requestFormModel.toJSON().selectedAttachmentCollection.set(this.collection.toJSON());
        // console.debug('requestFormModel collection after: ', this.requestFormModel.toJSON().selectedAttachmentCollection.toJSON());
        // console.groupEnd();
      } else {
        Hktdc.Dispatcher.trigger('openAlert', {
          message: validateFilesObj.errorMessages.join(',<br />'),
          type: 'error',
          title: 'Error'
        });
      }
    },

    doValidateFiles: function(files) {
      var maxSizeRule = _.find(this.rules, function(rule) {
        return rule.Key === 'MaxSize';
      });
      var fileTypeRules = _.find(this.rules, function(rule) {
        return rule.Key === 'FileType';
      }).Value.split(';');
      var base;
      switch (maxSizeRule.Remark.toUpperCase()) {
        case 'MB':
          base = 1024 * 1024;
          break;
        case 'KB':
          base = 1024;
          break;
        default:
          /* Bytes */
          base = 1;
      }
      var maxSizeInByte = base * maxSizeRule.Value;
      var valid = true;
      var errMsgArr = [];
      _.each(files, function(file) {
        if (file.size > maxSizeInByte) {
          valid = false;
          errMsgArr.push('file size must <= ' + maxSizeRule.Value + maxSizeRule.Remark);
        }
        if (!_.contains(fileTypeRules, file.type)) {
          valid = false;
          errMsgArr.push('file type not accepted');
        }
      });

      return {valid: valid, errorMessages: errMsgArr};
    },

    renderAttachmentItem: function(model) {
      // console.log(model.toJSON());
      var tagName;
      var appendTarget;
      var self = this;
      model.set({
        UploadedDate: moment(model.toJSON().UploadedDate).format('DD MMM YYYY')
      });
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
      // console.log($(appendTarget, this.el));
      // console.log(attachmentItemView.el);
      setTimeout(function() {
        $(appendTarget, self.el).append(attachmentItemView.el);
      });
    },

    render: function() {
      var isInsert = (this.requestFormModel.toJSON().mode !== 'read');
      this.$el.html(this.template({ insertMode: isInsert }));
      // console.log(this.collection.toJSON());
      this.collection.each(this.renderAttachmentItem);
      if (this.requestFormModel.toJSON().showFileLog) {
        this.open();
      }
      // if (!isInsert) {
      //   this.bindFileChangeEvent();
      // } else {
        // $('.attachmentTable', this.el).DataTable({
        //   paging: false,
        //   searching: false,
        //   pageLength: false
        // });
      // }
    }
  });
})();
