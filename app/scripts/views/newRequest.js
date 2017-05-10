/* global Hktdc, Backbone, JST, $, Q, utils, _, moment, dialogMessage, validateMessage */
Hktdc.Views = Hktdc.Views || {};

(function() {
  'use strict';

  Hktdc.Views.NewRequest = Backbone.View.extend({

    template: JST['app/scripts/templates/newRequest.ejs'],

    events: {
      // 'mousedown .recommend-select': 'mousedownRecommendSelect',
      'blur #txtjustification': 'updateNewRequestModel',
      // 'blur #txtexpectedDD': 'updateDateModelByEvent',
      'blur #txtfrequency': 'updateNewRequestModel',
      'blur #txtestimatedcost': 'updateNewRequestModel',
      'blur #txtbudgetprovided': 'updateNewRequestModel',
      // 'blur #txtbudgetsum': 'updateNewRequestModel',
      'blur #txtremark': 'updateNewRequestModel'
    },

    initialize: function(props) {
      // Backbone.Validation.bind(this);
      var self = this;
      /* *** Some model data is pre-set in the main router *** */

      /* must render the parent content first */
      //   return moment(date).format('DD MMM YYYY');
      // },
      // toValue: function(date, format, language) {
      //   return moment(date).format('YYYY-MM-DD');

      if (self.model.toJSON().EDeliveryDate && moment(self.model.toJSON().EDeliveryDate, 'YYYYMMDD').isValid()) {
        self.model.set({
          EDeliveryDate: moment(self.model.toJSON().EDeliveryDate, 'YYYYMMDD').format('DD MMM YYYY')
        });
      }
      self.setCommentBlock();
      self.render();

      /* mode === new */
      if (this.model.toJSON().mode === 'new') {
        console.debug('this is << NEW >> mode');

        /* First load all remote data */
        Q.all([
          self.loadEmployee(),
          self.loadApplicantDetail(),
          self.loadServiceCatagory(),
          self.loadFileTypeRules(),
          self.loadColleague()
        ])
        .then(function(results) {
          console.log('load ed resource');
          self.employeeArray = results[0];
          self.colleagueCollection = results[4];
          self.model.set({
            selectedServiceCollection: new Hktdc.Collections.SelectedService(),
            selectedAttachmentCollection: new Hktdc.Collections.SelectedAttachment(),
            employeeList: results[0]
          });

          /* Render the components below */
          self.renderApplicant(results[0]);
          self.renderApplicantDetail(results[1], results[0]);
          self.renderServiceCatagory(results[2]);
          self.renderAttachment(results[3]);
          self.renderCCList(results[4]);
          self.renderSelectedCCView();
          self.initDatePicker();
          self.checkAndLoadRecommend();
          /* default render the save button only,
           after change the approver(recommend by), render other button */
          self.renderButtons();
          /* init event listener last */
          setTimeout(function() {
            self.initModelChange();
          }, 500);
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
          self.loadApplicantDetail(),
          self.loadFileTypeRules(),
          self.loadColleague()
        ])
        .then(function(results) {
          console.log('loaded resource');
          self.employeeArray = results[0];
          self.colleagueCollection = results[4];

          var recommend = _.find(results[0], function(employee) {
            return employee.UserId === self.model.toJSON().ApproverUserID;
          });

          /* need override the workerId and WorkerFullName */
          recommend.WorkerId = recommend.UserId;
          recommend.WorkerFullName = recommend.UserFullName;
          var attachmentModelArray = _.map(self.model.toJSON().Attachments, function(attachment) {
            return new Hktdc.Models.Attachment();
          });
          self.model.set({
            selectedServiceTree: self.model.toJSON().RequestList,
            /* must sync RequestList to selectedServiceCollection for updating */
            selectedServiceCollection: new Hktdc.Collections.SelectedService(
              self.getAllRequestArray(self.model.toJSON().RequestList)
            ),
            selectedRecommentModel: new Hktdc.Models.Recommend(recommend),
            selectedAttachmentCollection: new Hktdc.Collections.SelectedAttachment(attachmentModelArray),
            deleteAttachmentIdArray: [],
            selectedCCCollection: new Hktdc.Collections.SelectedCC(self.model.toJSON().RequestCC)

          });
          // console.log(self.model.toJSON().selectedServiceCollection.toJSON());

          /* Render the components below */
          self.renderApplicant(results[0]);
          self.renderServiceCatagory(results[1]);
          self.renderApplicantDetail(results[2], results[0]);
          self.renderWorkflowLog(self.model.toJSON().ProcessLog);
          // self.renderServiceCatagory(self.mergeServiceCollection(results[1].toJSON(), self.model.toJSON().RequestList));
          self.renderAttachment(results[3], self.model.toJSON().Attachments);
          self.renderCCList(results[4]);
          self.renderSelectedCCView(self.model.toJSON().RequestCC);
          self.checkAndLoadRecommend();
          self.initDatePicker();

          self.renderButtons();

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

    render: function() {
      /* selectedApplicantModel is from mainRouter */
      // console.log(this.model.toJSON().selectedApplicantModel.toJSON());
      this.model.set({
        selectedApplicantName: this.model.toJSON().selectedApplicantModel.toJSON().UserFullName
      });

      this.$el.html(this.template({
        request: this.model.toJSON()
      }));
    },

    mousedownRecommendSelect: function(ev) {
      return this.haveBudgetAndService(false, ev);
    },

    checkAndLoadRecommend: function() {
      var self = this;
      self.toggleInvalidMessage('selectedRecommentModel', false);
      if (self.haveBudgetAndService(true)) {
        self.renderRecommendList();
      } else {
        self.model.set({
          selectedRecommentModel: null
        });
      }
    },

    haveBudgetAndService: function(allowEmptyService, ev) {
      // if (this.model.toJSON().mode === 'read') {
      //   return false;
      // }
      var self = this;
      var haveSelectService = function() {
        var valid = true;
        if (self.model.toJSON().selectedServiceCollection.toJSON().length <= 0 && !allowEmptyService) {
          self.highlightServiceCatagory(true);
          valid = false;
        } else {
          self.highlightServiceCatagory(false);
        }
        self.model.toJSON().selectedServiceCollection.each(function(service) {
          if (!service.toJSON().Notes) {
            valid = false;
            Hktdc.Dispatcher.trigger('serviceInvalid');
          }
        });
        // console.log('it is ', valid, '!!!!!!');
        if (valid) {
          // console.log('con 2');
          Hktdc.Dispatcher.trigger('serviceInvalid', true);
        }
        return valid;
      };

      var haveFilledCost = !!this.model.toJSON().EstimatedCost;
      // console.log(this.model.toJSON().selectedServiceCollection.toJSON());
      // console.log(this.model.toJSON().EstimatedCost);
      // console.log('haveSelectService(): ', haveSelectService());
      // console.log('haveFilledCost: ', haveFilledCost);
      // console.log('!(haveSelectService() && haveFilledCost) = ', !(haveSelectService() && haveFilledCost));
      if (!(haveSelectService() && haveFilledCost)) {
        // if it is fired by the click event
        if (ev) {
          if (ev && ev.preventDefault) {
            ev.preventDefault();
          }

          Hktdc.Dispatcher.trigger('openAlert', {
            message: dialogMessage.requestForm.validation.general,
            title: 'Input Error'
          });
        }
        return false;
      }
      return true;
      // return (this.model.toJSON().selectedServiceCollection.toJSON().length && this.model.toJSON().cost);
    },

    updateNewRequestModel: function(ev) {
      var targetField = $(ev.target).attr('field');
      if (this.model.toJSON().mode === 'read' && targetField !== 'Remark') {
        return false;
      }
      var updateObject = {};
      updateObject[targetField] = $(ev.target).val();
      // double set is to prevent invalid value bypass the set model process
      // because if saved the valid model, then set the invalid model will not success and the model still in valid state
      this.model.set(updateObject);

      this.model.set(updateObject, {
        validate: true,
        field: targetField
      });
    },

    updateDateModelByEvent: function(ev) {
      var field = $(ev.target).attr('field');
      var value = '';
      var obj = {};
      if ($(ev.target).val()) {
        value = moment($(ev.target).val(), 'DD MMM YYYY').format('YYYY-MM-DD');
      }
      obj[field] = value;

      this.model.set(obj, {
        validate: true,
        field: 'EDeliveryDate'
      });
      this.model.set(obj);
    },

    selectedServiceValid: function() {
      var isValid = true;
      var selectedServiceCollection = this.model.toJSON().selectedServiceCollection;
      // console.log(selectedServiceCollection);
      if (!selectedServiceCollection || selectedServiceCollection.length === 0) {
        isValid = false;
      } else {
        selectedServiceCollection.each(function(selectedServiceModel) {
          var selectedService = selectedServiceModel.toJSON();
          console.log(selectedService);
          if (!selectedService.Notes) {
            isValid = false;
          }
        });
      }
      // return false;
      // console.log(isValid);
      return isValid;
    },

    toggleInvalidMessage: function(field, isShow) {
      // console.log('toggleInvalidMessage: ', field);
      var self = this;
      var $target = $('[field=' + field + ']', self.el);
      // console.log($target);
      var $errorContainer = ($target.parent().find('.error-message').length)
        ? $target.parent().find('.error-message')
        : $target.parent().siblings('.error-message');
      if (isShow) {
        $errorContainer.removeClass('hidden');
        $target.addClass('error-input');
      } else {
        $errorContainer.addClass('hidden');
        $target.removeClass('error-input');
      }
    },

    initModelChange: function() {
      var self = this;
      this.model.on('change:selectedApplicantModel', function(model, selectedApplicantModel, options) {
        // console.log('on change selectedApplicantModel');
        // console.log('change:selectedApplicantModel: ', self.model.toJSON().selectedApplicantModel.toJSON());
        var selectedUserName = selectedApplicantModel.toJSON().UserFullName;
        $('.selectedApplicant', self.el).text(selectedUserName);
        /* clear the selectedRecommentModel */
        // self.model.set({ selectedRecommentModel: null });

        /* get new approver list */
        self.checkAndLoadRecommend();

        /* clear the button set to prevent lag button render */
        // self.doRenderButtons({showSave: true});
        self.renderButtons();

        self.loadApplicantDetail()
          .then(function(applicant) {
            self.renderApplicantDetail(applicant, self.model.toJSON().employeeList);
            self.renderButtons();
          });
      });

      this.model.on('change:EstimatedCost', function(model, newCost, options) {
        // console.log('change cost');
        /* clear the selectedRecommentModel */
        // self.model.set({ selectedRecommentModel: null });

        /* get new approver list */
        self.checkAndLoadRecommend();
        self.renderButtons();
      });

      /* click recommend will trigger change of the selectedRecommentModel */
      this.model.on('change:selectedRecommentModel', function(model, selectedRecommentModel, options) {
        if (!selectedRecommentModel) {
          // console.log('nononono: ',$('.recommend-select option:eq(1)', self.el));
          $('.recommend-select option:eq(0)', self.el).prop('selected', true);
          return false;
        }
        // console.log('selectedRecommentModel:', selectedRecommentModel.toJSON());
        var selectedUserName = selectedRecommentModel.toJSON().WorkerFullName;
        // console.log(selectedUserName);
        $('.recommend-select option[value="' + selectedUserName + '"]', self.el).prop('selected', true);

        self.model.set({
          selectedRecommentModel: self.model.toJSON().selectedRecommentModel
        }, {
          validate: true,
          field: 'selectedRecommentModel'
        });

        self.renderButtons();
      });

      this.model.on('invalid', function(model, validObj) {
        self.toggleInvalidMessage(validObj.field, true);
      });

      this.listenTo(this.model, 'valid', function(validObj) {
        // console.log('is valid', validObj);
        self.toggleInvalidMessage(validObj.field, false);
      });

      this.model.toJSON().selectedCCCollection.on('add', function(addedCC, newCollection) {
        var selectedUserName = addedCC.toJSON().FullName;
        // var selectedUserId = addedCC.toJSON().UserID;
        $('.selectedCC', this.el).text(selectedUserName);
      });

      this.model.toJSON().selectedServiceCollection.on('add', function(addedService, newCollection) {
        /* clear the selectedRecommentModel */
        // self.model.set({ selectedRecommentModel: null });
        // console.log('add<><><>');
        /* get new approver list */
        self.checkAndLoadRecommend();

        self.renderButtons();
      });

      this.model.toJSON().selectedServiceCollection.on('change', function(changedModel) {
        /* clear the selectedRecommentModel */
        // self.model.set({ selectedRecommentModel: null });
        // console.log('change{}{}{}{}');
        /* get new approver list */
        self.checkAndLoadRecommend();

        self.renderButtons();
      });

      this.model.toJSON().selectedServiceCollection.on('remove', function(changedModel) {
        /* clear the selectedRecommentModel */
        /* get new approver list */
        // console.log('remove selected service');
        self.checkAndLoadRecommend();
        self.renderButtons();
      });
    },

    initDatePicker: function() {
      var self = this;
      var createdOn = {
        year: moment(self.model.toJSON().CreatedOn, 'DD MMM YYYY').year(),
        month: moment(self.model.toJSON().CreatedOn, 'DD MMM YYYY').month(),
        day: moment(self.model.toJSON().CreatedOn, 'DD MMM YYYY').date()
      };
      var createdDate = new Date(createdOn.year, createdOn.month, createdOn.day);
      var today = new Date();
      var startDate = (today > createdDate) ? today : createdDate;

      var deliveryDateView = new Hktdc.Views.DatePicker({
        model: new Hktdc.Models.DatePicker({
          placeholder: '',
          field: 'EDeliveryDate',
          value: self.model.toJSON().EDeliveryDate
        }),
        startDate: startDate,
        onSelect: function(val) {
          self.model.set({
            EDeliveryDate: (moment(val, 'YYYY-MM-DD').isValid())
              ? moment(val, 'YYYY-MM-DD').format('YYYYMMDD')
              : ''
          }, {
            validate: true,
            field: 'EDeliveryDate'
          });

          self.model.set({
            EDeliveryDate: (moment(val, 'YYYY-MM-DD').isValid())
              ? moment(val, 'YYYY-MM-DD').format('YYYYMMDD')
              : ''
          });
        }
      });

      $('.delivery-datepicker-container', self.el).prepend(deliveryDateView.el);
    },

    getGroupedRequestList: function(RequestList) {
      var groupedRequestList = _.each(RequestList, function(serviceObj) {
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
      var doFetch = function() {
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
          error: function(collection, response) {
            utils.apiErrorHandling(response, {
              // 401: doFetch,
              unknownMessage: dialogMessage.component.serviceCatagoryList.error
            });
          }
        });
      };
      doFetch();

      return deferred.promise;
    },

    loadEmployee: function() {
      /* employee component */
      var deferred = Q.defer();
      var employeeCollection = new Hktdc.Collections.Employee();
      var doFetch = function() {
        employeeCollection.fetch({
          beforeSend: utils.setAuthHeader,
          success: function() {
            deferred.resolve(employeeCollection.toJSON());
          },
          error: function(collection, response) {
            utils.apiErrorHandling(response, {
              // 401: doFetch,
              unknownMessage: dialogMessage.component.employeeList.error
            });
          }
        });
      };
      doFetch();

      return deferred.promise;
    },

    loadApplicantDetail: function() {
      var self = this;
      var deferred = Q.defer();
      var doFetch = function() {
        self.model.toJSON().selectedApplicantModel.fetch({
          beforeSend: utils.setAuthHeader,
          success: function(res) {
            var selectedApplicantModel = res;
            deferred.resolve(selectedApplicantModel);
          },
          error: function(model, response) {
            utils.apiErrorHandling(response, {
              // 401: doFetch,
              unknownMessage: dialogMessage.component.applicantDetail.error
            });
          }
        });
      };
      doFetch();
      return deferred.promise;
    },

    loadFileTypeRules: function() {
      var deferred = Q.defer();
      var fileRuleModel = new Hktdc.Models.FileRule();
      var doFetch = function() {
        fileRuleModel.fetch({
          beforeSend: utils.setAuthHeader,
          success: function() {
            deferred.resolve(fileRuleModel);
          },
          error: function(model, response) {
            utils.apiErrorHandling(response, {
              // 401: doFetch,
              unknownMessage: dialogMessage.component.fileRule.error
            });
          }
        });
      };
      doFetch();
      return deferred.promise;
    },

    loadColleague: function() {
      var deferred = Q.defer();
      var colleagueCollection = new Hktdc.Collections.Colleague();
      var doFetch = function() {
        colleagueCollection.fetch({
          beforeSend: utils.setAuthHeader,
          success: function() {
            deferred.resolve(colleagueCollection);
          },
          error: function(collection, response) {
            utils.apiErrorHandling(response, {
              // 401: doFetch,
              unknownMessage: dialogMessage.component.userList.error
            });
          }
        });
      };
      doFetch();

      return deferred.promise;
    },

    renderApplicant: function(employeeArray) {
      var self = this;
      var applicantSelectView = new Hktdc.Views.ApplicantSelect({
        collection: new Hktdc.Collections.Applicant(employeeArray),
        selectedApplicant: self.model.toJSON().ApplicantUserID || Hktdc.Config.userID,
        allowEmpty: false,
        disabled: function() {
          return self.model.toJSON().actions && self.model.toJSON().actions.length > 0;
        },
        onSelect: function(model) {
          // console.log(model.toJSON());
          var val = (model) ? model.toJSON().UserId : null;
          self.model.set({
            applicant: val,
            selectedApplicantModel: model
          });
        }
      });
      applicantSelectView.render();

      $('.applicant-container', this.el).append(applicantSelectView.el);
      /* check me === formModel.applicant => disabled applicant button because preparer prepare form to applicant */
      /* this.model.ApplicantUserID present means it's not from new form */
      if (this.model.ApplicantUserID === Hktdc.Config.userID) {
        $('.applicant-container', this.el).find('button').prop('disabled', true);
      }
    },

    renderCCList: function(fullEmployeeList) {
      var self = this;
      var $input = $('.cc-picker', this.el);
      // console.log($input);
      var employeeExceptSelf = _.reject(fullEmployeeList.toJSON(), function(employee) {
        return employee.UserID === Hktdc.Config.userID;
      });
      var newEmployeeArray = _.map(employeeExceptSelf, function(employee) {
        employee.label = employee.FullName;
        return employee;
      });
      $input.autocomplete({
        source: newEmployeeArray,
        minLength: 2,
        delay: 500,
        select: function(ev, ui) {
          var existing = _.find(self.model.toJSON().selectedCCCollection.toJSON(), function(cc) {
            return (cc.UserID === ui.item.UserID);
          });
          if (!existing) {
            self.model.toJSON().selectedCCCollection.add(new Hktdc.Models.CC(ui.item));
          }
        },
        close: function(ev, ui) {
          // console.log($(ev.target).val());
          $(ev.target).val('');
        }
      });
    },

    setCommentBlock: function() {
      var me = Hktdc.Config.userID;
      var preparer = this.model.toJSON().PreparerUserID;
      if (
        this.model.toJSON().mode === 'read' &&
        (
          (this.model.toJSON().FormStatus && this.model.toJSON().FormStatus !== 'Draft') ||
          (this.model.toJSON().FormStatus === 'Approval' && me !== preparer)
        ) &&
        this.model.toJSON().actions
      ) {
        this.model.set({
          showRemark: true
        });
      }
    },

    renderButtons: function() {
      var self = this;
      var buttonModel = new Hktdc.Models.Button();
      var buttonView = new Hktdc.Views.Button({
        model: buttonModel,
        requestFormModel: this.model
      });
      buttonView.renderButtonHandler();

      self.listenTo(buttonModel, 'checkRemark', function(successCallback) {
        self.toggleInvalidMessage('Remark', false);
        self.toggleInvalidMessage('Forward_To_ID', false);

        self.checkRemark(true, successCallback);
      });
      self.listenTo(buttonModel, 'checkForward', function(successCallback) {
        self.toggleInvalidMessage('Remark', false);
        self.toggleInvalidMessage('Forward_To_ID', false);

        self.checkForward(true, successCallback);
      });

      this.listenTo(buttonModel, 'checkIsValid', function(successCallback) {
        var serviceValid = true;
        if (!self.haveBudgetAndService(false)) {
          serviceValid = false;
        }
        self.validateField();

        if (self.model.isValid() && serviceValid) {
          if (successCallback) {
            successCallback();
          }
        } else {
          Hktdc.Dispatcher.trigger('openAlert', {
            title: 'Input Error',
            message: dialogMessage.requestForm.validation.general
          });
        }
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
      this.model.set({
        selectedCCCollection: new Hktdc.Collections.SelectedCC(input)
      });
      $('.contact-group', this.el).append(new Hktdc.Views.SelectedCCList({
        collection: this.model.toJSON().selectedCCCollection,
        requestFormModel: this.model
      }).el);
    },

    renderWorkflowLog: function(workflowLogList) {
      if (this.model.toJSON().ProcessLog && this.model.toJSON().ProcessLog.length > 0) {
        var workflowLogCollections = new Hktdc.Collections.WorkflowLog(workflowLogList);
        var workflowLogListView = new Hktdc.Views.WorkflowLogList({
          collection: workflowLogCollections,
          requestFormModel: this.model
        });
        workflowLogListView.render();
        $('#workflowlog-container').html(workflowLogListView.el);
      }
    },

    renderAttachment: function(rulesModel, attachmentList) {
      var attachmentCollections = new Hktdc.Collections.Attachment(attachmentList);
      // console.log(rulesModel);
      var attachmentListView = new Hktdc.Views.AttachmentList({
        collection: attachmentCollections,
        requestFormModel: this.model,
        rules: rulesModel.toJSON()
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

    renderRecommendList: function() {
      var self = this;
      var recommendCollection = new Hktdc.Collections.Recommend();
      var ruleCodeArr = _.map(this.model.toJSON().selectedServiceCollection.toJSON(), function(selectedService) {
        return selectedService.Approver;
      });
      var ruleCode = _.uniq(ruleCodeArr).join(',');
      // console.log('ruleCode:::::::', this.model.toJSON().selectedApplicantModel.toJSON());
      var applicantUserId = this.model.toJSON().selectedApplicantModel.toJSON().UserId;
      var cost = this.model.toJSON().EstimatedCost;
      // console.log('selectedRecommend:', self.model.toJSON().ApproverUserID);
      recommendCollection.url = recommendCollection.url(ruleCode, applicantUserId, cost);
      var doFetch = function() {
        recommendCollection.fetch({
          beforeSend: utils.setAuthHeader,
          success: function() {
            var recommendListView = new Hktdc.Views.RecommendList({
              collection: recommendCollection,
              requestFormModel: self.model,
              tagName: 'select',
              className: 'form-control recommend-select',
              attributes: { field: 'selectedRecommentModel', name: 'selectedRecommentModel' },
              selectedRecommend: self.model.toJSON().ApproverUserID
            });
            $('.recommend-select', self.el).remove();
            $('.recommend-container', self.el).html(recommendListView.el);
            var selected = null;
            recommendCollection.each(function(approverModel) {
              if (
                self.model.toJSON().selectedRecommentModel &&
                (self.model.toJSON().selectedRecommentModel.toJSON().WorkerId === approverModel.toJSON().WorkerId)
              ) {
                selected = approverModel.toJSON();
              }
            });
            if (selected) {
              $('.recommend-select option[value="' + selected.WorkerId + '"]', self.el).prop('selected', true);
            } else {
              $('.recommend-select option:eq(0)', self.el).prop('selected', true);
              self.model.set({
                selectedRecommentModel: null
              });
            }
          },
          error: function(collection, response) {
            utils.apiErrorHandling(response, {
              // 401: doFetch,
              unknownMessage: dialogMessage.component.recommendList.error
            });
          }
        });
      };
      doFetch();
    },

    validateField: function() {
      var self = this;

      self.model.set({
        Justification: self.model.toJSON().Justification
      }, {
        validate: true,
        field: 'Justification'
      });

      self.model.set({
        selectedRecommentModel: self.model.toJSON().selectedRecommentModel
      }, {
        validate: true,
        field: 'selectedRecommentModel'
      });

      self.model.set({
        EstimatedCost: self.model.toJSON().EstimatedCost
      }, {
        validate: true,
        field: 'EstimatedCost'
      });

      self.model.set({
        EDeliveryDate: self.model.toJSON().EDeliveryDate
      }, {
        validate: true,
        field: 'EDeliveryDate'
      });
    },

    highlightServiceCatagory: function(isHighlight) {
      if (isHighlight) {
        $('#service-container', this.el)
          .addClass('error-input')
          .siblings('.error-message')
          .html(validateMessage.required)
          .removeClass('hidden');
      } else {
        $('#service-container', this.el)
          .removeClass('error-input')
          .siblings('.error-message')
          .html('')
          .addClass('hidden');
      }
    },

    checkRemark: function(openAlert, successCallback) {
      var self = this;
      if (!self.model.toJSON().Remark) {
        if (openAlert) {
          Hktdc.Dispatcher.trigger('openAlert', {
            title: 'Input Error',
            message: dialogMessage.requestForm.validation.general
          });
        }

        self.toggleInvalidMessage('Remark', true);
      } else {
        self.toggleInvalidMessage('Remark', false);
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
            title: 'Input Error',
            message: dialogMessage.requestForm.validation.general
          });
        }

        self.toggleInvalidMessage('Forward_To_ID', true);
      } else {
        self.toggleInvalidMessage('Forward_To_ID', false);
        if (successCallback) {
          successCallback();
        }
      }
    }

  });
})();
