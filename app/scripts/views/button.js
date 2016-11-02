/*global Hktdc, Backbone, JST*/

Hktdc.Views = Hktdc.Views || {};

(function () {
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
      this.setRequestObject(status);

      /* send the request object */
      // this.sendXhrRequest(this.requestFormModel.toJSON());
    },

    setRequestObject: function(status) {
      var requestFormData = this.requestFormModel.toJSON();
      var sendRequestModel = new Hktdc.Models.SendRequest({
        Req_Status: status,
        Prepared_By: requestFormData.preparedByUserName,
        Preparer_ID: requestFormData.preparedByUserId,
        Ref_Id: requestFormData.refId,
        Created_Date: requestFormData.createDate,
        Applicant: requestFormData.selectedApplicantModel.toJSON().UserFullName,
        Applicant_ID: requestFormData.selectedApplicantModel.toJSON().UserId,
        Title: requestFormData.title,
        Office: requestFormData.office,
        Department: requestFormData.department,
        Service_AcquireFor: this.getAcquireFor(this.requestFormModel)
      });
      console.log(sendRequestModel.toJSON());
    },

    getAcquireFor: function(model) {
      var requestFormData = model.toJSON();
      // console.log(requestFormData);
      // console.log(model.selectedCCCollection);
      // console.log(model.selectedCCCollection.toJSON());
      var basicData = {
        Justification_Importand_Notes: requestFormData.justification,
        Expected_Dalivery_Date: requestFormData.deliveryDate,
        Frequency_Duration_of_Use: requestFormData.frequency,
        Estimated_Cost: requestFormData.cost,
        Budget_Provided: requestFormData.budget,
        Budgeted_Sum: requestFormData.budgetSum,
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
        Remark: null,
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
      var catagoryMapping = [
        {
          paramName: 'Hardware_Software_IT_Service',
          serviceName: 'Acquire Hardware/Software/IT Services',
          uatServiceName: 'Hardware/Software/IT Services'
        },
        {
          paramName: 'General_Support_StandBy_Service',
          serviceName: 'Acquire General Support/ Stand-by Services',
          uatServiceName: 'General Support/ Stand-by Services'
        },
      ];

      var serviceMapping = [
        {
          paramName: 'Software_Service',
          serviceName: {
            localDev: 'Request for Software',
            uat: 'Software'
          },
          object: [
            { param: 'SW_Name', name: 'Name'},
            { param: 'SW_Notes', name: 'Notes'},
            { param: 'SW_GUID', name: 'GUID'}
          ],
          parent: 'Hardware_Software_IT_Service'
        },
        {
          paramName: 'Hardware_Service',
          serviceName: {
            localDev: 'Request for Hardware',
            uat: 'Hardware'
          },
          object: [
            {param: 'HW_Name', name: 'Name'},
            {param: 'HW_Notes', name: 'Notes'},
            {param: 'HW_GUID', name: 'GUID'}
          ],
          parent: 'Hardware_Software_IT_Service'
        },
        {
          paramName: 'Maintenance_Service',
          serviceName: {
            localDev: 'Request for Maintenance Services',
            uat: 'Maintenance Services'
          },
          object: [
            {param: 'Main_Name', name: 'Name'},
            {param: 'Main_Notes', name: 'Notes'},
            {param: 'Main_GUID', name: 'GUID'}
          ],
          parent: 'Hardware_Software_IT_Service'
        },
        {
          paramName: 'IT_Service',
          serviceName: {
            localDev: 'Request for IT Services(for IT only)',
            uat: 'IT Services(for IT only)'
          },
          object: [
            {param: 'IT_Name', name: 'Name'},
            {param: 'IT_Notes', name: 'Notes'},
            {param: 'IT_GUID', name: 'GUID'}
          ],
          parent: 'Hardware_Software_IT_Service'
        },
        {
          paramName: 'General_Support',
          serviceName: {
            localDev: 'Request for General Support',
            uat: 'General Support'
          },
          object: [
            {param: 'Request_Name', name: 'Name'},
            {param: 'Request_Notes', name: 'Notes'},
            {param: 'Request_GUID', name: 'GUID'}
          ],
          parent: 'General_Support_StandBy_Service'
        },
        {
          paramName: 'Onsite_StandBy_Service',
          serviceName: {
            localDev: 'Request for Onsite/Stand-by Services',
            uat: 'Onsite/Stand-by Services'
          },
          object: [
            {param: 'Onsite_Service_Notes', name: 'Notes'},
            {param: 'Onsite_Service_GUID', name: 'GUID'}
          ],
          parent: 'General_Support_StandBy_Service'
        }
      ];

      var returnData = {};

      _.each(catagoryMapping, function(catagory) {
        var serviceUnderThisCatagory = _.filter(serviceMapping, function(service) {
          return service.parent === catagory.paramName;
        });

        var catService = {};
        _.each(serviceUnderThisCatagory, function(service) {
          var relatedServices = _.where(selectedServiceCollectionArray, {serviceTypeName: service.serviceName[Hktdc.Config.environment]});
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

    getActionTaker: function(selectedServiceCollectionArray){
      var actionTakerArray = _.map(selectedServiceCollectionArray, function(serviceData){
        // console.log(serviceData);
        return serviceData.ActionTaker;
      });
      return _.uniq(actionTakerArray).join(';');
    },

    sendXhrRequest: function(data) {
      this.requestFormModel.url = this.requestFormModel.url('save');
      this.requestFormModel.save({}, {
        headers: {
          Authorization: 'Bearer ' + Hktdc.Config.accessToken
        },
      })
    },

    initialize: function (props) {
      // this.listenTo(this.model, 'change', this.render);
      this.requestFormModel = props.requestFormModel;
      this.render();
    },

    render: function () {
      this.$el.html(this.template(this.model.toJSON()));
    }

  });

})();
