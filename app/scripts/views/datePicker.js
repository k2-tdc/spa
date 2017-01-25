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
        format: {
          toDisplay: function(date, format, language) {
            return moment(date).format('DD MMM YYYY');
          },
          toValue: function(date, format, language) {
            return moment(date).format('MM/DD/YYYY');
          }
        }
      })
        .on('changeDate', function(ev) {
          // var $input = ($(ev.target).is('input')) ? $(ev.target) : $(ev.target).find('input');
          var val = moment($(this).datepicker('getDate')).format('MM/DD/YYYY');
          // console.log(val);
          if (self.onSelect) {
            self.onSelect(val);
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
      // console.log(ev);
      var val = moment($('.date', this.el).datepicker('getDate')).format('MM/DD/YYYY');
      if (this.onBlur) {
        // console.log('crash');
        this.onBlur(val);
      }
    }

  });
})();
