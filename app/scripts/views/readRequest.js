/* global Hktdc, Backbone, JST, $, utils, Q, moment, _, dialogMessage, validateMessage */

Hktdc.Views = Hktdc.Views || {};

(function() {
  'use strict';

  Hktdc.Views.ReadRequest = Backbone.View.extend({

    template: JST['app/scripts/templates/readRequest.ejs'],

    tagName: 'div',

    events: {
      'blur #txtRemark': 'updateNewRequestModel',
      'click #btnBackDraft': 'clickBackBtnHandlerDraft'
    },

    initialize: function() {
      /* mode === read */
      console.debug('This is << READ >> mode');
      var self = this;
      if (self.model.toJSON().EDeliveryDate && moment(self.model.toJSON().EDeliveryDate, 'YYYYMMDD').isValid()) {
        self.model.set({
          EDeliveryDate: moment(self.model.toJSON().EDeliveryDate, 'YYYYMMDD').format('DD MMM YYYY')
        });
      }

      self.setCommentBlock();

      if (_.find(self.model.toJSON().actions, function(action) {
        return action.Action === 'Forward';
      })) {
        self.model.set({
          showForwardTo: true
        });
      }
      self.render();

      if (self.model.toJSON().showForwardTo) {
        self.loadForwardUser()
          .then(function(forwardUserCollection) {
            self.forwardUserCollection = forwardUserCollection;
            // console.log(self.model.toJSON().RequestList);
            setTimeout(function() {
              self.renderForwardUserList();
              self.renderButtons();
              self.renderAttachment(self.model.toJSON().Attachments);
              self.renderSelectedCCView(self.model.toJSON().RequestCC);
              self.renderWorkflowLog(self.model.toJSON().ProcessLog);
              self.renderServiceCatagory(new Hktdc.Collections.ServiceCatagory(self.model.toJSON().RequestList));
            });
          })
          .fail(function(e) {
            console.error(e);
          });
      } else {
        setTimeout(function() {
          self.renderButtons();
          self.renderAttachment(self.model.toJSON().Attachments);
          self.renderSelectedCCView(self.model.toJSON().RequestCC);
          self.renderWorkflowLog(self.model.toJSON().ProcessLog);
          self.renderServiceCatagory(new Hktdc.Collections.ServiceCatagory(self.model.toJSON().RequestList));
        });
      }
    },

    render: function() {
      this.$el.html(this.template({
        request: this.model.toJSON()
      }));
    },

    updateNewRequestModel: function(ev) {
      var targetField = $(ev.target).attr('field');
      var updateObject = {};
      updateObject[targetField] = $(ev.target).val();
      this.model.set(updateObject);

      utils.toggleInvalidMessage(this.el, 'Remark', validateMessage.required, false);
      // double set is to prevent invalid value bypass the set model process
      // because if saved the valid model, then set the invalid model will not success and the model still in valid state
      // this.model.set(updateObject, {validate: true, field: targetField});
      // this.checkRemark(false);
    },

    //handling when user clicks on back button
    clickBackBtnHandlerDraft: function(ev) {
      var self = this;
      sessionStorage.setItem("isBackNavigation","true");
      ev.preventDefault();
      window.history.back();
    },
    //clickBackBtnHandler function ends

    loadForwardUser: function() {
      var deferred = Q.defer();
      var forwardUserCollection = new Hktdc.Collections.ForwardUser();
      forwardUserCollection.url = forwardUserCollection.url(this.model.toJSON().ApplicantUserID);
      var doFetch = function() {
        forwardUserCollection.fetch({
          beforeSend: utils.setAuthHeader,
          success: function() {
            deferred.resolve(forwardUserCollection);
          },
          error: function(collection, response) {
            utils.apiErrorHandling(response, {
              // 401: doFetch,
              unknownMessage: dialogMessage.component.forwardUserList.error
            });
          }
        });
      };
      doFetch();

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
          showRemark: true
        });
      }
    },

    renderForwardUserList: function() {
      var self = this;
      var toUserView = new Hktdc.Views.ToUserList({
        collection: this.forwardUserCollection,
        attributes: { field: 'Forward_To_ID', name: 'Forward_To_ID' },
        parentModel: this.model,
        selectFieldName: 'Forward_To_ID',
        onSelected: function() {
          utils.toggleInvalidMessage(self.el, 'Forward_To_ID', validateMessage.required, false);
        }
      });
      // $('.forwardToUser', buttonView.el).html(toUserView.el);
      $('.forwardToUser', this.el).html(toUserView.el);
    },

    renderButtons: function() {
      var self = this;
      var buttonModel = new Hktdc.Models.Button();
      var buttonView = new Hktdc.Views.Button({
        model: buttonModel,
        requestFormModel: self.model
      });
      self.listenTo(buttonModel, 'checkRemark', function(successCallback) {
        utils.toggleInvalidMessage(self.el, 'Remark', validateMessage.required, false);
        utils.toggleInvalidMessage(self.el, 'Forward_To_ID', validateMessage.required, false);

        self.checkRemark(true, successCallback);
      });
      self.listenTo(buttonModel, 'checkForward', function(successCallback) {
        utils.toggleInvalidMessage(self.el, 'Remark', validateMessage.required, false);
        utils.toggleInvalidMessage(self.el, 'Forward_To_ID', validateMessage.required, false);

        self.checkForward(true, successCallback);
      });
      buttonView.renderButtonHandler();
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
      var self = this;
      var workflowLogCollections = new Hktdc.Collections.WorkflowLog(workflowLogList);
      var workflowLogListView = new Hktdc.Views.WorkflowLogList({
        collection: workflowLogCollections,
        requestFormModel: self.model
      });
      workflowLogListView.render();
      $('#workflowlog-container', this.el).html(workflowLogListView.el);
      if (String(self.model.toJSON().Permission) === '2') {
        self.model.set({
          showLog: true
        });
      }
    },

    renderAttachment: function(attachmentList) {
      if (
        (this.model.toJSON().Attachments) &&
        (this.model.toJSON().Attachments.length > 0)
      ) {
        var attachmentCollections = new Hktdc.Collections.Attachment(attachmentList);
        var attachmentListView = new Hktdc.Views.AttachmentList({
          collection: attachmentCollections,
          requestFormModel: this.model
        });
        attachmentListView.render();
        $('#attachment-container', this.el).html(attachmentListView.el);
      }
    },

    renderServiceCatagory: function(serviceCatagoryCollections) {
      var serviceCatagoryListView = new Hktdc.Views.ServiceCatagoryList({
        collection: serviceCatagoryCollections,
        requestFormModel: this.model
      });
      serviceCatagoryListView.render();
      $('#service-container').html(serviceCatagoryListView.el);
    },

    checkRemark: function(openAlert, successCallback) {
      var self = this;
      if (!self.model.toJSON().Remark) {
        if (openAlert) {
          Hktdc.Dispatcher.trigger('openAlert', {
            title: dialogTitle.warning,
            message: dialogMessage.requestForm.validation.general
          });
        }

        utils.toggleInvalidMessage(self.el, 'Remark', validateMessage.required, true);
      } else {
        utils.toggleInvalidMessage(self.el, 'Remark', validateMessage.required, false);
        if (successCallback) {
          successCallback();
        }
      }
    },

    checkForward: function(openAlert, successCallback) {
      var self = this;
      if (!self.model.toJSON().Forward_To_ID) {
        if (openAlert) {
          Hktdc.Dispatcher.trigger('openAlert', {
            title: dialogTitle.warning,
            message: dialogMessage.requestForm.validation.general
          });
        }

        utils.toggleInvalidMessage(self.el, 'Forward_To_ID', validateMessage.required, true);
      } else {
        utils.toggleInvalidMessage(self.el, 'Forward_To_ID', validateMessage.required, false);
        if (successCallback) {
          successCallback();
        }
      }
    }

  });
})();
