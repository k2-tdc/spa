/* global Hktdc, Backbone, JST, $, _ */

Hktdc.Views = Hktdc.Views || {};

(function() {
  'use strict';

  Hktdc.Views.SelectedCC = Backbone.View.extend({

    template: JST['app/scripts/templates/selectedCC.ejs'],

    tagName: 'li',

    events: {
      'click .glyphicon': 'removeSelectedCCHandler'
    },

    initialize: function() {
      // this.listenTo(this.model, 'change', this.render);
    },

    removeSelectedCCHandler: function() {
      this.collection.remove(this.model);
    },

    render: function() {
      this.$el.html(this.template({
        selectedUserId: this.model.toJSON().USERID || this.model.toJSON().UserId,
        selectedUserName: this.model.toJSON().FULLNAME || this.model.toJSON().UserFullName,
        readonly: this.model.toJSON().readonly
      }));
    }
  });

  Hktdc.Views.SelectedCCList = Backbone.View.extend({

    tagName: 'ul',

    className: 'seleced-cc-list',

    initialize: function(props) {
      var self = this;
      _.extend(this, props);
      _.bindAll(this, 'renderSelectedCCItem');
      this.render();

      this.collection.on('add', function(addedCC, newCollection){
        $(self.el).empty();
        self.render();
      });
      this.collection.on('remove', function(addedCC, newCollection){
        $(self.el).empty();
        self.render();
      });
    },

    renderSelectedCCItem: function(model) {
      model.set({
        readonly: this.requestFormModel.toJSON().mode === 'read'
      })
      var selectedCCItemView = new Hktdc.Views.SelectedCC({
        model: model,
        collection: this.collection
      });
      selectedCCItemView.render();
      $(this.el).append(selectedCCItemView.el);
    },

    render: function() {
      /* the collection share with new request selectedCCCollection */
      // console.log(this.collection);
      this.collection.each(this.renderSelectedCCItem);
    }

  });

})();
