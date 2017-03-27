/* global Hktdc, Backbone, JST, $, moment, _ */

Hktdc.Views = Hktdc.Views || {};

(function() {
  'use strict';

  Hktdc.Views.DatePicker = Backbone.View.extend({

    template: JST['app/scripts/templates/datePicker.ejs'],

    tagName: 'div',

    className: 'input-group',

    events: {
      'blur .date': 'updateDateModelByEvent',
      'mousedown .datepicker-toggle-btn': 'mousedownHandler'
    },

    initialize: function(props) {
      // this.listenTo(this.model, 'change', this.render);
      _.extend(this, props);
      this.render();
    },

    render: function() {
      var self = this;
      self.$el.html(self.template(self.model.toJSON()));
      $('.date', self.el).datepicker({
        autoclose: true,
        startDate: self.startDate,
        forceParse: false,
        format: {
          toDisplay: function(date, format, language) {
            return moment(date).format('DD MMM YYYY');
          },
          toValue: function(date, format, language) {
            return moment(date).format('YYYY-MM-DD');
          }
        }
      })
        .on('changeDate', function(ev) {
          var datePickerValue = $(this).datepicker('getDate');
          var parseVal = (moment(datePickerValue).isValid())
            ? moment(datePickerValue).format('YYYY-MM-DD')
            : '';
          if (self.onSelect) {
            self.onSelect(parseVal);
          }
        })
        .on('show', function(ev) {
          $(ev.target).data('open', true);
        })
        .on('hide', function(ev) {
          $(ev.target).data('open', false);
        });
    },

    mousedownHandler: function(ev) {
      ev.stopPropagation();
      var $target = $('.date', this.el);
      var open = $target.data('open');
      if (open) {
        $target.datepicker('hide');
      } else {
        $target.datepicker('show');
      }
    },

    updateDateModelByEvent: function(ev) {
      // not use below as the date will reture null
      // var datePickerValue = $('.date', this.el).datepicker('getDate');

      var datePickerValue = $('.date', this.el).val();
      var parseVal = (moment(datePickerValue).isValid())
        ? moment(datePickerValue).format('YYYY-MM-DD')
        : '';
      if (this.onSelect) {
        this.onSelect(parseVal);
      }
    }

  });
})();
