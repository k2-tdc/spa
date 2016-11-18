/* global Hktdc, Backbone, JST, _, $ */

Hktdc.Views = Hktdc.Views || {};

(function() {
  'use strict';

  Hktdc.Views.Process = Backbone.View.extend({

    template: JST['app/scripts/templates/process.ejs'],

    tagName: 'li',

    events: {},

    initialize: function(props) {
      _.extend(this, props);
      this.render();
    },

    render: function() {
      // console.log(this.selectedProcess);
      // console.log(this.model.toJSON().ProcessID);
      if (this.tagName === 'option') {
        this.$el.attr('value', this.model.toJSON().ProcessID);
        if (String(this.selectedProcess) === String(this.model.toJSON().ProcessID)) {
          this.$el.prop('selected', true);
        }
      }
      this.$el.html(this.template(this.model.toJSON()));
    }
  });

  Hktdc.Views.ProcessList = Backbone.View.extend({

    tagName: 'ul',
    className: 'dropdown-menu ulnav-header-main',
    events: {
      'change': 'selectProcessItemHandler'
    },

    initialize: function(props) {
      _.extend(this, props);
      _.bindAll(this, 'renderProcessItem');
      // console.log(this.collection.toJSON());
      // this.listenTo(this.model, 'change', this.render);
    },

    selectProcessItemHandler: function(ev) {
      this.delegationPageModel.set({
        ProId: $(ev.target).val()
      });
    },

    renderProcessItem: function(model) {
      var itemViewTagName = 'li';
      if (this.tagName === 'select') {
        itemViewTagName = 'option';
        model.set({type: 'option'});
      }
      var processItemView = new Hktdc.Views.Process({
        model: model,
        tagName: itemViewTagName,
        selectedProcess: this.selectedProcess
      });
      // console.log(processItemView.el);
      this.$el.append(processItemView.el);
    },

    render: function() {
      if (this.tagName === 'select') {
        this.$el.prepend('<option value="" >--Select--</option>');
      }
      this.collection.each(this.renderProcessItem);
    }

  });
})();
