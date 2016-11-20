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
      // console.log(this.parentModel.toJSON());
      // console.log(this.model.toJSON().StepID);
      var parentStepId = (this.parentModel.toJSON().OldStepId)
        ? String(this.parentModel.toJSON().OldStepId)
        : String(this.parentModel.toJSON().StepId);

      if (parentStepId === String(this.model.toJSON().StepID)) {
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
      var self = this;
      _.extend(this, props);
      _.bindAll(this, 'renderStepOptions', 'selectStepItemHandler');
      this.render();
      this.parentModel.on('change:StepId', function() {
        self.$el.empty();
        self.render();
      });
    },

    selectStepItemHandler: function(ev) {
      this.parentModel.set({
        StepId: $(ev.target).val(),
        OldStepId: ''
      })
    },

    renderStepOptions: function(model) {
      var stepOptionView = new Hktdc.Views.Step({
        model: model,
        parentModel: this.parentModel
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
