/* global Hktdc, Backbone, JST, $, Q, utils, _, moment, dialogMessage, validateMessage, dialogTitle */
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
          console.log('initialize(New)-->checkAndLoadRecommend');
          self.checkAndLoadRecommend(true,false,true);
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
          //recommend.WorkerId = recommend.UserId;
		  //recommend.WorkerFullName = recommend.UserFullName;
      if(!(recommend)){ recommend = new Hktdc.Models.Employee();}
		  recommend.WorkerId = self.model.toJSON().ApproverUserID;
		  recommend.WorkerFullName = self.model.toJSON().ApproverFNAME;
		  
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
          //console.log('initialize(Edit)-->checkAndLoadRecommend');
          self.checkAndLoadRecommend(false,true,true);
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
      return this.haveBudgetAndService(false,true,true,ev);
    },

    checkAndLoadRecommend: function(isNewMode,isEditMode,isServiceAdd) {
	     var self = this;
	    self.toggleInvalidMessage('selectedRecommentModel', false);
      if(isNewMode){
          self.renderRecommendList(isNewMode,isEditMode);
        }
      else{
          if (self.haveBudgetAndService(false,isServiceAdd,false)) {
            self.renderRecommendList(isNewMode,isEditMode);
          }
        }
      if (self.model.toJSON().firstTimeValidate === false) {
        setTimeout(function() {
          self.model.set({
            selectedRecommentModel: self.model.toJSON().selectedRecommentModel
          }, {
            validate: true,
            field: 'selectedRecommentModel'
          });
        });
      }
    },
	
	haveSelectService:function(allowEmptyService,validateNotes) {
      var self = this;
      var isValidService=true; 
	    if (self.model.toJSON().selectedServiceCollection.toJSON().length <= 0 && !allowEmptyService) {
        isValidService= false;
        return isValidService;
      }
      if(validateNotes)
        {
            //Notes Validation...
            self.model.toJSON().selectedServiceCollection.each(function(service) {
              if(!(service.toJSON().Notes) ||
                service.toJSON().Notes.length===0)
              {
                isValidService=false;
                return isValidService;
              }
            });
        }
		else
          {
            var noteExistCount=0;
            self.model.toJSON().selectedServiceCollection.each(function(service) {
              if(service.toJSON().Notes &&
                 service.toJSON().Notes.length>0)
              {
                noteExistCount=noteExistCount+1;
              }
            });
            if(noteExistCount===0)
              isValidService=false;
          }
	    return isValidService;
    },

    haveBudgetAndService: function(allowEmptyService,isServiceAdd,validateNotes,ev) { 
      var self = this;
      var haveFilledCost = !!this.model.toJSON().EstimatedCost;
      // if(isServiceAdd){
        if (!(self.haveSelectService(allowEmptyService,validateNotes) && haveFilledCost)) {
          // if it is fired by the click event
          if (ev) {
            // console.log('1');
            if (ev && ev.preventDefault) {
              // console.log('2');
              ev.preventDefault();
            }
            Hktdc.Dispatcher.trigger('openAlert', {
              title: dialogTitle.warning,
              message: dialogMessage.requestForm.validation.general
            });
          }
          return false;
        }
      //}
      // else{
      //     if(!haveFilledCost)
      //       return false;
      // }
      return true;
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
      //console.log('toggleInvalidMessage: ', field);
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
        //console.log('initModelChange-->change:selectedApplicantModel-->checkAndLoadRecommend');
        self.checkAndLoadRecommend(false,false,true);

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
        /* clear the selectedRecommentModel */
        // self.model.set({ selectedRecommentModel: null });

        /* get new approver list */
        //console.log('change:EstimatedCost-->checkAndLoadRecommend');        
        self.checkAndLoadRecommend(false,false,true);
        self.renderButtons();
      });

      /* click recommend will trigger change of the selectedRecommentModel */
      this.model.on('change:selectedRecommentModel', function(model, selectedRecommentModel, options) {
        if (!selectedRecommentModel) {
          $('.recommend-select option:eq(0)', self.el).prop('selected', true);
          return false;
        }
        var selectedUserName = selectedRecommentModel.toJSON().WorkerFullName;
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
        console.log(validObj.field);
        //self.toggleInvalidMessage(validObj.field, true);
		  });
	
      this.listenTo(this.model, 'valid', function(validObj) {
        self.toggleInvalidMessage(validObj.field,false);
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
        //console.log('selectedServiceCollection-->add');
        if(addedService)
        {
          if(addedService.toJSON().Notes && addedService.toJSON().Notes.length>0){
              self.checkAndLoadRecommend(false,false,true);
            }
        }
        self.renderButtons();
      });

      this.model.toJSON().selectedServiceCollection.on('change', function(changedModel) {
        /* clear the selectedRecommentModel */
        // self.model.set({ selectedRecommentModel: null });
        // console.log('change{}{}{}{}');
        /* get new approver list */
        //console.log('selectedServiceCollection-->change');
        if(changedModel)
        {
          if(changedModel.toJSON().Notes && changedModel.toJSON().Notes.length>0){
              self.checkAndLoadRecommend(false,false,false);
            }
        }
        self.renderButtons();
      });

      this.model.toJSON().selectedServiceCollection.on('remove', function(changedModel) {
        /* clear the selectedRecommentModel */
        /* get new approver list */
        // console.log('remove selected service');
		
        //console.log('selectedServiceCollection-->remove');
		    self.checkAndLoadRecommend(false,false,false);
        self.renderButtons();
      });
    },

    initDatePicker: function() {
      var self = this;
      //var createdOn = {
      //  year: moment(self.model.toJSON().CreatedOn, 'DD MMM YYYY').year(),
      //  month: moment(self.model.toJSON().CreatedOn, 'DD MMM YYYY').month(),
      //  day: moment(self.model.toJSON().CreatedOn, 'DD MMM YYYY').date()
      //};
      //var createdDate = new Date(createdOn.year, createdOn.month, createdOn.day);
      //var today = new Date();
      //var startDate = (today > createdDate) ? today : createdDate;
	
	  var nowDate = new Date();
      var today = new Date(nowDate.getFullYear(), nowDate.getMonth(), nowDate.getDate(), 0, 0, 0, 0);
      var deliveryDateView = new Hktdc.Views.DatePicker({
        model: new Hktdc.Models.DatePicker({
          placeholder: '',
          field: 'EDeliveryDate',
          value: self.model.toJSON().EDeliveryDate,
		  startdate:today
        }),
        //startDate: startDate,
        onSelect: function(val) {
          //self.model.set({
          //  EDeliveryDate: (moment(val, 'YYYY-MM-DD').isValid())
          //    ? moment(val, 'YYYY-MM-DD').format('YYYYMMDD')
          //    : ''
          //}, {
          //  validate: false,
          //  field: 'EDeliveryDate'
          //});

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
        //selectedApplicant: self.model.toJSON().ApplicantUserID || Hktdc.Config.userID,
		selectedApplicant: self.model.toJSON().ApplicantFNAME || Hktdc.Config.userName,
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
        self.model.set({
          firstTimeValidate: false
        });
        
		  var serviceValid = true;
      if(!(self.validateServiceCatagory())){
        console.log('service is invalid');
        serviceValid =false;
        }

      //Call to higlight all the mandatory feilds..
      var mandatoryExist=false;
      mandatoryExist=this.highlightMandatoryFields();
      
      //Call for self Validate(Can be Removed)
      self.validateField(); 
      if (self.model.isValid() && serviceValid) {
          if (successCallback) {
            successCallback();
          }
        } else {
          Hktdc.Dispatcher.trigger('openAlert', {
            title: dialogTitle.warning,
            message: dialogMessage.requestForm.validation.general
          });
        }
      });
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
	
	
	
	//Function to get the Recommended By Start:-
	renderRecommendList: function(isNewMode,isEditMode) {
	  var self = this;
      //add a laoding image and disabled the dropdown
      $('.recommend-select', self.el).attr('disabled','disabled');
      $('.data-table-loader', self.el).removeClass('hidden');

      //get all the parameters and build the backend sever url
      var recommendCollection = new Hktdc.Collections.Recommend();
      var ruleCodeArr = _.map(this.model.toJSON().selectedServiceCollection.toJSON(), function(selectedService) {
        return selectedService.Approver;
      });
	  
      var ruleCode = _.uniq(ruleCodeArr).join(',');
	    var applicantUserId = this.model.toJSON().selectedApplicantModel.toJSON().UserId;
	    var cost = this.model.toJSON().EstimatedCost;
	    recommendCollection.url = recommendCollection.url(ruleCode, applicantUserId, cost);
	    console.log('recommendCollection url');
		  console.log(recommendCollection.url);
		
      //actual db call to the backend sever(GetAllEmployeeDetails)
      var doFetch = function() {
		  recommendCollection.fetch({
          beforeSend: utils.setAuthHeader,
          success: function() {
              //Sucesss Starts
              //generate the recommendListView
              var recommendListView = new Hktdc.Views.RecommendList({
                collection: recommendCollection,
                requestFormModel: self.model,
                tagName: 'select',
                className: 'form-control recommend-select',
                attributes: { field: 'selectedRecommentModel', name: 'selectedRecommentModel' },
                selectedRecommend: self.model.toJSON().ApproverUserID
              });
              
             //Assign all the retrived values..
             setTimeout(function() {
                //apply the select logic..(Select Logic Start)
                var selected = null;var defaultSelected=null;var defaultWorker=null;var showWarning=true;
                if(recommendCollection)
                {
                  //Always get the defaultRecommendBy
                  var defaultUserCollection= recommendCollection.filter(function (el) {
                    return el.toJSON().IsDefault===1;
                  });						
                  if(defaultUserCollection && defaultUserCollection.length>0){
                    defaultWorker=defaultUserCollection[0].toJSON();
                  }

                  //GET THE EXIST WORKER ID
                  var existWorkerId=null;
                  if(isEditMode && self.model.toJSON().selectedRecommentModel){
                    existWorkerId=self.model.toJSON().selectedRecommentModel.toJSON().WorkerId;
                  }
                  else{ existWorkerId=$('select[name=selectedRecommentModel]').val();
                  }
                  console.log(existWorkerId);
                  
                  //get the previous selected value
                  if(existWorkerId && existWorkerId!="-- Select --")
                  {
                    showWarning=true;
                    recommendCollection.each(function(approverModel) {
                      if(existWorkerId === approverModel.toJSON().WorkerId)
                        {
                          defaultSelected = approverModel.toJSON();
                          showWarning=false;
                        }
                    });
                  }
                  else{ showWarning=false }
                }
                //apply the select logic ends..(Select Logic ends)
          
                //Default selection logic
                if(defaultSelected) {
                  selected=defaultSelected;               
                  showWarning=false;
                }
                else if(defaultWorker) {
                  selected=defaultWorker;
                  showWarning=true;  
                }
                else{selected=null; 
                }
                
                //Default selection logic ends
                $('.recommend-select', self.el).remove();
                $('.recommend-container', self.el).html(recommendListView.el);
                if (selected) {
                  $('.recommend-select option[value="' + selected.WorkerId + '"]', self.el).prop('selected', true);

                  //assign the selected value to the model..
				          self.model.attributes.selectedRecommentModel=selected;
                  self.model.set({
						                       selectedRecommentModel: new Hktdc.Models.Recommend(selected)
                                 }, 
                                 {
                                  validate: true,
                                  field: 'selectedRecommentModel'
                                 });
                } else {
                  $('.recommend-select option:eq(0)', self.el).prop('selected', true);
                  self.model.set({
                    selectedRecommentModel: null
                  });
                }
                if(showWarning && !(isNewMode))
                  {
                    Hktdc.Dispatcher.trigger('openAlert', {
                    title: dialogTitle.information,
                    message: dialogMessage.requestForm.validation.ApproverChange
                    });
                  }
                //Default selection logic Ends
              },1000);

              //remove a laoding image and enabled the dropdown
              //To Do:-Take the function out of Timeout
              setTimeout(function() {
              $('.recommend-select', self.el).removeAttr('disabled');
              $('.data-table-loader', self.el).addClass('hidden');
                  },1000);
              //Sucesss Ends
          },
          
          //Error starts
          error: function(collection, response) {
                utils.apiErrorHandling(response, {
                  // 401: doFetch,
                  unknownMessage: dialogMessage.component.recommendList.error
                });
                //error case remove a laoding image and enabled the dropdown
                $('.data-table-loader', self.el).addClass('hidden');
                $('.recommend-select', self.el).removeAttr('disabled');
              }
            //Error ends
            });
          };
          //do fetch ends
          
          //call for the do fetch function
          doFetch();  
    },
    //Function to get the Recommended By Source Ends:-
  
    //Function To Validate Mandatory feilds
    highlightMandatoryFields: function() {
      var self = this;
      var inputModel=self.model.toJSON();
      var isValidInput=true;
      var invalidCount=0;
      
      //Justification
      if (!(inputModel.Justification && inputModel.Justification.trim()))  {
        self.toggleInvalidMessage('Justification', true);
        invalidCount=invalidCount+1;
      }
      else {
        self.toggleInvalidMessage('Justification', false);
      }
      //selectedRecommentModel
      if (!self.model.toJSON().selectedRecommentModel) {
        self.toggleInvalidMessage('selectedRecommentModel', true);
        invalidCount=invalidCount+1;
      }
      else {
        self.toggleInvalidMessage('selectedRecommentModel', false);
      }
     
      //Estimated Cost
      if (!(self.model.toJSON().EstimatedCost && inputModel.EstimatedCost.trim())) {
        self.toggleInvalidMessage('EstimatedCost', true);
        invalidCount=invalidCount+1;
      }
      else {
        self.toggleInvalidMessage('EstimatedCost', false);
      }
      
      if(invalidCount>0){isValidInput=false; }
      return isValidInput;
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
  
	//Function to Validate the Level 1 Inputs(Selection)  
	validateServiceLevel1Inputs:function()
	  {
			var isValid = true;
			var categorySelectedCount = $('.service-catagory-item input:checked').length; 
			if(categorySelectedCount > 0)
			{
				$(".service-catagory-item").each(function() {
                var isCategoryCheck = $(this).find('.toplevelCheckBox');
                var isCategoryCheckValue = (isCategoryCheck.prop('checked')) ? 1 : 0;
                var categoryPanel = $(this).find('.group-details-Panel');
				
                //get if service type is already not defined	
                if(isCategoryCheckValue===1)
                {
                    //if level 2 is already defined no need to highlight
                    var serviceLevel2=categoryPanel.find('.Headleve2sub').length;
                    if(serviceLevel2<=0) {isValid=false; }
                }
				});
      }
      console.log('validateServiceLevel1Inputs-->',isValid);
			return isValid;
    },
	
    //Function to Validate the Level 2 Inputs(Service Notes[textArea])
	validateServiceLevel2Inputs:function()
	  {
		  var isValid = true;
		  //check UI inputs at level 2
		  if($('textarea.lastnosub').length>0)
		  {
				$('textarea.lastnosub').each(function() {
				  var serviceNotes=$(this).val();
					if(!(serviceNotes)) { isValid=false; }
				});
      }
      console.log('validateServiceLevel2Inputs-->',isValid);
		  return isValid;
		  
    },
	
    //Function to Validate the Level 3 Inputs(Service Notes[textArea])
	  validateServiceLevel3Inputs:function()
	  {
		   var isValid = true;
			
		  //check UI inputs at level 3
		  if($('textarea.service-notes').length>0)
		  {
				$('textarea.service-notes').each(function() {
				  var serviceNotes=$(this).val();
				  if(!(serviceNotes)) { isValid = false;}
				});
      }
      
      console.log('validateServiceLevel3Inputs-->',isValid);
		  return isValid;
	  },
	  
  //Function to validate the service Aquired For Section of UI
	validateServiceCatagory: function() {  
        
		    //Reset the service panel to original mode
        this.ResetServicePanel();

		    //Check for Service validation(Model/UI)
        var validService=false;
        if(this.haveSelectService(false,true))
        {
            //Check for valid service at UI level
             if(this.validateServiceLevel1Inputs() && this.validateServiceLevel2Inputs() && this.validateServiceLevel3Inputs()){
              validService=true;
            }
        }
		
		   //if all valid the proceed ahead no need to highlight
		   if(validService) { return true;}
        else
        {
              //get if any of the category is selected or not
              var categorySelectedCount = $('.service-catagory-item input:checked').length; 
              if(categorySelectedCount > 0)
              { 
                  this.highlightServiceLevel1Inputs();
                  this.highlightServiceLevel3Inputs();
                  this.highlightServiceLevel2Inputs();
              }
              else{ 
                  this.highlightAllServiceCategories();
                }
		    }
    },

    ResetServicePanel:function()
    {
        //Reset Header Panel
        $('#service-container', this.el)
              .removeClass('error-input')
              .siblings('.error-message')
              .html('')
              .addClass('hidden');

        //Reset Level 1
         $(".service-catagory-item").each(function() {
          var categoryPanel = $(this).find('.group-details-Panel');
          categoryPanel.removeClass('error-input')
                                  .parent().siblings('.error-message')
                                  .html('')
                                  .addClass('hidden');
         });
        
         //Reset Level 2
        $('textarea.lastnosub').each(function() {
              var $parentL2 = $(this).parents('.select-service');      
							$parentL2.find('.error-message').addClass('hidden');
							$parentL2.removeClass('error-input');
            });
        
        //Reset Level 3
         $('textarea.service-notes').each(function() {
		                 var $parent = $(this).parents('.select-service');
                            $parent.find('.error-message').addClass('hidden');
                            $parent.removeClass('error-input');
              });

    },

    //Function to higlight Parent Service Category..
    highlightAllServiceCategories:function() {  
            $('#service-container', this.el)
              .addClass('error-input')
              .siblings('.error-message')
              .html(validateMessage.required)
              .removeClass('hidden');
    },

    //Function to higlight Parent Service Level  1 Inputs..
	  highlightServiceLevel1Inputs: function() {  
      $(".service-catagory-item").each(function() {
                var isCategoryCheck = $(this).find('.toplevelCheckBox');
                var isCategoryCheckValue = (isCategoryCheck.prop('checked')) ? 1 : 0;
                var categoryPanel = $(this).find('.group-details-Panel');
				
                //get if service type is already not defined	
                if(isCategoryCheckValue===1)
                {
                    //if level 2 is already defined no need to highlight
                    var serviceLevel2=categoryPanel.find('.Headleve2sub').length;
                    if(serviceLevel2<=0)
                    {
                      categoryPanel.addClass('error-input')
                                    .parent().siblings('.error-message')
                                    .html(validateMessage.required)
                                    .removeClass('hidden');
                    }
                }
          });
    },

    //Function to higlight Parent Service Level 2 Inputs..
    highlightServiceLevel2Inputs: function(){  	    
        var level2Exist=$('textarea.lastnosub');
        if(level2Exist.length>0)
        {
            $('textarea.lastnosub').each(function() {
                    var serviceNotesL2=$(this).val();
                     var $parentL2 = $(this).parents('.select-service');
                     if(!(serviceNotesL2))
                      {
							            $parentL2.find('.error-message').removeClass('hidden').html(validateMessage.requiredInside);
							            $parentL2.addClass('error-input');
                      }
            });
        }
    },

    //Function to higlight Parent Service Level 3 Inputs..
    highlightServiceLevel3Inputs: function(){  	    
		var level3Exist = $('textarea.service-notes');
		    if(level3Exist.length>0)
        {
            $('textarea.service-notes').each(function() {
		                 var $parent = $(this).parents('.select-service');
						 var serviceNotes=$(this).val();
		                 if(!(serviceNotes))
                      {
                          $parent.find('.error-message').removeClass('hidden').html(validateMessage.requiredInside);
                          $parent.addClass('error-input');
                      }
              });
        }
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
            title: dialogTitle.warning,
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