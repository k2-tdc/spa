/* global Hktdc, Backbone, JST, $, _, utils, Q, moment, FormData */

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
      'click #btnresend': 'clickResendBtnHandler',
      'click .workflow-btn': 'clickWorkflowBtnHandler'
    },

    initialize: function(props) {
      // this.listenTo(this.model, 'change', this.render);
      _.extend(this, props);
      // this.model.on('change')
      // this.render();
    },

    render: function(showButtonOptions) {
      /* load available buttons */

      this.model.set(_.extend({}, this.model.defaults, showButtonOptions));
      this.$el.html(this.template(this.model.toJSON()));
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
          options.showSave = true;
          self.renderDraftModeButton(FormStatus, Preparer, Applicant, Approver, ApplicantRuleCode);
          // _.extend(options, self.renderDraftModeButton(FormStatus, Preparer, Applicant, Approver, ApplicantRuleCode));
          // options.showDelete = true;
        }

        if (
          this.requestFormModel.toJSON().FormStatus === 'Approval' &&
          me === Applicant &&
          /\/check\//.test(Backbone.history.getHash())
        ) {
          options.showRecall = true;
          options.showResend = true;
        }

        if (self.requestFormModel.toJSON().actions) {
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

      self.render(showButtonOptions);
      // return for next button options if any
      return showButtonOptions;
    },

    renderRequestFormButtonByActions: function(actions, defaultOptions) {
      var self = this;
      actions = _.map(actions, function(action) {
        action.uri = self.getWorklistURI(action.ActionID);
        return action;
      });
      console.log('actions', actions);
      var options = _.extend({workflowButtons: actions}, defaultOptions);
      this.render(options);
    },

    clickWorkflowBtnHandler: function(ev) {
      var self = this;
      var actionName = $(ev.target).attr('workflowaction').replace(/(\r\n|\n|\r)/gm, '');
      var actionDisplay = $(ev.target).text().replace(/(\r\n|\n|\r)/gm, '');
      var status = self.requestFormModel.toJSON().FormStatus || 'Draft';
      Hktdc.Dispatcher.trigger('openConfirm', {
        title: 'Confirmation',
        message: 'Are you sure to ' + actionDisplay + '?',
        onConfirm: function() {
          Hktdc.Dispatcher.trigger('toggleLockButton', true);
          var saveData;
          // console.log('statas:', status, 'actionname: ', actionName, 'mode: ', self.requestFormModel.toJSON().mode);
          if (
            // means = the form is editable
            self.requestFormModel.toJSON().mode === 'edit' &&
            actionName !== 'Delete' &&

            // seems useless
            (status === 'Review' || status === 'Return' || status === 'Rework')
          ) {
            self.saveRequestAndSendAttachment(status, 'approver')
              .then(function(_saveData) {
                saveData = _saveData;
                return self.workflowHandler(ev);
              })
              .then(function() {
                // console.log('workflow handler success');
                self.openAlertDialog('send', {
                  submitTo: self.getSubmitTo(actionDisplay, self.requestFormModel.toJSON()),
                  refId: saveData.refId
                });

                Hktdc.Dispatcher.trigger('closeConfirm');
              })
              .fail(function(err) {
                console.error(err);
                // console.log('workflow handler error');
              })
              .fin(function() {
                Hktdc.Dispatcher.trigger('toggleLockButton', false);
              });
          } else {
            self.workflowHandler(ev)
              .then(function() {
                // because the Delete button may generated by server 'actions'
                if (actionName === 'Delete') {
                  self.openAlertDialog('delete', { refId: self.requestFormModel.toJSON().ReferenceID });
                } else {
                  self.openAlertDialog('send', {
                    submitTo: self.getSubmitTo(actionDisplay, self.requestFormModel.toJSON()),
                    refId: self.requestFormModel.toJSON().ReferenceID
                  });
                }
                Hktdc.Dispatcher.trigger('closeConfirm');
              })
              .fail(function(err) {
                console.error(err);
              })
              .fin(function() {
                Hktdc.Dispatcher.trigger('toggleLockButton', false);
              });
          }
        }
      });
    },

    clickSaveHandler: function() {
      var self = this;
      this.model.trigger('checkIsValid', function() {
        var status = self.requestFormModel.toJSON().FormStatus || 'Draft';
        var formType = (self.requestFormModel.toJSON().FormStatus) ? 'request' : 'draft';
        Hktdc.Dispatcher.trigger('openConfirm', {
          title: 'Confirmation',
          message: 'Confirm save the ' + formType + ' form?',
          onConfirm: function() {
            Hktdc.Dispatcher.trigger('toggleLockButton', true);
            self.saveRequestAndSendAttachment(status, '')
              .then(function(saveData) {
                self.openAlertDialog('save', { formType: formType, refId: saveData.refId });
                Hktdc.Dispatcher.trigger('closeConfirm');
                if (status === 'Draft') {
                  self.successRedirect('draft');
                } else {
                  self.successRedirect();
                }
              })
              .fail(function(err) {
                console.error(err);
              })
              .fin(function() {
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
          message: 'Are you sure  to send to applicant?',
          onConfirm: function() {
            Hktdc.Dispatcher.trigger('toggleLockButton', true);
            self.saveRequestAndSendAttachment('Review', 'applicant')
              .then(function(saveData) {
                self.openAlertDialog('send', { submitTo: 'applicant', refId: saveData.refId });
                Hktdc.Dispatcher.trigger('closeConfirm');
                self.successRedirect('');
              })
              .fail(function(err) {
                console.error(err);
              })
              .fin(function() {
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
          title: 'Confirmation',
          message: 'Are you sure to send to approver?',
          onConfirm: function() {
            Hktdc.Dispatcher.trigger('toggleLockButton', true);
            self.saveRequestAndSendAttachment('Approval', 'approver')
              .then(function(saveData) {
                self.openAlertDialog('send', { submitTo: 'approver', refId: saveData.refId });
                Hktdc.Dispatcher.trigger('closeConfirm');
                self.successRedirect('');
              })
              .fail(function(err) {
                console.log(err);
              })
              .fin(function() {
                Hktdc.Dispatcher.trigger('toggleLockButton', false);
              });
          }
        });
      });
    },

    clickDeleteBtnHandler: function() {
      var self = this;
      Hktdc.Dispatcher.trigger('openConfirm', {
        title: 'Confirmation',
        message: 'Are you sure to delete the request?',
        onConfirm: function() {
          Hktdc.Dispatcher.trigger('toggleLockButton', true);

          Backbone.emulateHTTP = true;
          Backbone.emulateJSON = true;
          var refId = self.requestFormModel.toJSON().ReferenceID;
          var DeleteRequestModel = Backbone.Model.extend({
            url: Hktdc.Config.apiURL + '/users/' + Hktdc.Config.userID + '/draft-list/computer-app/delete'
            // url: Hktdc.Config.apiURL + '/DeleteDraft?ReferID=' + refId
          });
          var DeleteRequestModelInstance = new DeleteRequestModel({data: [{ReferenceID: refId}]});

          DeleteRequestModelInstance.save(null, {
            beforeSend: utils.setAuthHeader,
            type: 'POST',
            success: function(model, response) {
              // console.log('success: ', a);
              // console.log(b);
              Hktdc.Dispatcher.trigger('reloadMenu');
              Hktdc.Dispatcher.trigger('toggleLockButton', false);
              Hktdc.Dispatcher.trigger('closeConfirm');

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
        title: 'Confirmation',
        message: 'Are you sure to Recall the Form: ' + self.requestFormModel.toJSON().ReferenceID + ' ?',
        onConfirm: function() {
          Hktdc.Dispatcher.trigger('toggleLockButton', true);

          Backbone.emulateHTTP = true;
          Backbone.emulateJSON = true;
          var ActionModel = Backbone.Model.extend({
            urlRoot: Hktdc.Config.apiURL + '/applications/computer-app/' + self.requestFormModel.toJSON().ReferenceID + '/recall'
          });
          var action = new ActionModel();
          action.set({
            UserId: Hktdc.Config.userID,
            ProcInstID: self.requestFormModel.toJSON().ProcInstID,
            ActionName: 'Recall',
            Remark: self.requestFormModel.toJSON().Remark
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

    clickResendBtnHandler: function() {
      var self = this;
      Hktdc.Dispatcher.trigger('openConfirm', {
        title: 'Confirmation',
        message: 'Are you sure to resend email notification?',
        onConfirm: function() {
          Hktdc.Dispatcher.trigger('toggleLockButton', true);

          Backbone.emulateHTTP = true;
          Backbone.emulateJSON = true;
          var formId = self.requestFormModel.toJSON().FormID;
          var ResendEmailModel = Backbone.Model.extend({
            url: Hktdc.Config.apiURL + '/users/' + Hktdc.Config.userID + '/work-list/computer-app/resend-email'
          });
          var ResendEmailModelInstance = new ResendEmailModel();
          ResendEmailModelInstance.save({ FormID: formId }, {
            beforeSend: utils.setAuthHeader,
            success: function(model, response) {
              // console.log('success: ', a);
              // console.log(b);
              Hktdc.Dispatcher.trigger('reloadMenu');
              Hktdc.Dispatcher.trigger('toggleLockButton', false);
              Hktdc.Dispatcher.trigger('closeConfirm');

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

    workflowHandler: function(ev) {
      // console.log(Backbone.history.getFragment());
      var self = this;
      var deferred = Q.defer();
      var hashWithoutQS = Backbone.history.getFragment().split('?')[0];
      var sn = hashWithoutQS.split('/')[3];
      var actionName = $(ev.target).attr('workflowaction').replace(/(\r\n|\n|\r)/gm, '');
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
        Remark: this.requestFormModel.toJSON().Remark
      };
      if ($(ev.target).attr('workflowAction') === 'Forward') {
        body.Forward_To_ID = this.requestFormModel.toJSON().Forward_To_ID;
      }

      Backbone.emulateHTTP = true;
      Backbone.emulateJSON = true;
      var worklistModel = new Hktdc.Models.WorklistAction();
      worklistModel.set(body);
      worklistModel.url = worklistModel.url($(ev.target).attr('uri'));
      worklistModel.save({}, {
        beforeSend: utils.setAuthHeader,
        success: function(action, response) {
          self.successRedirect();
          Hktdc.Dispatcher.trigger('reloadMenu');
          // window.location.href = "alltask.html";
          deferred.resolve(response);
        },
        error: function(model, response) {
          Hktdc.Dispatcher.trigger('openAlert', {
            message: 'Error on workflow action',
            type: 'error',
            title: 'Error'
          });
          deferred.reject(response.responseText);
        }
      });
      return deferred.promise;
    },

    saveRequestAndSendAttachment: function(status, submitTo) {
      /* set the request object */
      var realSubmitTo = (submitTo)
        ? this.requestFormModel.toJSON()[submitTo + 'SubmittedTo']
        : this.requestFormModel.toJSON().applicantSubmittedTo;

      // console.log(realSubmitTo);
      var insertServiceResponse;
      return Q.fcall(this.setRequestObject.bind(this, status, realSubmitTo))
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
          var self = this;
          return Q.all(_.map(this.requestFormModel.toJSON().deleteAttachmentIdArray, function(guid) {
            return self.deleteAttachment(guid);
          }));
          // return this.deleteAttachment();
        }.bind(this))

        .then(function() {
          // console.log('end delete attachment');
          // FormID = ReferenceID and FormID
          // if (true) {
          if (insertServiceResponse.FormID) {
            /* reload the menu for new counts */
            Hktdc.Dispatcher.trigger('reloadMenu');

            return {
              refId: insertServiceResponse.FormID
            };
          } else {
            throw new Error('server not return FormID');
          }
        })

        .fail(function(err) {
          Hktdc.Dispatcher.trigger('openAlert', {
            message: 'Error on saving the record:',
            title: 'Error',
            type: 'error'
          });
          throw err;
        });
    },

    setRequestObject: function(status, realSubmitTo) {
      var requestFormData = this.requestFormModel.toJSON();
      var serviceGroup = _.groupBy(requestFormData.selectedServiceCollection.toJSON(), 'GUID');
      var serviceList = _.flatten(_.map(serviceGroup, function(group, key) {
        group = _.sortBy(group, 'index');
        var finalService = group[0];
        var finalNameArr = [];
        var finalNoteArr = [];
        if (group.length > 0 && String(finalService.ControlFlag) === '2') {
          _.each(group, function(service) {
            finalNameArr.push(service.Name);
            finalNoteArr.push(service.Notes || '');
          });
          finalService.Name = finalNameArr.join('#*#');
          finalService.Notes = finalNoteArr.join('#*#');
          return finalService;
        }
        return group;
      }));
      console.log('raw date: ', requestFormData.EDeliveryDate);
      console.log('date is valid: ', moment(requestFormData.EDeliveryDate, 'DD MMM YYYY', true).isValid());

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
        Expected_Dalivery_Date: (moment(requestFormData.EDeliveryDate, 'DD MMM YYYY', true).isValid())
          ? moment(requestFormData.EDeliveryDate, 'DD MMM YYYY').format('YYYY-MM-DD')
          : requestFormData.EDeliveryDate,
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
            Name: ccData.FullName || ccData.FULLNAME,
            UserID: ccData.UserID || ccData.USERID
          };
        }),
        Remark: requestFormData.Remark,
        // TODO: use applicant or approver submittedTo
        SubmittedTo: realSubmitTo,
        ActionTakerRuleCode: this.getActionTaker(this.requestFormModel.toJSON().selectedServiceCollection.toJSON()),

        Service_AcquireFor: serviceList
        // Service_AcquireFor: this.requestFormModel.toJSON().selectedServiceCollection.toJSON()
      });
      console.log('final return:', sendRequestModel.toJSON());
      return sendRequestModel;
    },

    getWorklistURI: function(actionId) {
      var mapping = [
        { ActionID: '3', URI: 'approve'},
        { ActionID: '4', URI: 'reject'},
        { ActionID: '5', URI: 'return-to-applicant'},
        // { ActionID: '26', URI: 'recall'},
        { ActionID: '1', URI: 'send-to-approver'},
        { ActionID: '2', URI: 'return-to-preparer'},
        { ActionID: '28', URI: 'delete'},
        { ActionID: '7', URI: 'reject'},
        { ActionID: '8', URI: 'complete'},
        { ActionID: '9', URI: 'forward'},
        { ActionID: '10', URI: 'cancel'},
        { ActionID: '11', URI: 'send-to-its'},
        { ActionID: '22', URI: 'send-to-applicant'},
        { ActionID: '23', URI: 'delete'},
        { ActionID: '12', URI: 'recommend'},
        { ActionID: '13', URI: 'reject'},
        { ActionID: '14', URI: 'reject'},
        { ActionID: '15', URI: 'complete'},
        { ActionID: '16', URI: 'forward'},
        { ActionID: '17', URI: 'cancel'},
        { ActionID: '18', URI: 'reject'},
        { ActionID: '19', URI: 'complete'},
        { ActionID: '20', URI: 'forward'},
        { ActionID: '21', URI: 'cancel'},
        { ActionID: '24', URI: 'send-to-approver'},
        { ActionID: '25', URI: 'return-to-preparer'},
        { ActionID: '30', URI: 'delete'}
        // { ActionID: '6', Action: 'Recall', ButtonName: 'Recall', URI: 'recall'},
        // { ActionID: '29', Action: 'Submit', ButtonName: 'Submitted', URI: 'submitted'},
      ];

      return _.find(mapping, function(obj) {
        return String(obj.ActionID) === String(actionId);
      }).URI;
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

      sendRequestModel.url = sendRequestModel.url(this.requestFormModel.toJSON().ReferenceID);
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
      // var filename = _.map(files, function(file) {
      //   // return file.toJSON().file.name;
      //   return (file.file) && file.file.name;
      // });

      sendAttachmentModel.url = sendAttachmentModel.url(refId);

      _.each(files, function(file, i) {
        data.append('file' + i, file.file);
        // data.append('refid', refId);
        // data.append('process', 'CHSW');
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

    deleteAttachment: function(AttachmentGUID) {
      var deferred = Q.defer();
      // if (!deleteAttachmentIdArray || (deleteAttachmentIdArray && deleteAttachmentIdArray.length <= 0)) {
      //   deferred.resolve();
      //   return;
      // }
      Backbone.emulateHTTP = true;
      Backbone.emulateJSON = true;
      var delFileModel = new Hktdc.Models.DeleteFile();
      // delFileModel.set({
      //   files: _.map(deleteAttachmentIdArray, function(AttachmentGUID) {
      //     return {GUID: AttachmentGUID};
      //   })
      // });
      delFileModel.url = delFileModel.url(AttachmentGUID);
      delFileModel.save({}, {
        beforeSend: utils.setAuthHeader,
        type: 'DELETE',
        success: function() {
          deferred.resolve(AttachmentGUID);
        },
        error: function(e) {
          deferred.reject('Delete File Error' + JSON.stringify(e, null, 2));
        }
      });
      return deferred.promise;
    },

    successRedirect: function(forceRedirect) {
      var baseURL = Backbone.history.getHash().split('?')[0];

      if (forceRedirect || forceRedirect === '') {
        Backbone.history.navigate(forceRedirect, {trigger: true});
      } else if (/\/check\//.test(baseURL)) {
        Backbone.history.navigate('', {trigger: true});
      } else if (/\/draft\//.test(baseURL)) {
        Backbone.history.navigate('draft', {trigger: true});
      } else if (/\/all\//.test(baseURL)) {
        Backbone.history.navigate('alltask', {trigger: true});
      } else if (/\/approval\//.test(baseURL)) {
        Backbone.history.navigate('approvaltask', {trigger: true});
      // } else if (/\/request\//.test(baseURL)) {
      //   Backbone.history.navigate('draft', {trigger: true});
      } else {
        Backbone.history.navigate('', {trigger: true});
      }
    },

    openAlertDialog: function(type, data) {
      switch (type) {
        case 'save':
          Hktdc.Dispatcher.trigger('openAlert', {
            message: 'Your ' +
              data.formType +
              ' form has been saved. <br /> The request ID is ' +
              data.refId,
            title: 'Confirmation',
            type: 'success'
          });
          break;
        case 'send':
          var message = (data.submitTo)
            ? 'Your request is confirmed and sent to ' +
              data.submitTo +
              '.<br /> The ref. code is ' +
              data.refId
            : 'Your request is confirmed and sent.<br />The ref. code is ' +
              data.refId;
          Hktdc.Dispatcher.trigger('openAlert', {
            message: message,
            title: 'Confirmation',
            type: 'success'
          });
          break;
        case 'delete':
          Hktdc.Dispatcher.trigger('openAlert', {
            message: 'The record : ' +
              data.refId +
              ' is deleted.',
            title: 'Confirmation',
            type: 'success'
          });
          break;
        default:

      }
    },

    getSubmitTo: function(buttonName, formData) {
      switch (buttonName.trim().replace(/\s/gm, '').toLowerCase()) {
        case 'returntopreparer':
          return 'Preparer ' + formData.PreparerFNAME;

        case 'returntoapplicant':
        case 'sendtoapplicant':
          return 'Applicant ' + formData.ApplicantFNAME;

        case 'sendtoapprover':
          return 'Approver ' + formData.ApproverFNAME;

        case 'approve':
        case 'forward':
        case 'recommend':
          return 'Action Taker ' + formData.ActionTakerFullName;

        case 'reject':
          if (formData.FormStatus === 'ITSApproval') {
            return 'Action Taker ' + formData.ActionTakerFullName;
          }
          return false;

        case 'sendtoitsapproval':
          return 'ITS Approver ' + formData.ITSApproverFullName;

        default:
          return false;
      }
    }

  });
})();
