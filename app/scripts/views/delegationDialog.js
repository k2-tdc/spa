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
      'click .btn-save': 'clickSaveBtn',
      'change #enabled': 'changeField',
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
        // console.log(id);
        self.loadProcessStepsByProcId(id)
          .then(function(stepCollection) {
            var stepListView = new Hktdc.Views.StepList({
              collection: stepCollection,
              parentModel: self.model
            });

            $('.step-container', self.el).html(stepListView.el);
          });
      });

      this.$el.on('hidden.bs.modal', function() {
        self.model.set({
          open: false,
          DelegationId: '',
          Type: '',
          ProId: '',
          StepId: '',
          FromUserId: '',
          ToUserId: '',
          CreateUserId: Hktdc.Config.userID,
          Enable: '',
          Remark: ''
        });

        self.$el.find('select').find('option:eq(0)').prop('selected', true);
        self.$el.find('input[type=text]').val('');
        self.$el.find('input[type=radio]').prop('checked', false);
        self.$el.find('input[type=checkbox]').prop('checked', false);

        self.pageModal.set({
          saved: true
        });
      });
    },
    clickSaveBtn: function() {
      console.log(this.model.toJSON());

      var submitDelegationModel = new Hktdc.Models.SubmitDelegation({
        DelegationId: this.model.toJSON().DelegationId,
        Type: this.model.toJSON().Type,
        ProcessId: this.model.toJSON().ProId,
        StepId: this.model.toJSON().StepId,
        FromUserId: this.model.toJSON().FromUserId,
        ToUserId: this.model.toJSON().ToUserId,
        CreateUserId: Hktdc.Config.userID,
        Enable: this.model.toJSON().Enabled,
        Remark: this.model.toJSON().Remark
      });
      console.log(submitDelegationModel.toJSON());

      Backbone.emulateHTTP = true;
      Backbone.emulateJSON = true;

      submitDelegationModel.save({}, {
        success: function() {
          this.$el.modal('hide');
          Hktdc.Dispatcher.trigger('openAlert', {
            message: 'Successfully saved delegation',
            title: 'Success',
            type: 'success'
          });
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
    loadProcessStepsByProcId: function(procId) {
      /* employee component */
      var deferred = Q.defer();
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

      return deferred.promise;
    },

    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
    }

  });
})();
