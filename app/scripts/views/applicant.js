/*global Hktdc, Backbone, JST*/

Hktdc.Views = Hktdc.Views || {};

(function () {
  'use strict';

  Hktdc.Views.Applicant = Backbone.View.extend({

    template: JST['app/scripts/templates/applicant.ejs'],

    tagName: 'li',

    initialize: function () {
      // this.listenTo(this.model, 'change', this.render);
      // this.render();
    },

    render: function () {
      console.log(this.model.toJSON());
      this.$el.html(this.template(this.model.toJSON()));
    }

  });

  Hktdc.Views.ApplicantList = Backbone.View.extend({

    tagName: 'ul',

    className: 'dropdown-menu',

    initialize: function (options) {
      _.bindAll(this, 'renderApplicantItem');
      var self = this;
      // this.listenTo(this.model, 'change', this.render);
      var applicantCollection = new Hktdc.Collections.Applicant();
      applicantCollection.fetch({
        beforeSend: utils.setAuthHeader,
        success: function() {
          self.collection = applicantCollection;
          self.render();
        },
        error: function(e) {
          console.log(e);
        }
      });
    },

    renderApplicantItem: function(model){
      var applicantItemView = new Hktdc.Views.Applicant({ model: model });
      applicantItemView.render();
      $(this.el).append(applicantItemView.el);
    },

    render: function () {
      // this.$el.html(this.template(this.model.toJSON()));
      this.collection.each(this.renderApplicantItem);
    }

  });

})();
