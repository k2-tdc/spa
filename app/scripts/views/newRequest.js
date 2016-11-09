/* global Hktdc, Backbone, JST, $, Q, utils, alert, _ */
Hktdc.Views = Hktdc.Views || {};

(function() {
  'use strict';

  Hktdc.Views.NewRequest = Backbone.View.extend({

    template: JST['app/scripts/templates/newRequest.ejs'],

    el: '#mainContent',

    events: {
      'click #recommend-btn': 'checkBudgetAndService',
      'blur #txtjustification': 'updateNewRequestModel',
      'blur #txtexpectedDD': 'updateNewRequestModel',
      'blur #txtfrequency': 'updateNewRequestModel',
      'blur #txtestimatedcost': 'updateNewRequestModel',
      'blur #txtbudgetprovided': 'updateNewRequestModel',
      // 'blur #txtbudgetsum': 'updateNewRequestModel',
      'blur #txtremark': 'updateNewRequestModel'
    },

    checkBudgetAndService: function() {
      if (this.model.toJSON().mode === 'read') {
        return false;
      }
      var self = this;
      var haveSelectService = !!this.model.toJSON().selectedServiceCollection.toJSON().length;
      var haveFilledCost = !!this.model.toJSON().EstimatedCost;
      if (!(haveSelectService && haveFilledCost)) {
        alert('please select service and filled the cost field');
        return false;
      } else {
        var recommendCollection = new Hktdc.Collections.Recommend();
        var ruleCodeArr = _.map(this.model.toJSON().selectedServiceCollection.toJSON(), function(selectedService) {
          return selectedService.Approver;
        });
        var ruleCode = _.uniq(ruleCodeArr).join(';');
        // console.log(this.model.toJSON().selectedApplicantModel.toJSON());
        var applicantUserId = this.model.toJSON().selectedApplicantModel.toJSON().UserId;
        var cost = this.model.toJSON().EstimatedCost;
        recommendCollection.url = recommendCollection.url(ruleCode, applicantUserId, cost);
        recommendCollection.fetch({
          beforeSend: utils.setAuthHeader,
          success: function() {
            var recommendListView = new Hktdc.Views.RecommendList({
              collection: recommendCollection,
              requestFormModel: self.model
            });

            $('.recommend-list', self.el).remove('.recommend-list');
            $('.recommend-container', self.el).append(recommendListView.el);
          },
          error: function() {
            console.log('error');
          }
        });
      }
      // return (this.model.toJSON().selectedServiceCollection.toJSON().length && this.model.toJSON().cost);
    },

    updateNewRequestModel: function(ev) {
      if (this.model.toJSON().mode === 'read') {
        return false;
      }
      var targetField = $(ev.target).attr('field');
      var updateObject = {};
      updateObject[targetField] = $(ev.target).val();
      this.model.set(updateObject);
    },

    initialize: function(props) {
      // this.listenTo(this.model, 'change', this.render);
      // Backbone.Validation.bind(this);
      var self = this;

      /* *** Some model data is pre-set in the main router *** */

      /* must render the parent content first */
      self.render();

      /* ----------- create new request ----------- */
      if (this.model.toJSON().mode === 'new') {
        console.log('this is << NEW >> mode');

        /* First load all remote data */
        Q.all([
          self.loadEmployee(),
          self.loadApplicantDetail(),
          self.loadServiceCatagory()
        ])
          .then(function(result) {
            console.log('load ed resource');

            self.model.set({
              selectedServiceCollection: new Hktdc.Collections.SelectedService(),
              selectedAttachmentCollection: new Hktdc.Collections.SelectedAttachment(),
              employeeList: result[0]
            });

            /* Render the components below */
            self.renderApplicantAndCCList(result[0]);
            self.renderApplicantDetail(result[1], result[0]);
            self.renderServiceCatagory(result[2]);
            self.renderAttachment();
            self.renderSelectedCCView();

            /* default render the save button only, after change the approver(recommend by), render details */
            self.doRenderButtons({showSave: true});

            /* init event listener last */
            self.initModelChange();
          })
          .fail(function(e) {
            console.error(e);
          });
      } else if (this.model.toJSON().mode === 'read') {
        console.debug('This is << READ >> mode');
        Q.all([
          self.loadServiceCatagory(),
          self.loadEmployee()
          // ... load other remote resource
        ])
          .then(function(results) {
            /* must sync RequestList to selectedServiceCollection for updating */
            self.model.set({ selectedServiceTree: self.model.toJSON().RequestList });
            console.log(self.model.toJSON().RequestList);

            self.renderSelectedCCView(self.model.toJSON().RequestCC);
            self.renderWorkflowLog(self.model.toJSON().ProcessLog);
            self.renderAttachment(self.model.toJSON().Attachments);

            /* direct put the Request list to collection because no need to change selection */
            self.renderServiceCatagory(results[0]);

            // quick hack to do after render
            setTimeout(function() {
              if (self.model.toJSON().mode === 'read') {
                $('input, textarea, button', self.el).prop('disabled', 'disabled');
              }
              var FormStatus = self.model.toJSON().FormStatus;
              var Preparer = self.model.toJSON().PreparerUserID;
              var Applicant = self.model.toJSON().ApplicantUserID;
              var Approver = self.model.toJSON().ApproverUserID;
              var ActionTaker = self.model.toJSON().ActionTakerUserID;
              var ITSApprover = self.model.toJSON().ITSApproverUserID;
              self.renderRequestFormButton(
                FormStatus,
                Preparer,
                Applicant,
                Approver,
                ActionTaker,
                ITSApprover
              );

            });
          })
          .fail(function(e) {
            console.error(e);
          });
      } else if (this.model.toJSON().mode === 'edit') {
        console.debug('This is << EDIT >> mode');
        Q.all([
          self.loadEmployee(),
          self.loadServiceCatagory(),
          self.loadApplicantDetail()
        ])
          .then(function(results) {
            console.log('loaded resource');
            self.model.set({
              selectedServiceTree: self.model.toJSON().RequestList,
              /* must sync RequestList to selectedServiceCollection for updating */
              selectedServiceCollection: new Hktdc.Collections.SelectedService(
                self.getAllRequestArray(self.model.toJSON().RequestList)
              ),
              selectedAttachmentCollection: new Hktdc.Collections.SelectedAttachment(),
              selectedCCCollection: new Hktdc.Collections.SelectedCC()

            });
            // console.log(self.model.toJSON().selectedServiceCollection.toJSON());

            /* Render the components below */
            self.renderApplicantAndCCList(results[0]);
            self.renderServiceCatagory(results[1]);
            self.renderApplicantDetail(results[2], results[0]);
            // self.renderServiceCatagory(self.mergeServiceCollection(results[1].toJSON(), self.model.toJSON().RequestList));
            self.renderAttachment(self.model.toJSON().Attachments);
            self.renderSelectedCCView(self.model.toJSON().RequestCC);

            var FormStatus = self.model.toJSON().FormStatus;
            var Preparer = self.model.toJSON().PreparerUserID;
            var Applicant = self.model.toJSON().ApplicantUserID;
            var Approver = self.model.toJSON().ApproverUserID;
            var ActionTaker = self.model.toJSON().ActionTakerUserID;
            var ITSApprover = self.model.toJSON().ITSApproverUserID;
            self.renderRequestFormButton(
              FormStatus,
              Preparer,
              Applicant,
              Approver,
              ActionTaker,
              ITSApprover
            );

            /* init event listener last */
            self.initModelChange();
          })
          .fail(function(e) {
            console.error(e);
          });
      } else {
        console.error('no available request mode');
      }
    },

    initModelChange: function() {
      var self = this;
      this.model.on('change:selectedApplicantModel', function(model, selectedApplicantModel, options) {
        // console.log('on change selectedApplicantModel');
        console.log('change:selectedApplicantModel: ', self.model.toJSON().selectedApplicantModel.toJSON());
        var selectedUserName = selectedApplicantModel.toJSON().UserFullName;
        $('.selectedApplicant', self.el).text(selectedUserName);
        self.loadApplicantDetail()
          .then(function(applicant) {
            self.renderApplicantDetail(applicant, self.model.toJSON().employeeList);
          });

        /* clear the selectedRecommentModel */
        self.model.set({ selectedRecommentModel: null });
        self.doRenderButtons({ showSave: true });
      });

      this.model.on('change:EstimatedCost', function(model, newCost, options) {
        console.log('change cost');
        /* clear the selectedRecommentModel */
        self.model.set({ selectedRecommentModel: null });
        self.doRenderButtons({ showSave: true });
      });

      /* click recommend will trigger change of the selectedRecommentModel */
      this.model.on('change:selectedRecommentModel', function(model, selectedRecommentModel, options) {
        if (!selectedRecommentModel) {
          $('#recommend-btn', self.el).text('--Select--');
          return false;
        }
        console.log('selectedRecommentModel:', selectedRecommentModel.toJSON());
        var selectedUserName = selectedRecommentModel.toJSON().WorkerFullName;
        // console.log(selectedUserName);
        $('#recommend-btn', self.el).text(selectedUserName);

        self.checkAndRenderButton();
      });

      this.model.toJSON().selectedCCCollection.on('add', function(addedCC, newCollection) {
        var selectedUserName = addedCC.toJSON().UserFullName;
        // var selectedUserId = addedCC.toJSON().UserId;
        $('.selectedCC', this.el).text(selectedUserName);
      });

      this.model.toJSON().selectedServiceCollection.on('add', function(addedService, newCollection) {
        // console.log('added service', newCollection.toJSON());
        /* clear the selectedRecommentModel */
        self.model.set({ selectedRecommentModel: null });
        self.doRenderButtons({ showSave: true });
      });

      this.model.toJSON().selectedServiceCollection.on('change', function(changedModel) {
        // console.log(addedService);
        /* clear the selectedRecommentModel */
        self.model.set({ selectedRecommentModel: null });
        self.doRenderButtons({ showSave: true });
      });

      this.model.on('change:showLog', function(model, isShow) {
        console.log('showLog: ', isShow);
      });
    },

    getShowButtonOptionsByFormStatus: function(data) {
      var formStatus = data.FormStatus;
      var actions = data.actions;
      console.log(formStatus);
      console.log(actions);
      switch (formStatus) {
        case 'Draft':
          return {
            showSave: true,
            showSendToApprover: true
          };
        case 'Approval':
          var result = {};
          // TODO: check self is approver
          // var iAmApprover = true;
          if (actions) {
            result = {
              showApprove: _.contains(actions, 'Approve'),
              showReject: _.contains(actions, 'Reject'),
              showReturn: _.contains(actions, 'Return')
            };
          } else {
            result = {
              showBack: true,
              showRecall: true
            }
          }
          return result;
        default:
          // default = [Submitted, ProcessTasks, Rework, Review]
          return {
            showBack: true
          };
      }
    },

    mergeServiceCollection: function(rawData, editedData) {
      /* =================== Dreprecated method =================== */

      // console.group('merge');
      // console.log('rawData: ', rawData);
      // console.log('editedData: ', editedData);
      var mergedData = _.map(rawData, function(rawServiceCatagory) {
        var matchedServiceCatagory = _.find(editedData, function(editedServiceCatagory) {
          // console.log('editedServiceCatagory: ', editedServiceCatagory);
          // console.log('rawServiceCatagory: ', rawServiceCatagory);
          return editedServiceCatagory.Name === rawServiceCatagory.Name;
        });
        // console.log('matchedServiceCatagory', matchedServiceCatagory);
        if (matchedServiceCatagory) {
          // if edited collection present, extend Level2
          rawServiceCatagory.Level2 = _.map(rawServiceCatagory.Level2, function(rawServiceType) {
            var matchedServiceType = _.find(matchedServiceCatagory.Level2, function(editedServiceType) {
              // TODO: use GUID if api fixed
              // return editedServiceType.Name === rawServiceType.Name;
              // console.group('check servicetype match');
              // console.log(editedServiceType.Name);
              // console.log(rawServiceType.Name);
              // console.groupEnd();
              return editedServiceType.Name === rawServiceType.Name;
            });
            // console.log('matchedServiceType: ', matchedServiceType);
            // if edited collection present, extend Level3
            if (matchedServiceType) {
              rawServiceType.Level3 = _.map(rawServiceType.Level3, function(rawServiceRequest) {
                var matchedServiceRequest = _.find(matchedServiceType.Level3, function(editedServiceRequest) {
                  return editedServiceRequest.Name === rawServiceRequest.Name;
                });
                if (matchedServiceRequest) {
                  return matchedServiceRequest;
                } else {
                  return rawServiceRequest;
                }
              });
            }
            return rawServiceType;
          });
        }
        return rawServiceCatagory;
      });
      // console.log(JSON.stringify(mergedData, null, 2));
      // console.groupEnd();

      return new Hktdc.Collections.ServiceCatagory(mergedData);
    },

    getGroupedRequestList: function(RequestList) {
      var groupedRequestList = _.each(RequestList, function(serviceObj){
        // TODO: change to GUID
        return serviceObj.Name;
      });
    },

    getAllRequestArray: function(requestTree) {
      var requestArr = [];
      _.each(requestTree, function(serviceCatagory) {
        // console.log(serviceCatagory);
        _.each(serviceCatagory.Level2, function(serviceType) {
          _.each(serviceType.Level3, function(serviceRequest) {
            requestArr.push(serviceRequest);
          });
        });
      });
      return requestArr;
    },

    loadServiceCatagory: function() {
      var deferred = Q.defer();
      // var self = this;
      var serviceCatagoryCollections = new Hktdc.Collections.ServiceCatagory();
      serviceCatagoryCollections.fetch({
        beforeSend: utils.setAuthHeader,
        success: function() {
          try {
            console.debug('[views/newRequest.js] - onLoadData');
            deferred.resolve(serviceCatagoryCollections);
          } catch (e) {
            console.error('error on rendering service level1::', e);
            deferred.reject(e);
          }
        },
        error: function(model, response) {
          deferred.reject(response);
          console.error(JSON.stringify(response, null, 2));
        }
      });
      return deferred.promise;
    },

    loadEmployee: function() {
      /* employee component */
      var deferred = Q.defer();
      // var self = this;

      var employeeCollection = new Hktdc.Collections.Employee();
      employeeCollection.fetch({
        beforeSend: utils.setAuthHeader,
        success: function() {
          // console.log('selectedCCCollection: ', self.model.toJSON().selectedCCCollection);
          // console.log('selectedCCCollection: ', self.model);
          deferred.resolve(employeeCollection.toJSON());
        },
        error: function(err) {
          deferred.reject(err);
        }
      });

      return deferred.promise;
    },

    loadApplicantDetail: function() {
      // var self = this;
      var deferred = Q.defer();
      this.model.toJSON().selectedApplicantModel.fetch({
        beforeSend: utils.setAuthHeader,
        success: function(res) {
          var selectedApplicantModel = res;

          deferred.resolve(selectedApplicantModel);
        },
        error: function(e) {
          deferred.reject(e);
        }
      });
      return deferred.promise;
    },

    renderApplicantAndCCList: function(employeeArray) {
      var self = this;
      $('.applicant-container', this.el).append(new Hktdc.Views.ApplicantList({
        collection: new Hktdc.Collections.Applicant(employeeArray),
        requestFormModel: this.model
      }).el);

      /* check me === formModel.applicant => disabled applicant button because preparer prepare form to applicant */
      /* this.model.ApplicantUserID present means it's not from new form */
      if (this.model.ApplicantUserID === Hktdc.Config.userID) {
        $('.applicant-container', this.el).find('button').prop('disabled', true);
      }
      // $('.cc-container', this.el).append(new Hktdc.Views.CCList({
      //   collection: new Hktdc.Collections.CC(employeeArray),
      //   requestFormModel: this.model
      // }).el);

      // console.log($('.cc-picker', this.el));
      // console.log(employeeArray);
      var $input = $('.cc-picker', this.el);
      // console.log($input);
      var newEmployeeArray = _.map(employeeArray, function(employee) {
        employee.label = employee.UserFullName;
        return employee;
      });
      $input.autocomplete({
        source: newEmployeeArray,
        select: function(ev, ui) {
          var existing = _.find(self.model.toJSON().selectedCCCollection.toJSON(), function(cc){
            return cc.UserId === ui.item.UserId;
          });
          if (!existing) {
            self.model.toJSON().selectedCCCollection.add(new Hktdc.Models.CC(ui.item));
          }
        },
        close: function(ev, ui) {
          console.log($(ev.target).val());
          $(ev.target).val('');
        }
      });
    },

    checkAndRenderButton: function() {
      var self = this;
      /* From list || from choose applicant */
      var Applicant = self.model.toJSON().ApplicantUserID || self.model.toJSON().selectedApplicantModel.toJSON().UserId;
      if (
        !self.model.toJSON().FormStatus ||
        (self.model.toJSON().FormStatus === 'Draft' && Applicant !== Hktdc.Config.userID) // && Preparer === Hktdc.Config.userID
      ) {
        console.debug('NEED Check APPLICANT_RULECODE');
        /* load related button set */
        var acceptedRuleCodes = ['IT0008', 'IT0009'];
        var Preparer = self.model.toJSON().PreparerUserID;
        var ApplicantRuleCode = self.model.toJSON().selectedApplicantModel.toJSON().RuleCode;
        var Approver = self.model.toJSON().selectedRecommentModel.toJSON().WorkerId;

        // var ApproverRuleCode = self.model.toJSON().selectedRecommentModel.toJSON().RuleCode;
        console.log('Preparer: ', Preparer);
        console.log('Applicant: ', Applicant);
        console.log('ApplicantRuleCode: ', ApplicantRuleCode);
        console.log('Approver: ', Approver);

        if (!_.contains(acceptedRuleCodes, ApplicantRuleCode)) {
          alert('rule code error');
          self.doRenderButtons({});
          return false;
        }

        self.renderDraftButton(Preparer, Applicant, Approver, ApplicantRuleCode);
      } else {
        console.debug('BY FORMSTATUS');
        // alert('Approval and beyond ');
        var FormStatus = self.model.toJSON().FormStatus;
        var Preparer = self.model.toJSON().PreparerUserID;
        // var Applicant = self.model.toJSON().ApplicantUserID;
        var Approver = self.model.toJSON().ApproverUserID;
        var ActionTaker = self.model.toJSON().ActionTakerUserID;
        var ITSApprover = self.model.toJSON().ITSApproverUserID;
        self.renderRequestFormButton(
          FormStatus,
          Preparer,
          Applicant,
          Approver,
          ActionTaker,
          ITSApprover
        );
      }
    },

    doRenderButtons: function(showButtonOptions) {
      /* load available buttons */
      var defaultOptions = {
        showBack: false, // TODO: need?
        showSave: false,
        showSendToApplicant: false,
        showSendToApprover: false,
        showDelete: false,
        showReturn: false,
        showApprove: false,
        showReject: false,
        showRecall: false,
        showSendEmail: false,
        showComplete: false,
        showFoward: false,
        showCancel: false,
        approverSendTo: 'Approver', // [Approver, ITS Approval]
        applicantSendTo: 'Applicant',
        returnTo: 'Preparer'
      };

      var buttonModel = new Hktdc.Models.Button(_.extend(defaultOptions, showButtonOptions));
      console.debug(buttonModel.toJSON());
      var buttonView = new Hktdc.Views.Button({
        model: buttonModel,
        requestFormModel: this.model
      });
      console.log(buttonView.el);
      $('.buttons-container', this.el).html(buttonView.el);
    },

    renderApplicantDetail: function(selectedApplicantModel, employeeList) {
      var applicant = selectedApplicantModel.toJSON();
      var target = _.find(employeeList, function(employee) {
        return employee.UserId === applicant.UserId
      });
      selectedApplicantModel.set({
        RuleCode: target.RuleCode
      })
      this.model.set({
        DEPT: applicant.Depart,
        Title: applicant.Title,
        Location: applicant.Office,
        // RuleCode: target.RuleCode
      });
      console.log(this.model.toJSON());
      $('#divdepartment', this.el).text(applicant.Depart);
    },

    renderDraftButton: function(Preparer, Applicant, Approver, ApplicantRuleCode) {
      var self = this;
      var showButtonOptions = { showSave: true, showDelete: true };
      // console.group('check condition');
      // for submitted to

      // 1) Preparer !== Applicant && ApproverRuleCode !== IT0009 && ApproverRuleCode !== 'IT0008'
      if (ApplicantRuleCode === 'IT0009') {
        if (Preparer !== Applicant && Approver !== Applicant) {
          console.log('condition 1 (IT0009): Preparer !== Applicant && Approver !== Applicant');
          showButtonOptions.showSendToApplicant = true;
          showButtonOptions.applicantSendTo = 'Applicant';
          showButtonOptions.showSendToApprover = true;
          showButtonOptions.approverSendTo = 'Approver';
          self.model.set({
            applicantSubmittedTo: 'Applicant',
            approverSubmittedTo: 'Approver'
          });
        } else if (Preparer === Applicant && Approver !== Applicant) {
          console.log('condition 2 (IT0009): Preparer === Applicant && Approver !== Applicant');
          showButtonOptions.showSendToApprover = true;
          showButtonOptions.approverSendTo = 'Approver';
          self.model.set({
            approverSubmittedTo: 'Approver'
          });
        } else {
          alert('RuleCode IT0009, rule code error, Preparer: ' + Preparer + ', Applicant: ' + Applicant + ', Approver: ' + Approver);
        }
      } else if (ApplicantRuleCode === 'IT0008') {
        if (Preparer === Applicant && Approver !== Applicant) {
          console.log('condition 3 (IT0008): Preparer === Applicant && Approver !== Applicant');
          showButtonOptions.showSendToApplicant = false;
          showButtonOptions.showSendToApprover = true;
          showButtonOptions.approverSendTo = 'Approver';
          self.model.set({
            approverSubmittedTo: 'Approver'
          });
        } else if (Preparer === Applicant && Approver === Applicant) {
          console.log('condition 4 (IT0008): Preparer === Applicant && Approver === Applicant');
          showButtonOptions.showSendToApprover = true;
          showButtonOptions.approverSendTo = 'Task Actioner';
          self.model.set({ approverSubmittedTo: 'TaskActioner' });
        } else if (Preparer !== Applicant && Approver === Applicant) {
          console.log('condition 5 (IT0008): Preparer !== Applicant && Approver === Applicant');
          showButtonOptions.showSendToApplicant = true;
          showButtonOptions.showSendToApprover = false;
          showButtonOptions.applicantSendTo = 'Applicant';
          self.model.set({ applicantSubmittedTo: 'Applicant' });
        } else if (Preparer !== Applicant && Approver !== Applicant) {
          console.log('condition 6 (IT0008): Preparer !== Applicant && Applicant !== Applicant');
          showButtonOptions.showSendToApplicant = true;
          showButtonOptions.applicantSendTo = 'Applicant';
          self.model.set({ applicantSubmittedTo: 'Applicant' });
        } else {
          alert('RuleCode IT0008, rule code error');
        }
      } else {
        alert('rule code: !IT0008, !IT0009 error');
      }

      console.log(showButtonOptions);
      // console.groupEnd();

      self.doRenderButtons(showButtonOptions);
    },

    renderRequestFormButton: function(FormStatus, Preparer, Applicant, Approver, ActionTaker, ITSApprover) {
      var self = this;
      var me = Hktdc.Config.userID;
      var showButtonOptions = {};
      switch (FormStatus) {
        case 'Draft':
          if (me === Applicant) {
            showButtonOptions.showSave = true;
            showButtonOptions.showSendToApprover = true;
            showButtonOptions.showDelete = true;
          } else {
            alert(FormStatus + ': exception condition of render button.');
          }
          break;
        case 'Review':
          if (me === Applicant) {
            showButtonOptions.showSave = true;
            showButtonOptions.showSendToApprover = true;
            showButtonOptions.showDelete = true;
            showButtonOptions.showReturn = true;
            showButtonOptions.returnTo = 'Preparer';
          } else {
            alert(FormStatus + ': exception condition of render button.');
          }
          break;
        case 'Approval':
          if (me === Applicant) {
            showButtonOptions.showRecall = true;
            showButtonOptions.showSendEmail = true;
          } else if (me === Approver) {
            showButtonOptions.showApprove = true;
            showButtonOptions.showReject = true;
            showButtonOptions.showReturn = true;
            showButtonOptions.showDelete = true;
            showButtonOptions.returnTo = 'Applicant';
          } else {
            alert(FormStatus + ': exception condition of render button.');
          }
          break;
        case 'Process Task':
          if (me === ActionTaker) {
            showButtonOptions.showReject = true;
            showButtonOptions.showComplete = true;
            showButtonOptions.showForward = true;
            showButtonOptions.showCancel = true;
            showButtonOptions.showSendToApprover = true;
            showButtonOptions.approverSendTo = 'ITS Approval';
          } else {
            alert(FormStatus + ': exception condition of render button.');
          }
          break;
        case 'ITS Approval':
          if (me === ITSApprover) {
            showButtonOptions.showReject = true;
            showButtonOptions.showRecommend = true;
          } else {
            alert(FormStatus + ': exception condition of render button.');
          }
          break;
        case 'Approved by ITS':
          if (me === ActionTaker) {
            showButtonOptions.showReject = true;
            showButtonOptions.showComplete = true;
            showButtonOptions.showForward = true;
            showButtonOptions.showCancel = true;
          } else {
            alert(FormStatus + ': exception condition of render button.');
          }
          break;
        case 'Rejected by ITS':
          if (me === ActionTaker) {
            showButtonOptions.showReject = true;
            showButtonOptions.showComplete = true;
            showButtonOptions.showForward = true;
            showButtonOptions.showCancel = true;
          } else {
            alert(FormStatus + ': exception condition of render button.');
          }
          break;
        case 'Return':
          if (me === Preparer) {
            showButtonOptions.showSave = true;
            showButtonOptions.showSendToApplicant = true;
            showButtonOptions.showDelete = true;
          } else if (me === Applicant) {
            showButtonOptions.showSave = true;
            showButtonOptions.showSendToApprover = true;
            showButtonOptions.showReturn = true;
            showButtonOptions.returnTo = 'Preparer';
          } else {
            alert(FormStatus + ': exception condition of render button.');
          }
          break;
        case 'Reject':
        case 'Completed':
        case 'Cancelled':
        case 'Deleted':
        case 'Recall':
          console.log('not show any button Reject, Completed, Cancelled, Deleted, Recall');
          break;
        default:
          alert('wrong Form status:\n' + FormStatus);
      }

      self.doRenderButtons(showButtonOptions);
    },

    renderSelectedCCView: function(input) {
      this.model.set({selectedCCCollection: new Hktdc.Collections.SelectedCC(input)});
      $('.contact-group', this.el).append(new Hktdc.Views.SelectedCCList({
        collection: this.model.toJSON().selectedCCCollection
      }).el);
    },

    renderWorkflowLog: function(workflowLogList) {
      var workflowLogCollections = new Hktdc.Collections.WorkflowLog(workflowLogList);
      var workflowLogListView = new Hktdc.Views.WorkflowLogList({
        collection: workflowLogCollections,
        requestFormModel: this.model
      });
      workflowLogListView.render();
      $('#workflowlog-container').html(workflowLogListView.el);
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
      /* selectedApplicantModel is from mainRouter */
      // console.log(this.model.toJSON().selectedApplicantModel.toJSON());
      this.model.set({
        selectedApplicantName: this.model.toJSON().selectedApplicantModel.toJSON().UserFullName
      });

      this.$el.html(this.template({request: this.model.toJSON()}));
    }

  });
})();
