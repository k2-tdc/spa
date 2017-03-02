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
      self.renderDatePicker();
      self.model.on('change:showAdvanced', function(model, isShow) {
        self.doToggleAdvanceMode(isShow);
      });

    },

    render: function() {
      // this.$el.html(this.template(this.model.toJSON()));
      this.$el.html(this.template({ filter: this.model.toJSON() }));
      this.renderDataTable();
    },

    updateModel: function(field, value) {
      var newObject = {};
      newObject[field] = value;
      // console.log(newObject);
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
        value = moment($(ev.target).val(), 'DD MMM YYYY').format('YYYYMMDD');
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
      var usefulData = _.pick(this.model.toJSON(),
        'offset',
        'limit',
        'sort',
        'status',
        'start-date',
        'end-date',
        'refid',
        'applicant',

        // 'UserId',
        'EmployeeId'
      );
      var filterArr = _.map(usefulData, function(val, filter) {
        var value = (_.isNull(val)) ? '' : val;
        return filter + '=' + value;
      });
      var statusApiURL;
      // console.log(this.model.);
      switch (this.model.toJSON().mode) {
        case 'DRAFT':
          statusApiURL = Hktdc.Config.apiURL + '/users/' + Hktdc.Config.userID + '/draft-list/computer-app?' + filterArr.join('&');
          break;
        case 'ALL TASKS':
          statusApiURL = Hktdc.Config.apiURL + '/users/' + Hktdc.Config.userID + '/work-list/computer-app?' + filterArr.join('&');
          break;
        case 'APPROVAL TASKS':
          // statusApiURL = Hktdc.Config.apiURL + '/GetApproveList?' + filterArr.join('&');
          statusApiURL = Hktdc.Config.apiURL + '/users/' + Hktdc.Config.userID + '/approval-work-list/computer-app?' + filterArr.join('&');
          break;
        case 'CHECK STATUS':
          // statusApiURL = Hktdc.Config.apiURL + '/GetRequestList?' + filterArr.join('&');
          statusApiURL = Hktdc.Config.apiURL + '/users/' + Hktdc.Config.userID + '/applications/computer-app?' + filterArr.join('&');
          break;
        default:
          console.log('mode error');
          // statusApiURL = Hktdc.Config.apiURL + '/GetRequestDetails?' + filterArr.join('&');
      }
      return statusApiURL;
    },

    renderDataTable: function() {
      var self = this;
      /* Use DataTable's AJAX instead of backbone fetch and render */
      /* because to make use of DataTable funciton */
      this.statusDataTable = $('#statusTable', this.el).DataTable({
        bRetrieve: true,
        order: [0, 'desc'],
        searching: false,
        processing: true,
        oLanguage: {
          sProcessing: '<div class="data-table-loader"></div>'
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
        }],
        initComplete: function(settings, records) {
          self.renderUserFilter(records);
          self.renderStatusFilter(records);
        }

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
        Backbone.history.navigate('request' + typePath + rowData.refId + SNOrProcIdPath, {
          trigger: true
        });
      });
    },

    renderUserFilter: function(records) {
      var self = this;
      var userListView;
      var applicants = _.map(records, function(record) {
        return {
          UserId: record.ApplicantUserId,
          UserFullName: record.ApplicantFNAME
        };
      });
      var distinctApplicants = _.uniq(applicants, function(applicant) {
        return applicant.UserId;
      });
      var applicantCollection = new Hktdc.Collections.Applicant(distinctApplicants);
      if (self.model.toJSON().mode === 'APPROVAL TASKS' || self.model.toJSON().mode === 'ALL TASKS') {
        userListView = new Hktdc.Views.DelegationList({
          tagName: 'select',
          className: 'form-control user-select',
          attributes: {
            name: 'SUser'
          },
          collection: applicantCollection,
          selectedDelegation: self.model.toJSON().SUser
        });
      } else {
        userListView = new Hktdc.Views.ApplicantSelect({
          collection: applicantCollection,
          selectedApplicant: self.model.toJSON().applicant,
          onSelect: function(model) {
            var val = (model) ? model.toJSON().UserId : '';
            self.model.set({ applicant: val });
          }
        });
        userListView.render();
      }

      $('.user-container', self.el).html(userListView.el);
    },

    renderStatusFilter: function(records) {
      var self = this;
      var allStatus = _.map(records, function(record) {
        return {
          ReferenceName: record.DisplayStatus,
          ReferenceID: record.FormStatus
        };
      });
      var distinctStatus = _.uniq(allStatus, function(status) {
        return status.ReferenceID;
      });

      var statusCollection = new Hktdc.Collections.Status(distinctStatus);
      var statusListView = new Hktdc.Views.StatusList({
        collection: statusCollection,
        selectedStatus: self.model.toJSON().status
      });

      $('.status-container', self.el).html(statusListView.el);
    },

    renderDatePicker: function() {
      var self = this;
      var createDateFromView = new Hktdc.Views.DatePicker({
        model: new Hktdc.Models.DatePicker({
          placeholder: 'From Date',
          value: (self.model.toJSON()['create-start-date'])
            ? moment(self.model.toJSON()['create-start-date'], 'YYYYMMDD').format('DD MMM YYYY')
            : null
        }),
        onSelect: function(val) {
          self.model.set({
            'start-date': val
          });
        }
      });
      var createDateToView = new Hktdc.Views.DatePicker({
        model: new Hktdc.Models.DatePicker({
          placeholder: 'To Date',
          value: (self.model.toJSON()['create-end-date'])
            ? moment(self.model.toJSON()['create-end-date'], 'YYYYMMDD').format('DD MMM YYYY')
            : null
        }),
        onSelect: function(val) {
          self.model.set({
            'end-date': val
          });
        }
      });

      $('.create-from-datepicker-container', self.el).html(createDateFromView.el);
      $('.create-to-datepicker-container', self.el).html(createDateToView.el);
    },

    getSummaryFromRow: function(formID, requestList) {
      var summary = 'Ref.ID : ' + formID;
      _.each(requestList, function(Level1) {
        // summary += '<br /><strong style="text-decoration: underline">' + Level1.Name + '</strong><br />';
        _.each(Level1.Level2, function(Level2) {
          summary += ' <div><strong><span>' + Level2.Name + ' </span></strong></div>';
          _.each(Level2.Level3, function(Level3) {
            var lv3Content;
            if (String(Level3.ControlFlag) === '2') {
              lv3Content = (Level3.SValue) ? '<span>&nbsp;' + Level3.SValue.split('#*#')[0] + '</span>' : '';
              summary += '<div><span>-</span>' + lv3Content + '</div> ';
            } else {
              var lv3Title = '<span>&nbsp;' + Level3.Name + ' </span>';
              lv3Content = (Level3.SValue) ? '<span>: ' + Level3.SValue + '</span>' : '';
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
