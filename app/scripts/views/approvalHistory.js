/* global Hktdc, Backbone, JST, utils, _,  $, Q, moment, dialogMessage */

Hktdc.Views = Hktdc.Views || {};

(function() {
  'use strict';

  Hktdc.Views.ApprovalHistory = Backbone.View.extend({

    template: JST['app/scripts/templates/approvalHistory.ejs'],

    events: {
      'click #btnSearchCheckStatus': 'doSearch',
      'click .advanced-btn-wrapper': 'toggleAdvanceMode',
      'change .status-select': 'updateModelByEvent',
      'blur .search-field': 'updateModelByEvent'
    },

    initialize: function(props) {
      // console.debug('[ views/checkStatus.js ] - Initizing check status views');
      // this.listenTo(this.model, 'change', this.render);
      $('#mainContent').removeClass('compress');

      var self = this;
      var self = this;
      var backHandler=utils.initializeBackHandler();
      //console.log('initializeBackHandler call ends',backHandler);

      // _.extend(this, props);
      self.render(backHandler);
      self.model.on('change:showAdvanced', function(model, isShow) {
        self.doToggleAdvanceMode(isShow,false);
      });
      backHandler=false;
    },

    render: function(_isBackHandler) {
      var self = this;
      self.$el.html(self.template(self.model.toJSON()));
      self.doToggleAdvanceMode(self.model.toJSON().showAdvanced,_isBackHandler);
      self.renderDatePicker();
      self.renderDataTable(_isBackHandler);
    },

    renderDatePicker: function() {
      var self = this;
      var createDateFromView = new Hktdc.Views.DatePicker({
        model: new Hktdc.Models.DatePicker({
          placeholder: 'From Date',
          value: (self.model.toJSON()['create-start-date'])
            ? moment(self.model.toJSON()['create-start-date'], 'YYYY-MM-DD').format('DD MMM YYYY')
            : null
        }),
        onSelect: function(val) {
          self.model.set({
            'create-start-date': (moment(val, 'YYYY-MM-DD').isValid())
              ? moment(val, 'YYYY-MM-DD').format('YYYYMMDD')
              : ''
          });
        }
      });
      var createDateToView = new Hktdc.Views.DatePicker({
        model: new Hktdc.Models.DatePicker({
          placeholder: 'To Date',
          value: (self.model.toJSON()['create-end-date'])
            ? moment(self.model.toJSON()['create-end-date'], 'YYYY-MM-DD').format('DD MMM YYYY')
            : null
        }),
        onSelect: function(val) {
          self.model.set({
            'create-end-date': (moment(val, 'YYYY-MM-DD').isValid())
              ? moment(val, 'YYYY-MM-DD').format('YYYYMMDD')
              : ''
          });
        }
      });
      var approvalDateFromView = new Hktdc.Views.DatePicker({
        model: new Hktdc.Models.DatePicker({
          placeholder: 'From Date',
          value: (self.model.toJSON()['approval-start-date'])
            ? moment(self.model.toJSON()['approval-start-date'], 'YYYY-MM-DD').format('DD MMM YYYY')
            : null
        }),
        onSelect: function(val) {
          self.model.set({
            'approval-start-date': (moment(val, 'YYYY-MM-DD').isValid())
              ? moment(val, 'YYYY-MM-DD').format('YYYYMMDD')
              : ''
          });
        }
      });
      var approvalDateToView = new Hktdc.Views.DatePicker({
        model: new Hktdc.Models.DatePicker({
          placeholder: 'To Date',
          value: (self.model.toJSON()['approval-end-date'])
            ? moment(self.model.toJSON()['approval-end-date'], 'YYYY-MM-DD').format('DD MMM YYYY')
            : null
        }),
        onSelect: function(val) {
          self.model.set({
            'approval-end-date': (moment(val, 'YYYY-MM-DD').isValid())
              ? moment(val, 'YYYY-MM-DD').format('YYYYMMDD')
              : ''
          });
        }
      });

      $('.create-from-datepicker-container', self.el).html(createDateFromView.el);
      $('.create-to-datepicker-container', self.el).html(createDateToView.el);
      $('.approval-from-datepicker-container', self.el).html(approvalDateFromView.el);
      $('.approval-to-datepicker-container', self.el).html(approvalDateToView.el);
    },

    renderDataTable: function(_isBackHandler) {
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
          },
          error: function(response, status, err) {
            utils.apiErrorHandling(response, {
              // 401: doFetch,
              unknownMessage: dialogMessage.approvalHistory.getList.error
            });
          }
        },
        initComplete: function(settings, records) {
          self.renderUserFilter(records,_isBackHandler);
          self.renderStatusFilter(records,_isBackHandler);
          utils.updateDataTablePageInfo(_isBackHandler,self.approvalHistoryDataTable);
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
        utils.getCurrentPageInfo(self.approvalHistoryDataTable);
        var ProcInstIDPath = '/' + rowData.ProcInstID;
        var typePath = '/history/';

        Backbone.history.navigate('request' + typePath + rowData.refId + ProcInstIDPath, {
          trigger: true
        });
      });
    },
	
	 renderUserFilter: function(records,_isBackHandler) {
      var self = this;
      var applicants = _.map(records, function(record) {
        return {
          UserId: record.ApplicantUserId,
          UserFullName: record.ApplicantFNAME,
          EmployeeID: record.ApplicantEMP
        };
      });
      var distinctApplicants = _.uniq(applicants, function(applicant) {
        return applicant.UserFullName;
      });
      
      distinctApplicants=utils.refreshSourceFromStorage("Applicants",distinctApplicants,_isBackHandler);
      var _selectedApplicantName=utils.getDefaultApplicant(distinctApplicants,self.model.toJSON().applicant);
      var applicantCollection = new Hktdc.Collections.Applicant(distinctApplicants);
      
      
      //console.log(self.model.toJSON());
       var userListView = new Hktdc.Views.ApplicantSelect({
          collection: applicantCollection,
          //selectedApplicant: self.model.toJSON().applicant || '',
          selectedApplicant: _selectedApplicantName || '',
          onSelect: function(model) {
            var data = (model.toJSON().UserId === '0')
              ? { applicant: '', 'applicant-employee-id': '' }
              : { applicant: model.toJSON().UserId, 'applicant-employee-id': model.toJSON().EmployeeID }
            self.model.set(data);
          }
        });  
      userListView.render();
      $('.user-container', self.el).html(userListView.el);
    },

    renderStatusFilter: function(records,_isBackHandler) {
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

      distinctStatus=utils.refreshSourceFromStorage("AvaiStatus",distinctStatus,_isBackHandler);

      var statusCollection = new Hktdc.Collections.Status(distinctStatus);

      var statusListView = new Hktdc.Views.StatusList({
        collection: statusCollection,
        selectedStatus: self.model.toJSON().status
      });
      $('.status-container', self.el).html(statusListView.el);
    },

    loadSelectUserList: function() {
      /* employee component */
      var deferred = Q.defer();
      var applicantCollection = new Hktdc.Collections.Applicant();
      applicantCollection.url = applicantCollection.url(this.model.toJSON().mode);
      var doFetch = function() {
        applicantCollection.fetch({
          beforeSend: utils.setAuthHeader,
          success: function() {
            deferred.resolve(applicantCollection);
          },
          error: function(collection, response) {
            utils.apiErrorHandling(response, {
              // 401: doFetch,
              unknownMessage: dialogMessage.component.applicantList.error
            });
          }
        });
      };

      doFetch();

      return deferred.promise;
    },

    loadStatus: function() {
      var deferred = Q.defer();
      var statusCollection = new Hktdc.Collections.Status();
      var task = this.model.toJSON().mode;
      statusCollection.url = statusCollection.url(task);
      var doFetch = function() {
        statusCollection.fetch({
          beforeSend: utils.setAuthHeader,
          success: function() {
            deferred.resolve(statusCollection);
          },
          error: function(collection, response) {
            utils.apiErrorHandling(response, {
              // 401: doFetch,
              unknownMessage: dialogMessage.component.statusList.error
            });
          }
        });
      };

      doFetch();
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
        value = moment($(ev.target).val(), 'DD MMM YYYY').format('YYYY-MM-DD');
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
        //$('.advanced-btn .isHide', this.el).show();
        //$('.advanced-btn .isShow', this.el).hide();
        //$('.advanced-btn-wrapper .closeBtn', this.el).css('display', 'inline-block');
        //$('.advanced-btn-wrapper .openBtn', this.el).hide();
      } else {
        $('.advanced-form', this.el).hide();
        //$('.advanced-btn .isHide', this.el).hide();
        //$('.advanced-btn .isShow', this.el).show();
        //$('.advanced-btn-wrapper .openBtn', this.el).css('display', 'inline-block');
        //$('.advanced-btn-wrapper .closeBtn', this.el).hide();
      }
    },

    doSearch: function() {
      var queryParams = _.pick(this.model.toJSON(),
        'userid',
        'applicant-employee-id',
        'applicant',
        'approval-start-date',
        'approval-end-date',
        'status',
        'refid',
        'create-start-date',
        'create-end-date',
        'keyword'
      );

      // console.log(Backbone.history.getHash().split('?')[0]);
      var currentBase = Backbone.history.getHash().split('?')[0];
      Backbone.history.navigate(currentBase + utils.getQueryString(queryParams));
      this.approvalHistoryDataTable.ajax.url(this.getAjaxURL()).load();
    },

    getAjaxURL: function() {
      var usefulData = _.pick(this.model.toJSON(),
        'userid',
        'applicant-employee-id',
        'applicant',
        'approval-start-date',
        'approval-end-date',
        'status',
        'refid',
        'create-start-date',
        'create-end-date',
        'keyword'
      );
      //var statusApiURL = Hktdc.Config.apiURL + '/applications/computer-app/approval-history' + utils.getQueryString(usefulData);
      var statusApiURL = Hktdc.Config.apiURL + '/users/' + Hktdc.Config.userID + '/approval-history/computer-app' + utils.getQueryString(usefulData);
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
              var lv3Content = (Level3.SValue) ? '<span>' + Level3.SValue.split('#*#')[0].replace(/(?:\r\n|\r|\n)/g, '<br />') + '</span>' : '';
              summary += '<div>' + lv3Content + '</div> ';
            } else {
              var lv3Title = '<span>' + Level3.Name + ':</span><br />';
              var lv3Content = (Level3.SValue) ? '<span>' + Level3.SValue.replace(/(?:\r\n|\r|\n)/g, '<br />') + '</span>' : '';
              if (Level3.Name) {
                summary += '<div>' + lv3Title + lv3Content + '</div> ';
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

      switch (status) {
        case 'Draft':
          return 'Draft <br /> by: ' + Hktdc.Config.userName;

        case 'Submitted':
          return 'Submitted<br /> by: ' + Hktdc.Config.userName;

        case 'Approval':
          return formStatusDisplay + '<br /> by: ' + (row.CurrentActor || row.ApproverFNAME);

        case 'ProcessTasks':
        case 'ApprovedbyITS':
        case 'RejectedbyITS':
          return formStatusDisplay + '<br /> by: ' + (row.CurrentActor || row.ActionTakerFullName);

        case 'Rework':
          return formStatusDisplay + '<br /> by: ' + (row.CurrentActor || row.PreparerFNAME);

        case 'Review':
        case 'Return':
          return formStatusDisplay + '<br /> by: ' + (row.CurrentActor || row.ApplicantFNAME);

        case 'Reject':
        case 'Completed':
        case 'Cancelled':
        case 'Deleted':
        case 'Recalled':
          return formStatusDisplay;

        case 'ITSApproval':
          return formStatusDisplay + '<br /> by: ' + (row.CurrentActor || row.ITSApproverFullName);

        default:
          return formStatusDisplay + '<br /> by: ' + (row.CurrentActor || row.LastUser);

      }
    }

  });
})();
