/* global Hktdc, Backbone, JST, Q, utils, _, $, confirm */


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

        this.loadProcessList(),
        this.loadFromUser()
      ])
        .then(function(results) {
          self.stepCollection = results[0];
          self.employeeCollection = results[1];
          self.processCollection = results[2];

          // have set in loadFromuser
          // self.fromUserCollection = results[2];

          // console.log(self.dialogModel.toJSON());
          self.renderDialog();

          var stepListView = new Hktdc.Views.StepList({
            collection: self.stepCollection,
            parentModel: self.model
          });
          var processListView = new Hktdc.Views.ProcessList({
            tagName: 'select',
            className: 'form-control',
            collection: self.processCollection,
            parentModel: self.model
          });

          processListView.render();
          $('.step-container', self.el).html(stepListView.el);
          $('.process-container', self.el).html(processListView.el);
        });

      this.model.on('change:saved', function(model, saved) {
        if (saved) {
          self.model.set({
            UserId: Hktdc.Config.userID,
            DeleId: '',
            ProId: '',
            StepId: '',
            Type: ''
          });
          self.doSearch();
        }
      });
      this.model.on('change:ProId', function() {
        self.loadProcessSteps()
          .then(function(stepCollection) {
            self.model.set({StepId: ''});
            var stepListView = new Hktdc.Views.StepList({
              collection: stepCollection,
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
        bRetrieve: true,
        order: [0, 'desc'],
        searching: false,
        ajax: {
          url: this.getAjaxURL(),
          beforeSend: utils.setAuthHeader,
          dataSrc: function(data) {
            // console.log(JSON.stringify({ data: data }, null, 2));
            var modData = _.map(data, function(row) {
              _.extend(row, {
                operation: self.getOperation()
              });
              return row;
            });
            return modData;
            // return { data: modData, recordsTotal: modData.length };
          }
        },
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
        columns: [
          {
            data: 'ProcessDisplayName'
            // render: function(data) {
            //   return moment(data).format('DD MMM YYYY');
            // }
          }, {
            data: 'StepDisplayName'
          }, {
            data: 'DelegationType'
          }, {
            data: 'Enabled',
            render: function(data) {
              return (String(data) === '1') ? 'Yes' : 'No';
            }
          }, {
            data: 'FromUser_FULL_NAME'
          }, {
            data: 'ToUser_FULL_NAME'
          }, {
            data: 'operation'
          }
        ]
      });

      $('#delegationTable tbody', this.el).on('click', 'tr', function(ev) {
        var rowData = self.delegationDataTable.row(this).data();
        console.log('b4 dialog model', self.dialogModel.toJSON());
        self.model.set({
          saved: false
        });
        self.dialogModel.set({
          DelegationId: rowData.DelegationID,
          Type: rowData.DelegationType,
          ProId: rowData.ProcessID,
          StepId: rowData.StepID,
          OldStepId: rowData.StepID,
          FromUserId: rowData.FromUser_USER_ID,
          ToUserId: rowData.ToUser_USER_ID,
          Enabled: rowData.Enabled,
          Remark: rowData.Remark
        });
        // self.renderDialog(true);
        console.log('after dialog model', self.dialogModel.toJSON());
        self.openDialog();
      });

      $('#delegationTable tbody', this.el).on('click', '.btn-del', function(ev) {
        var isConfirm = confirm('Are you sure to delete delegation?');
        if (isConfirm) {
          Backbone.emulateHTTP = true;
          Backbone.emulateJSON = true;
          ev.stopPropagation();
          var rowData = self.delegationDataTable.row($(this).parents('tr')).data();
          var DelegationID = rowData.DelegationID;
          var DeleteRequestModel = Backbone.Model.extend({
            url: Hktdc.Config.apiURL + '/DeleteDelegation?DeleID=' + DelegationID
          });
          var DeleteRequestModelInstance = new DeleteRequestModel();
          DeleteRequestModelInstance.save(null, {
            beforeSend: utils.setAuthHeader,
            success: function(model, response) {
              // console.log('success: ', a);
              // console.log(b);
              self.delegationDataTable.ajax.reload();
              // Hktdc.Dispatcher.trigger('reloadMenu');
            },
            error: function(err) {
              Hktdc.Dispatcher.trigger('openAlert', {
                message: 'error on delete delegation' + JSON.stringify(err, null, 2),
                type: 'error',
                title: 'Error'
              });
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

    renderDialog: function() {
      var self = this;
      console.log('renderDialog');
      var dialogView = new Hktdc.Views.DelegationDialog({
        model: self.dialogModel,
        pageModal: self.model
      });

      var stepListViewInDialog = new Hktdc.Views.StepList({
        collection: self.stepCollection,
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
        collection: self.processCollection,
        parentModel: self.dialogModel
      });
      processListViewInDialog.render();

      var toUserListViewInDialog = new Hktdc.Views.ToUserList({
        collection: new Hktdc.Collections.ToUser(self.employeeCollection.toJSON()),
        parentModel: self.dialogModel
      });
      var fromUserListViewInDialog = new Hktdc.Views.FromUserList({
        collection: self.fromUserCollection,
        parentModel: self.dialogModel
      });
      $('.step-container', dialogView.el).html(stepListViewInDialog.el);
      $('.process-container', dialogView.el).html(processListViewInDialog.el);
      // console.log(fromUserListViewInDialog.el);
      $('.fromUser-container', dialogView.el).html(fromUserListViewInDialog.el);
      $('.toUser-container', dialogView.el).html(toUserListViewInDialog.el);
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
      // var queryParams = this.model.toJSON();
      var queryParams = _.omit(this.model.toJSON(), 'UserId', 'DeleId', 'saved');
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
      if (this.model.toJSON().ProId) {
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
      } else {
        deferred.resolve(new Hktdc.Collections.Step([]));
      }

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

    loadFromUser: function() {
      var deferred = Q.defer();
      var self = this;
      this.fromUserCollection = new Hktdc.Collections.FromUser();
      this.fromUserCollection.fetch({
        beforeSend: utils.setAuthHeader,
        success: function() {
          deferred.resolve(self.fromUserCollection);
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
      console.log(this.dialogModel.toJSON());
      this.model.set({
        saved: false
      });
      this.dialogModel.set({
        open: true
      });
    }

  });
})();
