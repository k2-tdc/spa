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
        /* The new request model will handle the change */

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

      this.render();
    },

    renderApplicantItem: function(model) {
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