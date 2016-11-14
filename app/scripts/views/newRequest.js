/* global Hktdc, Backbone, JST, $, Q, utils, alert, _ */
Hktdc.Views = Hktdc.Views || {};

(function() {
  'use strict';

  Hktdc.Views.NewRequest = Backbone.View.extend({

    template: JST['app/scripts/templates/newRequest.ejs'],

    events: {
      'click #recommend-btn': 'checkBudgetAndService',
      'blur #txtjustification': 'updateNewRequestModel',
      'blur #txtexpectedDD': 'updateNewRequestModel',
      'blur #txtfrequency': 'updateNewRequestModel',
      'blur #txtestimatedcost': 'updateNewRequestModel',
      'blur #txtbudgetprovided': 'updateNewRequestModel',
      // 'blur #txtbudgetsum': 'updateNewRequestModel',
      'blur #txtcomment': 'updateNewRequestModel',
      'blur #txtremark': 'updateNewRequestModel'
    },

    checkBudgetAndService: function() {
      if (this.model.toJSON().mode === 'read') {
        return false;
      }
      var self = this;
      var haveSelectService = !!this.model.toJSON().selectedServiceCollection.toJSON().length;
      var haveFilledCost = !!this.model.toJSON().EstimatedCost;
      // console.log(this.model.toJSON().selectedServiceCollection.toJSON());
      // console.log(this.model.toJSON().EstimatedCost);
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
      var targetField = $(ev.target).attr('field');
      if (this.model.toJSON().mode === 'read' && targetField !== 'Comment') {
        return false;
      }
      var updateObject = {};
      updateObject[targetField] = $(ev.target).val();
      this.model.set(updateObject);
    },

    initialize: function(props) {
      // this.listenTo(this.model, 'change', this.render);
      // Backbone.Validation.bind(this);
      var self = this;
      if (self.model.toJSON().FormStatus && self.model.toJSON().FormStatus !== 'Draft') {
        self.model.set({
          showComment: true
        });
      }
      /* *** Some model data is pre-set in the main router *** */

      /* must render the parent content first */
      self.render();

      /* mode === new */
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

            /* default render the save button only,
             after change the approver(recommend by), render other button */
            self.renderButtonHandler();
            /* init event listener last */
            setTimeout(function() {
              self.initModelChange();
            }, 500);
          })
          .fail(function(e) {
            console.error(e);
          });

      /* mode === read */
      } else if (this.model.toJSON().mode === 'read') {
        console.debug('This is << READ >> mode');
        Q.all([
          self.loadServiceCatagory(),
          self.loadEmployee()
          // ... load other remote resource
        ])
          .then(function(results) {
            /* must sync RequestList to selectedServiceCollection for updating */
            var recommend = _.find(results[1], function(employee) {
              return employee.UserId === self.model.toJSON().ApproverUserID;
            });

            /* need override the workerId and WorkerFullName */
            recommend.WorkerId = recommend.UserId;
            recommend.WorkerFullName = recommend.UserFullName;

            self.model.set({
              selectedServiceTree: self.model.toJSON().RequestList,
              selectedRecommentModel: new Hktdc.Models.Recommend(recommend)
            });

            // console.log(self.model.toJSON().RequestList);

            self.renderSelectedCCView(self.model.toJSON().RequestCC);
            self.renderWorkflowLog(self.model.toJSON().ProcessLog);
            self.renderAttachment(self.model.toJSON().Attachments);

            /* direct put the Request list to collection because no need to change selection */
            self.renderServiceCatagory(results[0]);

            // quick hack to do after render
            setTimeout(function() {
              $('input, textarea:not(.keepEdit), button', self.el).prop('disabled', 'disabled');
              /*
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
              */
              self.renderButtonHandler();
            });
          })
          .fail(function(e) {
            console.error(e);
          });

      /* mode === edit */
      } else if (this.model.toJSON().mode === 'edit') {
        console.debug('This is << EDIT >> mode');
        Q.all([
          self.loadEmployee(),
          self.loadServiceCatagory(),
          self.loadApplicantDetail()
        ])
          .then(function(results) {
            console.log('loaded resource');
            var recommend = _.find(results[0], function(employee) {
              return employee.UserId === self.model.toJSON().ApproverUserID;
            });

            /* need override the workerId and WorkerFullName */
            recommend.WorkerId = recommend.UserId;
            recommend.WorkerFullName = recommend.UserFullName;

            self.model.set({
              selectedServiceTree: self.model.toJSON().RequestList,
              /* must sync RequestList to selectedServiceCollection for updating */
              selectedServiceCollection: new Hktdc.Collections.SelectedService(
                self.getAllRequestArray(self.model.toJSON().RequestList)
              ),
              selectedRecommentModel: new Hktdc.Models.Recommend(recommend),
              selectedAttachmentCollection: new Hktdc.Collections.SelectedAttachment(),
              selectedCCCollection: new Hktdc.Collections.SelectedCC(self.model.toJSON().RequestCC)

            });
            // console.log(self.model.toJSON().selectedServiceCollection.toJSON());

            /* Render the components below */
            self.renderApplicantAndCCList(results[0]);
            self.renderServiceCatagory(results[1]);
            self.renderApplicantDetail(results[2], results[0]);
            // self.renderServiceCatagory(self.mergeServiceCollection(results[1].toJSON(), self.model.toJSON().RequestList));
            self.renderAttachment(self.model.toJSON().Attachments);
            self.renderSelectedCCView(self.model.toJSON().RequestCC);

            // var FormStatus = self.model.toJSON().FormStatus;
            // var Preparer = self.model.toJSON().PreparerUserID;
            // var Applicant = self.model.toJSON().ApplicantUserID;
            // var Approver = self.model.toJSON().ApproverUserID;
            // var ActionTaker = self.model.toJSON().ActionTakerUserID;
            // var ITSApprover = self.model.toJSON().ITSApproverUserID;
            //
            // self.renderRequestFormButton(
            //   FormStatus,
            //   Preparer,
            //   Applicant,
            //   Approver,
            //   ActionTaker,
            //   ITSApprover
            // );
            self.renderButtonHandler();

            /* init event listener last */
            setTimeout(function() {
              self.initModelChange();
            }, 500);
          })
          .fail(function(e) {
            console.error(e);
          });

      /* else no matched mode */
      } else {
        console.error('no available request mode');
      }
    },

    initModelChange: function() {
      var self = this;
      this.model.on('change:selectedApplicantModel', function(model, selectedApplicantModel, options) {
        // console.log('on change selectedApplicantModel');
        // console.log('change:selectedApplicantModel: ', self.model.toJSON().selectedApplicantModel.toJSON());
        var selectedUserName = selectedApplicantModel.toJSON().UserFullName;
        $('.selectedApplicant', self.el).text(selectedUserName);
        self.loadApplicantDetail()
          .then(function(applicant) {
            self.renderApplicantDetail(applicant, self.model.toJSON().employeeList);
          });

        /* clear the selectedRecommentModel */
        self.model.set({ selectedRecommentModel: null });
        self.renderButtonHandler();
      });

      this.model.on('change:EstimatedCost', function(model, newCost, options) {
        // console.log('change cost');
        /* clear the selectedRecommentModel */
        self.model.set({ selectedRecommentModel: null });
        self.renderButtonHandler();
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

        self.renderButtonHandler();
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
        self.renderButtonHandler();
      });

      this.model.toJSON().selectedServiceCollection.on('change', function(changedModel) {
        // console.log(addedService);
        /* clear the selectedRecommentModel */
        self.model.set({ selectedRecommentModel: null });
        self.renderButtonHandler();
      });

      this.model.toJSON().selectedServiceCollection.on('remove', function(changedModel) {
        // console.log(addedService);
        /* clear the selectedRecommentModel */
        self.model.set({ selectedRecommentModel: null });
        self.renderButtonHandler();
      });

      this.model.on('change:showLog', function(model, isShow) {
        console.log('showLog: ', isShow);
      });
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
            serviceRequest.Notes = serviceRequest.SValue;
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
        // TODO: may not use Applicant Collection here
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

    renderButtonHandler: function() {
      var self = this;
      /* From list || from choose applicant */
      var Applicant = self.model.toJSON().ApplicantUserID || self.model.toJSON().selectedApplicantModel.toJSON().UserId;
      var FormStatus = self.model.toJSON().FormStatus;
      if (
        !FormStatus ||
        FormStatus === 'Draft'
        // FormStatus === 'Review' ||
        // FormStatus === 'Return'
      ) {
        console.debug('NEED Check APPLICANT_RULECODE');
        /* load related button set */
        var Preparer = self.model.toJSON().PreparerUserID;
        var ApplicantRuleCode = self.model.toJSON().selectedApplicantModel.toJSON().RuleCode;
        var Approver = (self.model.toJSON().selectedRecommentModel)
          ? self.model.toJSON().selectedRecommentModel.toJSON().WorkerId
          : self.model.toJSON().ApproverUserID;
        // var ApproverRuleCode = self.model.toJSON().selectedRecommentModel.toJSON().RuleCode;
        console.log('Preparer: ', Preparer);
        console.log('Applicant: ', Applicant);
        console.log('ApplicantRuleCode: ', ApplicantRuleCode);
        console.log('Approver: ', Approver);
        if (!Preparer || !Applicant || !Approver || !ApplicantRuleCode) {
          if (FormStatus) {
            self.doRenderButtons({
              showSave: true,
              showDelete: false
            });
          } else {
            self.doRenderButtons({ showSave: true });
          }
        } else {
          self.renderDraftModeButton(FormStatus, Preparer, Applicant, Approver, ApplicantRuleCode);
        }
      } else {
        console.debug('BY FORMSTATUS');
        // var FormStatus = self.model.toJSON().FormStatus;
        // var Preparer = self.model.toJSON().PreparerUserID;
        // // var Applicant = self.model.toJSON().ApplicantUserID;
        // var Approver = self.model.toJSON().ApproverUserID;
        // var ActionTaker = self.model.toJSON().ActionTakerUserID;
        // var ITSApprover = self.model.toJSON().ITSApproverUserID;
        // self.renderRequestFormButton(
        //   FormStatus,
        //   Preparer,
        //   Applicant,
        //   Approver,
        //   ActionTaker,
        //   ITSApprover
        // );
        if (self.model.toJSON().actions) {
          self.renderRequestFormButtonByActions(self.model.toJSON().actions);
        } else {
          alert('no actions button');
        }
      }
    },

    renderDraftModeButton: function(FormStatus, Preparer, Applicant, Approver, ApplicantRuleCode) {
      var self = this;
      // var me = Hktdc.Config.userID;
      var showButtonOptions = { showSave: true };
      if (self.model.toJSON().FormStatus) {
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
          self.model.set({
            applicantSubmittedTo: 'Applicant',
            approverSubmittedTo: 'Approver'
          });

        // 2) Preparer === Applicant && Approver !== Applicant
        } else if (Preparer === Applicant && Approver !== Applicant) {
          console.log('condition 2 (IT0009): Preparer === Applicant && Approver !== Applicant');
          showButtonOptions.showSendToApprover = true;
          showButtonOptions.approverSendTo = 'Approver';
          self.model.set({
            approverSubmittedTo: 'Approver'
          });

        // 2) Preparer === / !==  Applicant && Approver === Applicant
        } else {
          alert('Exception case: RuleCode IT0009, Approver === Applicant');
        }

      // ApproverRuleCode !== 'IT0008'
      } else if (ApplicantRuleCode === 'IT0008') {
        // Preparer === Applicant && Approver !== Applicant
        if (Preparer === Applicant && Approver !== Applicant) {
          console.log('condition 3 (IT0008): Preparer === Applicant && Approver !== Applicant');
          showButtonOptions.showSendToApplicant = false;
          showButtonOptions.showSendToApprover = true;
          showButtonOptions.approverSendTo = 'Approver';
          self.model.set({
            approverSubmittedTo: 'Approver'
          });
        // Preparer === Applicant && Approver === Applicant
        } else if (Preparer === Applicant && Approver === Applicant) {
          console.log('condition 4 (IT0008): Preparer === Applicant && Approver === Applicant');
          showButtonOptions.showSendToApprover = true;
          showButtonOptions.approverSendTo = 'Task Actioner';
          self.model.set({ approverSubmittedTo: 'TaskActioner' });
        // Preparer !== Applicant && Approver === Applicant
        } else if (Preparer !== Applicant && Approver === Applicant) {
          console.log('condition 5 (IT0008): Preparer !== Applicant && Approver === Applicant');
          showButtonOptions.showSendToApplicant = true;
          showButtonOptions.showSendToApprover = false;
          showButtonOptions.applicantSendTo = 'Applicant';
          self.model.set({ applicantSubmittedTo: 'Applicant' });
        // Preparer !== Applicant && Approver !== Applicant
        } else if (Preparer !== Applicant && Approver !== Applicant) {
          console.log('condition 6 (IT0008): Preparer !== Applicant && Applicant !== Applicant');
          showButtonOptions.showSendToApplicant = true;
          showButtonOptions.applicantSendTo = 'Applicant';
          self.model.set({ applicantSubmittedTo: 'Applicant' });
        // Preparer !== Applicant && Approver !== Applicant
        } else {
          alert('Exception case: RuleCode IT0008, unknown situation');
        }

      // ApproverRuleCode !== 'IT0008' !== 'IT0009'
      } else {
        alert('unacceptable rule code: !== (IT0008 || IT0009)');
        showButtonOptions = {
          showSave: false,
          showDelete: false
        }
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

      console.log('after role check: ', showButtonOptions);
      // console.groupEnd();

      self.doRenderButtons(showButtonOptions);
    },

    renderRequestFormButtonByActions: function(actions, defaultOptions) {
      var options = {workflowButtons: actions};
      var Applicant = this.model.toJSON().ApplicantUserID || this.model.toJSON().selectedApplicantModel.toJSON().UserId;
      var Preparer = this.model.toJSON().PreparerUserID;
      var me = Hktdc.Config.userID;
      if (this.model.toJSON().FormStatus === 'Review' || this.model.toJSON().FormStatus === 'Return') {
        options.showSave = true;
        if (
          (this.model.toJSON().FormStatus === 'Review' && me === Applicant) ||
          (this.model.toJSON().FormStatus === 'Return' && me === Preparer)
        ) {
          options.showDelete = true;
        }
      }
      this.doRenderButtons(options);
    },

    doRenderButtons: function(showButtonOptions) {
      /* load available buttons */
      var defaultOptions = {
        showSave: false,
        showSendToApplicant: false,
        showSendToApprover: false,
        showDelete: false,
        showReturn: false,
        approverSendTo: 'Approver', // [Approver, ITS Approval]
        applicantSendTo: 'Applicant',
        returnTo: 'Preparer',

        workflowButtons: []
        // showApprove: false,
        // showReject: false,
        // showRecall: false,
        // showSendEmail: false,
        // showComplete: false,
        // showForward: false,
        // showCancel: false
      };

      var buttonModel = new Hktdc.Models.Button(_.extend(defaultOptions, showButtonOptions));
      // console.debug(buttonModel.toJSON());
      var buttonView = new Hktdc.Views.Button({
        model: buttonModel,
        requestFormModel: this.model
      });
      // console.log(buttonView.el);
      $('.buttons-container', this.el).html(buttonView.el);
    },

    renderApplicantDetail: function(selectedApplicantModel, employeeList) {
      var applicant = selectedApplicantModel.toJSON();
      var target = _.find(employeeList, function(employee) {
        return employee.UserId === applicant.UserId;
      });
      selectedApplicantModel.set({
        RuleCode: target.RuleCode
      });
      this.model.set({
        DEPT: applicant.Depart,
        Title: applicant.Title,
        Location: applicant.Office
        // RuleCode: target.RuleCode
      });
      console.log(this.model.toJSON());
      $('#divdepartment', this.el).text(applicant.Depart);
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
    },

    /* =================== Deprecated method start =================== */
    mergeServiceCollection: function(rawData, editedData) {
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
            var ApplicantRuleCode = self.model.toJSON().selectedApplicantModel.toJSON().RuleCode;
            if (ApplicantRuleCode === 'IT0008') {
              showButtonOptions.showSave = true;
              showButtonOptions.showSendToApplicant = true;
              showButtonOptions.showDelete = true;
            } else if (ApplicantRuleCode === 'IT0009') {
              showButtonOptions.showSave = true;
              showButtonOptions.showSendToApplicant = true;
              showButtonOptions.showSendToApprover = true;
              showButtonOptions.showDelete = true;
            } else {
              alert(FormStatus + ': exception condition of render button.');
            };
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
      console.log(showButtonOptions);
      self.doRenderButtons(showButtonOptions);
    }
    /* =================== Deprecated method end =================== */
  });
})();
