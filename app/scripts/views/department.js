/* global Hktdc, Backbone, JST, _, $ */

Hktdc.Views = Hktdc.Views || {};

(function() {
  'use strict';
  Hktdc.Views.DepartmentSelect = Backbone.View.extend({
    tagName: 'select',
    className: 'form-control',
    events: {
      'change': 'selectDepartmentHandler'
    },
    initialize: function(props) {
      console.debug('[ views/department.js ] initialize: DepartmentSelect');
      _.bindAll(this, 'renderDepartmentItem');
      _.extend(this, props);
      this.listenTo(this.collection, 'change', this.render);
    },

    render: function() {
      var self = this;
      this.collection.unshift({
        DeptName: '-- Select --',
        DeptCode: 0
      });

      this.collection.each(this.renderDepartmentItem);
      setTimeout(function() {
        self.$el.find('option[value="' + self.selectedDepartment + '"]').prop('selected', true);
      });
    },

    selectDepartmentHandler: function(ev) {
      if (this.onSelect) {
        this.onSelect($(ev.target).val());
      }
    },

    renderDepartmentItem: function(model) {
      // console.log(model.toJSON());
      var departmentItemView = new Hktdc.Views.DepartmentOption({
        model: model
      });
      this.$el.append(departmentItemView.el);
    }

  });

  Hktdc.Views.DepartmentOption = Backbone.View.extend({
    template: JST['app/scripts/templates/departmentOption.ejs'],
    tagName: 'option',
    attributes: function() {
      return {
        value: String(this.model.toJSON().DeptCode)
      };
    },

    events: {},

    initialize: function() {
      this.render();
    },

    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
    }

  });
})();
