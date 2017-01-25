/* global Hktdc, Backbone, JST, utils, _,  $, Q, moment */

Hktdc.Views = Hktdc.Views || {};

(function() {
  'use strict';

  Hktdc.Views.ApprovalHistory = Backbone.View.extend({

    template: JST['app/scripts/templates/approvalHistory.ejs'],

    events: {
      'click #btnSearchCheckStatus': 'doSearch',
      'click .advanced-btn': 'toggleAdvanceMode',
      'change .user-select': 'updateModelByEvent',
      'change .status-select': 'updateModelByEvent',
      'blur .search-field': 'updateModelByEvent'
    },

    initialize: function(props) {
      // console.debug('[ views/checkStatus.js ] - Initizing check status views');
      // this.listenTo(this.model, 'change', this.render);
      $('#mainContent').removeClass('compress');

      var self = this;
      // _.extend(this, props);
      self.render();
      self.model.on('change:showAdvanced', function(model, isShow) {
        self.doToggleAdvanceMode(isShow);
      });
    },

    render: function() {
      var self = this;
      self.$el.html(self.template(self.model.toJSON()));
      self.doToggleAdvanceMode(self.model.toJSON().showAdvanced);
      self.renderDatePicker();
      self.renderDataTable();

      Q.all([
        self.loadSelectUserList(),
        self.loadStatus()
      ])
        .then(function(results) {
          var userCollection = results[0];
          var statusCollection = results[1];

          var userListView = new Hktdc.Views.ApplicantList({
            tagName: 'select',
            className: 'form-control user-select',
            attributes: {
              name: 'Appl'
            },
            collection: userCollection,
            selectedApplicant: self.model.toJSON().Appl
          });

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

    renderDatePicker: function() {
      var self = this;
      var createDateFromView = new Hktdc.Views.DatePicker({
        model: new Hktdc.Models.DatePicker({
          placeholder: 'From Date'
        }),
        onSelect: function(val) {
          console.log(val);
          self.model.set({
            'create-start-date': val
          });
        }
      });
      var createDateToView = new Hktdc.Views.DatePicker({
        model: new Hktdc.Models.DatePicker({
          placeholder: 'To Date'
        }),
        onSelect: function(val) {
          self.model.set({
            'create-end-date': val
          });
        }
      });
      var approvalDateFromView = new Hktdc.Views.DatePicker({
        model: new Hktdc.Models.DatePicker({
          placeholder: 'From Date'
        }),
        onSelect: function(val) {
          self.model.set({
            'approval-start-date': val
          });
        }
      });
      var approvalDateToView = new Hktdc.Views.DatePicker({
        model: new Hktdc.Models.DatePicker({
          placeholder: 'To Date'
        }),
        onSelect: function(val) {
          self.model.set({
            'approval-end-date': val
          });
        }
      });

      $('.create-from-datepicker-container', self.el).html(createDateFromView.el);
      $('.create-to-datepicker-container', self.el).html(createDateToView.el);
      $('.approval-from-datepicker-container', self.el).html(approvalDateFromView.el);
      $('.approval-to-datepicker-container', self.el).html(approvalDateToView.el);
    },

    renderDataTable: function() {
      var self = this;
      /* Use DataTable's AJAX instead of backbone fetch and render */
      /* because to make use of DataTable funciton */
      self.approvalHistoryDataTable = $('#approvalHistoryTable', self.el).DataTable({
        bRetrieve: true,
        order: [0, 'desc'],
        searching: false,
        processing: true,
        oLanguage: {
          sProcessing: '<div class="data-table-loader"></div>'
        },
        ajax: {
          url: self.getAjaxURL(),
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
          $(row).css({
            cursor: 'pointer'
          });
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

      $('#approvalHistoryTable tbody', self.el).on('click', 'tr', function(ev) {
        var rowData = self.approvalHistoryDataTable.row(this).data();
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
        Backbone.history.navigate('request' + typePath + rowData.refId + SNOrProcIdPath, {
          trigger: true
        });
      });
    },

    loadSelectUserList: function() {
      /* employee component */
      var deferred = Q.defer();
      var applicantCollection = new Hktdc.Collections.Applicant();
      applicantCollection.url = applicantCollection.url(this.model.toJSON().mode);
      applicantCollection.fetch({
        beforeSend: utils.setAuthHeader,
        success: function() {
          deferred.resolve(applicantCollection);
        },
        error: function(err) {
          deferred.reject(err);
        }
      });

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

    updateModel: function(field, value) {
      var newObject = {};
      newObject[field] = value;
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
      var queryParams = _.pick(this.model.toJSON(), 'userid', 'employeeid', 'applicant', 'approval-start-date', 'approval-end-date', 'status', 'refid', 'create-start-date', 'create-end-date', 'keyword');

      // console.log(Backbone.history.getHash().split('?')[0]);
      var currentBase = Backbone.history.getHash().split('?')[0];
      Backbone.history.navigate(currentBase + utils.getQueryString(queryParams));
      this.approvalHistoryDataTable.ajax.url(this.getAjaxURL()).load();
    },

    getAjaxURL: function() {
      var usefulData = _.pick(this.model.toJSON(), 'userid', 'employeeid', 'applicant', 'approval-start-date', 'approval-end-date', 'status', 'refid', 'create-start-date', 'create-end-date', 'keyword');
      var statusApiURL = Hktdc.Config.apiURL.replace('/api/request', '') + '/applications/computer-app/approval-history' + utils.getQueryString(usefulData);
      return statusApiURL;
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
      } else if (status === 'Recalled') {
        return formStatusDisplay;
        // return formStatusDisplay + '<br /> by: ' + row.ApplicantFNAME;
      } else if (status === 'ITSApproval') {
        return formStatusDisplay + '<br /> by: ' + row.ITSApproverFullName;
      } else {
        return formStatusDisplay + '<br /> by: ' + row.LastUser;
      }

      // return status + '<br />' + formStatusDisplay + '<br /> by: ' + approver;
    }

  });
})();
