/* global Hktdc, Backbone, moment */

Hktdc.Models = Hktdc.Models || {};

(function() {
  'use strict';

  Hktdc.Models.NewRequest = Backbone.Model.extend({

    url: function(refId) {
      var qsArr = [
        'UserId=' + Hktdc.Config.userID,
        'ReferID=' + refId
      ];
      return Hktdc.Config.apiURL + '/GetRequestDetails?' + qsArr.join('&');
    },

    initialize: function() {
      // console.log(this.toJSON().selectedApplicantModel.toJSON());
      // TODO: The change event should place in view??
    },

    defaults: {
      FormStatus: null,

      PreparerFNAME: null,
      PreparerUserID: null,
      ApplicantFNAME: null,
      ApplicantUserID: null,
      ApproverFNAME: null,
      ApproverUserID: null,
      ActionTakerFNAME: null,
      ActionTakerUserID: null,
      ITSApproverFNAME: null,
      ITSApproverUserID: null,

      // refId: null,
      ReferenceID: null,
      SN: null,
      CreatedOn: null,

      // applicant department
      // department: null,
      DEPT: null,

      // applicant title
      // title: null,
      Title: null,

      // applicant office
      // office: null,
      Location: null,

      // justification: null,
      Justification: null,
      // deliveryDate: null,
      EDeliveryDate: null,
      // frequency: null,
      DurationOfUse: null,
      // cost: null,
      EstimatedCost: null,
      // budget: null,
      BudgetProvided: null,
      // budgetSum: null,
      // BudgetSum: null,
      Remark: null,

      actions: [],
      selectedServiceTree: null,
      selectedServiceCollection: null,
      selectedAttachmentCollection: null,
      deleteAttachmentCollection: null,
      selectedCCCollection: null,

      selectedApplicantModel: null,
      selectedRecommentModel: null,

      employeeList: null,
      currentCC: null,
      requestService: [],
      applicantSubmittedTo: null,
      approverSubmittedTo: null,

      showRemark: false,
      showLog: false,
      showFileLog: false,

      /**
       * 'mode' options: ['read', 'new', 'edit']
       *   'new': create new request
       *   'edit': edit old request
       *   'read': readonly, for reading old request
       */
      mode: 'read',
      attachmentMode: 'read'
    },

    validate: function(attrs, options) {
      // console.log(attrs);
      // console.log(options);
      // console.log(attrs.Justification);
      var justificationIsValid = function() {
        return (attrs.Justification && attrs.Justification.trim());
      };
      var costIsValid = function() {
        return (attrs.EstimatedCost && attrs.EstimatedCost.trim());
      };
      var approverIsValid = function() {
        return !!attrs.selectedRecommentModel;
      };
      var EDDateIsValid = function() {
        // console.log(attrs.EDeliveryDate);
        var today = moment().minute(0).hour(0).second(0);
        var eDate = (moment(attrs.EDeliveryDate, 'YYYYMMDD', true).isValid())
          ? moment(attrs.EDeliveryDate, 'YYYYMMDD')
          : moment(attrs.EDeliveryDate, 'DD MMM YYYY');
        var createDate = moment(attrs.CreatedOn, 'DD MMM YYYY');
        // console.group(new Date());
        // console.log('attrs.CreatedOn: ', attrs.CreatedOn);
        // console.log('attrs.EDeliveryDate: ', attrs.EDeliveryDate);
        // console.log('today: ', today);
        // console.log('cdate: ', createDate);
        // console.log('edate: ', eDate);
        // console.log('today.unix: ', today.unix());
        // console.log('cdate.unix: ', createDate.unix());
        // console.log('edate.unix: ', eDate.unix());
        // console.log('eDate.unix() >= createDate.unix()', eDate.unix() >= createDate.unix());
        // console.log('eDate.unix() >= today.unix()', eDate.unix() >= today.unix());
        // console.log('isNaN(eDate)', isNaN(eDate));
        // console.groupEnd();
        // console.log(eDate);
        return (
          (
            eDate.unix() >= createDate.unix() &&
            eDate.unix() >= today.unix()
          ) ||
          !attrs.EDeliveryDate
        );
      };
      if (options.field) {
        if (options.field === 'Justification' && !justificationIsValid()) {
          return {
            field: 'Justification',
            messge: 'Please fill the Justification and Important Notes'
          };
        } else if (options.field === 'EstimatedCost' && !costIsValid()) {
          return {
            field: 'EstimatedCost',
            message: 'Please fill the Estimated Cost'
          };
        } else if (options.field === 'selectedRecommentModel' && !approverIsValid()) {
          return {
            field: 'selectedRecommentModel',
            message: 'Please select a Recommend By.'
          };
        } else if (options.field === 'EDeliveryDate' && !EDDateIsValid()) {
          return {
            field: 'EDeliveryDate',
            message: 'Estimated date must be after create date'
          };
        } else {
          this.trigger('valid', {field: options.field});
        }
      } else {
        if (
          justificationIsValid() &&
          costIsValid() &&
          approverIsValid() &&
          EDDateIsValid()
        ) {
          this.trigger('valid', {field: 'selectedRecommentModel'});
        } else {
          return 'form data not valid';
        }
      }

      // if (options.field === 'selectedApplicantModel' && !attrs.selectedApplicantModel) {
      //   return {
      //     field: 'selectedApplicant',
      //     message: 'Please select a Applicant <br />'
      //   };
      // } else {
      //   this.trigger('valid', {field: 'selectedApplicant'});
      // }
      //

      // var isValid = true;
      // var selectedServiceCollection = this.attrs.selectedServiceCollection;
      // // console.log(selectedServiceCollection);
      // if (!selectedServiceCollection || selectedServiceCollection.length === 0) {
      //   isValid = false;
      // } else {
      //   selectedServiceCollection.each(function(selectedServiceModel) {
      //     var selectedService = selectedServiceModel.toJSON();
      //     console.log(selectedService);
      //     if (!selectedService.Notes) {
      //       isValid = false;
      //     }
      //   });
      // }
      // if (!isValid) {
      //   return {
      //     message: 'Please input the request'
      //
      //   };
      // }
    },

    parse: function(response, options) {
      return response;
    }
  });
})();
