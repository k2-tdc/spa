/*global Hktdc, Backbone, JST*/

Hktdc.Views = Hktdc.Views || {};

(function () {
  'use strict';

  Hktdc.Views.CC = Backbone.View.extend({

    template: JST['app/scripts/templates/cc.ejs'],

    tagName: 'li',

    initialize: function(props) {
      // console.log(props.parentModel.toJSON());
      var self = this;

      this.parentModel = props.parentModel;

      $(this.el).click(function() {
        /* The new request model will handle the change */

        /* Add selected CC collections to parents coll. */
        self.parentModel.selectedCCCollection.add(self.model);

        self.model.set({selected: true});
        self.parentModel.set({
          // selectedCCCollection: newCCArray,
          currentCC: self.model
        });
        self.render();
      });
    },

    render: function () {
      this.$el.html(this.template({user: this.model.toJSON()}));
    }
  });

  Hktdc.Views.CCList = Backbone.View.extend({

    tagName: 'ul',

    className: 'dropdown-menu cc-list',

    initialize: function (props) {
      this.parentModel = props.parentModel;

      _.bindAll(this, 'renderCCItem');

      this.render();
    },

    renderCCItem: function(model) {
      var ccItemView = new Hktdc.Views.CC({
        model: model,
        parentModel: this.parentModel
      });

      ccItemView.render();
      $(this.el).append(ccItemView.el);
    },

    render: function () {
      // this.$el.html(this.template(this.model.toJSON()));
      this.collection.each(this.renderCCItem);
    }
  });


})();
