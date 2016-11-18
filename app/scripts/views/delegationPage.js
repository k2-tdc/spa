/* global Hktdc, Backbone, JST, Q, utils, _, $ */


Hktdc.Views = Hktdc.Views || {};

(function() {
  'use strict';

  Hktdc.Views.DelegationPage = Backbone.View.extend({

    template: JST['app/scripts/templates/delegationPage.ejs'],
    events: {
      'click #btnSearchDelegation': 'doSearch',
      'change .type-select': 'updateModelByEvent',
      'change .step-select': 'updateModelByEvent',
      'click #ancnewdelegation': 'openDialog'
    },
    initialize: function(props) {
      console.debug('[ views/delegationPage.js ] - Initizing check status views');
      var self = this;
      _.extend(this, props);
      this.render();

      Q.all([
        this.loadProcessSteps(),

        // employee for dialog only
        this.loadEmployee(),

        this.loadProcessList()
      ])
        .then(function(results) {
          var stepCollection = results[0];
          var employeeCollection = results[1];
          var processCollection = results[2];
          // console.log(self.dialogModel.toJSON());


          var dialogView = new Hktdc.Views.DelegationDialog({
            model: self.dialogModel,
            pageModal: self.model
          });
          $('body').append(dialogView.el);
          var stepListViewInDialog = new Hktdc.Views.StepList({
            collection: stepCollection,
            attributes: {
              name: 'select-step'
            },
            parentModel: self.dialogModel
          });
          var processListViewInDialog = new Hktdc.Views.ProcessList({
            tagName: 'select',
            className: 'form-control select-process',
            to: 'dialog',
            attributes: {
              name: 'select-process'
            },
            collection: processCollection,
            parentModel: self.dialogModel
          });
          var toUserListViewInDialog = new Hktdc.Views.ToUserList({
            collection: new Hktdc.Collections.ToUser(employeeCollection.toJSON()),
            parentModel: self.dialogModel
          });
          var fromUserListViewInDialog = new Hktdc.Views.FromUserList({
            collection: new Hktdc.Collections.ToUser(employeeCollection.toJSON()),
            parentModel: self.dialogModel
          });
          $('.step-container', dialogView.el).html(stepListViewInDialog.el);
          $('.process-container', dialogView.el).html(processListViewInDialog.el);
          // console.log(fromUserListViewInDialog.el);
          $('.fromUser-container', dialogView.el).html(fromUserListViewInDialog.el);
          $('.toUser-container', dialogView.el).html(toUserListViewInDialog.el);



          var stepListView = new Hktdc.Views.StepList({
            collection: stepCollection,
            selectedStep: self.model.toJSON().StepId,
            parentModel: self.model
          });
          var processListView = new Hktdc.Views.ProcessList({
            tagName: 'select',
            className: 'form-control',
            collection: processCollection,
            selectedProcess: self.model.toJSON().ProId,
            parentModel: self.model
          });

          processListView.render();
          processListViewInDialog.render();
          // console.log(self.model.toJSON());
          // console.log(stepListView.el);
          $('.step-container', self.el).html(stepListView.el);
          // console.log($('.step-container', dialogView.el));
          // console.log(stepListViewInDialog.el);
          console.log(processListViewInDialog.el);
          $('.process-container', self.el).html(processListView.el);
        });

      this.model.on('change:saved', function() {
        self.model.clear();
        self.doSearch();
      });
      this.model.on('change:ProId', function() {
        self.loadProcessSteps()
          .then(function(stepCollection) {
            var stepListView = new Hktdc.Views.StepList({
              collection: stepCollection,
              selectedStep: self.model.toJSON().StepId,
              parentModel: self.model
            });

            $('.step-container', self.el).html(stepListView.el);
          });
      });
    },

    render: function() {
      // this.$el.html(this.template(this.model.toJSON()));
      var self = this;
      this.$el.html(this.template(this.model.toJSON()));

      /* Use DataTable's AJAX instead of backbone fetch and render */
      /* because to make use of DataTable funciton */
      this.delegationDataTable = $('#delegationTable', this.el).DataTable({
        ajax: {
          url: this.getAjaxURL(),
          beforeSend: utils.setAuthHeader,
          dataSrc: function(data) {
            // console.log(JSON.stringify({ data: data }, null, 2));
            var modData = _.map(data, function(row) {
              return {
                process: row.ProcessDisplayName,
                step: row.StepDisplayName,
                type: row.DelegationType,
                enabled: row.Enabled,
                fromUser: row.FromUser_FULL_NAME,
                toUser: row.ToUser_FULL_NAME,
                operation: self.getOperation()
              };
            });
            return modData;
            // return { data: modData, recordsTotal: modData.length };
          }
        },
        order: [0, 'desc'],
        createdRow: function(row, data, index) {
          $(row).css({
            cursor: 'pointer'
          });
          $(row).hover(function() {
            $(this).addClass('highlight');
          }, function() {
            $(this).removeClass('highlight');
          });
        },
        columns: [{
          data: 'process'
          // render: function(data) {
          //   return moment(data).format('DD MMM YYYY');
          // }
        }, {
          data: 'step'
        }, {
          data: 'type'
        }, {
          data: 'enabled'
        }, {
          data: 'fromUser'
        }, {
          data: 'toUser'
        }, {
          data: 'operation'
        }],
        bRetrieve: true
      });

      $('#delegationTable tbody', this.el).on('click', 'tr', function(ev) {
        var rowData = self.delegationDataTable.row(this).data();
        var SNPath = (rowData.SN) ? '/' + rowData.SN : '';
        var typePath;
        if (self.model.toJSON().mode === 'APPROVAL TASKS') {
          typePath = '/approval/';
        } else if (self.model.toJSON().mode === 'ALL TASKS') {
          typePath = '/all/';
        } else if (self.model.toJSON().mode === 'DRAFT') {
          typePath = '/draft/';
        } else {
          typePath = '/draft/';
        }
        Backbone.history.navigate('request' + typePath + rowData.refId + SNPath, {
          trigger: true
        });
      });

      $('#delegationTable tbody', this.el).on('click', '.btn-del', function(ev) {
        var isConfirm = confirm("Are you sure to delete draft?");
        if (isConfirm) {
          Backbone.emulateHTTP = true;
          Backbone.emulateJSON = true;
          ev.stopPropagation();
          var rowData = self.delegationDataTable.row($(this).parents('tr')).data();
          var refId = rowData.refId;
          var DeleteRequestModel = Backbone.Model.extend({
            url: Hktdc.Config.apiURL + '/DeleteDraft?ReferID=' + refId
          });
          var DeleteRequestModelInstance = new DeleteRequestModel();
          DeleteRequestModelInstance.save(null, {
            beforeSend: utils.setAuthHeader,
            success: function(model, response) {
              // console.log('success: ', a);
              // console.log(b);
              self.delegationDataTable.ajax.reload();
              Hktdc.Dispatcher.trigger('reloadMenu');
            },
            error: function(err) {
              console.log(err);
              // console.log(b);
            }
          });
        } else {
          ev.stopPropagation();
          return false;
        }
        // var rowData = self.delegationDataTable.row(this).data();
        // Backbone.history.navigate('request/' + rowData.refId, {trigger: true});
      });
    },

    updateModel: function(field, value) {
      var newObject = {};
      newObject[field] = value;
      console.log(newObject);
      this.model.set(newObject);
    },

    updateModelByEvent: function(ev, fieldName) {
      var field = $(ev.target).attr('name');
      // console.log(field);
      var newObject = {};
      newObject[field] = $(ev.target).val();
      console.log(newObject);
      this.model.set(newObject);
    },

    doSearch: function() {
      var queryParams = this.model.toJSON();
      // var queryParams = _.omit(this.model.toJSON(), 'UserId', 'canChooseStatus', 'mode', 'searchUserType');
      // console.log(Backbone.history.getHash().split('?')[0]);
      var currentBase = Backbone.history.getHash().split('?')[0];
      Backbone.history.navigate(currentBase + utils.getQueryString(queryParams));
      this.delegationDataTable.ajax.url(this.getAjaxURL()).load();
    },

    getAjaxURL: function() {
      var usefulData = _.pick(this.model.toJSON(), 'UserId', 'DeleId', 'ProId', 'StepId', 'Type');
      var filterArr = _.map(usefulData, function(val, filter) {
        var value = (_.isNull(val)) ? '' : val;
        return filter + '=' + value;
      });
      var delegationApiURL = Hktdc.Config.apiURL + '/GetDelegationDetails?' + filterArr.join('&');
      return delegationApiURL;
    },

    loadProcessSteps: function() {
      /* employee component */
      var deferred = Q.defer();
      var stepCollection = new Hktdc.Collections.Step();
      stepCollection.url = stepCollection.url(this.model.toJSON().ProId);
      stepCollection.fetch({
        beforeSend: utils.setAuthHeader,
        success: function() {
          deferred.resolve(stepCollection);
        },
        error: function(err) {
          deferred.reject(err);
        }
      });

      return deferred.promise;
    },

    loadEmployee: function() {
      var deferred = Q.defer();
      var employeeCollection = new Hktdc.Collections.Employee();
      employeeCollection.fetch({
        beforeSend: utils.setAuthHeader,
        success: function() {
          deferred.resolve(employeeCollection);
        },
        error: function(err) {
          deferred.reject(err);
        }
      });
      return deferred.promise;
    },

    loadProcessList: function() {
      var deferred = Q.defer();
      var processCollection = new Hktdc.Collections.Process();
      processCollection.fetch({
        beforeSend: utils.setAuthHeader,
        success: function() {
          deferred.resolve(processCollection);
        },
        error: function(err) {
          deferred.reject(err);
        }
      });
      return deferred.promise;
    },

    getOperation: function(row) {
      return '<button class="btn btn-primary btn-del"><span class="glyphicon glyphicon-remove"></span></button>';
    },

    openDialog: function() {
      console.log('crash');
      this.dialogModel.set({open: true});
    }

  });
})();
