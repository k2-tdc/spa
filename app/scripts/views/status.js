/* global Hktdc, Backbone, JST, $, _ */

Hktdc.Views = Hktdc.Views || {};

(function() {
  'use strict';

  Hktdc.Views.Status = Backbone.View.extend({

    template: JST['app/scripts/templates/status.ejs'],
    tagName: 'option',
    initialize: function(props) {
      // this.listenTo(this.model, 'change', this.render);
      // _.extend(this, props);
      this.render();
    },

    render: function() {
      this.$el.html(this.template({
        data: this.model.toJSON()
      }));
      this.$el.attr('value', this.model.toJSON().ReferenceID);
      // console.log(this.model.toJSON());
      if (this.model.toJSON().selectedStatus === this.model.toJSON().ReferenceID) {
        this.$el.prop('selected', true);
      }
    }
  });

  Hktdc.Views.StatusList = Backbone.View.extend({
    tagName: 'select',
    className: 'form-control status-select',
    attributes: {name: 'CStat'},
    initialize: function(props) {
      _.extend(this, props);
      _.bindAll(this, 'renderStatusItemView');
      this.render();
    },

    renderStatusItemView: function(model) {
      model.set({selectedStatus: this.selectedStatus});
      var statusItemView = new Hktdc.Views.Status({model: model});
      this.$el.append(statusItemView.el);
    },

    render: function() {
      this.$el.append('<option value="">-- Select --</option>');
      this.collection.each(this.renderStatusItemView);
    }
  });
})();
