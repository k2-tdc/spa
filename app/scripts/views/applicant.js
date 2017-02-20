/* global Hktdc, Backbone, JST, $, _ */

Hktdc.Views = Hktdc.Views || {};

(function() {
  'use strict';

  Hktdc.Views.ApplicantList = Backbone.View.extend({

    tagName: 'ul',

    className: 'dropdown-menu applicant-list',

    initialize: function(props) {
      _.extend(this, props);
      _.bindAll(this, 'renderApplicantItem', 'renderApplicantOption');
      this.render();
    },

    renderApplicantItem: function(model) {
      var applicantItemView = new Hktdc.Views.ApplicantItem({
        model: model,
        requestFormModel: this.requestFormModel
      });

      applicantItemView.render();
      $(this.el).append(applicantItemView.el);
    },

    render: function() {
      this.collection.each(this.renderApplicantItem);
    }
  });

  Hktdc.Views.ApplicantItem = Backbone.View.extend({

    template: JST['app/scripts/templates/applicant.ejs'],
    tagName: 'li',
    events: {
      'click': 'clickApplcantHandler'
    },

    initialize: function(props) {
      _.extend(this, props);
    },

    clickApplcantHandler: function() {
      /* The new request model will handle the change */
      this.requestFormModel.set({
        selectedApplicantModel: this.model
      });
    },

    render: function() {
      this.$el.html(this.template({user: this.model.toJSON()}));
    }
  });

  Hktdc.Views.ApplicantSelect = Backbone.View.extend({
    tagName: 'select',
    className: 'form-control user-select',
    events: {
      'change': 'selectApplicantHandler'
    },
    attributes: {
      name: 'applicant'
    },
    initialize: function(props) {
      console.debug('[ views/applicant.js ] initialize: ApplicantSelect');
      _.bindAll(this, 'renderApplicantItem');
      _.extend(this, props);
      // this.listenTo(this.collection, 'change', this.render);
    },

    render: function() {
      var self = this;
      this.collection.unshift({
        UserFullName: '-- Select --',
        UserId: 0
        
        // in some collection (e.g. report applicant) may be:
        // FullName: '-- Select --',
        // UserID: 0
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
      var applicantOptionsView = new Hktdc.Views.ApplicantOption({
        model: model
      });
      this.$el.append(applicantOptionsView.el);
    }

  });

  Hktdc.Views.ApplicantOption = Backbone.View.extend({

    template: JST['app/scripts/templates/applicantOption.ejs'],

    tagName: 'option',

    initialize: function(props) {
      _.extend(this, props);
      this.render();
    },

    render: function() {
      this.$el.html(this.template({user: this.model.toJSON()}));
      this.$el.attr('value', this.model.toJSON().UserId || this.model.toJSON().UserID);
      if ((this.selectedApplicant === this.model.toJSON().UserId) || this.selectedApplicant === this.model.toJSON().UserID) {
        this.$el.prop('selected', true);
      }
    }

  });
})();
