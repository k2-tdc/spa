/* global Hktdc, Backbone, JST, utils, _,  $, Q, moment, dialogMessage */

Hktdc.Views = Hktdc.Views || {};

(function() {
  'use strict';

  Hktdc.Views.CheckStatus = Backbone.View.extend({

    template: JST['app/scripts/templates/checkStatus.ejs'],

    events: {
      'click #btnSearchCheckStatus': 'doSearch',
      'click .advanced-btn-wrapper': 'toggleAdvanceMode',
      'change .status-select': 'updateModelByEvent',
      'blur .search-field': 'updateModelByEvent',
      'blur .date': 'updateDateModelByEvent'
    },

    initialize: function(props) {
      //console.log('[ views/checkStatus.js ] - Initializing check status views');
      // this.listenTo(this.model, 'change', this.render);
      $('#mainContent').removeClass('compress');


      var self = this;
      var backHandler=utils.initializeBackHandler();
      //console.log('initializeBackHandler call ends',backHandler);

      // _.extend(this, props);
      self.render(backHandler);
      self.doToggleAdvanceMode(self.model.toJSON().showAdvanced,backHandler);
      self.renderDatePicker();
      self.model.on('change:showAdvanced', function(model, isShow) {
      self.doToggleAdvanceMode(isShow,false);
      });
      
      backHandler=false;
      //console.log('[ views/checkStatus.js ] - Initializing Ends check status views');
    },

    render: function(_isBackHandler) {
      //console.log('[ views/checkStatus.js ] - render starts',_isBackHandler);

      // this.$el.html(this.template(this.model.toJSON()));
      var self = this;
      this.$el.html(this.template({ filter: this.model.toJSON() }));
      this.renderDataTable(_isBackHandler);
      
      if (this.model.toJSON().showShareUser) {
          this.loadShareUser()
            .then(function(shareUsers) {
              return self.renderShareUser(shareUsers);
            })
            .catch(function(e) {
              console.error(e);
            });
        }

      //console.log('[ views/checkStatus.js ] - render ends');        
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

    doToggleAdvanceMode: function(isShow,_isBackHandler) {
        
      //check if the navigation is from back else store the value in session for local storage
      var self=this;
      isShow=utils.toggleModeForBackNavigation(isShow,_isBackHandler);
      if (isShow) {
        $('.advanced-form', this.el).show();
      } else {
        $('.advanced-form', this.el).hide();
      }
    },

    doSearch: function() {
	  //console.log('call to do search');		
      var queryParams = _.pick(this.model.toJSON(),
        'offset',
        'limit',
        'sort',
        'status',
        'start-date',
        'end-date',
        'refid',
        'applicant',
        'applicant-employee-id',
        'SUser'
      );
      var currentBase = Backbone.history.getHash().split('?')[0];
      Backbone.history.navigate(currentBase + utils.getQueryString(queryParams));
      this.statusDataTable.ajax.url(this.getAjaxURL()).load();
      //console.log('call to do search end');		
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
        'applicant-employee-id',
        'SUser'
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

    loadShareUser: function() {
      var deferred = Q.defer();
      var shareUserCollection = new Hktdc.Collections.ShareUser();
      var type = (this.model.toJSON().mode === 'APPROVAL TASKS') ? 'Approval' : false;
      shareUserCollection.url = shareUserCollection.url(type);
      var doFetch = function() {
        shareUserCollection.fetch({
          beforeSend: utils.setAuthHeader,
          success: function() {
            deferred.resolve(shareUserCollection);
          },
          error: function(collection, response) {
            utils.apiErrorHandling(response, {
              // 401: doFetch,
              unknownMessage: dialogMessage.component.userList.error
            });
          }
        });
      };
      doFetch();

      return deferred.promise;
    },

    renderDataTable: function(_isBackHandler) {
	  //console.log('renderDataTable this.getAjaxURL()',this.getAjaxURL());		
      
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
                SN: row.SN,
                SUser: row.SUser
              };
            });
            return modData;
            // return { data: modData, recordsTotal: modData.length };
          },
          error: function(response, status, err) {
            utils.apiErrorHandling(response, {
              // 401: doFetch,
              unknownMessage: dialogMessage.checkStatus.getList.error
            });
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
          self.renderApplicantFilter(records,_isBackHandler);
          self.renderStatusFilter(records,_isBackHandler);
          utils.updateDataTablePageInfo(_isBackHandler,self.statusDataTable);
        }
      });

      $('#statusTable tbody', this.el).on('click', 'tr', function(ev) {
        var rowData = self.statusDataTable.row(this).data();
        //call to set the current page number in the session storage
        utils.getCurrentPageInfo(self.statusDataTable);

        var SNOrProcIdPath = '';
        if ((rowData.SN)) {
          SNOrProcIdPath = '/' + rowData.SN;
        } else {
          if (rowData.ProcInstID) {
            SNOrProcIdPath = '/' + rowData.ProcInstID;
          }
        }
        Hktdc.Config.sharingUser = rowData.SUser;
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

    renderApplicantFilter: function(records,_isBackHandler) {
      var self = this;
      var userListView;
     
      var applicants = _.map(records, function(record) {
        return {
          UserId: record.ApplicantUserId,
          UserFullName: record.ApplicantFNAME,
          EmployeeID: record.ApplicantEMP
        };
      });
     
      var distinctApplicants = _.uniq(applicants, function(applicant) {
        //return applicant.UserId;
		    return applicant.UserFullName;
      });

      distinctApplicants=utils.refreshSourceFromStorage("Applicants",distinctApplicants,_isBackHandler);
      var _selectedApplicantName=utils.getDefaultApplicant(distinctApplicants,this.model.toJSON().applicant);

      //bind the records
      var applicantCollection = new Hktdc.Collections.Applicant(distinctApplicants);
      userListView = new Hktdc.Views.ApplicantSelect({
        collection: applicantCollection,
        //selectedApplicant: self.model.toJSON().applicant || '',
        selectedApplicant: _selectedApplicantName || '',
        // selectedApplicant: self.model.toJSON().applicant || Hktdc.Config.userID || '0',
        onSelect: function(model) {
          // var val = (model) ? model.toJSON().EmployeeID : '';
          var data = (model.toJSON().UserId === '0')
            ? { applicant: '', 'applicant-employee-id': '' }
            : { applicant: model.toJSON().UserId, 'applicant-employee-id': model.toJSON().EmployeeID };
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

    renderDatePicker: function() {
      var self = this;
      var createDateFromView = new Hktdc.Views.DatePicker({
        model: new Hktdc.Models.DatePicker({
          placeholder: 'From Date',
          value: (self.model.toJSON()['start-date'])
            ? moment(self.model.toJSON()['start-date'], 'YYYY-MM-DD').format('DD MMM YYYY')
            : null
        }),
        onSelect: function(val) {
          self.model.set({
            'start-date': (moment(val, 'YYYY-MM-DD').isValid())
              ? moment(val, 'YYYY-MM-DD').format('YYYYMMDD')
              : ''
          });
        }
      });
      var createDateToView = new Hktdc.Views.DatePicker({
        model: new Hktdc.Models.DatePicker({
          placeholder: 'To Date',
          value: (self.model.toJSON()['end-date'])
            ? moment(self.model.toJSON()['end-date'], 'YYYY-MM-DD').format('DD MMM YYYY')
            : null
        }),
        onSelect: function(val) {
          self.model.set({
            'end-date': (moment(val, 'YYYY-MM-DD').isValid())
              ? moment(val, 'YYYY-MM-DD').format('YYYYMMDD')
              : ''
          });
        }
      });

      $('.create-from-datepicker-container', self.el).html(createDateFromView.el);
      $('.create-to-datepicker-container', self.el).html(createDateToView.el);
    },

    renderShareUser: function(shareUsersCollection) {
      var self = this;
      var shareUserListView = new Hktdc.Views.DelegationSelect({
        attributes: {
          name: 'SUser'
        },
        collection: shareUsersCollection,
        selectedDelegation: self.model.toJSON().SUser,
        onSelect: function(selectedUser) {
          self.model.set({
            SUser: selectedUser.UserID
          });
        }
      });

      // shareUserListView
      $('.share-user-container', self.el).html(shareUserListView.el);
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
              lv3Content = (Level3.SValue) ? '<span>' + Level3.SValue.split('#*#')[0].replace(/(?:\r\n|\r|\n)/g, '<br />') + '</span>' : '';
			  /*var svalueParsed='';
			  _.each(Level3.SValue.split('#*#'),function(sv){
				  svalueParsed+= sv.replace(/(?:\r\n|\r|\n)/g, '<br />')+'<br />' ;
				  });
			  
			  lv3Content = (Level3.SValue) ?  '<span>' + svalueParsed + '</span>' : '';*/
              summary += '<div>' + lv3Content + '</div> ';
            } else {
              var lv3Title = '<span>' + Level3.Name + ':</span><br />';
              lv3Content = (Level3.SValue) ? '<span>' + Level3.SValue.replace(/(?:\r\n|\r|\n)/g, '<br />') + '</span>' : '';
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