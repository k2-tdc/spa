/* global Hktdc, Backbone, JST, _ */

Hktdc.Views = Hktdc.Views || {};

(function() {
  'use strict';

  Hktdc.Views.ReportApplicantSelect = Backbone.View.extend({
    tagName: 'select',
    className: 'form-control user-select',
    events: {
      'change': 'selectApplicantHandler'
    },
    attributes: {
      name: 'applicant'
    },
    initialize: function(props) {
      console.debug('[ views/reportApplicant.js ] initialize: ReportApplicantSelect');
      _.bindAll(this, 'renderApplicantItem');
      _.extend(this, props);
      // this.listenTo(this.collection, 'change', this.render);
    },

    render: function() {
      var self = this;
      this.collection.unshift({
        FullName: '-- Select --',
        UserID: 0
      });
      this.collection.each(this.renderApplicantItem);
      setTimeout(function() {
        self.$el.find('option[value="' + self.selectedApplicant + '"]').prop('selected', true);
      });
    },

    selectApplicantHandler: function(ev) {
      if (this.onSelect) {
        this.onSelect(this.collection.get($(ev.target).find('option:selected').val()));
      }
    },

    renderApplicantItem: function(model) {
      var applicantOptionsView = new Hktdc.Views.ReportApplicantOption({
        model: model
      });
      this.$el.append(applicantOptionsView.el);
    }

  });

  Hktdc.Views.ReportApplicantOption = Backbone.View.extend({

    template: JST['app/scripts/templates/reportApplicantOption.ejs'],

    tagName: 'option',

    initialize: function(props) {
      _.extend(this, props);
      this.render();
    },

    render: function() {
      this.$el.html(this.template({
        user: this.model.toJSON()
      }));
      this.$el.attr('value', this.model.toJSON().UserID);
      if (this.selectedApplicant === this.model.toJSON().UserID) {
        this.$el.prop('selected', true);
      }
    }

  });
})();
