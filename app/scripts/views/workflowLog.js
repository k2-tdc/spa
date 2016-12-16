/* global Hktdc, Backbone, JST, $, _ */

Hktdc.Views = Hktdc.Views || {};

(function() {
  'use strict';

  Hktdc.Views.WorkflowLog = Backbone.View.extend({

    template: JST['app/scripts/templates/workflowLog.ejs'],

    tagName: 'tr',

    id: '',

    className: '',

    events: {},

    initialize: function() {
      this.listenTo(this.model, 'change', this.render);
    },

    render: function() {
      // console.log(this.model.toJSON());
      // console.log(this.template({log: this.model.toJSON()}));
      this.$el.html(this.template({
        log: this.model.toJSON()
      }));
    }

  });

  Hktdc.Views.WorkflowLogList = Backbone.View.extend({

    template: JST['app/scripts/templates/workflowLogList.ejs'],

    tagName: 'div',

    events: {
      'click #ancworkflowlog': 'clickToggleButton'
    },

    initialize: function(props) {
      var self = this;
      _.bindAll(this, 'renderWrokflowLogItem', 'clickToggleButton');
      this.requestFormModel = props.requestFormModel;
      if (props.showLog) {
        self.open();
      }
      this.requestFormModel.on('change:showLog', function(model, isShow) {
        if (isShow) {
          self.open();
        } else {
          self.close();
        }
      });
      // this.requestFormModel.set({
      //   showLog: (
      //     (this.requestFormModel.toJSON().ProcessLog) &&
      //     (this.requestFormModel.toJSON().ProcessLog.length > 0)
      //   )
      // });
    },

    clickToggleButton: function() {
      this.requestFormModel.set({
        showLog: !this.requestFormModel.toJSON().showLog
      });
    },

    open: function() {
      $('.headdivworkflowlog', this.el).show();

      $('#ancworkflowlog', this.el)
        .removeClass('glyphicon glyphicon-menu-down')
        .addClass('glyphicon glyphicon-menu-up')
        .attr('arrow', 'glyphicon-menu-up');
    },

    close: function() {
      $('.headdivworkflowlog', this.el).hide();
      $('#ancworkflowlog')
        .attr('arrow', 'glyphicon-menu-down')
        .removeClass('glyphicon glyphicon-menu-up')
        .addClass('glyphicon glyphicon-menu-down');
    },

    renderWrokflowLogItem: function(model) {
      model.set({
        CreatedOn: moment(model.toJSON().CreatedOn).format('DD MMM YYYY HH:mm:ss')
      });
      // console.log(model.toJSON());
      var workflowLogItemView = new Hktdc.Views.WorkflowLog({
        model: model
      });
      workflowLogItemView.render();
      $('tbody', this.el).append(workflowLogItemView.el);
    },

    render: function() {
      this.$el.html(this.template());
      // this.model.set({
      //   CreatedOn: moment()
      // })
      this.collection.each(this.renderWrokflowLogItem);
      // setTimeout(() => {
      // $('.workflowlogTable', this.el).DataTable({
      //   paging: false,
      //   searching: false,
      //   pageLength: false,
      //   order: [3, 'asc']
      // });
      // }, 1000);
    }

  });
})();
