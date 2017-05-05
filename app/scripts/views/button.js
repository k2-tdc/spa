/* global Hktdc, Backbone, JST, $, _, utils, Q, moment, FormData, dialogMessage, sprintf */

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
      this.delayReloadMenuTime = 10000;
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
            message: dialogMessage.requestForm.rulecode.fail1,
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
            message: dialogMessage.requestForm.rulecode.fail2,
            type: 'error',
            title: 'Error'
          });
        }

      // ApproverRuleCode !== 'IT0008' !== 'IT0009'
      } else {
        Hktdc.Dispatcher.trigger('openAlert', {
          message: dialogMessage.requestForm.rulecode.fail3,
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
      var actionKey = actionDisplay.trim().replace(/\s/gm, '').toLowerCase();
      var status = self.requestFormModel.toJSON().FormStatus || 'Draft';
      var onFormValid = function() {
        Hktdc.Dispatcher.trigger('openConfirm', {
          title: 'Alert',
          message: dialogMessage.requestFormButton[actionKey].confirm,
          onConfirm: function() {
            Hktdc.Dispatcher.trigger('toggleLockButton', true);
            // console.log('statas:', status, 'actionname: ', actionName, 'mode: ', self.requestFormModel.toJSON().mode);
            if (
              // means = the form is editable
              self.requestFormModel.toJSON().mode === 'edit' &&
              actionName !== 'Delete' &&

              // seems useless
              (status === 'Review' || status === 'Return' || status === 'Rework')
            ) {
              self.saveRequestAndSendAttachment(status, 'approver')
              .then(function() {
                return self.workflowHandler(ev);
              })
              .then(function() {
                // console.log('workflow handler success');
                Hktdc.Dispatcher.trigger('openAlert', {
                  message: dialogMessage.requestFormButton[actionKey].success,
                  title: 'Information'
                });
              })
              .fail(function(err) {
                Hktdc.Dispatcher.trigger('openAlert', {
                  message: sprintf(dialogMessage.requestFormButton[actionKey].fail, (err.request_id || err)),
                  type: 'error',
                  title: 'Error'
                });
              })
              .fin(function() {
                Hktdc.Dispatcher.trigger('closeConfirm');
                Hktdc.Dispatcher.trigger('toggleLockButton', false);
              });
            } else {
              self.workflowHandler(ev)
              .then(function() {
                // because the Delete button may generated by server 'actions'
                Hktdc.Dispatcher.trigger('openAlert', {
                  title: 'Information',
                  message: dialogMessage.requestFormButton[actionKey].success
                });
              })
              .fail(function(err) {
                Hktdc.Dispatcher.trigger('openAlert', {
                  title: 'Error',
                  message: sprintf(dialogMessage.requestFormButton[actionKey].fail, (err.request_id || err))
                });
              })
              .fin(function() {
                Hktdc.Dispatcher.trigger('closeConfirm');
                Hktdc.Dispatcher.trigger('toggleLockButton', false);
              });
            }
          }
        });
      };
      if (actionKey === 'reject' || actionKey === 'returntopreparer' || actionKey === 'returntoapplicant') {
        this.model.trigger('checkRemark', onFormValid);
      } else if (actionKey === 'forward') {
        this.model.trigger('checkForward', onFormValid);
      } else {
        onFormValid();
      }
    },

    clickSaveHandler: function() {
      var self = this;
      this.model.trigger('checkIsValid', function() {
        var status = self.requestFormModel.toJSON().FormStatus || 'Draft';
        var formType = (self.requestFormModel.toJSON().FormStatus) ? 'request' : 'draft';
        Hktdc.Dispatcher.trigger('openConfirm', {
          title: 'Alert',
          message: dialogMessage.requestFormButton.save.confirm,
          onConfirm: function() {
            Hktdc.Dispatcher.trigger('toggleLockButton', true);
            self.saveRequestAndSendAttachment(status, '')
              .then(function(saveData) {
                Hktdc.Dispatcher.trigger('openAlert', {
                  message: dialogMessage.requestFormButton.save.success,
                  title: 'Information'
                });
                if (status === 'Draft') {
                  self.successRedirect('draft');
                } else {
                  self.successRedirect();
                }
              })
              .fail(function(err) {
                Hktdc.Dispatcher.trigger('openAlert', {
                  message: sprintf(dialogMessage.requestFormButton.save.fail, err.request_id || err),
                  type: 'error',
                  title: 'Error'
                });
              })
              .fin(function() {
                Hktdc.Dispatcher.trigger('closeConfirm');
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
          title: 'Alert',
          message: dialogMessage.requestFormButton.sendtoapplicant.confirm,
          onConfirm: function() {
            Hktdc.Dispatcher.trigger('toggleLockButton', true);
            self.saveRequestAndSendAttachment('Review', 'applicant')
              .then(function(saveData) {
                Hktdc.Dispatcher.trigger('openAlert', {
                  message: dialogMessage.requestFormButton.sendtoapplicant.success,
                  title: 'Information'
                });
                self.successRedirect('');
              })
              .fail(function(err) {
                Hktdc.Dispatcher.trigger('openAlert', {
                  message: sprintf(dialogMessage.requestFormButton.sendtoapplicant.fail, err.request_id || err),
                  type: 'error',
                  title: 'Error'
                });
              })
              .fin(function() {
                Hktdc.Dispatcher.trigger('closeConfirm');
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
          title: 'Alert',
          message: dialogMessage.requestFormButton.sendtoapprover.confirm,
          onConfirm: function() {
            Hktdc.Dispatcher.trigger('toggleLockButton', true);
            self.saveRequestAndSendAttachment('Approval', 'approver')
              .then(function(saveData) {
                Hktdc.Dispatcher.trigger('openAlert', {
                  message: dialogMessage.requestFormButton.sendtoapprover.success,
                  title: 'Information'
                });
                self.successRedirect('');
              })
              .fail(function(err) {
                Hktdc.Dispatcher.trigger('openAlert', {
                  message: sprintf(dialogMessage.requestFormButton.sendtoapprover.fail, err.request_id || err),
                  type: 'error',
                  title: 'Error'
                });
              })
              .fin(function() {
                Hktdc.Dispatcher.trigger('closeConfirm');
                Hktdc.Dispatcher.trigger('toggleLockButton', false);
              });
          }
        });
      });
    },

    clickDeleteBtnHandler: function() {
      var self = this;
      Hktdc.Dispatcher.trigger('openConfirm', {
        title: 'Alert',
        message: dialogMessage.requestFormButton.delete.confirm,
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
          var doSave = function() {
            DeleteRequestModelInstance.save(null, {
              beforeSend: utils.setAuthHeader,
              type: 'POST',
              success: function(model, response) {
                setTimeout(function() {
                  Hktdc.Dispatcher.trigger('reloadMenu');
                }, self.delayReloadMenuTime);
                Hktdc.Dispatcher.trigger('toggleLockButton', false);

                self.successRedirect();
              },
              error: function(model, response) {
                if (response.status === 401) {
                  utils.getAccessToken(function() {
                    doSave();
                  });
                } else {
                  console.error(response.responseText);
                  Hktdc.Dispatcher.trigger('toggleLockButton', false);
                  try {
                    Hktdc.Dispatcher.trigger('openAlert', {
                      message: sprintf(dialogMessage.requestFormButton.delete.fail, JSON.parse(response.responseText).request_id),
                      title: 'Error'
                    });
                  } catch (e) {
                    Hktdc.Dispatcher.trigger('openAlert', {
                      message: sprintf(dialogMessage.requestFormButton.delete.fail, 'Unknown error code.'),
                      title: 'Error'
                    });
                  }
                }
              },
              complete: function() {
                Hktdc.Dispatcher.trigger('closeConfirm');
              }
            });
          };
          doSave();
        }
      });
    },

    clickRecallBtnHandler: function() {
      var self = this;
      Hktdc.Dispatcher.trigger('openConfirm', {
        title: 'Alert',
        message: dialogMessage.requestFormButton.recall.confirm,
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
          var doSave = function() {
            action.save({}, {
              beforeSend: utils.setAuthHeader,
              success: function(model, response) {
                Hktdc.Dispatcher.trigger('openAlert', {
                  message: dialogMessage.requestFormButton.recall.success,
                  title: 'Information'
                });
                Hktdc.Dispatcher.trigger('toggleLockButton', false);
                self.successRedirect();
              },
              error: function(model, response) {
                if (response.status === 401) {
                  utils.getAccessToken(function() {
                    doSave();
                  });
                } else {
                  Hktdc.Dispatcher.trigger('toggleLockButton', false);
                  try {
                    Hktdc.Dispatcher.trigger('openAlert', {
                      message: sprintf(dialogMessage.requestFormButton.recall.fail, JSON.parse(response.responseText).request_id),
                      title: 'Error'
                    });
                  } catch (e) {
                    console.error(response.responseText);
                    Hktdc.Dispatcher.trigger('toggleLockButton', false);
                    Hktdc.Dispatcher.trigger('openAlert', {
                      message: sprintf(dialogMessage.requestFormButton.recall.fail, 'Unknown error code.'),
                      title: 'Error'
                    });
                  }
                }
              },
              complete: function() {
                Hktdc.Dispatcher.trigger('closeConfirm');
              }
            });
          };
          doSave();
        }
      });
    },

    clickResendBtnHandler: function() {
      var self = this;
      Hktdc.Dispatcher.trigger('openConfirm', {
        title: 'Alert',
        message: dialogMessage.requestFormButton.resendemailnotificaiton.confirm,
        onConfirm: function() {
          Hktdc.Dispatcher.trigger('toggleLockButton', true);

          Backbone.emulateHTTP = true;
          Backbone.emulateJSON = true;
          var formId = self.requestFormModel.toJSON().FormID;
          var ResendEmailModel = Backbone.Model.extend({
            url: Hktdc.Config.apiURL + '/users/' + Hktdc.Config.userID + '/work-list/computer-app/resend-email'
          });
          var ResendEmailModelInstance = new ResendEmailModel();
          var doSave = function() {
            ResendEmailModelInstance.save({ FormID: formId }, {
              beforeSend: utils.setAuthHeader,
              success: function(model, response) {
                // console.log('success: ', a);
                // console.log(b);
                setTimeout(function() {
                  Hktdc.Dispatcher.trigger('reloadMenu');
                }, self.delayReloadMenuTime);
                Hktdc.Dispatcher.trigger('toggleLockButton', false);

                self.successRedirect();
              },
              error: function(model, response) {
                if (response.status === 401) {
                  utils.getAccessToken(function() {
                    doSave();
                  });
                } else {
                  Hktdc.Dispatcher.trigger('toggleLockButton', false);
                  try {
                    Hktdc.Dispatcher.trigger('openAlert', {
                      message: sprintf(dialogMessage.requestFormButton.resendemailnotificaiton.fail, JSON.parse(response.responseText).request_id),
                      title: 'Error'
                    });
                  } catch (e) {
                    console.error(response.responseText);
                    Hktdc.Dispatcher.trigger('openAlert', {
                      message: sprintf(dialogMessage.requestFormButton.resendemailnotificaiton.fail, 'Unknown error code.'),
                      title: 'Error'
                    });
                  }
                }
                // console.log(b);
              },
              complete: function() {
                Hktdc.Dispatcher.trigger('closeConfirm');
              }
            });
          };
          doSave();
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
          message: dialogMessage.requestForm.preparedata.fail,
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
      var doSave = function() {
        worklistModel.save({}, {
          beforeSend: utils.setAuthHeader,
          success: function(action, response) {
            self.successRedirect();
            setTimeout(function() {
              Hktdc.Dispatcher.trigger('reloadMenu');
            }, self.delayReloadMenuTime);
            // window.location.href = "alltask.html";
            deferred.resolve(response);
          },
          error: function(model, response) {
            if (response.status === 401) {
              utils.getAccessToken(function() {
                doSave();
              }, function(err) {
                deferred.reject(err);
              });
            } else {
              try {
                deferred.reject(JSON.parse(response.responseText));
              } catch (e) {
                console.error(response.responseText);
                deferred.reject('Unknown error code.');
              }
            }
          }
        });
      };
      doSave();
      return deferred.promise;
    },

    saveRequestAndSendAttachment: function(status, submitTo) {
      /* set the request object */
      var self = this;
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
            setTimeout(function() {
              Hktdc.Dispatcher.trigger('reloadMenu');
            }, self.delayReloadMenuTime);
            return {
              refId: insertServiceResponse.FormID
            };
          } else {
            throw new Error('server not return FormID');
          }
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
      // Backbone.emulateHTTP = true;
      // Backbone.emulateJSON = true;

      sendRequestModel.url = sendRequestModel.url(this.requestFormModel.toJSON().ReferenceID);
      var doSave = function() {
        sendRequestModel.save({}, {
          beforeSend: utils.setAuthHeader,
          success: function(mymodel, response) {
            deferred.resolve(response);
          },
          error: function(model, response) {
            if (response.status === 401) {
              utils.getAccessToken(function() {
                doSave();
              }, function(err) {
                deferred.reject(err);
              });
            } else {
              try {
                deferred.reject(JSON.parse(response.responseText));
              } catch (e) {
                console.error('Error on saving request.');
                console.error(response.responseText);
                deferred.reject('Unknown error code.');
              }
            }
          }
        });
      };
      doSave();
      return deferred.promise;
    },

    sendAttachment: function(refId, attachmentCollection) {
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
      var data = new FormData();
      var sendAttachmentModel = new Hktdc.Models.SendAttachment();

      sendAttachmentModel.url = sendAttachmentModel.url(refId);

      _.each(files, function(file, i) {
        data.append('file' + i, file.file);
      });

      ajaxOptions.data = data;

      var doSave = function() {
        sendAttachmentModel.save(null, $.extend({}, ajaxOptions, {
          beforeSend: utils.setAuthHeader,
          success: function(model, response) {
            deferred.resolve();
          },
          error: function(model, response) {
            if (response.status === 401) {
              utils.getAccessToken(function() {
                doSave();
              }, function(err) {
                deferred.reject(err);
              });
            } else {
              try {
                deferred.reject(JSON.parse(response.responseText));
              } catch (e) {
                console.error('Submit File Error');
                console.error(response.responseText);
                deferred.reject('Unknown error code.');
              }
            }
          }
        }));
      };
      doSave();
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
      var doSave = function() {
        delFileModel.save({}, {
          beforeSend: utils.setAuthHeader,
          type: 'DELETE',
          success: function() {
            deferred.resolve(AttachmentGUID);
          },
          error: function(model, response) {
            if (response.status === 401) {
              utils.getAccessToken(function() {
                doSave();
              }, function(err) {
                deferred.reject(err);
              });
            } else {
              console.error(response.responseText);
              deferred.reject('Delete File Error');
            }
          }
        });
      };
      doSave();
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

    // this function is deprecated
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
          return 'Preparer ' + (formData.PreparerFNAME || '');

        case 'returntoapplicant':
        case 'sendtoapplicant':
          return 'Applicant ' + (formData.ApplicantFNAME || '');

        case 'sendtoapprover':
          return 'Approver ' + (formData.ApproverFNAME || '');

        case 'approve':
        case 'forward':
        case 'recommend':
          return 'Action Taker ' + (formData.ActionTakerFullName || '');

        case 'reject':
          if (formData.FormStatus === 'ITSApproval') {
            return 'Action Taker ' + (formData.ActionTakerFullName || '');
          }
          return false;

        case 'sendtoitsapproval':
          return 'ITS Approver ' + (formData.ITSApproverFullName || '');

        default:
          return false;
      }
    }

  });
})();
