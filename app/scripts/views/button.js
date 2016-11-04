/* global Hktdc, Backbone, JST, $, _ */

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
      this.setRequestObject(status, function(sendRequestModel) {
        /* send the request object */
        this.sendXhrRequest(sendRequestModel, function(data) {
          console.log('ended post data');
          /* send file */
          this.sendFile(data, function() {

          });
        }.bind(this));
      }.bind(this));

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
      callback(sendRequestModel);
    },

    getAcquireFor: function(model) {
      var requestFormData = model.toJSON();
      // console.log(requestFormData);
      // console.log(model.selectedCCCollection);
      // console.log(model.selectedCCCollection.toJSON());
      var basicData = {
        Justification_Importand_Notes: requestFormData.Justification,
        Expected_Dalivery_Date: requestFormData.EDeliveryDate,
        Frequency_Duration_of_Use: requestFormData.DurationOfUse,
        Estimated_Cost: requestFormData.EstimatedCost,
        Budget_Provided: requestFormData.BudgetProvided,
        Budgeted_Sum: requestFormData.BudgetSum,
        Recommend_By: (requestFormData.selectedRecommentModel) ?
          requestFormData.selectedRecommentModel.toJSON().WorkerFullName :
          null,
        Recommend_By_ID: (requestFormData.selectedRecommentModel) ?
          requestFormData.selectedRecommentModel.toJSON().WorkerId :
          null,
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

      return _.extend(basicData, serviceData);
    },

    getServiceData: function(selectedServiceCollectionArray) {
      /* serviceName and uatServiceName is the name from service type api call */
      /* This stupid mapping is beacause the server api is hardcoded the request service params */
      // console.log(selectedServiceCollectionArray);
      var catagoryMapping = [{
        paramName: 'Hardware_Software_IT_Service',
        serviceName: 'Acquire Hardware/Software/IT Services',
        uatServiceName: 'Hardware/Software/IT Services'
      }, {
        paramName: 'General_Support_StandBy_Service',
        serviceName: 'Acquire General Support/ Stand-by Services',
        uatServiceName: 'General Support/ Stand-by Services'
      }];

      var serviceMapping = [{
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
      }, {
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
      }, {
        paramName: 'Onsite_StandBy_Service',
        serviceName: {
          localDev: 'Request for Onsite/Stand-by Services',
          uat: 'Onsite/Stand-by Services'
        },
        object: [{
          param: 'Onsite_Service_Notes',
          name: 'Notes'
        }, {
          param: 'Onsite_Service_ID',
          name: 'GUID'
        }],
        parent: 'General_Support_StandBy_Service'
      }];

      var returnData = {};

      _.each(catagoryMapping, function(catagory) {
        var serviceUnderThisCatagory = _.filter(serviceMapping, function(service) {
          return service.parent === catagory.paramName;
        });

        var catService = {};
        _.each(serviceUnderThisCatagory, function(service) {
          var relatedServices = _.where(selectedServiceCollectionArray, {
            serviceTypeName: service.serviceName[Hktdc.Config.environment]
          });
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

    sendXhrRequest: function(sendRequestModel, callback) {
      Backbone.emulateHTTP = true;
      Backbone.emulateJSON = true;

      sendRequestModel.url = sendRequestModel.url('save');
      sendRequestModel.save({}, {
        beforeSend: utils.setAuthHeader,
        success: function(mymodel, response) {
          callback()
        },
        error: function() {

        }
      })
    },

    sendFile: function() {
      console.log('send file');
      return false;


      // TODO: convert following to backbone structure

      var filename = [];
      $(".spnfilename").each(function() {
        filename.push($(this).html());
      });
      var MyBackboneModel = Backbone.Model.extend({
        url: function() {
          return '' + Config.DomainName + '/api/request/SubmitFile?refid=' + $('#divRefID').text() + '&filename=' + filename + ''
        },
      });

      var model = new MyBackboneModel();
      var myData = filename;
      var ajaxOptions = {};
      var files = $("#Fileattach").get(0).files;

      var data = new FormData();
      if (files.length > 0) {
        for (i = 0; i < files.length; i++) {
          if (Sfiles.indexOf(files[i].name) != -1) {
            data.append("file" + i, files[i]);
          }
        }
      }

      ajaxOptions = {
        type: "POST",
        data: data,
        processData: false,
        cache: false,
        contentType: false
      };

      mymodel.set(myData);
      model.save(null, $.extend({}, ajaxOptions, {
        beforeSend: function() {
          console.log('Message')
        },
        headers: {
          "Authorization": 'Bearer ' + accessToken
        },
        success: function(model, response) {
          alert("Record Saved Successfully \n Reference ID : " + $('#divRefID').text() + "");

          if (status == "Submitted") {
            window.location.href = "index.html";
          } else if (status == "Draft") {
            window.location.href = "draft.html";
          }

        },
        error: function(model, response) {

          var err = eval("(" + response.responseText + ")");
          alert(err.Message);

        }

      }));


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
