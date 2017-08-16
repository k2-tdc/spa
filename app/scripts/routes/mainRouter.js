/* global Hktdc, Backbone, utils, _, $, NProgress, dialogMessage */

Hktdc.Routers = Hktdc.Routers || {};

(function() {
  'use strict';

  Hktdc.Routers.Main = Backbone.Router.extend({
    routes: {
      '': 'checkStatus',
      'check_status': 'checkStatus',
      'request': 'newRequest',
      // :from = [draft, check, all, approval]
      'request/:from/:requestId': 'editRequest',
      'request/:from/:requestId/:snOrProcId': 'editRequest',
      // 'delegation': 'delegationList',
      'report': 'report',
      'draft': 'draft',
      'alltask': 'allTask',
      'approvaltask': 'approvalTask',
      'history': 'approvalHistory',
      'logout': 'logout'
    },

    initialize: function() {},

    checkStatus: function() {
      console.debug('[ routes/mainRouter.js ] - checkStatus route handler');
      Hktdc.Dispatcher.trigger('checkPagePermission', function() {
        var checkStatusModel = new Hktdc.Models.CheckStatus({
          canChooseStatus: true,
          showShareUser: false,
          UserId: Hktdc.Config.userID,
          'applicant-employee-id': utils.getParameterByName('applicant-employee-id'),
          status: utils.getParameterByName('status'),
          refid: utils.getParameterByName('refid'),
          'start-date': utils.getParameterByName('start-date'),
          'end-date': utils.getParameterByName('end-date'),
          applicant: utils.getParameterByName('applicant') || ''
        });

        checkStatusModel.set({
          mode: 'CHECK STATUS'
        });
        var csView = new Hktdc.Views.CheckStatus({
          model: checkStatusModel
        });

        $('#mainContent').empty().html(csView.el);

        var subheaderMenuListCollection = new Hktdc.Collections.SubheaderMenu();
        var subheaderMenuListView = new Hktdc.Views.SubheaderMenuList({
          collection: subheaderMenuListCollection,
          currentPageName: 'CHECK STATUS'
        });
        subheaderMenuListView.render();
        $('.subheader-menu-container').html(subheaderMenuListView.el);
      });
    },

    draft: function() {
      console.debug('[ routes/mainRouter.js ] - draft route handler');
      Hktdc.Dispatcher.trigger('checkPagePermission', function() {
        var checkStatusModel = new Hktdc.Models.CheckStatus({
          canChooseStatus: false,
          showShareUser: false,
          UserId: Hktdc.Config.userID,
          'applicant-employee-id': utils.getParameterByName('applicant-employee-id'),
          status: utils.getParameterByName('status'),
          refid: utils.getParameterByName('refid'),
          'start-date': utils.getParameterByName('start-date'),
          'end-date': utils.getParameterByName('end-date'),
          applicant: utils.getParameterByName('applicant') || ''
        });
        checkStatusModel.set({
          mode: 'DRAFT'
        });
        var csView = new Hktdc.Views.CheckStatus({
          model: checkStatusModel
        });

        $('#mainContent').empty().html(csView.el);

        var subheaderMenuListCollection = new Hktdc.Collections.SubheaderMenu();
        var subheaderMenuListView = new Hktdc.Views.SubheaderMenuList({
          collection: subheaderMenuListCollection,
          currentPageName: 'Draft list'
        });
        subheaderMenuListView.render();

        $('.subheader-menu-container').html(subheaderMenuListView.el);
      });
    },

    allTask: function() {
      console.debug('[ routes/mainRouter.js ] - all task route handler');
      Hktdc.Dispatcher.trigger('checkPagePermission', function() {
        var checkStatusModel = new Hktdc.Models.CheckStatus({
          showShareUser: true,
          canChooseStatus: true,
          UserId: Hktdc.Config.userID,
          'applicant-employee-id': utils.getParameterByName('applicant-employee-id'),
          status: utils.getParameterByName('status'),
          refid: utils.getParameterByName('refid'),
          'start-date': utils.getParameterByName('start-date'),
          'end-date': utils.getParameterByName('end-date'),
          applicant: utils.getParameterByName('applicant') || '',
          SUser: utils.getParameterByName('SUser')
        });
        checkStatusModel.set({
          mode: 'ALL TASKS'
        });
        var csView = new Hktdc.Views.CheckStatus({
          model: checkStatusModel
        });

        $('#mainContent').empty().html(csView.el);

        var subheaderMenuListCollection = new Hktdc.Collections.SubheaderMenu();
        var subheaderMenuListView = new Hktdc.Views.SubheaderMenuList({
          collection: subheaderMenuListCollection,
          currentPageName: 'All Tasks'
        });
        subheaderMenuListView.render();

        $('.subheader-menu-container').html(subheaderMenuListView.el);
      });
    },

    approvalTask: function() {
      console.debug('[ routes/mainRouter.js ] - approval task route handler');
      Hktdc.Dispatcher.trigger('checkPagePermission', function() {
        var checkStatusModel = new Hktdc.Models.CheckStatus({
          canChooseStatus: true,
          showShareUser: true,
          UserId: Hktdc.Config.userID,
          'applicant-employee-id': utils.getParameterByName('applicant-employee-id'),
          status: utils.getParameterByName('status'),
          refid: utils.getParameterByName('refid'),
          'start-date': utils.getParameterByName('start-date'),
          'end-date': utils.getParameterByName('end-date'),
          applicant: utils.getParameterByName('applicant') || '',
          SUser: utils.getParameterByName('SUser')
        });
        checkStatusModel.set({
          mode: 'APPROVAL TASKS'
        });
        var csView = new Hktdc.Views.CheckStatus({
          model: checkStatusModel
        });

        $('#mainContent').empty().html(csView.el);

        var subheaderMenuListCollection = new Hktdc.Collections.SubheaderMenu();
        var subheaderMenuListView = new Hktdc.Views.SubheaderMenuList({
          collection: subheaderMenuListCollection,
          currentPageName: 'Approval Tasks'
        });
        subheaderMenuListView.render();

        $('.subheader-menu-container').html(subheaderMenuListView.el);
      });
    },

    approvalHistory: function() {
      console.debug('[ routes/mainRouter.js ] - approval history route handler');
      try {
        Hktdc.Dispatcher.trigger('checkPagePermission', function() {
          var approvalHistoryModel = new Hktdc.Models.ApprovalHistory({
            canChooseStatus: true,
            userid: Hktdc.Config.userID,
            employeeid: '',
            applicant: utils.getParameterByName('applicant') || '',
            'approval-start-date': utils.getParameterByName('approval-start-date'),
            'approval-end-date': utils.getParameterByName('approval-end-date'),
            status: utils.getParameterByName('status'),
            refid: utils.getParameterByName('refid'),
            'create-start-date': utils.getParameterByName('create-start-date'),
            'create-end-date': utils.getParameterByName('create-end-date'),
            keyword: utils.getParameterByName('keyword')
          });
          approvalHistoryModel.set({
            mode: 'APPROVAL HISTORY'
          });
          var approvalHistoryView = new Hktdc.Views.ApprovalHistory({
            model: approvalHistoryModel
          });

          $('#mainContent').empty().html(approvalHistoryView.el);

          var subheaderMenuListCollection = new Hktdc.Collections.SubheaderMenu();
          var subheaderMenuListView = new Hktdc.Views.SubheaderMenuList({
            collection: subheaderMenuListCollection,
            currentPageName: 'Approval History'
          });
          subheaderMenuListView.render();

          $('.subheader-menu-container').html(subheaderMenuListView.el);
        });
      } catch (e) {
        console.error(e);
      }
    },

    /* this handling insert new */
    newRequest: function() {
      console.debug('[ routes/mainRouter.js ] - newRequest route handler');
      Hktdc.Dispatcher.trigger('checkPagePermission', function() {
        var referenceIdModel = new Hktdc.Models.ReferenceId();
        var doFetch = function() {
          referenceIdModel.fetch({
            beforeSend: utils.setAuthHeader,
            type: 'POST',
            success: function() {
              $('#mainContent').addClass('compress');
              var newRequestModel = new Hktdc.Models.NewRequest({
                ReferenceID: referenceIdModel.toJSON().ReferenceID,
                PreparerFNAME: Hktdc.Config.userName,
                PreparerUserID: Hktdc.Config.userID,
                CreatedOn: window.moment().format('DD MMM YYYY'),
                mode: 'new',

                /* set the default selected applicant is self */
                selectedApplicantModel: new Hktdc.Models.Applicant({
                  UserId: Hktdc.Config.userID,
                  UserFullName: Hktdc.Config.userName
                })
              });
              var nrView = new Hktdc.Views.NewRequest({
                model: newRequestModel
              });

              $('#mainContent').empty().html(nrView.el);

              var subheaderMenuListCollection = new Hktdc.Collections.SubheaderMenu();
              var subheaderMenuListView = new Hktdc.Views.SubheaderMenuList({
                collection: subheaderMenuListCollection,
                currentPageName: 'New Request'
              });
              subheaderMenuListView.render();

              $('.subheader-menu-container').html(subheaderMenuListView.el);
            },
            error: function(model, response) {
              utils.apiErrorHandling(response, {
                // 401: doFetch,
                unknownMessage: dialogMessage.requestForm.getRefId.error
              });
            }
          });
        };
        doFetch();
      });
    },

    /* this handling 'edit' old request OR 'read' old request */
    editRequest: function(from, requestId, snOrProcId) {
      console.debug('[ routes/mainRouter.js ] - editRequest route handler');
      Hktdc.Dispatcher.trigger('checkPagePermission', function() {
        var requestCollection = new Hktdc.Collections.NewRequest();
        var procId = (snOrProcId && snOrProcId.indexOf('_') > 0)
        ? snOrProcId.split('_')[0]
        : snOrProcId; // SN = '123_456'
        var type;
        var SUser = Hktdc.Config.sharingUser;
        if (/\/approval\//.test(Backbone.history.getHash())) {
          type = 'Approval';
        } else if (/\/all\//.test(Backbone.history.getHash())) {
          type = 'Worklist';
        } else if (/\/check\//.test(Backbone.history.getHash())) {
          type = 'Check';
        } else if (/\/history\//.test(Backbone.history.getHash())) {
          type = 'History';
        } else {
          type = 'Draft';
        }
        requestCollection.url = requestCollection.url(requestId, type, procId, snOrProcId, SUser);
        var doFetch = function() {
          requestCollection.fetch({
            beforeSend: utils.setAuthHeader,
            success: function(result, response) {
              if (result.length === 0) {
                var noPermissionView = new Hktdc.Views.NoPermission();
                noPermissionView.render();
                $('#mainContent').empty().html(noPermissionView.el);
                // Hktdc.Dispatcher.trigger('openAlert', {
                //   message: 'Record not found or no permission to access the record',
                //   title: 'error',
                //   type: 'error'
                // });
                NProgress.done();
                return;
              }
              $('#mainContent').addClass('compress');
              var rawData = response[0];
              var requestModel = new Hktdc.Models.NewRequest(rawData);
              var FormStatus = requestModel.toJSON().FormStatus;
              var me = Hktdc.Config.userID;
              /* ----------- IMPORTANT: pre-set the request mode  ----------- */
              var editModeStatus = ['Draft', 'Review', 'Return', 'Rework'];
              var subheaderMapping = {
                draft: 'Draft',
                check: 'Check Status',
                all: 'All Tasks',
                approval: 'Approval Tasks',
                history: 'Approval History'
              };
              // var mode = (modeObj) ? modeObj.name : 'read';
              var getMode = function() {
                // 'Draft'
                if (FormStatus === 'Draft') {
                  return 'edit';

                  // other status
                } else if ((!(_.contains(editModeStatus, FormStatus)) || !rawData.actions)) {
                  return 'read';

                  // ['Review', 'Return', 'Rework']
                } else {
                  if (FormStatus === 'Review' && requestModel.toJSON().ApplicantUserID === me) {
                    return 'edit';
                  } else if (FormStatus === 'Return' && requestModel.toJSON().ApplicantUserID === me) {
                    return 'edit';
                  } else if (FormStatus === 'Rework' && requestModel.toJSON().PreparerUserID === me) {
                    return 'edit';
                  }
                }
                return 'read';
              };

              requestModel.set({
                mode: getMode(),
                selectedApplicantModel: new Hktdc.Models.Applicant({
                  UserId: rawData.ApplicantUserID,
                  UserFullName: rawData.ApplicantFNAME
                })
              });

              var requestView;
              if (getMode() === 'edit') {
				
                requestView = new Hktdc.Views.NewRequest({
                  model: requestModel
                });
              } else {
				  
                requestView = new Hktdc.Views.ReadRequest({
                  model: requestModel
                });
              }

              $('#mainContent').empty().html(requestView.el);

              var subheaderMenuListCollection = new Hktdc.Collections.SubheaderMenu();
              var subheaderMenuListView = new Hktdc.Views.SubheaderMenuList({
                collection: subheaderMenuListCollection,
                currentPageName: subheaderMapping[from]
              });
              subheaderMenuListView.render();
              // console.log($('.subheader-menu-container'));

              $('.subheader-menu-container').html(subheaderMenuListView.el);
            },
            error: function(collection, response) {
              utils.apiErrorHandling(response, {
                // 401: doFetch,
                unknownMessage: dialogMessage.requestForm.getDetail.error
              });
            }
          });
        };

        doFetch();
      });
    },

    delegationList: function() {
      console.log('mainRouter delegationlist');
      // console.log(utils.getParameterByName('ProId'));
      var delegationPageModel = new Hktdc.Models.DelegationPage({
        UserId: Hktdc.Config.userID,
        DeleId: utils.getParameterByName('DeleId'),
        ProId: utils.getParameterByName('ProId'),
        StepId: utils.getParameterByName('StepId'),
        Type: utils.getParameterByName('Type')
      });
      var delegationPageView = new Hktdc.Views.DelegationPage({
        model: delegationPageModel,
        dialogModel: new Hktdc.Models.DelegationDialog()
      });
      $('#mainContent').html(delegationPageView.el);
    },

    report: function() {
      try {
        Hktdc.Dispatcher.trigger('checkPagePermission', function() {
          var reportView = new Hktdc.Views.Report({
            model: new Hktdc.Models.Report()
          });
          $('#mainContent').html(reportView.el);

          var subheaderMenuListCollection = new Hktdc.Collections.SubheaderMenu();
          var subheaderMenuListView = new Hktdc.Views.SubheaderMenuList({
            collection: subheaderMenuListCollection,
            currentPageName: 'Usage Report'
          });
          subheaderMenuListView.render();

          $('.subheader-menu-container').html(subheaderMenuListView.el);
        });
      } catch (e) {
        console.error(e);
      }
    },

    logout: function() {
      var logoutView = new Hktdc.Views.Logout();
      $('#mainContent').html(logoutView.el);
    }
  });
})();
