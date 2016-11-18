/* global Hktdc, Backbone, JST, $, _ */

Hktdc.Views = Hktdc.Views || {};

(function() {
  'use strict';

  Hktdc.Views.ToUserOption = Backbone.View.extend({

    template: JST['app/scripts/templates/toUserOption.ejs'],

    tagName: 'option',

    initialize: function(props) {
      _.extend(this, props);
    },

    render: function() {
      this.$el.html(this.template({user: this.model.toJSON()}));
      this.$el.attr('value', this.model.toJSON().UserId);
    }

  });

  Hktdc.Views.ToUserList = Backbone.View.extend({

    tagName: 'select',

    className: 'form-control',

    initialize: function(props) {
      _.extend(this, props);
      _.bindAll(this, 'renderToUserOption');
      this.render();
    },
    events: {
      'change': 'selectToUserHandler'
    },

    selectToUserHandler: function(ev) {
      console.log('select to user');
      /* The new request model will handle the change */
      // var self = this;
      this.parentModel.set({
        ToUserId: $(ev.target).val()
      });
      // this.parentModel.on('change:ToUserId', function() {
      //   self.$el.find('option').eq(0).prop('selected', true);
      // });
    },

    renderToUserOption: function(model) {
      var toUserOptionView = new Hktdc.Views.ToUserOption({
        model: model,
        requestFormModel: this.requestFormModel
      });

      toUserOptionView.render();
      // console.log(toUserOptionView.el);
      $(this.el).append(toUserOptionView.el);
    },

    render: function() {
      // this.$el.html(this.template(this.model.toJSON()));
      if (this.tagName === 'ul') {
        this.collection.each(this.renderToUserItem);
      } else {
        $(this.el).append('<option value="">-- Select --</option>');
        this.collection.each(this.renderToUserOption);
      }
    }
  });
})();
