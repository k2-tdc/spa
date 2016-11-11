/* global Hktdc, Backbone, JST, utils, _,  $, Q, moment */

Hktdc.Views = Hktdc.Views || {};

(function() {
  'use strict';

  Hktdc.Views.CheckStatus = Backbone.View.extend({

    template: JST['app/scripts/templates/checkStatus.ejs'],

    el: '#mainContent',

    events: {
      'click #btnSearchCheckStatus': 'doSearch',
      'change .user-select': 'updateModelByEvent',
      'change .status-select': 'updateModelByEvent',
      'blur .search-field': 'updateModelByEvent'
    },

    initialize: function(props) {
      console.debug('[ views/checkStatus.js ] - Initizing check status views');
      // this.listenTo(this.model, 'change', this.render);
      var self = this;
      // _.extend(this, props);
      this.render();

      $('.date')
        .datepicker({
          autoclose: true
        })
        .on('changeDate', function(ev, a) {
          var $input = $(ev.target).find('input');
          var fieldName = $input.attr('name');
          var val = $input.val();
          self.updateModel(fieldName, val);
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

          console.log(userListView.el);
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

    updateModelByEvent: function(ev, fieldName) {
      var field = $(ev.target).attr('name');
      // console.log(field);
      var newObject = {};
      newObject[field] = $(ev.target).val();
      console.log(newObject);
      this.model.set(newObject);
    },

    doSearch: function() {
      var queryParams = _.omit(this.model.toJSON(), 'UserId', 'canChooseStatus', 'mode', 'searchUserType');
      // console.log(queryParams);
      Backbone.history.navigate('draft' + utils.getQueryString(queryParams));
      this.statusDataTable.ajax.url(this.getAjaxURL()).load();
    },

    getAjaxURL: function() {
      var usefulData = _.pick(this.model.toJSON(), 'CStat', 'ReferID', 'FDate', 'TDate', 'Appl', 'UserId', 'SUser', 'ProsIncId');
      var filterArr = _.map(usefulData, function(val, filter) {
        var value = (_.isNull(val)) ? '' : val;
        return filter + '=' + value;
      });
      var statusApiURL;
      // console.log(this.model.);
      switch (this.model.toJSON().mode) {
        case 'DRAFT':
          statusApiURL = Hktdc.Config.apiURL + '/GetDraftDetails?' + filterArr.join('&');
          break;
        case 'ALL TASKS':
          statusApiURL = Hktdc.Config.apiURL + '/GetWorklistDetails?' + filterArr.join('&');
          break;
        case 'APPROVAL TASKS':
          statusApiURL = Hktdc.Config.apiURL + '/GetApproveListDetails?' + filterArr.join('&');
          break;
        case 'CHECK STATUS':
          statusApiURL = Hktdc.Config.apiURL + '/GetRequestDetails?' + filterArr.join('&');
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
        ajax: {
          url: this.getAjaxURL(),
          beforeSend: utils.setAuthHeader,
          dataSrc: function(data) {
            // console.log(JSON.stringify({ data: data }, null, 2));
            var modData = _.map(data, function(row) {
              var formStatusDisplay = row.ActionTakerStatus || row.ITSApprover || 'Recommend';
              return {
                lastActionDate: row.SubmittedOn,
                applicant: row.ApplicantFNAME,
                summary: self.getSummaryFromRow(row.ReferenceID, row.RequestList),
                status: self.getStatusFrowRow(row.FormStatus, row.ApproverFNAME, formStatusDisplay),
                refId: row.ReferenceID,
                ProcInstID: row.ProcInstID
              }
            });
            return modData;
            // return { data: modData, recordsTotal: modData.length };
          }
        },
        order: [0, 'desc'],
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
          render: function(a, b, c) {
            return moment(a).format('DD MMM YYYY');
          }
        }, {
          data: 'applicant'
        }, {
          data: 'summary'
        }, {
          data: 'status'
        }],
        bRetrieve: true
      });

      $('#statusTable tbody', this.el).on('click', 'tr', function(ev) {
        var rowData = self.statusDataTable.row(this).data();
        var procIdPath = (rowData.ProcInstID) ? '/' + rowData.ProcInstID : '';
        Backbone.history.navigate('request/' + rowData.refId + procIdPath, {trigger: true});
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
      var summary = "Ref.ID : " + formID;
      _.each(requestList, function(Level1) {
        summary += "<br /><strong style='text-decoration: underline'>" + Level1.Name + "</strong><br />";
        _.each(Level1.Level2, function(Level2) {
          summary += " <br /><strong><span style='margin-left:10px;'>" + "--" + Level2.Name + " </span></strong><br />";
          _.each(Level2.Level3, function(Level3) {
            if (Level3.Name != null)
              summary += "<br /><span style='margin-left:20px;'>" + "---" + Level3.Name + " </span><br /> ";
          });
        });
      });

      return summary;

    },

    getStatusFrowRow: function(status, approver, formStatusDisplay) {
      console.log(formStatusDisplay);
      if (status === 'Draft') {
        return '<button class="btn btn-primary btn-del"><span class="glyphicon glyphicon-remove"></span></button>'
      }
      return status + '<br />' + formStatusDisplay + '<br /> by: ' + approver;
    }

  });

})();
