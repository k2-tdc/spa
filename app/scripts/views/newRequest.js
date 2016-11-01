/*global Hktdc, Backbone, JST*/

Hktdc.Views = Hktdc.Views || {};

(function() {
  'use strict';

  Hktdc.Views.NewRequest = Backbone.View.extend({

    template: JST['app/scripts/templates/newRequest.ejs'],

    el: '#mainContent',

    initialize: function() {
      // this.listenTo(this.model, 'change', this.render);
      var self = this;
      this.render();

      /* create service collections */
      var serviceCatagoryCollections = new Hktdc.Collections.ServiceCatagory();
      serviceCatagoryCollections.fetch({
        beforeSend: utils.setAuthHeader,
        success: function() {
          try {
            console.debug('[views/newRequest.js] - onLoadData');
            var serviceCatagoryListView = new Hktdc.Views.ServiceCatagoryList({
              collection: serviceCatagoryCollections,
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

      self.model.selectedCCCollection = new Hktdc.Collections.SelectedCC();

      /* common component */
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
      this.model.on('change:selectedApplicant', function(model, selectedApplicantModel, options) {
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
        // $('.applicant-container').attr("eid", $(this).attr("eid"));
        // var recommendCollection = new Hktdc.Collections.Recommend();
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
    },

    render: function() {
      // console.log(this.model.toJSON().selectedApplicant.toJSON());
      this.model.set({
        selectedApplicantName: this.model.toJSON().selectedApplicant.toJSON().UserFullName
      });
      this.$el.html(this.template(this.model.toJSON()));
    }

  });

})();
