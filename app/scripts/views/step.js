/* global Hktdc, Backbone, JST, _, $ */

Hktdc.Views = Hktdc.Views || {};

(function() {
  'use strict';

  Hktdc.Views.Step = Backbone.View.extend({

    template: JST['app/scripts/templates/stepOption.ejs'],

    tagName: 'option',

    initialize: function(props) {
      // this.listenTo(this.model, 'change', this.render);
      // console.log(this.model.toJSON());
      _.extend(this, props);
      this.render();
    },

    render: function() {
      this.$el.html(this.template(this.model.toJSON()));

      this.$el.attr('value', this.model.toJSON().StepID);
      // console.log(this.selectedStep);
      // console.log(this.model.toJSON().StepID);
      if (String(this.selectedStep) === String(this.model.toJSON().StepID)) {
        this.$el.prop('selected', true);
      }
    }
  });

  Hktdc.Views.StepList = Backbone.View.extend({

    template: JST['app/scripts/templates/step.ejs'],

    tagName: 'select',

    id: 'ddstep',

    className: 'form-control',

    events: {
      'change': 'selectStepItemHandler'
    },

    initialize: function(props) {
      _.extend(this, props);
      _.bindAll(this, 'renderStepOptions', 'selectStepItemHandler');
      this.render();
    },

    selectStepItemHandler: function(ev) {
      this.parentModel.set({
        StepId: $(ev.target).val()
      })
    },

    renderStepOptions: function(model) {
      var stepOptionView = new Hktdc.Views.Step({
        model: model,
        selectedStep: this.selectedStep
      });
      this.$el.append(stepOptionView.el);
    },

    render: function() {
      this.$el.append('<option value="null">--Select--</option>');
      // console.log(this.collection.toJSON());
      this.collection.each(this.renderStepOptions);
    }

  });
})();
