/* global Hktdc, Backbone, JST, $, _, utils, Q, confirm */

Hktdc.Views = Hktdc.Views || {};

(function() {
  'use strict';

  Hktdc.Views.Button = Backbone.View.extend({

    template: JST['app/scripts/templates/button.ejs'],

    tagName: 'div',

    className: 'available-buttons text-center',

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
      this.render();
    },

    clickWorkflowBtnHandler: function(ev) {
      // console.log(Backbone.history.getFragment());
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
      var isConfirm = confirm('Are you sure want to ' + actionName + '?');
      if (isConfirm) {
        Backbone.emulateHTTP = true;
        Backbone.emulateJSON = true;
        var worklistModel = new Hktdc.Models.WorklistAction();
        worklistModel.set(body);
        worklistModel.save({}, {
          beforeSend: utils.setAuthHeader,
          success: function(action, response) {
            console.log('ok');
            Backbone.history.navigate('alltask', {trigger: true});
            Hktdc.Dispatcher.trigger('reloadMenu');
            // window.location.href = "alltask.html";
          },
          error: function(action, response) {
            console.log('error');
          }
        });
      } else {
        console.log('not ' + actionName);
        return false;
      }
    },

    clickSaveHandler: function() {
      if (this.checkIsValid()) {
        var status = this.requestFormModel.toJSON().FormStatus || 'Draft';
        this.saveAndApprover(status, '');
      }
    },

    clickApplicantHandler: function() {
      if (this.checkIsValid()) {
        this.saveAndApprover('Submitted', 'applicant');
      }
    },

    clickApproverHandler: function() {
      if (this.checkIsValid()) {
        this.saveAndApprover('Submitted', 'approver');
      }
    },

    clickDeleteBtnHandler: function() {
      var isConfirm = confirm('Are you sure to delete the request?');
      var self = this;
      if (isConfirm) {
        Backbone.emulateHTTP = true;
        Backbone.emulateJSON = true;
        var refId = this.requestFormModel.toJSON().ReferenceID;
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
            Backbone.history.navigate('draft', {trigger: true});
          },
          error: function(err) {
            console.log(err);
            // console.log(b);
          }
        });
      } else {
        return false;
      }
      // var rowData = self.statusDataTable.row(this).data();
      // Backbone.history.navigate('request/' + rowData.refId, {trigger: true});
    },

    clickRecallBtnHandler: function() {
      var Con = confirm('Are you sure want to ' + this.requestFormModel.toJSON().FormID + '?');
      if (Con) {
        Backbone.emulateHTTP = true;
        Backbone.emulateJSON = true;
        var ActionModel = Backbone.Model.extend({
          urlRoot: Hktdc.Config.apiURL + '/RecallAction'
        });
        var action = new ActionModel();
        action.set({
          UserId: Hktdc.Config.userID,
          ProcInstID: this.requestFormModel.toJSON().ProcInstID,
          ActionName: 'Recall',
          Comment: this.requestFormModel.toJSON().Comment
        });
        action.save({}, {
          beforeSend: utils.setAuthHeader,
          success: function(action, response) {
            console.log(response);
            Hktdc.Dispatcher.trigger('openAlert', {
              message: 'Successfully Recall request',
              type: 'success',
              title: 'Success'
            });
            Backbone.history.navigate('/', {trigger: true});
          },
          error: function(action, response) {
            Hktdc.Dispatcher.trigger('openAlert', {
              message: 'Error on Recall request' + JSON.stringify(response.responseText.Message, null, 2),
              type: 'error',
              title: 'Error'
            });
          }
        });


      } else {
        return false;
      }
      // var rowData = self.statusDataTable.row(this).data();
      // Backbone.history.navigate('request/' + rowData.refId, {trigger: true});
    },

    checkIsValid: function() {
      var isValid = true;
      var errMessage = '';
      var self = this;
      // console.log(this.requestFormModel.toJSON());
      if (!(this.requestFormModel.toJSON().Justification && this.requestFormModel.toJSON().Justification.trim())) {
        isValid = false;
        errMessage = 'Please fill the Justification and Important Notes';
      } else if (!(this.requestFormModel.toJSON().EstimatedCost && this.requestFormModel.toJSON().EstimatedCost.trim())) {
        isValid = false;
        errMessage = 'Please fill the Estimated Cost';
      } else if (!this.requestFormModel.toJSON().selectedApplicantModel) {
        isValid = false;
        errMessage = 'Please select a Applicant';
      } else if (!this.requestFormModel.toJSON().selectedRecommentModel) {
        isValid = false;
        errMessage = 'Please select a Recommend By.';
      } else if (!self.selectedServiceValid()) {
        isValid = false;
        errMessage = 'Please fill all fields from the Service Acquired for.'
      }

      Hktdc.Dispatcher.trigger('openAlert', {
        message: errMessage,
        title: 'Error!',
        type: 'error'
      });

      return isValid;
    },

    selectedServiceValid: function() {
      var isValid = true;
      var selectedServiceCollection = this.requestFormModel.toJSON().selectedServiceCollection;
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

    saveAndApprover: function(status, submitTo) {
      /* set the request object */
      var realSubmitTo = this.requestFormModel.toJSON().applicantSubmittedTo;
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
          console.log('ended post data');
          /* send file */
          return this.sendAttachment(
            insertServiceResponse.FormID,
            this.requestFormModel.toJSON().selectedAttachmentCollection
          );
        }.bind(this))

        .then(function() {
          // console.log('end send attachment');
          // FormID = ReferenceID and FormID
          // if (true) {
          if (insertServiceResponse.FormID) {
            // window.location.href = Hktdc.Config.projectPath + '#draft';
            Hktdc.Dispatcher.trigger('openAlert', {
              message: 'Record Saved Successfully <br /> Reference ID : ' + insertServiceResponse.FormID,
              title: 'Success',
              type: 'success'
            });

            // if (true) {
            if (status === 'Submitted') {
              Backbone.history.navigate('', {trigger: true});
            } else if (status === 'Draft') {
              Backbone.history.navigate('draft', {trigger: true});
            }

            /* reload the menu for new counts */
            Hktdc.Dispatcher.trigger('reloadMenu');
          } else {
            Hktdc.Dispatcher.trigger('openAlert', {
              message: 'error on saving the record',
              title: 'Error',
              type: 'error'
            });
          }
        })

        .fail(function(err) {
          Hktdc.Dispatcher.trigger('openAlert', {
            message: 'catched error on saving the record: <br /><code>' + JSON.stringify(err, null, 2) + '</code>',
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

    getServiceData: function(selectedServiceCollectionArray) {
      /* !!!Dreprecated!!! */

      /* serviceName and uatServiceName is the name from service type api call */
      /* This stupid mapping is beacause the server api is hardcoded the request service params */
      // console.log(selectedServiceCollectionArray);
      var catagoryMapping = [
        {
          paramName: 'Hardware_Software_IT_Service',
          serviceName: 'Acquire Hardware/Software/IT Services',
          uatServiceName: 'Hardware/Software/IT Services'
        }, {
          paramName: 'General_Support_StandBy_Service',
          serviceName: 'Acquire General Support/ Stand-by Services',
          uatServiceName: 'General Support/ Stand-by Services'
        }
      ];

      var serviceMapping = [
        {
          paramName: 'Software_Service',
          serviceName: {
            localDev: 'Request for Software',
            uat: 'Software'
          },
          object: [{
            param: 'SW_Name',
            name: 'Name'
          }, {
            param: 'SW_Notes',
            name: 'Notes'
          }, {
            param: 'SW_GUID',
            name: 'GUID'
          }],
          parent: 'Hardware_Software_IT_Service'
        }, {
          paramName: 'Hardware_Service',
          serviceName: {
            localDev: 'Request for Hardware',
            uat: 'Hardware'
          },
          object: [{
            param: 'HW_Name',
            name: 'Name'
          }, {
            param: 'HW_Notes',
            name: 'Notes'
          }, {
            param: 'HW_GUID',
            name: 'GUID'
          }],
          parent: 'Hardware_Software_IT_Service'
        }, {
          paramName: 'Maintenance_Service',
          serviceName: {
            localDev: 'Request for Maintenance Services',
            uat: 'Maintenance Services'
          },
          object: [{
            param: 'Main_Name',
            name: 'Name'
          }, {
            param: 'Main_Notes',
            name: 'Notes'
          }, {
            param: 'Main_GUID',
            name: 'GUID'
          }],
          parent: 'Hardware_Software_IT_Service'
        }, {
          paramName: 'IT_Service',
          serviceName: {
            localDev: 'Request for IT Services(for IT only)',
            uat: 'IT Services(for IT only)'
          },
          object: [{
            param: 'IT_Name',
            name: 'Name'
          }, {
            param: 'IT_Notes',
            name: 'Notes'
          }, {
            param: 'IT_GUID',
            name: 'GUID'
          }],
          parent: 'Hardware_Software_IT_Service'
        },


        {
          paramName: 'General_Support',
          serviceName: {
            localDev: 'Request for General Support',
            uat: 'General Support'
          },
          object: [{
            param: 'Request_Name',
            name: 'Name'
          }, {
            param: 'Request_Notes',
            name: 'Notes'
          }, {
            param: 'Request_GUID',
            name: 'GUID'
          }],
          parent: 'General_Support_StandBy_Service'
        },

        {
          paramName: 'Onsite_StandBy_Service',
          serviceName: {
            localDev: 'Request for Onsite/Stand-by Services',
            uat: 'Onsite/Stand-by Services'
          },
          object: [{
            param: 'Onsite_Service_Notes',
            name: 'Notes'
          }, {
            param: 'Onsite_Service_Name',
            name: 'Name'
          }, {
            param: 'Onsite_Service_ID',
            name: 'GUID'
          }],
          parent: 'General_Support_StandBy_Service'
        }
      ];

      var returnData = {};

      _.each(catagoryMapping, function(catagory) {
        var serviceUnderThisCatagory = _.filter(serviceMapping, function(service) {
          return service.parent === catagory.paramName;
        });
        // console.log('serviceUnderThisCatagory', serviceUnderThisCatagory);
        var catService = {};
        _.each(serviceUnderThisCatagory, function(service) {
          // console.group();
          // console.log('selectedServiceCollectionArray', selectedServiceCollectionArray);
          // console.log('service.serviceName.uat', service.serviceName.uat);
          var relatedServices = _.where(selectedServiceCollectionArray, {
            serviceTypeName: service.serviceName.uat
            // serviceTypeName: service.serviceName[Hktdc.Config.environment]
          });
          // console.log('relatedServices', relatedServices);
          // console.groupEnd();
          relatedServices = _.map(relatedServices, function(relatedService) {
            var returnObj = {};
            _.each(service.object, function(obj) {
              returnObj[obj.param] = relatedService[obj.name];
            });
            return returnObj;
          });
          catService[service.paramName] = relatedServices;
        });
        returnData[catagory.paramName] = catService;
      });

      return returnData;
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
          deferred.reject(e);
        }
      });
      return deferred.promise;
    },

    sendAttachment: function(refId, attachmentCollection) {
      // console.group('files');
      // var attachmentCollection = attachmentCollection.toJSON();
      // var attachmentCollection = $('#Fileattach').get(0).files;
      // console.log('attchCollection', attachmentCollection);
      if (attachmentCollection.length <= 0) {
        return false;
      }
      var ajaxOptions = {
        type: 'POST',
        processData: false,
        cache: false,
        contentType: false
      };
      var deferred = Q.defer();
      var files = attachmentCollection;
      // var files = $('#Fileattach').get(0).files;
      var data = new FormData();
      var sendAttachmentModel = new Hktdc.Models.SendAttachment();
      var filename = attachmentCollection.map(function(fileModel) {
        return fileModel.toJSON().file.name;
      });
      // console.log(filename);
      sendAttachmentModel.url = sendAttachmentModel.url(refId, filename);

      attachmentCollection.each(function(fileModel, i) {
        console.log(fileModel.toJSON().file);
        data.append('file' + i, fileModel.toJSON().file);
      });

      // console.log('final data: ', data);
      // console.groupEnd();
      ajaxOptions.data = data;

      // mymodel = sendRequest model
      // mymodel.set(filename);
      sendAttachmentModel.save(null, $.extend({}, ajaxOptions, {
        beforeSend: utils.setAuthHeader,
        success: function(model, response) {
          Hktdc.Dispatcher.trigger('openAlert', {
            message: 'Record Saved Successfully <br /> Reference ID : ' + refId,
            type: 'success',
            title: 'Success'
          });
          deferred.resolve();
        },
        error: function(model, response) {
          deferred.reject();
          Hktdc.Dispatcher.trigger('openAlert', {
            message: 'Error on upload file',
            type: 'error',
            title: 'Error'
          });
        }
      }));
      return deferred.promise;
    },

    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
    }

  });
})();
