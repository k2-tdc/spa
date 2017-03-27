/* global Hktdc, Backbone, JST, _ */

Hktdc.Views = Hktdc.Views || {};

(function() {
  'use strict';

  Hktdc.Views.DelegationList = Backbone.View.extend({

    tagName: 'ul',

    className: 'dropdown-menu delegation-list',

    initialize: function(props) {
      _.extend(this, props);
      _.bindAll(this, 'renderDelegationOption');
      this.render();
    },

    renderDelegationOption: function(model) {
      var delegationOptionView = new Hktdc.Views.DelegationOption({
        model: model,
        selectedDelegation: this.selectedDelegation
      });

      delegationOptionView.render();
      this.$el.append(delegationOptionView.el);
    },

    render: function() {
      this.collection.each(this.renderDelegationItem);
    }
  });

  Hktdc.Views.DelegationSelect = Backbone.View.extend({

    tagName: 'select',

    className: 'form-control user-select',

    initialize: function(props) {
      _.extend(this, props);
      _.bindAll(this, 'renderDelegationOption');
      this.render();
    },

    events: {
      'select': 'selectApplcantHandler'
    },

    selectApplcantHandler: function() {
      /* The new request model will handle the change */

      this.requestFormModel.set({
        selectedDelegationModel: this.model
      });
    },

    renderDelegationOption: function(model) {
      var delegationOptionView = new Hktdc.Views.DelegationOption({
        model: model,
        requestFormModel: this.requestFormModel,
        selectedDelegation: this.selectedDelegation
      });

      delegationOptionView.render();
      this.$el.append(delegationOptionView.el);
    },

    render: function() {
      this.$el.append('<option value="">-- Select --</option>');
      this.collection.each(this.renderDelegationOption);
    }
  });

  Hktdc.Views.DelegationOption = Backbone.View.extend({

    template: JST['app/scripts/templates/userOption.ejs'],

    tagName: 'option',

    initialize: function(props) {
      _.extend(this, props);
    },

    render: function() {
      this.$el.html(this.template({
        user: this.model.toJSON()
      }));
      this.$el.attr('value', this.model.toJSON().FromUser_USER_ID);
      if (this.selectedDelegation === this.model.toJSON().FromUser_USER_ID) {
        this.$el.prop('selected', true);
      }
    }

  });

})();
