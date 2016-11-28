/* global Hktdc, Backbone, JST, Q, utils, _, $ */

Hktdc.Views = Hktdc.Views || {};

(function() {
  'use strict';

  Hktdc.Views.DelegationDialog = Backbone.View.extend({
    template: JST['app/scripts/templates/delegationDialog.ejs'],
    attributes: {
      role: 'dialog',
      'aria-labelledby': 'delegation dialog'
    },
    events: {
      'change .select-process': 'clearOldStepId',
      'click .btn-save': 'clickSaveBtn',
      'change #enabled': 'changeChecked',
      'change #txtremark': 'changeField',
      'click .typeRadio': 'changeField'
    },
    className: 'modal fade bs-example-modal-sm',
    initialize: function(props) {
      var self = this;
      _.extend(this, props);
      this.render();

      this.$el.modal({
        backdrop: true,
        show: false
      });

      this.model.on('change:open', function(model, isOpen) {
        if (isOpen) {
          self.$el.modal('show');
        }
      });

      this.model.on('change:ProId', function(model, id) {
        console.log('in dialog');
        self.loadProcessStepsByProcId(id)
          .then(function(stepCollection) {
            self.model.set({
              StepId: ''
              // OldStepId: ''
            });
            var stepListView = new Hktdc.Views.StepList({
              collection: stepCollection,
              parentModel: self.model
            });

            $('.step-container', self.el).html(stepListView.el);
          });
      });

      this.model.on('change:Type', function(model, value) {
        $('input[name="Type"][value="' + value + '"]', self.el).prop('checked', true);
      });

      this.model.on('change:Enabled', function(model, value) {
        if (String(value) === '1') {
          $('input[name="Enabled"]', self.el).prop('checked', true);
        } else {
          $('input[name="Enabled"]', self.el).prop('checked', false);
        }
      });

      this.model.on('change:Remark', function(model, value) {
        $('input[name="Remark"]', self.el).val(value);
      });

      this.model.on('change:FromUserId', function(model, value) {
        $('select[name="FromUserId"]', self.el)
          .find('option[value="' + value + '"]')
          .prop('selected', true);
      });

      this.$el.on('hidden.bs.modal', function() {
        self.closeAndResetModel();
      });
    },
    clickSaveBtn: function() {
      console.log(this.model.toJSON());
      var self = this;
      var valid = true;
      var errMsgArr = [];
      var submitDelegationModel = new Hktdc.Models.SubmitDelegation({
        DelegationId: this.model.toJSON().DelegationId,
        Type: this.model.toJSON().Type,
        ProcessId: this.model.toJSON().ProId,
        StepId: this.model.toJSON().StepId || this.model.toJSON().OldStepId,
        FromUserId: this.model.toJSON().FromUserId,
        ToUserId: this.model.toJSON().ToUserId,
        CreateUserId: Hktdc.Config.userID,
        Enable: this.model.toJSON().Enabled,
        Remark: this.model.toJSON().Remark
      });
      console.log(submitDelegationModel.toJSON());

      if (!submitDelegationModel.toJSON().Type) {
        valid = false;
        errMsgArr.push('Please select the type');
      }
      if (!submitDelegationModel.toJSON().ProcessId) {
        valid = false;
        errMsgArr.push('Please select the process');
      }
      if (!submitDelegationModel.toJSON().StepId) {
        valid = false;
        errMsgArr.push('Please select the step');
      }
      if (!submitDelegationModel.toJSON().FromUserId) {
        valid = false;
        errMsgArr.push('Please select the from user');
      }
      if (!submitDelegationModel.toJSON().ToUserId) {
        valid = false;
        errMsgArr.push('Please select the to user');
      }

      if (!valid) {
        Hktdc.Dispatcher.trigger('openAlert', {
          message: errMsgArr.join('<br />'),
          title: 'Input is not valid',
          type: 'error'
        });
      }
      Backbone.emulateHTTP = true;
      Backbone.emulateJSON = true;

      submitDelegationModel.save({}, {
        success: function() {
          self.$el.modal('hide');
          Hktdc.Dispatcher.trigger('openAlert', {
            message: 'Successfully saved delegation',
            title: 'Success',
            type: 'success'
          });
          self.onSavedDelegation();
        },
        fail: function() {
          Hktdc.Dispatcher.trigger('openAlert', {
            message: 'error on saving delegation',
            title: 'Error',
            type: 'error'
          });
        }
      });
    },
    changeField: function(ev) {
      console.log($(ev.target).val());
      var modelName = $(ev.target).attr('name');
      var newObject = {};
      newObject[modelName] = $(ev.target).val();
      console.log(newObject);
      this.model.set(newObject);
    },
    changeChecked: function(ev) {
      var modelName = $(ev.target).attr('name');
      var newObject = {};
      if ($(ev.target).prop('checked')) {
        newObject[modelName] = 1;
      } else {
        newObject[modelName] = 0;
      }
      this.model.set(newObject);
    },
    clearOldStepId: function() {
      console.log('change in dialog');
      this.model.set({
        OldStepId: ''
      });
    },
    onSavedDelegation: function() {
      var self = this;
      self.closeAndResetModel();
      self.$el.find('select').find('option:eq(0)').prop('selected', true);
      self.$el.find('input[type=text]').val('');
      self.$el.find('input[type=radio]').prop('checked', false);
      self.$el.find('input[type=checkbox]').prop('checked', false);

      self.pageModal.set({
        saved: true
      });
    },

    closeAndResetModel: function() {
      this.model.set({
        open: false,
        DelegationId: '',
        Type: '',
        ProId: '',
        StepId: '',
        OldStepId: '',
        FromUserId: '',
        ToUserId: '',
        CreateUserId: Hktdc.Config.userID,
        Enable: '',
        Remark: ''
      });
    },

    loadProcessStepsByProcId: function(procId) {
      /* employee component */
      var deferred = Q.defer();

      if (this.model.toJSON().ProId) {
        var stepCollection = new Hktdc.Collections.Step();
        stepCollection.url = stepCollection.url(procId);
        stepCollection.fetch({
          beforeSend: utils.setAuthHeader,
          success: function() {
            deferred.resolve(stepCollection);
          },
          error: function(err) {
            deferred.reject(err);
          }
        });
      }else {
        deferred.resolve(new Hktdc.Collections.Step([]));
      }
      return deferred.promise;
    },

    render: function() {
      // console.log('render in delegation dialog');
      this.$el.html(this.template(this.model.toJSON()));
    }

  });
})();
