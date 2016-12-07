/* global Hktdc, Backbone, JST, $ */

Hktdc.Views = Hktdc.Views || {};

(function() {
  'use strict';

  Hktdc.Views.ReadRequest = Backbone.View.extend({

    template: JST['app/scripts/templates/readRequest.ejs'],

    tagName: 'div',

    id: '',

    className: '',

    events: {},

    initialize: function() {
      /* mode === read */
      console.debug('This is << READ >> mode');
      var self = this;
      self.render();

      this.model.set({
        showFileLog: true
      });

      // Q.all([
      //   self.loadServiceCatagory(),
      //   self.loadEmployee(),
      //   self.loadFileTypeRules()
      // ])
      // .then(function(results) {
      /* must sync RequestList to selectedServiceCollection for updating */
      // var recommend = _.find(results[1], function(employee) {
      //   return employee.UserId === self.model.toJSON().ApproverUserID;
      // });
      // self.employeeArray = results[1];
      // console.log(self.employeeArray);
      /* need override the workerId and WorkerFullName */
      // recommend.WorkerId = recommend.UserId;
      // recommend.WorkerFullName = recommend.UserFullName;

      // self.model.set({
      //   selectedServiceTree: self.model.toJSON().RequestList,
      //   selectedRecommentModel: new Hktdc.Models.Recommend(recommend)
      // });

      console.log(self.model.toJSON().RequestList);
      setTimeout(function() {
        self.renderAttachment(self.model.toJSON().Attachments);
        self.renderSelectedCCView(self.model.toJSON().RequestCC);
        self.renderWorkflowLog(self.model.toJSON().ProcessLog);
        self.renderServiceCatagory(new Hktdc.Collections.ServiceCatagory(self.model.toJSON().RequestList));
      });
      /* direct put the Request list to collection because no need to change selection */

      // quick hack to do after render
      // setTimeout(function() {
      //   $('input, textarea:not(.keepEdit), button', self.el).prop('disabled', 'disabled');
      /*
        var FormStatus = self.model.toJSON().FormStatus;
        var Preparer = self.model.toJSON().PreparerUserID;
        var Applicant = self.model.toJSON().ApplicantUserID;
        var Approver = self.model.toJSON().ApproverUserID;
        var ActionTaker = self.model.toJSON().ActionTakerUserID;
        var ITSApprover = self.model.toJSON().ITSApproverUserID;

        self.renderRequestFormButton(
        FormStatus,
        Preparer,
        Applicant,
        Approver,
        ActionTaker,
        ITSApprover
      );
      */
      // self.renderButtonHandler();
      // });
      // })
      // .fail(function(e) {
      //   console.error(e);
      // });


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
      var workflowLogCollections = new Hktdc.Collections.WorkflowLog(workflowLogList);
      var workflowLogListView = new Hktdc.Views.WorkflowLogList({
        collection: workflowLogCollections,
        requestFormModel: this.model
      });
      workflowLogListView.render();
      $('#workflowlog-container', this.el).html(workflowLogListView.el);
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
      this.$el.html(this.template({
        request: this.model.toJSON()
      }));
    }

  });
})();
