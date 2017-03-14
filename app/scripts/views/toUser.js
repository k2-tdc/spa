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
      if (this.parentModel && String(this.parentModel.toJSON().ToUserId) === String(this.model.toJSON().UserId)) {
        this.$el.prop('selected', true);
      }
    }

  });

  Hktdc.Views.ToUserList = Backbone.View.extend({

    tagName: 'select',

    className: 'form-control',

    initialize: function(props) {
      var self = this;
      _.extend(this, props);
      _.bindAll(this, 'renderToUserOption');
      this.render();
      if (this.parentModel) {
        this.parentModel.on('change:ToUserId', function() {
          self.$el.empty();
          self.render();
        });
      }
    },
    events: {
      'change': 'selectToUserHandler'
    },

    selectToUserHandler: function(ev) {
      /* The new request model will handle the change */
      // var self = this;
      console.log(this.selectFieldName);
      if (this.parentModel) {
        var setObj = {};
        if (this.selectFieldName) {
          setObj[this.selectFieldName] = $(ev.target).val();
        } else {
          setObj.ToUserId = $(ev.target).val();
        }
        this.parentModel.set(setObj);
      }
      // this.parentModel.on('change:ToUserId', function() {
      //   self.$el.find('option').eq(0).prop('selected', true);
      // });
    },

    renderToUserOption: function(model) {
      var toUserOptionView = new Hktdc.Views.ToUserOption({
        model: model,
        parentModel: this.parentModel
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
