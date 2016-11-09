/* global Hktdc, Backbone, JST, $, _ */

Hktdc.Views = Hktdc.Views || {};

(function() {
  'use strict';

  Hktdc.Views.Applicant = Backbone.View.extend({

    template: JST['app/scripts/templates/applicant.ejs'],
    tagName: 'li',
    events: {
      'click': 'clickApplcantHandler'
    },

    clickApplcantHandler: function() {
      /* The new request model will handle the change */

      this.requestFormModel.set({
        selectedApplicantModel: this.model
      });
    },

    initialize: function(props) {
      _.extend(this, props);
    },

    render: function() {
      this.$el.html(this.template({user: this.model.toJSON()}));
    }
  });

  Hktdc.Views.ApplicantOption = Backbone.View.extend({

    template: JST['app/scripts/templates/applicantOption.ejs'],

    tagName: 'option',

    initialize: function(props) {
      _.extend(this, props);
    },

    render: function() {
      this.$el.html(this.template({user: this.model.toJSON()}));
      this.$el.attr('value', this.model.toJSON().UserId);
      if (this.selectedApplicant === this.model.toJSON().UserId) {
        this.$el.prop('selected', true);
      }
    }

  });

  Hktdc.Views.ApplicantList = Backbone.View.extend({

    tagName: 'ul',

    className: 'dropdown-menu applicant-list',

    initialize: function(props) {
      _.extend(this, props);
      _.bindAll(this, 'renderApplicantItem', 'renderApplicantOption');
      this.render();
    },
    events: {
      'select': 'selectApplcantHandler'
    },

    selectApplcantHandler: function() {
      /* The new request model will handle the change */

      this.requestFormModel.set({
        selectedApplicantModel: this.model
      });
    },

    renderApplicantItem: function(model) {
      var applicantItemView = new Hktdc.Views.Applicant({
        model: model,
        requestFormModel: this.requestFormModel
      });

      applicantItemView.render();
      $(this.el).append(applicantItemView.el);
    },

    renderApplicantOption: function(model) {
      var applicantOptionView = new Hktdc.Views.ApplicantOption({
        model: model,
        requestFormModel: this.requestFormModel,
        selectedApplicant: this.selectedApplicant
      });

      applicantOptionView.render();
      // console.log(applicantOptionView.el);
      $(this.el).append(applicantOptionView.el);
    },

    render: function() {
      // this.$el.html(this.template(this.model.toJSON()));
      console.log(this.selectedApplicant);
      if (this.tagName === 'ul') {
        this.collection.each(this.renderApplicantItem);
      } else {
        $(this.el).append('<option value="">-- Select --</option>');
        this.collection.each(this.renderApplicantOption);
      }
    }
  });
})();
