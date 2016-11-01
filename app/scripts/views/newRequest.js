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
      var targetField = $(ev.target).attr('field');
      var updateObject = {};
      updateObject[targetField] = $(ev.target).val();
      this.model.set(updateObject);
    },

    initialize: function() {
      // this.listenTo(this.model, 'change', this.render);
      var self = this;
      this.render();

      /* create service collections */
      self.model.selectedServiceCollection = new Hktdc.Collections.SelectedService();

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

      /* employee component */
      self.model.selectedCCCollection = new Hktdc.Collections.SelectedCC();

      var employeeCollection = new Hktdc.Collections.Employee();
      employeeCollection.fetch({
        beforeSend: utils.setAuthHeader,
        success: function() {
          $('.applicant-container', self.el).append(new Hktdc.Views.ApplicantList({
            collection: new Hktdc.Collections.Applicant(employeeCollection.toJSON()),
            parentModel: self.model
          }).el);

          $('.cc-container', self.el).append(new Hktdc.Views.CCList({
            collection: new Hktdc.Collections.CC(employeeCollection.toJSON()),
            parentModel: self.model
          }).el);

          $('.contact-group', self.el).append(new Hktdc.Views.SelectedCCList({
            collection: self.model.selectedCCCollection
          }).el);

          self.initModelChange();
        },
        error: function(err) {
          console.log(err);
        }
      })
    },

    initModelChange: function() {
      var self = this;
      this.model.on('change:selectedApplicantModel', function(model, selectedApplicantModel, options) {
        var selectedUserName = selectedApplicantModel.toJSON().UserFullName;
        $('.selectedApplicant', self.el).text(selectedUserName);
        selectedApplicantModel.fetch({
          beforeSend: utils.setAuthHeader,
          success: function(res) {
            var selectedUserDepartment = res.toJSON().Depart;
            $('#divdepartment', self.el).text(selectedUserDepartment);
          },
          error: function(e) {
            console.log(e);
          }
        });
        // console.log(selectedApplicantModel);
        // return selectedApplicantModel;
        // $('.applicant-container').attr("eid", $(this).attr("eid"));
        // var recommendCollection = new Hktdc.Collections.Recommend();
      });

      this.model.on('change:selectedRecommentModel', function(model, selectedRecommentModel, options) {
        var selectedUserName = selectedRecommentModel.toJSON().UserFullName;
        $('.recommend-btn', self.el).text(selectedUserName);
        // this.model.
      });

      this.model.selectedCCCollection.on('add', function(addedCC, newCollection) {
        // console.log(addedCC.toJSON());
        var selectedUserName = addedCC.toJSON().UserFullName;
        var selectedUserId = addedCC.toJSON().UserId;
        $('.selectedCC', this.el).text(selectedUserName);

        // $('.contact-group', this.el).append(
        //   '<a type="button" eid=' +
        //     selectedUserId +
        //     ' style="text-decoration:none;margin-right:5px;margin-top:5px;" class="btn btn-default spncc"><span class="glyphicon glyphicon-remove spanremovecc"></span>' +
        //     selectedUserName +
        //   '</a>'
        // );
      });

      this.model.selectedServiceCollection.on('add', function(addedService, newCollection){
        console.log('added service', addedService.toJSON());
      });
    },

    render: function() {
      // console.log(this.model.toJSON().selectedApplicantModel.toJSON());
      this.model.set({
        selectedApplicantName: this.model.toJSON().selectedApplicantModel.toJSON().UserFullName
      });
      this.$el.html(this.template(this.model.toJSON()));
    }

  });

})();
