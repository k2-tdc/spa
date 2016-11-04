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
      this.requestFormModel = props.requestFormModel;
    },

    render: function() {
      this.$el.html(this.template({user: this.model.toJSON()}));
    }

  });

  Hktdc.Views.ApplicantList = Backbone.View.extend({

    tagName: 'ul',

    className: 'dropdown-menu applicant-list',

    initialize: function(props) {
      this.requestFormModel = props.requestFormModel;

      _.bindAll(this, 'renderApplicantItem');

      this.render();
    },

    renderApplicantItem: function(model) {
      var applicantItemView = new Hktdc.Views.Applicant({
        model: model,
        requestFormModel: this.requestFormModel
      });

      applicantItemView.render();
      $(this.el).append(applicantItemView.el);
    },

    render: function() {
      // this.$el.html(this.template(this.model.toJSON()));
      this.collection.each(this.renderApplicantItem);
    }
  });
})();
