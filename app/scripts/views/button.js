/* global Hktdc, Backbone, JST, $, _, utils, Q */

Hktdc.Views = Hktdc.Views || {};

(function() {
  'use strict';

  Hktdc.Views.Button = Backbone.View.extend({

    template: JST['app/scripts/templates/button.ejs'],

    tagName: 'div',

    className: 'btn-group',

    events: {
      'click #btnsave': 'clickSaveHandler',
      'click #btnapplicant': 'clickApplcantHandler',
      'click #btnapprover': 'clickApproverHandler'
    },

    clickSaveHandler: function() {
      this.saveAndApprover('Draft');
    },

    clickApplcantHandler: function() {
      this.saveAndApprover('Submitted');
    },

    clickApproverHandler: function() {
      this.saveAndApprover('Submitted');
    },

    saveAndApprover: function(status) {
      /* set the request object */
      Q.fcall(this.setRequestObject.bind(this, status))
        .then(function(sendRequestModel) {
          console.log('ended set data', sendRequestModel.toJSON());
          /* send the request object */
          return this.sendXhrRequest(sendRequestModel);
        }.bind(this))

        .then(function(data) {
          console.log('ended post data');
          /* send file */
          return this.sendAttactment(
            this.requestFormModel.toJSON().ReferenceID,
            this.requestFormModel.selectedAttachmentCollection
          );
        }.bind(this))

        .then(function(status) {
          console.log('end send attachment');
          if (status === 'Submitted') {
            window.location.href = '/';
          } else if (status === 'Draft') {
            window.location.href = '/#draft';
          }
        })

        .fail(function(err) {
          console.log(err);
        });
    },

    setRequestObject: function(status, callback) {
      if (status === 'Draft') {
        this.requestFormModel.set({ submittedTo: '' });
      }
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
        Service_AcquireFor: this.getAcquireFor(this.requestFormModel)
      });
      return sendRequestModel;
    },

    getAcquireFor: function(model) {
      var requestFormData = model.toJSON();
      console.log('requestFormData: ', requestFormData);
      // console.log(model.selectedCCCollection);
      // console.log(model.selectedCCCollection.toJSON());
      var basicData = {
        Justification_Importand_Notes: requestFormData.Justification,
        Expected_Dalivery_Date: requestFormData.EDeliveryDate,
        Frequency_Duration_of_Use: requestFormData.DurationOfUse,
        Estimated_Cost: requestFormData.EstimatedCost,
        Budget_Provided: requestFormData.BudgetProvided,
        Budgeted_Sum: requestFormData.BudgetSum,
        Recommend_By: (requestFormData.selectedRecommentModel)
          ? requestFormData.selectedRecommentModel.toJSON().WorkerFullName
          : null,
        Recommend_By_ID: (requestFormData.selectedRecommentModel)
          ? requestFormData.selectedRecommentModel.toJSON().WorkerId
          : null,
        cc: _.map(model.selectedCCCollection.toJSON(), function(ccData) {
          return {
            Name: ccData.UserFullName,
            UserID: ccData.UserId
          };
        }),
        Remark: requestFormData.Remark,
        SubmittedTo: requestFormData.submittedTo,
        ActionTakerRuleCode: this.getActionTaker(model.selectedServiceCollection.toJSON())
          // TODO:
          // Attachments: this.getFileName(),
      };
      var serviceData = this.getServiceData(model.selectedServiceCollection.toJSON());
      console.log('selectedServiceCollection', model.selectedServiceCollection.toJSON());
      console.log('serviceData', serviceData);
      _.extend(basicData, serviceData);
      // console.log('final send output: ', basicData);
      return basicData;
    },

    getServiceData: function(selectedServiceCollectionArray) {
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
          deferred.resolve();
        },
        error: function() {
          deferred.reject();
        }
      });
      return deferred.promise;
    },

    sendAttactment: function(refId, attachmentCollection) {
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
        // console.log(fileModel.toJSON());
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
          alert('Record Saved Successfully \n Reference ID : ' + $('#divRefID').text());
          deferred.resolve();
        },
        error: function(model, response) {
          deferred.reject();
          var err = eval("(" + response.responseText + ")");
          alert(err.Message);
        }
      }));
      return deferred.promise;
    },

    initialize: function(props) {
      // this.listenTo(this.model, 'change', this.render);
      this.requestFormModel = props.requestFormModel;
      this.render();
    },

    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
    }

  });
})();
