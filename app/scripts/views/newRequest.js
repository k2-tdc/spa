/*global Hktdc, Backbone, JST*/

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
      if (this.mode === 'read') {
        return false;
      }
      var self = this;
      var haveSelectService = !!this.model.selectedServiceCollection.toJSON().length;
      var haveFilledCost = !!this.model.toJSON().cost;
      if (!(haveSelectService && haveFilledCost)) {
        alert('please select service and filled the cost field');
        return false;
      } else {
        var recommendCollection = new Hktdc.Collections.Recommend();
        var ruleCodeArr = _.map(this.model.selectedServiceCollection.toJSON(), function(selectedService){
          return selectedService.Approver;
        });
        var ruleCode = _.uniq(ruleCodeArr).join(';');
        // console.log(this.model.toJSON().selectedApplicantModel.toJSON());
        var applicantUserId = this.model.toJSON().selectedApplicantModel.toJSON().UserId;
        var cost = this.model.toJSON().cost;
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
        })
      }
      // return (this.model.selectedServiceCollection.toJSON().length && this.model.toJSON().cost);
    },

    updateNewRequestModel: function(ev) {
      if (this.mode === 'read') {
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
      this.mode = props.mode;

      /* must render the parent content first */
      self.render();

      /* ----------- create new request ----------- */
      if (props.mode === 'new') {
        console.log('this is << new >> mode');

        /* create service collections */
        // self.model.selectedServiceCollection = new Hktdc.Collections.SelectedService();

        /* Render the components below */
        self.renderSelectedCCView();


        var serviceCatagoryCollections = new Hktdc.Collections.ServiceCatagory();
        serviceCatagoryCollections.fetch({
          beforeSend: utils.setAuthHeader,
          success: function() {
            try {
              console.debug('[views/newRequest.js] - onLoadData');
              var serviceCatagoryListView = new Hktdc.Views.ServiceCatagoryList({
                collection: serviceCatagoryCollections,
                requestFormModel: self.model
              });
              serviceCatagoryListView.render();
              $('#service-container').html(serviceCatagoryListView.el);

            } catch (e) {
              console.error('error on rendering service level1::', e);
            }
          },

          error: function(model, response) {
            console.error(JSON.stringify(response, null, 2));
          }
        });

        Q.all([
          self.loadEmployee(),
          self.loadApplicantDetail(),
          Q.fcall(self.loadButtons.bind(self))
        ])
          .then(function() {
            self.initModelChange();
          })
          .fail(function(e) {
            console.error(e);
          });

      } else if (props.mode === 'read') {
        console.debug('This is << EDIT >> mode');
        var requestList = this.model.toJSON().RequestList;
        var workflowLogList = this.model.toJSON().ProcessLog;
        var attachmentList = this.model.toJSON().Attachments;
        var serviceCatagoryCollections = new Hktdc.Collections.ServiceCatagory(requestList);
        var workflowLogCollections = new Hktdc.Collections.WorkflowLog(workflowLogList);
        var attachmentCollections = new Hktdc.Collections.Attachment(attachmentList);

        /* render the components below */

        var serviceCatagoryListView = new Hktdc.Views.ServiceCatagoryList({
          collection: serviceCatagoryCollections,
          requestFormModel: self.model
        });
        var workflowLogListView = new Hktdc.Views.WorkflowLogList({
          collection: workflowLogCollections,
          requestFormModel: self.model
        });
        var attachmentListView = new Hktdc.Views.AttachmentList({
          collection: attachmentCollections,
          requestFormModel: self.model
        });

        serviceCatagoryListView.render();
        $('#service-container').html(serviceCatagoryListView.el);

        workflowLogListView.render();
        $('#workflowlog-container').html(workflowLogListView.el);

        attachmentListView.render();
        $('#attachment-container').html(attachmentListView.el);

        self.renderSelectedCCView(this.model.toJSON().RequestCC);

        Q.all([
          self.loadEmployee(),
          // self.loadApplicantDetail(),
          Q.fcall(self.loadButtons.bind(self))
        ])
          .then(function() {
            $('input, textarea, button', self.el).prop('disabled', 'disabled');
          })
          .fail(function(e) {
            console.error(e);
          });
      }
    },

    initModelChange: function() {
      var self = this;
      this.model.on('change:selectedApplicantModel', function(model, selectedApplicantModel, options) {
        // console.log('on change selectedApplicantModel');
        console.log(self.model.toJSON().selectedApplicantModel.toJSON());
        var selectedUserName = selectedApplicantModel.toJSON().UserFullName;
        $('.selectedApplicant', self.el).text(selectedUserName);
        self.loadApplicantDetail();

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
        var showButtonOptions = {};
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
          showButtonOptions.showApplicant = false;
          showButtonOptions.showApprover = true;
          showButtonOptions.approverSendTo = 'Applicant';
        } else if (Preparer !== Applicant && Applicant === Approver) {
          // SubmittedTo = "Approver";
          // $("#btnapplicant").hide();
          // $("#btnapprover").text("Send to Approver");
          console.log('condition 2');
          console.log('Preparer !== Applicant && Applicant === Approver');
          self.model.set({ submittedTo: 'Approver' });
          showButtonOptions.showApplicant = false;
          showButtonOptions.showApprover = true;
          showButtonOptions.approverSendTo = 'Approver';
        } else if (Preparer === Applicant && Applicant === Approver) {
          // $('#btnapplicant').hide();
          // $('#btnapprover').text('Send to Task Actioner');
          console.log('condition 3');
          console.log('Preparer === Applicant && Applicant === Approver');
          self.model.set({ submittedTo: 'TaskActioner' });
          showButtonOptions.showApplicant = false;
          showButtonOptions.showApprover = true;
          showButtonOptions.approverSendTo = 'Task Actioner';
        } else if (Preparer === Applicant && Applicant !== Approver) {
          // SubmittedTo = "Approver";
          // $("#btnapplicant").hide();
          // $("#btnapprover").text("Send to Approver");
          console.log('condition 4');
          console.log('Preparer === Applicant && Applicant !== Approver');
          self.model.set({ submittedTo: 'Approver' });
          showButtonOptions.showApplicant = false;
          showButtonOptions.showApprover = true;
          showButtonOptions.approverSendTo = 'Approver';
        } else if (Preparer !== Applicant && AppRuleCode !== 'IT0009') {
          // $("#btnapplicant").show();
          // $("#btnapplicant").text("Send to Applicant");
          // $("#btnapprover").text("Send to Approver");
          console.log('condition 5');
          console.log('Preparer !== Applicant && AppRuleCode !== \'IT0009\'');
          // showButtonOptions.showApplicant = true;
          // showButtonOptions.showApprover = true;
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

        self.loadButtons(showButtonOptions);
      });

      this.model.selectedCCCollection.on('add', function(addedCC, newCollection) {
        var selectedUserName = addedCC.toJSON().UserFullName;
        var selectedUserId = addedCC.toJSON().UserId;
        $('.selectedCC', this.el).text(selectedUserName);
      });

      this.model.selectedServiceCollection.on('change', function(addedService, newCollection){
        console.log('changed service', addedService.toJSON());
        /* clear the selectedRecommentModel */
        self.model.set({ selectedRecommentModel: null });
      });

      this.model.selectedServiceCollection.on('add', function(addedService, newCollection){
        console.log('added service', addedService.toJSON());
        /* clear the selectedRecommentModel */
        self.model.set({ selectedRecommentModel: null });
      });

      this.model.on('change:showLog', function(model, isShow) {
        console.log('showLog: ', isShow);
      });
    },

    loadButtons: function(showButtonOptions) {

      /* load available buttons */
      var buttonModel = new Hktdc.Models.Button(showButtonOptions);
      var buttonView = new Hktdc.Views.Button({
        model: buttonModel,
        requestFormModel: this.model
      });
      $('.available-buttons', this.el).html(buttonView.el);
    },

    loadEmployee: function() {
      /* employee component */
      var deferred = Q.defer();
      var self = this;

      var employeeCollection = new Hktdc.Collections.Employee();
      employeeCollection.fetch({
        beforeSend: utils.setAuthHeader,
        success: function() {
          $('.applicant-container', self.el).append(new Hktdc.Views.ApplicantList({
            collection: new Hktdc.Collections.Applicant(employeeCollection.toJSON()),
            requestFormModel: self.model
          }).el);

          $('.cc-container', self.el).append(new Hktdc.Views.CCList({
            collection: new Hktdc.Collections.CC(employeeCollection.toJSON()),
            requestFormModel: self.model
          }).el);
          // console.log('selectedCCCollection: ', self.model.toJSON().selectedCCCollection);
          // console.log('selectedCCCollection: ', self.model);
          deferred.resolve();
        },
        error: function(err) {
          deferred.reject(err);
        }
      });

      return deferred.promise;

    },

    loadApplicantDetail: function() {
      var self = this;
      var deferred = Q.defer();
      this.model.toJSON().selectedApplicantModel.fetch({
        beforeSend: utils.setAuthHeader,
        success: function(res) {
          var selectedUserDepartment = res.toJSON().Depart;
          $('#divdepartment', self.el).text(selectedUserDepartment);
          deferred.resolve();
        },
        error: function(e) {
          deferred.reject(e);
        }
      });
      return deferred.promise;

    },

    renderSelectedCCView: function(input) {

      this.model.selectedCCCollection = new Hktdc.Collections.SelectedCC(input);
      $('.contact-group', this.el).append(new Hktdc.Views.SelectedCCList({
        collection: this.model.selectedCCCollection
      }).el);
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
