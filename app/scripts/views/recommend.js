/*global Hktdc, Backbone, JST*/

Hktdc.Views = Hktdc.Views || {};

(function() {
  'use strict';

  Hktdc.Views.Recommend = Backbone.View.extend({

    template: JST['app/scripts/templates/recommend.ejs'],
    tagName: 'li',
    events: {
      'click': 'clickRecommendHandler'
    },
    initialize: function(props) {
      this.requestFormModel = props.requestFormModel;
    },
    clickRecommendHandler: function() {
      /* if select the  */
      this.requestFormModel.set({
        selectedRecommentModel: this.model
      });

      this.renderButton();
    },

    renderButton: function() {
      var model = this.requestFormModel.toJSON();
      var Preparer = model.preparedBy;
      var Applicant = model.selectedApplicantModel.toJSON().UserFullName;
      var Approver = model.selectedRecommentModel.toJSON().UserFullName;
      var AppRuleCode = model.selectedRecommentModel.toJSON().RuleCode;
      console.log('Preparer', Preparer);
      console.log('Applicant', Applicant);
      console.log('Approver', Approver);
      console.log('AppRuleCode', AppRuleCode);
      // for submitted to
      // if (Preparer !== Applicant && Applicant !== Approver) {
      //     SubmittedTo = "Applicant";
      //     $("#btnapplicant").hide();
      //     $("#btnapprover").text("Send to Applicant");
      // }
      // if (Preparer == Applicant && Applicant == Approver) {
      //     SubmittedTo = "TaskActioner";
      //     $("#btnapplicant").hide();
      //     $("#btnapprover").text("Send to Task Actioner");
      // }
      // if (Preparer != Applicant && Applicant == Approver) {
      //     SubmittedTo = "Approver";
      //     $("#btnapplicant").hide();
      //     $("#btnapprover").text("Send to Approver");
      // }
      // if (Preparer == Applicant && Applicant != Approver) {
      //     SubmittedTo = "Approver";
      //     $("#btnapplicant").hide();
      //     $("#btnapprover").text("Send to Approver");
      // }
      // if (Preparer != Applicant && 'IT0009' != Apprulecode) {
      //   $("#btnapplicant").show();
      //   $("#btnapplicant").text("Send to Applicant");
      //   $("#btnapprover").text("Send to Approver");
      // }
      // if (Preparer == Applicant && 'IT0009' != Apprulecode) {
      //   $("#btnapplicant").hide();
      //   $("#btnapprover").text("Send to Approver");
      // }
    },

    render: function() {
      this.$el.html(this.template({user: this.model.toJSON()}));
    }
  });

  Hktdc.Views.RecommendList = Backbone.View.extend({

    tagName: 'ul',

    className: 'dropdown-menu recommend-list',

    initialize: function(props) {
      this.requestFormModel = props.requestFormModel;
      _.bindAll(this, 'renderRecommendItem');
      this.render();
    },

    renderRecommendItem: function(model) {
      // console.log(model);
      // model.set({})
      var recommendItemView = new Hktdc.Views.Recommend({
        model: model,
        requestFormModel: this.requestFormModel
      });

      recommendItemView.render();
      $(this.el).append(recommendItemView.el);
    },

    render: function() {
      // this.$el.html(this.template(this.model.toJSON()));
      // console.log(this.collection.toJSON());
      this.collection.each(this.renderRecommendItem);
    }
  });


})();
