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
      var self = this;
      self.isInvalid = {
        justification: function() {
          return (self.attributes.Justification && self.attributes.Justification.trim());
        },
        cost: function() {
          return (self.attributes.EstimatedCost && self.attributes.EstimatedCost.trim());
        },
        approver: function() {
          return !!self.attributes.selectedRecommentModel;
        },
        EDDate: function() {
          // console.log(self.attributes.EDeliveryDate);
          var today = moment().minute(0).hour(0).second(0);
          var eDate = (moment(self.attributes.EDeliveryDate, 'YYYYMMDD', true).isValid())
          ? moment(self.attributes.EDeliveryDate, 'YYYYMMDD')
          : moment(self.attributes.EDeliveryDate, 'DD MMM YYYY');
          var createDate = moment(self.attributes.CreatedOn, 'DD MMM YYYY');
          return (
            //(
            //  eDate.unix() >= createDate.unix() &&
            //  eDate.unix() >= today.unix()
            //) ||
            //!self.attributes.EDeliveryDate
			1==1
          );
        }
      };
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
      if (options.field) {
        if (options.field === 'Justification' && !this.isInvalid.justification()) {
          return {
            field: 'Justification',
            messge: 'Please fill the Justification and Important Notes'
          };
        } else if (options.field === 'EstimatedCost' && !this.isInvalid.cost()) {
          return {
            field: 'EstimatedCost',
            message: 'Please fill the Estimated Cost'
          };
        } else if (options.field === 'selectedRecommentModel' && !this.isInvalid.approver()) {
          return {
            field: 'selectedRecommentModel',
            message: 'Please select a Recommend By.'
          };
        } 
		//else if (options.field === 'EDeliveryDate' && !this.isInvalid.EDDate()) {
        //  return {
        //    field: 'EDeliveryDate',
        //    message: 'Estimated date must be after create date'
        //  };
        //} 
		else {
          this.trigger('valid', {field: options.field});
        }
      } else {
        if (
          this.isInvalid.justification() &&
          this.isInvalid.cost() &&
          this.isInvalid.approver() &&
          this.isInvalid.EDDate()
        ) {
          this.trigger('valid', {field: 'selectedRecommentModel'});
        } else {
          return 'form data not valid';
        }
      }
    },

    parse: function(response, options) {
      return response;
    }
  });
})();
