/* global Hktdc, Backbone, JST, $, _, utils, Q */

Hktdc.Views = Hktdc.Views || {};

(function() {
  'use strict';

  Hktdc.Views.Button = Backbone.View.extend({

    template: JST['app/scripts/templates/button.ejs'],

    tagName: 'div',

    events: {
      'click #btnsave': 'clickSaveHandler',
      'click #btnapplicant': 'clickApplicantHandler',
      'click #btnapprover': 'clickApproverHandler',
      'click #btndelete': 'clickDeleteBtnHandler',
      'click #btnrecall': 'clickRecallBtnHandler',
      'click .workflow-btn': 'clickWorkflowBtnHandler'
    },

    initialize: function(props) {
      // this.listenTo(this.model, 'change', this.render);
      _.extend(this, props);
      // this.model.on('change')
      // this.render();
    },

    clickWorkflowBtnHandler: function(ev) {
      var self = this;
      var actionName = $(ev.target).attr('workflowaction').replace('\n', '');
      var status = self.requestFormModel.toJSON().FormStatus || 'Draft';
      Hktdc.Dispatcher.trigger('openConfirm', {
        title: 'confirmation',
        message: 'Are you sure want to ' + actionName + '?',
        onConfirm: function() {
          Hktdc.Dispatcher.trigger('toggleLockButton', true);
          if (status === 'Review' && self.model.toJSON().showSave) {
            self.saveAndApprover(status, 'approver', function() {
              self.workflowHandler(ev, function() {
                console.log('workflow handler success');
                Hktdc.Dispatcher.trigger('closeConfirm');
                Hktdc.Dispatcher.trigger('toggleLockButton', false);
              }, function() {
                console.log('workflow handler error');
                Hktdc.Dispatcher.trigger('toggleLockButton', false);
              });
            });
          } else {
            self.workflowHandler(ev, function() {
              console.log('2 workflow handler success');
              Hktdc.Dispatcher.trigger('closeConfirm');
              Hktdc.Dispatcher.trigger('toggleLockButton', false);
            }, function() {
              console.log('2 workflow handler error');
              Hktdc.Dispatcher.trigger('toggleLockButton', false);
            });
          }
        }
      });
    },

    workflowHandler: function(ev, successCallback, errorCallback) {
      // console.log(Backbone.history.getFragment());
      var self = this;
      var hashWithoutQS = Backbone.history.getFragment().split('?')[0];
      var sn = hashWithoutQS.split('/')[3];
      var actionName = $(ev.target).attr('workflowaction').replace('\n', '');
      if (!actionName || !sn) {
        Hktdc.Dispatcher.trigger('openAlert', {
          message: 'Error on prepare data',
          type: 'error',
          title: 'Error'
        });
      }
      var body = {
        UserId: Hktdc.Config.userID,
        SN: sn,
        ActionName: actionName,
        Comment: this.requestFormModel.toJSON().Comment
      };
      if ($(ev.target).attr('workflowAction') === 'Forward') {
        body.Forward_To_ID = this.requestFormModel.toJSON().Forward_To_ID;
      }

      Backbone.emulateHTTP = true;
      Backbone.emulateJSON = true;
      var worklistModel = new Hktdc.Models.WorklistAction();
      worklistModel.set(body);
      worklistModel.save({}, {
        beforeSend: utils.setAuthHeader,
        success: function(action, response) {
          console.log('ok');
          self.successRedirect();
          Hktdc.Dispatcher.trigger('reloadMenu');
          // window.location.href = "alltask.html";
          if (successCallback) {
            successCallback();
          }
        },
        error: function(action, response) {
          // console.log('error on worklist action');
          Hktdc.Dispatcher.trigger('openAlert', {
            message: 'Error on workflow action',
            type: 'error',
            title: 'Error'
          });

          if (errorCallback) {
            errorCallback();
          }
        }
      });
    },

    clickSaveHandler: function() {
      var self = this;
      // if (true) {
      this.model.trigger('checkIsValid', function() {
        var status = self.requestFormModel.toJSON().FormStatus || 'Draft';
        Hktdc.Dispatcher.trigger('openConfirm', {
          title: 'confirmation',
          message: 'Confirm save the Draft?',
          onConfirm: function() {
            Hktdc.Dispatcher.trigger('toggleLockButton', true);
            self.saveAndApprover(status, '', function() {
              Hktdc.Dispatcher.trigger('toggleLockButton', false);
              Hktdc.Dispatcher.trigger('closeConfirm');
              Backbone.history.navigate('draft', {trigger: true});
            }, function() {
              Hktdc.Dispatcher.trigger('toggleLockButton', false);
            });
          }
        });
      });
    },

    clickApplicantHandler: function() {
      var self = this;
      this.model.trigger('checkIsValid', function() {
        Hktdc.Dispatcher.trigger('openConfirm', {
          title: 'Comfirmation',
          message: 'Are you sure you want to send to applicant?',
          onConfirm: function() {
            Hktdc.Dispatcher.trigger('toggleLockButton', true);
            self.saveAndApprover('Review', 'applicant', function() {
              Hktdc.Dispatcher.trigger('toggleLockButton', false);
              Hktdc.Dispatcher.trigger('closeConfirm');
              Backbone.history.navigate('', {trigger: true});
            }, function() {
              Hktdc.Dispatcher.trigger('toggleLockButton', false);
            });
          }
        });
      });
    },

    clickApproverHandler: function() {
      var self = this;
      this.model.trigger('checkIsValid', function() {
        Hktdc.Dispatcher.trigger('openConfirm', {
          title: 'confirmation',
          message: 'Are you sure you want to send to approver?',
          onConfirm: function() {
            Hktdc.Dispatcher.trigger('toggleLockButton', true);
            self.saveAndApprover('Approval', 'approver', function() {
              Hktdc.Dispatcher.trigger('toggleLockButton', false);
              Hktdc.Dispatcher.trigger('closeConfirm');
              Backbone.history.navigate('', {trigger: true});
            }, function() {
              Hktdc.Dispatcher.trigger('toggleLockButton', false);
            });
          }
        });
      });
    },

    clickDeleteBtnHandler: function() {
      var self = this;
      Hktdc.Dispatcher.trigger('openConfirm', {
        title: 'confirmation',
        message: 'Are you sure to delete the request?',
        onConfirm: function() {
          Hktdc.Dispatcher.trigger('toggleLockButton', true);

          Backbone.emulateHTTP = true;
          Backbone.emulateJSON = true;
          var refId = self.requestFormModel.toJSON().ReferenceID;
          var DeleteRequestModel = Backbone.Model.extend({
            url: Hktdc.Config.apiURL + '/DeleteDraft?ReferID=' + refId
          });
          var DeleteRequestModelInstance = new DeleteRequestModel();
          DeleteRequestModelInstance.save(null, {
            beforeSend: utils.setAuthHeader,
            success: function(model, response) {
              // console.log('success: ', a);
              // console.log(b);
              Hktdc.Dispatcher.trigger('reloadMenu');
              Hktdc.Dispatcher.trigger('toggleLockButton', false);
              Hktdc.Dispatcher.trigger('closeConfirm');

              // Backbone.history.navigate('draft', {trigger: true});
              self.successRedirect();
            },
            error: function(err) {
              Hktdc.Dispatcher.trigger('toggleLockButton', false);
              Hktdc.Dispatcher.trigger('openAlert', {
                message: 'server error on delete: ' + err,
                type: 'error',
                title: 'Error'
              });
              console.log(err);
              // console.log(b);
            }
          });
        }
      });
    },

    clickRecallBtnHandler: function() {
      var self = this;
      Hktdc.Dispatcher.trigger('openConfirm', {
        title: 'confirmation',
        message: 'Are you sure want to ' + self.requestFormModel.toJSON().FormID + '?',
        onConfirm: function() {
          Hktdc.Dispatcher.trigger('toggleLockButton', true);

          Backbone.emulateHTTP = true;
          Backbone.emulateJSON = true;
          var ActionModel = Backbone.Model.extend({
            urlRoot: Hktdc.Config.apiURL + '/RecallAction'
          });
          var action = new ActionModel();
          action.set({
            UserId: Hktdc.Config.userID,
            ProcInstID: self.requestFormModel.toJSON().ProcInstID,
            ActionName: 'Recall',
            Comment: self.requestFormModel.toJSON().Comment
          });
          action.save({}, {
            beforeSend: utils.setAuthHeader,
            success: function(action, response) {
              Hktdc.Dispatcher.trigger('openAlert', {
                message: 'Successfully Recall request',
                type: 'notice',
                title: 'Confirmation'
              });
              Hktdc.Dispatcher.trigger('toggleLockButton', false);
              Hktdc.Dispatcher.trigger('closeConfirm');
              // Backbone.history.navigate('/', {trigger: true});
              self.successRedirect();
            },
            error: function(action, response) {
              Hktdc.Dispatcher.trigger('toggleLockButton', false);
              Hktdc.Dispatcher.trigger('openAlert', {
                message: 'Error on Recall request' + JSON.stringify(response.responseText.Message, null, 2),
                type: 'error',
                title: 'Error'
              });
            }
          });
        }
      });
    },

    saveAndApprover: function(status, submitTo, redirectCallback, failCallback) {
      /* set the request object */
      var realSubmitTo = this.requestFormModel.toJSON().applicantSubmittedTo;
      var self = this;
      if (submitTo) {
        realSubmitTo = this.requestFormModel.toJSON()[submitTo + 'SubmittedTo'];
      }
      // console.log(realSubmitTo);
      var insertServiceResponse;
      Q.fcall(this.setRequestObject.bind(this, status, realSubmitTo))
        .then(function(sendRequestModel) {
          console.debug('ended set data', sendRequestModel.toJSON());
          /* send the request object */
          return this.sendXhrRequest(sendRequestModel);
        }.bind(this))

        .then(function(data) {
          insertServiceResponse = data;
          console.log('ended save request');
          /* send file */
          return this.sendAttachment(
            insertServiceResponse.FormID,
            this.requestFormModel.toJSON().selectedAttachmentCollection
          );
        }.bind(this))

        .then(function(data) {
          /* delete file */
          console.log('end send attachment');
          return this.deleteAttachment(this.requestFormModel.toJSON().deleteAttachmentIdArray);
        }.bind(this))

        .then(function() {
          console.log('end delete attachment');
          // FormID = ReferenceID and FormID
          // if (true) {
          if (insertServiceResponse.FormID) {
            // window.location.href = Hktdc.Config.projectPath + '#draft';
            if (!submitTo) {
              Hktdc.Dispatcher.trigger('openAlert', {
                message: 'Your Draft has been saved. <br /> The request ID is ' + insertServiceResponse.FormID,
                title: 'Success',
                type: 'success'
              });
            } else {
              Hktdc.Dispatcher.trigger('openAlert', {
                message: 'Your request is confirmed and sent to ' + realSubmitTo + '.<br /> The ref. code is ' + insertServiceResponse.FormID,
                title: 'Success',
                type: 'success'
              });
            }

            // if (!redirectCallback) {
            //   self.successRedirect();
            // } else {
            redirectCallback();
            // }
            /* reload the menu for new counts */
            Hktdc.Dispatcher.trigger('reloadMenu');
          } else {
            if (failCallback) {
              failCallback();
            }

            Hktdc.Dispatcher.trigger('openAlert', {
              message: 'error on saving the record',
              title: 'Error',
              type: 'error'
            });
          }
        })

        .fail(function(err) {
          // console.log(err);
          if (failCallback) {
            failCallback();
          }
          Hktdc.Dispatcher.trigger('openAlert', {
            message: 'caught error on saving the record: <br /><code>' + err + '</code>',
            title: 'Error',
            type: 'error'
          });
        });
    },

    setRequestObject: function(status, realSubmitTo) {
      var requestFormData = this.requestFormModel.toJSON();
      var sendRequestModel = new Hktdc.Models.SendRequest({
        Req_Status: status,
        Prepared_By: requestFormData.PreparerFNAME,
        Preparer_ID: requestFormData.PreparerUserID,
        Ref_Id: requestFormData.ReferenceID,
        Created_Date: requestFormData.CreatedOn,
        Applicant: requestFormData.selectedApplicantModel.toJSON().UserFullName,
        Applicant_ID: requestFormData.selectedApplicantModel.toJSON().UserId,
        Title: requestFormData.Title,
        Office: requestFormData.Location,
        Department: requestFormData.DEPT,
        Forward_To_ID: requestFormData.Forward_To_ID,

        Justification_Importand_Notes: requestFormData.Justification,
        Expected_Dalivery_Date: requestFormData.EDeliveryDate,
        Frequency_Duration_of_Use: requestFormData.DurationOfUse,
        Estimated_Cost: requestFormData.EstimatedCost,
        Budget_Provided: requestFormData.BudgetProvided,
        // Budgeted_Sum: requestFormData.BudgetSum,
        Recommend_By: (requestFormData.selectedRecommentModel)
          ? requestFormData.selectedRecommentModel.toJSON().WorkerFullName
          : null,
        Recommend_By_ID: (requestFormData.selectedRecommentModel)
          ? requestFormData.selectedRecommentModel.toJSON().WorkerId
          : null,
        cc: _.map(this.requestFormModel.toJSON().selectedCCCollection.toJSON(), function(ccData) {
          return {
            Name: ccData.UserFullName || ccData.FULLNAME,
            UserID: ccData.UserId || ccData.USERID
          };
        }),
        Remark: requestFormData.Remark,
        // TODO: use applicant or approver submittedTo
        SubmittedTo: realSubmitTo,
        ActionTakerRuleCode: this.getActionTaker(this.requestFormModel.toJSON().selectedServiceCollection.toJSON()),

        Service_AcquireFor: this.requestFormModel.toJSON().selectedServiceCollection.toJSON()
        // Service_AcquireFor: this.getAcquireFor(this.requestFormModel)
      });
      console.log('final return:', sendRequestModel.toJSON());
      return sendRequestModel;
    },

    getAcquireFor: function(model) {
      /* !!!Dreprecated!!! */

      var requestFormData = model.toJSON();
      console.log('requestFormData: ', requestFormData);
      // console.log(model.toJSON().selectedCCCollection);
      // console.log(model.toJSON().selectedCCCollection.toJSON());
      var basicData = {
        Justification_Importand_Notes: requestFormData.Justification,
        Expected_Dalivery_Date: requestFormData.EDeliveryDate,
        Frequency_Duration_of_Use: requestFormData.DurationOfUse,
        Estimated_Cost: requestFormData.EstimatedCost,
        Budget_Provided: requestFormData.BudgetProvided,
        // Budgeted_Sum: requestFormData.BudgetSum,
        Recommend_By: (requestFormData.selectedRecommentModel)
          ? requestFormData.selectedRecommentModel.toJSON().WorkerFullName
          : null,
        Recommend_By_ID: (requestFormData.selectedRecommentModel)
          ? requestFormData.selectedRecommentModel.toJSON().WorkerId
          : null,
        cc: _.map(model.toJSON().selectedCCCollection.toJSON(), function(ccData) {
          return {
            Name: ccData.UserFullName,
            UserID: ccData.UserId
          };
        }),
        Remark: requestFormData.Remark,
        SubmittedTo: requestFormData.submittedTo,
        ActionTakerRuleCode: this.getActionTaker(model.toJSON().selectedServiceCollection.toJSON())
          // TODO:
          // Attachments: this.getFileName(),
      };
      console.log('selectedServiceCollection', model.toJSON().selectedServiceCollection.toJSON());
      var serviceData = this.getServiceData(model.toJSON().selectedServiceCollection.toJSON());
      console.log('serviceData', serviceData);
      _.extend(basicData, serviceData);
      // console.log('final send output: ', basicData);
      return basicData;
    },

    getActionTaker: function(selectedServiceCollectionArray) {
      var actionTakerArray = _.map(selectedServiceCollectionArray, function(serviceData) {
        // console.log(serviceData);
        return serviceData.ActionTaker;
      });
      return _.uniq(actionTakerArray).join(';');
    },

    sendXhrRequest: function(sendRequestModel) {
      var deferred = Q.defer();
      Backbone.emulateHTTP = true;
      Backbone.emulateJSON = true;

      sendRequestModel.url = sendRequestModel.url('save');
      sendRequestModel.save({}, {
        beforeSend: utils.setAuthHeader,
        success: function(mymodel, response) {
          deferred.resolve(response);
        },
        error: function(e) {
          deferred.reject('Submit Request Error' + JSON.stringify(e, null, 2));
        }
      });
      return deferred.promise;
    },

    sendAttachment: function(refId, attachmentCollection) {
      // console.group('files');
      // var attachmentCollection = attachmentCollection.toJSON();
      // var attachmentCollection = $('#Fileattach').get(0).files;
      // console.log('attchCollection', attachmentCollection);
      var deferred = Q.defer();
      var files = _.reject(attachmentCollection.toJSON(), function(attachment) {
        return attachment.AttachmentGUID;
      });
      if (files.length <= 0) {
        deferred.resolve();
        return;
      }
      var ajaxOptions = {
        type: 'POST',
        processData: false,
        cache: false,
        contentType: false
      };
      // var files = $('#Fileattach').get(0).files;
      var data = new FormData();
      var sendAttachmentModel = new Hktdc.Models.SendAttachment();
      var filename = _.map(files, function(file) {
        // return file.toJSON().file.name;
        return (file.file) && file.file.name;
      });
      // console.log(filename);
      sendAttachmentModel.url = sendAttachmentModel.url(refId, filename);

      _.each(files, function(file, i) {
        console.log(file.file);
        data.append('file' + i, file.file);
      });

      // console.log('final data: ', data);
      // console.groupEnd();
      ajaxOptions.data = data;

      // mymodel = sendRequest model
      // mymodel.set(filename);
      sendAttachmentModel.save(null, $.extend({}, ajaxOptions, {
        beforeSend: utils.setAuthHeader,
        success: function(model, response) {
          deferred.resolve();
        },
        error: function(e) {
          deferred.reject('Submit File Error' + JSON.stringify(e, null, 2));
        }
      }));
      return deferred.promise;
    },

    deleteAttachment: function(deleteAttachmentIdArray) {
      var deferred = Q.defer();
      if (!deleteAttachmentIdArray || (deleteAttachmentIdArray && deleteAttachmentIdArray.length <= 0)) {
        deferred.resolve();
        return;
      }
      Backbone.emulateHTTP = true;
      Backbone.emulateJSON = true;
      var delFileModel = new Hktdc.Models.DeleteFile();
      delFileModel.set({
        files: _.map(deleteAttachmentIdArray, function(AttachmentGUID) {
          return {GUID: AttachmentGUID};
        })
      });
      delFileModel.save({}, {
        beforeSend: utils.setAuthHeader,
        success: function() {
          deferred.resolve(deleteAttachmentIdArray);
        },
        error: function(e) {
          deferred.reject('Delete File Error' + JSON.stringify(e, null, 2));
        }
      });
      return deferred.promise;
    },

    successRedirect: function() {
      var baseURL = Backbone.history.getHash().split('?')[0];
      if (/\/check\//.test(baseURL)) {
        Backbone.history.navigate('', {trigger: true});
      } else if (/\/draft\//.test(baseURL)) {
        Backbone.history.navigate('draft', {trigger: true});
      } else if (/\/all\//.test(baseURL)) {
        Backbone.history.navigate('alltask', {trigger: true});
      } else if (/\/approval\//.test(baseURL)) {
        Backbone.history.navigate('approvaltask', {trigger: true});
      } else {
        Backbone.history.navigate('', {trigger: true});
      }
    },

    renderButtonHandler: function() {
      var self = this;
      /* From list || from choose applicant */
      var FormStatus = self.requestFormModel.toJSON().FormStatus;
      var Preparer = self.requestFormModel.toJSON().PreparerUserID;
      var Applicant = (self.requestFormModel.toJSON().selectedApplicantModel)
        ? self.requestFormModel.toJSON().selectedApplicantModel.toJSON().UserId
        : self.requestFormModel.toJSON().ApplicantUserID;
      var ApplicantRuleCode = self.requestFormModel.toJSON().selectedApplicantModel.toJSON().RuleCode;
      var Approver = (self.requestFormModel.toJSON().selectedRecommentModel)
      ? self.requestFormModel.toJSON().selectedRecommentModel.toJSON().WorkerId
      : self.requestFormModel.toJSON().ApproverUserID;
      // var ActionTaker = self.requestFormModel.toJSON().ActionTakerUserID;
      // var ITSApprover = self.requestFormModel.toJSON().ITSApproverUserID;
      var me = Hktdc.Config.userID;
      if (
        !FormStatus ||
        FormStatus === 'Draft'
        // FormStatus === 'Review' ||
        // FormStatus === 'Return'
      ) {
        console.debug('NEED Check APPLICANT_RULECODE');
        /* load related button set */
        // var ApproverRuleCode = self.requestFormModel.toJSON().selectedRecommentModel.toJSON().RuleCode;
        console.log('Preparer: ', Preparer);
        console.log('Applicant: ', Applicant);
        console.log('ApplicantRuleCode: ', ApplicantRuleCode);
        console.log('Approver: ', Approver);
        if (!Preparer || !Applicant || !Approver || !ApplicantRuleCode) {
          if (FormStatus) {
            self.render({
              showSave: true,
              showDelete: false
            });
          } else {
            self.render({ showSave: true });
          }
        } else {
          self.renderDraftModeButton(FormStatus, Preparer, Applicant, Approver, ApplicantRuleCode);
        }

      // non Draft FormStatus
      } else {
        console.debug('BY FORMSTATUS');
        var options = {};

        // self.renderRequestFormButton( FormStatus, Preparer, Applicant, Approver, ActionTaker, ITSApprover);
        if (this.requestFormModel.toJSON().FormStatus === 'Review' && me === Applicant && this.requestFormModel.toJSON().mode !== 'read') {
          options.showSave = true;
          // options.showDelete = true;
        }

        if (this.requestFormModel.toJSON().FormStatus === 'Return' && me === Applicant && this.requestFormModel.toJSON().mode !== 'read') {
          options.showSave = true;
        }

        if (this.requestFormModel.toJSON().FormStatus === 'Rework' && me === Preparer && this.requestFormModel.toJSON().mode !== 'read') {
          self.renderDraftModeButton(FormStatus, Preparer, Applicant, Approver, ApplicantRuleCode);
          // options.showSave = true;
          // options.showDelete = true;
        }

        if (this.requestFormModel.toJSON().FormStatus === 'Approval' && me === Applicant) {
          options.showRecall = true;
          options.showResend = true;
        }

        if (self.requestFormModel.toJSON().actions) {
          if (_.find(self.requestFormModel.toJSON().actions, function(action) {
            return action.Action === 'Forward';
          })) {
            options.showForwardTo = true;
          }

          self.renderRequestFormButtonByActions(self.requestFormModel.toJSON().actions, options);
        } else {
          self.render(options);
        }

        if (_.isEmpty(options) && !(self.requestFormModel.toJSON().actions)) {
          // Hktdc.Dispatcher.trigger('openAlert', {
          //   message: 'no actions button',
          //   type: 'error',
          //   title: 'Error'
          // });
          self.render({noButton: true});
        }
      }
    },

    renderDraftModeButton: function(FormStatus, Preparer, Applicant, Approver, ApplicantRuleCode) {
      var self = this;
      // var me = Hktdc.Config.userID;
      var showButtonOptions = { showSave: true };
      if (self.requestFormModel.toJSON().FormStatus) {
        showButtonOptions.showDelete = true;
      }
      // console.group('check condition');
      // for submitted to

      // ApproverRuleCode !== 'IT0009'
      if (ApplicantRuleCode === 'IT0009') {
        // 1) Preparer !== Applicant && Approver !== Applicant
        if (Preparer !== Applicant && Approver !== Applicant) {
          console.log('condition 1 (IT0009): Preparer !== Applicant && Approver !== Applicant');
          showButtonOptions.showSendToApplicant = true;
          showButtonOptions.applicantSendTo = 'Applicant';
          showButtonOptions.showSendToApprover = true;
          showButtonOptions.approverSendTo = 'Approver';
          self.requestFormModel.set({
            applicantSubmittedTo: 'Applicant',
            approverSubmittedTo: 'Approver'
          });

        // 2) Preparer === Applicant && Approver !== Applicant
        } else if (Preparer === Applicant && Approver !== Applicant) {
          console.log('condition 2 (IT0009): Preparer === Applicant && Approver !== Applicant');
          showButtonOptions.showSendToApprover = true;
          showButtonOptions.approverSendTo = 'Approver';
          self.requestFormModel.set({
            approverSubmittedTo: 'Approver'
          });

        // 2) Preparer === / !==  Applicant && Approver === Applicant
        } else {
          Hktdc.Dispatcher.trigger('openAlert', {
            message: 'Exception case: RuleCode IT0009, Approver === Applicant',
            type: 'error',
            title: 'Error'
          });
        }

      // ApproverRuleCode !== 'IT0008'
      } else if (ApplicantRuleCode === 'IT0008') {
        // Preparer === Applicant && Approver !== Applicant
        if (Preparer === Applicant && Approver !== Applicant) {
          console.log('condition 3 (IT0008): Preparer === Applicant && Approver !== Applicant');
          showButtonOptions.showSendToApplicant = false;
          showButtonOptions.showSendToApprover = true;
          showButtonOptions.approverSendTo = 'Approver';
          self.requestFormModel.set({
            approverSubmittedTo: 'Approver'
          });
        // Preparer === Applicant && Approver === Applicant
        } else if (Preparer === Applicant && Approver === Applicant) {
          console.log('condition 4 (IT0008): Preparer === Applicant && Approver === Applicant');
          showButtonOptions.showSendToApprover = true;
          showButtonOptions.approverSendTo = 'Task Actioner';
          self.requestFormModel.set({ approverSubmittedTo: 'TaskActioner' });
        // Preparer !== Applicant && Approver === Applicant
        } else if (Preparer !== Applicant && Approver === Applicant) {
          console.log('condition 5 (IT0008): Preparer !== Applicant && Approver === Applicant');
          showButtonOptions.showSendToApplicant = true;
          showButtonOptions.showSendToApprover = false;
          showButtonOptions.applicantSendTo = 'Applicant';
          self.requestFormModel.set({ applicantSubmittedTo: 'Applicant' });
        // Preparer !== Applicant && Approver !== Applicant
        } else if (Preparer !== Applicant && Approver !== Applicant) {
          console.log('condition 6 (IT0008): Preparer !== Applicant && Applicant !== Applicant');
          showButtonOptions.showSendToApplicant = true;
          showButtonOptions.applicantSendTo = 'Applicant';
          self.requestFormModel.set({ applicantSubmittedTo: 'Applicant' });
        // Preparer !== Applicant && Approver !== Applicant
        } else {
          Hktdc.Dispatcher.trigger('openAlert', {
            message: 'Exception case: RuleCode IT0008, unknown situation',
            type: 'error',
            title: 'Error'
          });
        }

      // ApproverRuleCode !== 'IT0008' !== 'IT0009'
      } else {
        Hktdc.Dispatcher.trigger('openAlert', {
          message: 'unacceptable rule code: !== (IT0008 || IT0009)',
          type: 'error',
          title: 'Error'
        });
        showButtonOptions = {
          showSave: false,
          showDelete: false
        };
      }

      console.log('before role check: ', showButtonOptions);

      /* Check Login user against role, ANSURE THE ABOVE SET BUT UNWANTED BUTTON NOT SHOW */
      // formstatus is 'Draft'
      // if (FormStatus === 'Draft') {
      //   if (me === Applicant) {
      //     showButtonOptions.showSendToApplicant = false;
      //   }
      // // formstatus is 'Review'
      // } else if (FormStatus === 'Review') {
      //   /* NO role case to handle, must be applicant */
      //   showButtonOptions.showReturn = true;
      //   showButtonOptions.returnTo = 'Preparer';
      // // formstatus is Return
      // } else if (FormStatus === 'Return') {
      //   if (me === Applicant) {
      //     showButtonOptions.showDelete = false;
      //     showButtonOptions.showSendToApplicant = false;
      //     showButtonOptions.showReturn = true;
      //   } else if (me === Preparer) {
      //     showButtonOptions.showSendToApprover = false;
      //     showButtonOptions.showReturn = false;
      //   }
      // } else {
      //   /* no Case to handle, must be applicant */
      // }

      // console.log('after role check: ', showButtonOptions);
      // console.groupEnd();

      self.render(showButtonOptions);
    },

    renderRequestFormButtonByActions: function(actions, defaultOptions) {
      var options = _.extend({workflowButtons: actions}, defaultOptions);
      this.render(options);
    },

    render: function(showButtonOptions) {
      /* load available buttons */

      this.model.set(_.extend({}, this.model.defaults, showButtonOptions));
      this.$el.html(this.template(this.model.toJSON()));
    }

  });
})();
