/* global Hktdc, Backbone, JST, $, _ */

Hktdc.Views = Hktdc.Views || {};

(function() {
  'use strict';

  Hktdc.Views.FromUserOption = Backbone.View.extend({

    template: JST['app/scripts/templates/fromUserOption.ejs'],

    tagName: 'option',

    initialize: function(props) {
      _.extend(this, props);
    },

    render: function() {
      this.$el.html(this.template({user: this.model.toJSON()}));
      this.$el.attr('value', this.model.toJSON().UserId);
    }

  });

  Hktdc.Views.FromUserList = Backbone.View.extend({

    tagName: 'select',

    className: 'form-control',

    initialize: function(props) {
      _.extend(this, props);
      _.bindAll(this, 'renderFromUserOption');
      this.render();
    },
    events: {
      'change': 'selectFromUserHandler'
    },

    selectFromUserHandler: function(ev) {
      /* The new request model will handle the change */
      console.log('select from user');
      // var self = this;
      this.parentModel.set({
        FromUserId: $(ev.target).val()
      });
      // this.parentModel.on('change:FromUserId', function() {
      //   // console.log(self.$el.find('option').eq(0));
      //   self.$el.find('option').eq(0).prop('selected', true);
      // });
    },

    renderFromUserOption: function(model) {
      var fromUserOptionView = new Hktdc.Views.FromUserOption({
        model: model,
        parentModel: this.parentModel
      });

      fromUserOptionView.render();
      // console.log(fromUserOptionView.el);
      $(this.el).append(fromUserOptionView.el);
    },

    render: function() {
      $(this.el).append('<option value="">-- Select --</option>');
      this.collection.each(this.renderFromUserOption);
    }
  });
})();
