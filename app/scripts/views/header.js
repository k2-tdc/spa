/* global Hktdc, Backbone, JST, $, utils, dialogMessage, Q, dialogTitle, sprintf */

Hktdc.Views = Hktdc.Views || {};

(function() {
  'use strict';

  Hktdc.Views.Header = Backbone.View.extend({

    template: JST['app/scripts/templates/header.ejs'],

    // set auto bind to existing #header
    el: '#header',

    initialize: function(props) {
      // this.listenTo(this.model, 'change', this.render);
      // var self = this;
      this.render();
      // this.model.on('change:processList', function(model, pList) {
      //   // console.log(newValue.toJSON());
      //   // console.log('changed: ', pList);
      //   var processListView = new Hktdc.Views.ProcessList({
      //     collection: new Hktdc.Collections.Process(pList)
      //   });
      //   processListView.render();
      //   $('.process-switch', self.el).append(processListView.el);
      // });

      // if (bowser.check({mobile: true})) {
      //   $('.process-switch', self.el).addClass('mobile');
      // } else {
      //   $('.process-switch', self.el).removeClass('mobile');
      // }
    },

    events: {
      // 'click .process-switch': 'changeZIndex'
    },

    // changeZIndex: function() {
      // $('#menu').css({zIndex: 0});
      // $('#page').css({zIndex: 1});
    // },
    loadProcessList: function() {
      var deferred = Q.defer();
      var menuProcessCollection = new Hktdc.Collections.MenuProcess();
      var doFetch = function() {
        menuProcessCollection.fetch({
          beforeSend: utils.setAuthHeader,
          success: function() {
            deferred.resolve(menuProcessCollection);
          },
          error: function(collection, response) {
            utils.apiErrorHandling(response, {
              // 401: doFetch,
              unknownMessage: dialogMessage.component.recommendList.error
            });
          }
        });
      };
      doFetch();

      return deferred.promise;
    },

    renderProcessList: function(collection) {
      console.log(collection);
      var processListView = new Hktdc.Views.MenuProcessList({
        collection: collection
      });
      processListView.render();
      $('.process-switch', this.el).append(processListView.el);
    },

    render: function() {
      // var data = this.model.toJSON() || ;
      var self = this;
      self.$el.html(self.template());
      self.loadProcessList()
        .then(function(collection) {
          self.renderProcessList(collection);
        })
        .catch(function(err) {
          console.error(err);
          Hktdc.Dispatcher.trigger('openAlert', {
            title: dialogTitle.error,
            message: sprintf(dialogMessage.common.error.script, {
              code: 'unknown',
              msg: dialogMessage.component.general.error
            })
          });
        });
    }

  });
})();
