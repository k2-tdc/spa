/* global Hktdc, Backbone, JST, utils, _,  $, Q, moment */

Hktdc.Views = Hktdc.Views || {};

(function() {
  'use strict';

  Hktdc.Views.CheckStatus = Backbone.View.extend({

    template: JST['app/scripts/templates/checkStatus.ejs'],

    events: {
      'click #btnSearchCheckStatus': 'doSearch',
      'click .advanced-btn': 'toggleAdvanceMode',
      'change .user-select': 'updateModelByEvent',
      'change .status-select': 'updateModelByEvent',
      'blur .search-field': 'updateModelByEvent',
      'blur .date': 'updateDateModelByEvent'
    },

    initialize: function(props) {
      // console.debug('[ views/checkStatus.js ] - Initizing check status views');
      // this.listenTo(this.model, 'change', this.render);
      $('#mainContent').removeClass('compress');

      var self = this;
      // _.extend(this, props);
      self.render();
      self.doToggleAdvanceMode(self.model.toJSON().showAdvanced);
      self.model.on('change:showAdvanced', function(model, isShow) {
        self.doToggleAdvanceMode(isShow);
      });
      self.listenTo(Hktdc.Dispatcher, 'reloadCheckStatus', function(isLock) {
        self.statusDataTable.ajax.reload();
      });

      $('.datepicker-toggle-btn', self.el).mousedown(function(ev) {
        ev.stopPropagation();
        // $(this).prev().data('open');
        // console.log($(ev.target));
        var $target = $(ev.target).parents('.input-group').find('.date');
        var open = $target.data('open');
        // console.log(open);
        if (open) {
          $target.datepicker('hide');
        } else {
          $target.datepicker('show');
        }
      });
      $('.date', self.el)
        .datepicker({
          autoclose: true,
          format: {
            toDisplay: function(date, format, language) {
              return moment(date).format('DD MMM YYYY');
            },
            toValue: function(date, format, language) {
              return moment(date).format('MM/DD/YYYY');
            }
          }
        })
        .on('changeDate', function(ev) {
          var $input = ($(ev.target).is('input')) ? $(ev.target) : $(ev.target).find('input');
          var fieldName = $input.attr('name');
          var val = moment($(this).datepicker('getDate')).format('MM/DD/YYYY');
          // console.log(fieldName);
          // console.log(val);
          self.updateModel(fieldName, val);
        })
        .on('show', function(ev) {
          $(ev.target).data('open', true);
        })
        .on('hide', function(ev) {
          $(ev.target).data('open', false);
        });

      Q.all([
        this.loadSelectUserList(),
        this.loadStatus()
      ])
        .then(function(results) {
          var userCollection = results[0];
          var statusCollection = results[1];
          // console.log(self.model.toJSON().mode);
          if (self.model.toJSON().mode === 'APPROVAL TASKS' || self.model.toJSON().mode === 'ALL TASKS') {
            var userListView = new Hktdc.Views.DelegationList({
              tagName: 'select',
              className: 'form-control user-select',
              attributes: {name: 'SUser'},
              collection: userCollection,
              selectedDelegation: self.model.toJSON().SUser
            });
          } else {
            var userListView = new Hktdc.Views.ApplicantList({
              tagName: 'select',
              className: 'form-control user-select',
              attributes: {name: 'Appl'},
              collection: userCollection,
              selectedApplicant: self.model.toJSON().Appl
            });
          }

          var statusListView = new Hktdc.Views.StatusList({
            collection: statusCollection,
            selectedStatus: self.model.toJSON().CStat
          });

          // console.log(userListView.el);
          $('.user-container', self.el).html(userListView.el);
          // console.log(statusListView.el);
          $('.status-container', self.el).html(statusListView.el);
        });
    },

    updateModel: function(field, value) {
      var newObject = {};
      newObject[field] = value;
      console.log(newObject);
      this.model.set(newObject);
    },

    updateModelByEvent: function(ev) {
      var field = $(ev.target).attr('name');
      var value = $(ev.target).val();
      this.updateModel(field, value);
    },

    updateDateModelByEvent: function(ev) {
      var field = $(ev.target).attr('name');
      var value = '';
      if ($(ev.target).val()) {
        value = moment($(ev.target).val(), 'DD MMM YYYY').format('MM/DD/YYYY');
      }

      this.updateModel(field, value);
    },

    toggleAdvanceMode: function() {
      this.model.set({
        showAdvanced: !this.model.toJSON().showAdvanced
      });
      // console.log(this.model.toJSON().showAdvanced);
    },

    doToggleAdvanceMode: function(isShow) {
      if (isShow) {
        $('.advanced-form', this.el).show();
        $('.advanced-btn .isHide', this.el).show();
        $('.advanced-btn .isShow', this.el).hide();
        $('.advanced-btn-wrapper .closeBtn', this.el).css('display', 'inline-block');
        $('.advanced-btn-wrapper .openBtn', this.el).hide();
      } else {
        $('.advanced-form', this.el).hide();
        $('.advanced-btn .isHide', this.el).hide();
        $('.advanced-btn .isShow', this.el).show();
        $('.advanced-btn-wrapper .openBtn', this.el).css('display', 'inline-block');
        $('.advanced-btn-wrapper .closeBtn', this.el).hide();
      }
    },

    doSearch: function() {
      var queryParams = _.omit(this.model.toJSON(), 'UserId', 'canChooseStatus', 'mode', 'searchUserType');
      // console.log(Backbone.history.getHash().split('?')[0]);
      var currentBase = Backbone.history.getHash().split('?')[0];
      Backbone.history.navigate(currentBase + utils.getQueryString(queryParams));
      this.statusDataTable.ajax.url(this.getAjaxURL()).load();
    },

    getAjaxURL: function() {
      var usefulData = _.pick(this.model.toJSON(), 'CStat', 'ReferID', 'FDate', 'TDate', 'Appl', 'UserId', 'SUser', 'ProsIncId', 'EmployeeId');
      var filterArr = _.map(usefulData, function(val, filter) {
        var value = (_.isNull(val)) ? '' : val;
        return filter + '=' + value;
      });
      var statusApiURL;
      // console.log(this.model.);
      switch (this.model.toJSON().mode) {
        case 'DRAFT':
          statusApiURL = Hktdc.Config.apiURL + '/GetDraftList?' + filterArr.join('&');
          break;
        case 'ALL TASKS':
          statusApiURL = Hktdc.Config.apiURL + '/GetWorklist?' + filterArr.join('&');
          break;
        case 'APPROVAL TASKS':
          statusApiURL = Hktdc.Config.apiURL + '/GetApproveList?' + filterArr.join('&');
          break;
        case 'CHECK STATUS':
          statusApiURL = Hktdc.Config.apiURL + '/GetRequestList?' + filterArr.join('&');
          break;
        default:
          console.log('mode error');
          // statusApiURL = Hktdc.Config.apiURL + '/GetRequestDetails?' + filterArr.join('&');
      }
      return statusApiURL;
    },

    render: function() {
      // this.$el.html(this.template(this.model.toJSON()));
      var self = this;
      this.$el.html(this.template(this.model.toJSON()));

      /* Use DataTable's AJAX instead of backbone fetch and render */
      /* because to make use of DataTable funciton */
      this.statusDataTable = $('#statusTable', this.el).DataTable({
        bRetrieve: true,
        order: [0, 'desc'],
        searching: false,
        processing: true,
        oLanguage: {
          sProcessing: '<span class="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span>'
        },
        ajax: {
          url: this.getAjaxURL(),
          beforeSend: utils.setAuthHeader,
          dataSrc: function(data) {
            // console.log(JSON.stringify({ data: data }, null, 2));
            var modData = _.map(data, function(row) {
              return {
                lastActionDate: row.SubmittedOn,
                applicant: row.ApplicantFNAME,
                summary: self.getSummaryFromRow(row.ReferenceID, row.RequestList),
                status: self.getStatusFrowRow(row),
                refId: row.ReferenceID,
                ProcInstID: row.ProcInstID,
                SN: row.SN
              };
            });
            return modData;
            // return { data: modData, recordsTotal: modData.length };
          }
        },
        createdRow: function(row, data, index) {
          $(row).css({cursor: 'pointer'});
          $(row).hover(function() {
            $(this).addClass('highlight');
          }, function() {
            $(this).removeClass('highlight');
          });
          // if (data.condition) {
          // }
        },
        columns: [{
          data: 'lastActionDate',
          render: function(data) {
            return moment(data).format('DD MMM YYYY');
          }
        }, {
          data: 'applicant'
        }, {
          data: 'summary'
        }, {
          data: 'status'
        }]
      });

      $('#statusTable tbody', this.el).on('click', 'tr', function(ev) {
        var rowData = self.statusDataTable.row(this).data();
        var SNOrProcIdPath = '';
        if ((rowData.SN)) {
          SNOrProcIdPath = '/' + rowData.SN;
        } else {
          if (rowData.ProcInstID) {
            SNOrProcIdPath = '/' + rowData.ProcInstID;
          }
        }
        var typePath;
        if (self.model.toJSON().mode === 'APPROVAL TASKS') {
          typePath = '/approval/';
        } else if (self.model.toJSON().mode === 'ALL TASKS') {
          typePath = '/all/';
        } else if (self.model.toJSON().mode === 'DRAFT') {
          typePath = '/draft/';
        } else {
          typePath = '/check/';
        }
        Backbone.history.navigate('request' + typePath + rowData.refId + SNOrProcIdPath, {trigger: true});
      });

      $('#statusTable tbody', this.el).on('click', '.btn-del', function(ev) {
        var isConfirm = confirm("Are you sure to delete draft?");
        if (isConfirm) {
          Backbone.emulateHTTP = true;
          Backbone.emulateJSON = true;
          ev.stopPropagation();
          var rowData = self.statusDataTable.row($(this).parents('tr')).data();
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
              self.statusDataTable.ajax.reload();
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
        // var rowData = self.statusDataTable.row(this).data();
        // Backbone.history.navigate('request/' + rowData.refId, {trigger: true});
      });
    },

    loadSelectUserList: function() {
      /* employee component */
      var deferred = Q.defer();
      // var self = this;
      if (this.model.toJSON().mode === 'ALL TASKS' || this.model.toJSON().mode === 'APPROVAL TASKS') {
        var delegationCollection = new Hktdc.Collections.Delegation();
        delegationCollection.fetch({
          beforeSend: utils.setAuthHeader,
          success: function() {
            // console.log('selectedCCCollection: ', self.model.toJSON().selectedCCCollection);
            // console.log('selectedCCCollection: ', self.model);
            deferred.resolve(delegationCollection);
          },
          error: function(err) {
            deferred.reject(err);
          }
        });
      } else {
        var applicantCollection = new Hktdc.Collections.Applicant();
        applicantCollection.url = applicantCollection.url(this.model.toJSON().mode);
        applicantCollection.fetch({
          beforeSend: utils.setAuthHeader,
          success: function() {
            // console.log('selectedCCCollection: ', self.model.toJSON().selectedCCCollection);
            // console.log('selectedCCCollection: ', self.model);
            deferred.resolve(applicantCollection);
          },
          error: function(err) {
            deferred.reject(err);
          }
        });
      }

      return deferred.promise;
    },

    loadStatus: function() {
      var deferred = Q.defer();
      var statusCollection = new Hktdc.Collections.Status();
      var task = this.model.toJSON().mode;
      statusCollection.url = statusCollection.url(task);
      statusCollection.fetch({
        beforeSend: utils.setAuthHeader,
        success: function() {
          deferred.resolve(statusCollection);
        },
        error: function(err) {
          deferred.reject(err);
        }
      });
      return deferred.promise;
    },

    getSummaryFromRow: function(formID, requestList) {
      var summary = 'Ref.ID : ' + formID;
      _.each(requestList, function(Level1) {
        // summary += '<br /><strong style="text-decoration: underline">' + Level1.Name + '</strong><br />';
        _.each(Level1.Level2, function(Level2) {
          summary += ' <div><strong><span>' + Level2.Name + ' </span></strong></div>';
          _.each(Level2.Level3, function(Level3) {
            if (String(Level3.ControlFlag) === '2') {
              var lv3Content = (Level3.SValue) ? '<span>&nbsp;' + Level3.SValue.split('#*#')[0] + '</span>' : '';
              summary += '<div><span>-</span>' + lv3Content + '</div> ';
            } else {
              var lv3Title = '<span>&nbsp;' + Level3.Name + ' </span>';
              var lv3Content = (Level3.SValue) ? '<span>: ' + Level3.SValue + '</span>' : '';
              if (Level3.Name) {
                summary += '<div><span>-</span>' + lv3Title + lv3Content + '</div> ';
              }
            }
          });
        });
      });

      return summary;
    },

    getStatusFrowRow: function(row) {
      var formStatusDisplay = row.DisplayStatus;
      var status = row.FormStatus;

      // if (true) {
      if (status === 'Draft') {
        return 'Draft <br /> by: ' + Hktdc.Config.userName;
        // return '<div><button class="btn btn-primary btn-del"><span class="glyphicon glyphicon-remove"></span></button></div>';
      } else if (status === 'Submitted') {
        return 'Submitted<br /> by: ' + Hktdc.Config.userName;
      } else if (status === 'Review') {
        return formStatusDisplay + '<br /> by: ' + row.ApplicantFNAME;
      } else if (status === 'Approval') {
        return formStatusDisplay + '<br /> by: ' + row.ApproverFNAME;
      } else if (status === 'ProcessTasks') {
        return formStatusDisplay + '<br /> by: ' + row.ActionTakerFullName;
      } else if (status === 'Return') {
        return formStatusDisplay + '<br /> by: ' + row.ApplicantFNAME;
      } else if (status === 'Reject') {
        return formStatusDisplay;
      } else if (status === 'Completed') {
        return formStatusDisplay;
      } else if (status === 'Cancelled') {
        return formStatusDisplay;
      } else if (status === 'Deleted') {
        return formStatusDisplay;
      } else if (status === 'Recall') {
        return formStatusDisplay + '<br /> by: ' + row.ApplicantFNAME;
      } else if (status === 'ITSApproval') {
        return formStatusDisplay + '<br /> by: ' + row.ITSApproverFullName;
      } else {
        return formStatusDisplay + '<br /> by: ' + row.LastUser;
      }

      // return status + '<br />' + formStatusDisplay + '<br /> by: ' + approver;
    }

  });
})();
