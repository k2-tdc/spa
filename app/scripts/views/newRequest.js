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
      'blur #txtbudgetsum': 'updateNewRequestModel',
      'blur #txtremark': 'updateNewRequestModel'
    },

    checkBudgetAndService: function() {
      if (this.model.mode === 'read') {
        return false;
      }
      var self = this;
      var haveSelectService = !!this.model.selectedServiceCollection.toJSON().length;
      var haveFilledCost = !!this.model.toJSON().EstimatedCost;
      if (!(haveSelectService && haveFilledCost)) {
        alert('please select service and filled the cost field');
        return false;
      } else {
        var recommendCollection = new Hktdc.Collections.Recommend();
        var ruleCodeArr = _.map(this.model.selectedServiceCollection.toJSON(), function(selectedService) {
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

            $('.recommend-container', self.el).append(recommendListView.el);
          },
          error: function() {
            console.log('error');
          }
        });
      }
      // return (this.model.selectedServiceCollection.toJSON().length && this.model.toJSON().cost);
    },

    updateNewRequestModel: function(ev) {
      if (this.model.mode === 'read') {
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

            self.model.selectedServiceCollection = new Hktdc.Collections.SelectedService();
            self.model.selectedAttachmentCollection = new Hktdc.Collections.SelectedAttachment();

            /* Render the components below */
            self.renderApplicantAndCCList(result[0]);
            self.renderApplicantDetail(result[1]);
            self.renderServiceCatagory(result[2]);
            self.renderAttachment();
            self.renderSelectedCCView();
            self.renderButtons({showSave: true});

            /* init event listener last */
            self.initModelChange();
          })
          .fail(function(e) {
            console.error(e);
          });
      } else if (this.model.toJSON().mode === 'read') {
        console.debug('This is << READ >> mode');
        Q.all([
          // self.loadEmployee(),
          self.loadServiceCatagory()
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
              var options = self.getShowButtonOptionsByFormStatus(self.model.toJSON());
              self.renderButtons(options);
            });
          })
          .fail(function(e) {
            console.error(e);
          });
      } else if (this.model.toJSON().mode === 'edit') {
        console.debug('This is << EDIT >> mode');
        Q.all([
          self.loadEmployee(),
          self.loadServiceCatagory()
        ])
          .then(function(results) {
            console.log('loaded resource');
            self.model.set({ selectedServiceTree: self.model.toJSON().RequestList });
            console.log(self.model.toJSON().RequestList);
            /* must sync RequestList to selectedServiceCollection for updating */
            self.model.selectedServiceCollection = new Hktdc.Collections.SelectedService(
              self.getAllRequestArray(self.model.toJSON().RequestList)
            );
            // console.log(self.model.selectedServiceCollection.toJSON());
            self.model.selectedAttachmentCollection = new Hktdc.Collections.SelectedAttachment();

            /* Render the components below */
            self.renderApplicantAndCCList(results[0]);
            self.renderServiceCatagory(results[1]);
            // self.renderServiceCatagory(self.mergeServiceCollection(results[1].toJSON(), self.model.toJSON().RequestList));
            self.renderAttachment(self.model.toJSON().Attachments);
            self.renderSelectedCCView(self.model.toJSON().RequestCC);
            var options = self.getShowButtonOptionsByFormStatus(self.model.toJSON());
            self.renderButtons(options);

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
        console.log(self.model.toJSON().selectedApplicantModel.toJSON());
        var selectedUserName = selectedApplicantModel.toJSON().UserFullName;
        $('.selectedApplicant', self.el).text(selectedUserName);
        self.loadApplicantDetail()
          .then(function(applicant) {
            self.renderApplicantDetail(applicant);
          });

        /* clear the selectedRecommentModel */
        self.model.set({ selectedRecommentModel: null });
      });

      this.model.on('change:cost', function(model, newCost, options) {
        /* clear the selectedRecommentModel */
        self.model.set({ selectedRecommentModel: null });
      });

      /* click recommend will trigger change of the selectedRecommentModel */
      this.model.on('change:selectedRecommentModel', function(model, selectedRecommentModel, options) {
        console.log('selectedRecommentModel:', selectedRecommentModel);
        if (!selectedRecommentModel) {
          $('#recommend-btn', self.el).text('--Select--');
          return false;
        }
        var selectedUserName = selectedRecommentModel.toJSON().WorkerFullName;
        // console.log(selectedUserName);
        $('#recommend-btn', self.el).text(selectedUserName);

        /* load related button set */
        var Preparer = self.model.toJSON().PreparerFNAME;
        var Applicant = self.model.toJSON().selectedApplicantModel.toJSON().UserFullName;
        var Approver = self.model.toJSON().selectedRecommentModel.toJSON().UserFullName;
        var AppRuleCode = self.model.toJSON().selectedRecommentModel.toJSON().RuleCode;
        console.log('crash');
        var showButtonOptions = { showSave: true };
        console.group('check condition');
        console.log('Preparer: ', Preparer);
        console.log('Applicant: ', Applicant);
        // console.log((Preparer == Applicant));
        console.log('Approver: ', Approver);
        console.log('AppRuleCode: ', AppRuleCode);
        // for submitted to
        if (Preparer !== Applicant && Applicant !== Approver) {
          // $("#btnapplicant").hide();
          // $("#btnapprover").text("Send to Applicant");
          console.log('condition 1');
          console.log('Preparer !== Applicant && Applicant !== Approver');
          self.model.set({ submittedTo: 'Applicant' });
          showButtonOptions.showSendToApplicant = false;
          showButtonOptions.showSendToApprover = true;
          showButtonOptions.approverSendTo = 'Applicant';
        } else if (Preparer !== Applicant && Applicant === Approver) {
          // SubmittedTo = "Approver";
          // $("#btnapplicant").hide();
          // $("#btnapprover").text("Send to Approver");
          console.log('condition 2');
          console.log('Preparer !== Applicant && Applicant === Approver');
          self.model.set({ submittedTo: 'Approver' });
          showButtonOptions.showSendToApplicant = false;
          showButtonOptions.showSendToApprover = true;
          showButtonOptions.approverSendTo = 'Approver';
        } else if (Preparer === Applicant && Applicant === Approver) {
          // $('#btnapplicant').hide();
          // $('#btnapprover').text('Send to Task Actioner');
          console.log('condition 3');
          console.log('Preparer === Applicant && Applicant === Approver');
          self.model.set({ submittedTo: 'TaskActioner' });
          showButtonOptions.showSendToApplicant = false;
          showButtonOptions.showSendToApprover = true;
          showButtonOptions.approverSendTo = 'Task Actioner';
        } else if (Preparer === Applicant && Applicant !== Approver) {
          // SubmittedTo = "Approver";
          // $("#btnapplicant").hide();
          // $("#btnapprover").text("Send to Approver");
          console.log('condition 4');
          console.log('Preparer === Applicant && Applicant !== Approver');
          self.model.set({ submittedTo: 'Approver' });
          showButtonOptions.showSendToApplicant = false;
          showButtonOptions.showSendToApprover = true;
          showButtonOptions.approverSendTo = 'Approver';
        } else if (Preparer !== Applicant && AppRuleCode !== 'IT0009') {
          // $("#btnapplicant").show();
          // $("#btnapplicant").text("Send to Applicant");
          // $("#btnapprover").text("Send to Approver");
          console.log('condition 5');
          console.log('Preparer !== Applicant && AppRuleCode !== \'IT0009\'');
          // showButtonOptions.showSendToApplicant = true;
          // showButtonOptions.showSendToApprover = true;
          // showButtonOptions.applicantSendTo = 'Applicant';
          // showButtonOptions.approverSendTo = 'Approver';
        } else if (Preparer === Applicant && AppRuleCode !== 'IT0009') {
          // $("#btnapplicant").hide();
          // $("#btnapprover").text("Send to Approver");
          console.log('condition 6');
          console.log('Preparer === Applicant && AppRuleCode !== \'IT0009\'');
        }
        console.log(showButtonOptions);
        console.groupEnd();

        self.renderButtons(showButtonOptions);
      });

      this.model.selectedCCCollection.on('add', function(addedCC, newCollection) {
        var selectedUserName = addedCC.toJSON().UserFullName;
        // var selectedUserId = addedCC.toJSON().UserId;
        $('.selectedCC', this.el).text(selectedUserName);
      });

      this.model.selectedServiceCollection.on('add', function(addedService, newCollection) {
        console.log('added service', newCollection.toJSON());
        /* clear the selectedRecommentModel */
        self.model.set({ selectedRecommentModel: null });
      });
      this.model.selectedServiceCollection.on('change', function(changedModel) {
        console.log('changed service', newCollection.toJSON());
        // console.log(addedService);
        // console.log(newCollection);
        /* clear the selectedRecommentModel */
        self.model.set({ selectedRecommentModel: null });
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
      $('.applicant-container', this.el).append(new Hktdc.Views.ApplicantList({
        collection: new Hktdc.Collections.Applicant(employeeArray),
        requestFormModel: this.model
      }).el);

      $('.cc-container', this.el).append(new Hktdc.Views.CCList({
        collection: new Hktdc.Collections.CC(employeeArray),
        requestFormModel: this.model
      }).el);
    },

    renderButtons: function(showButtonOptions) {
      /* load available buttons */
      var buttonModel = new Hktdc.Models.Button(showButtonOptions);
      // console.debug(buttonModel.toJSON());
      var buttonView = new Hktdc.Views.Button({
        model: buttonModel,
        requestFormModel: this.model
      });
      // console.log(buttonView.el);
      $('.available-buttons', this.el).html(buttonView.el);
    },

    renderApplicantDetail: function(selectedApplicantModel) {
      var applicant = selectedApplicantModel.toJSON();
      this.model.set({
        DEPT: applicant.Depart,
        Title: applicant.Title,
        Location: applicant.Office
      });
      $('#divdepartment', this.el).text(applicant.Depart);
    },

    renderSelectedCCView: function(input) {
      this.model.selectedCCCollection = new Hktdc.Collections.SelectedCC(input);
      $('.contact-group', this.el).append(new Hktdc.Views.SelectedCCList({
        collection: this.model.selectedCCCollection
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
