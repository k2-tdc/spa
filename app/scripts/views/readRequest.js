/* global Hktdc, Backbone, JST, $, utils, Q */

Hktdc.Views = Hktdc.Views || {};

(function() {
  'use strict';

  Hktdc.Views.ReadRequest = Backbone.View.extend({

    template: JST['app/scripts/templates/readRequest.ejs'],

    tagName: 'div',

    id: '',

    className: '',

    events: {},

    initialize: function() {
      /* mode === read */
      console.debug('This is << READ >> mode');
      var self = this;

      self.setCommentBlock();
      self.render();

      this.model.set({
        showFileLog: true
      });

      // Q.all([
      self.loadColleague()
      // ])
        .then(function(colleagueCollection) {
          self.colleagueCollection = colleagueCollection;
          // console.log(self.model.toJSON().RequestList);
          setTimeout(function() {
            self.renderAttachment(self.model.toJSON().Attachments);
            self.renderSelectedCCView(self.model.toJSON().RequestCC);
            self.renderWorkflowLog(self.model.toJSON().ProcessLog);
            self.renderServiceCatagory(new Hktdc.Collections.ServiceCatagory(self.model.toJSON().RequestList));
            self.renderButtons();
          });
        })
        .fail(function(e) {
          console.error(e);
        });
    },

    loadColleague: function() {
      var deferred = Q.defer();
      var colleagueCollection = new Hktdc.Collections.Colleague();
      colleagueCollection.fetch({
        beforeSend: utils.setAuthHeader,
        success: function() {
          deferred.resolve(colleagueCollection);
        },
        error: function(err) {
          deferred.reject(err);
        }
      });

      return deferred.promise;
    },

    setCommentBlock: function() {
      var me = Hktdc.Config.userID;
      var preparer = this.model.toJSON().PreparerUserID;
      if (
        (
          (this.model.toJSON().FormStatus && this.model.toJSON().FormStatus !== 'Draft') ||
          (this.model.toJSON().FormStatus === 'Approval' && me !== preparer)
        ) &&
        (this.model.toJSON().actions)
      ) {
        this.model.set({
          showComment: true
        });
      }
    },

    renderButtons: function() {
      var buttonView = new Hktdc.Views.Button({
        model: new Hktdc.Models.Button(),
        requestFormModel: this.model
      });
      buttonView.renderButtonHandler();
      var toUserView = new Hktdc.Views.ToUserList({
        collection: this.colleagueCollection,
        parentModel: this.model,
        selectFieldName: 'Forward_To_ID'
      });
      $('.forwardToUser', buttonView.el).html(toUserView.el);
      // console.log(buttonView.el);
      $('.buttons-container', this.el).html(buttonView.el);
    },

    renderSelectedCCView: function(input) {
      this.model.set({
        selectedCCCollection: new Hktdc.Collections.SelectedCC(input)
      });
      $('.contact-group', this.el).append(new Hktdc.Views.SelectedCCList({
        collection: this.model.toJSON().selectedCCCollection,
        requestFormModel: this.model
      }).el);
    },

    renderWorkflowLog: function(workflowLogList) {
      var workflowLogCollections = new Hktdc.Collections.WorkflowLog(workflowLogList);
      var workflowLogListView = new Hktdc.Views.WorkflowLogList({
        collection: workflowLogCollections,
        requestFormModel: this.model
      });
      workflowLogListView.render();
      $('#workflowlog-container', this.el).html(workflowLogListView.el);
    },

    renderAttachment: function(attachmentList) {
      var attachmentCollections = new Hktdc.Collections.Attachment(attachmentList);
      var attachmentListView = new Hktdc.Views.AttachmentList({
        collection: attachmentCollections,
        requestFormModel: this.model
      });
      attachmentListView.render();
      $('#attachment-container').html(attachmentListView.el);
    },

    renderServiceCatagory: function(serviceCatagoryCollections) {
      var serviceCatagoryListView = new Hktdc.Views.ServiceCatagoryList({
        collection: serviceCatagoryCollections,
        requestFormModel: this.model
      });
      serviceCatagoryListView.render();
      $('#service-container').html(serviceCatagoryListView.el);
    },

    render: function() {
      this.$el.html(this.template({
        request: this.model.toJSON()
      }));
    }

  });
})();
