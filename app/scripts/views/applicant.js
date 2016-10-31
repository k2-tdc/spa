/*global Hktdc, Backbone, JST*/

Hktdc.Views = Hktdc.Views || {};

(function () {
  'use strict';

  Hktdc.Views.Applicant = Backbone.View.extend({

    template: JST['app/scripts/templates/applicant.ejs'],

    tagName: 'li',

    initialize: function(props) {
      // console.log(props.parentModel.toJSON());
      var self = this;

      this.parentModel = props.parentModel;

      $(this.el).click(function() {
        var selectedUserId = $(this).children().attr('eid');
        var selectedUserName = $(this).text().trim()
        $('#divapplicant').text(selectedUserName);
        // $('#divapplicant').attr("eid", $(this).attr("eid"));
        // var recommendCollection = new Hktdc.Collections.Recommend();
        console.log(self.model);
        self.parentModel.set({
          selectedApplicant: self.model
        });
      });
    },

    render: function () {
      this.$el.html(this.template({user: this.model.toJSON()}));
    }

  });

  Hktdc.Views.ApplicantList = Backbone.View.extend({

    tagName: 'ul',

    className: 'dropdown-menu applicant-list',

    initialize: function (props) {
      this.parentModel = props.parentModel;

      _.bindAll(this, 'renderApplicantItem');
      var self = this;
      // this.listenTo(this.model, 'change', this.render);
      var applicantCollection = new Hktdc.Collections.Applicant();
      applicantCollection.fetch({
        beforeSend: utils.setAuthHeader,
        success: function () {
          self.collection = applicantCollection;
          self.render();
        },
        error: function(e) {
          console.log(e);
        }
      });
    },

    renderApplicantItem: function(model){
      var applicantItemView = new Hktdc.Views.Applicant({
        model: model,
        parentModel: this.parentModel
      });

      applicantItemView.render();
      $(this.el).append(applicantItemView.el);
    },

    render: function () {
      // this.$el.html(this.template(this.model.toJSON()));
      this.collection.each(this.renderApplicantItem);
    }
  });
})();
