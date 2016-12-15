/* global Hktdc, Backbone, utils, _, $ */

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
      'draft': 'draft',
      'alltask': 'allTask',
      'approvaltask': 'approvalTask',
      'logout': 'logout'
    },

    initialize: function() {
      var footerView = new Hktdc.Views.Footer();
    },

    checkStatus: function() {
      console.debug('[ routes/mainRouter.js ] - checkStatus route handler');

      var checkStatusModel = new Hktdc.Models.CheckStatus({
        canChooseStatus: true,
        searchUserType: 'Applicant',
        UserId: Hktdc.Config.userID,
        EmployeeId: Hktdc.Config.employeeID,
        CStat: utils.getParameterByName('CStat'),
        ReferID: utils.getParameterByName('ReferID'),
        FDate: utils.getParameterByName('FDate'),
        TDate: utils.getParameterByName('TDate'),
        Appl: utils.getParameterByName('Appl')
      });

      checkStatusModel.set({ mode: 'CHECK STATUS' });
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
    },

    draft: function() {
      console.debug('[ routes/mainRouter.js ] - draft route handler');

      var checkStatusModel = new Hktdc.Models.CheckStatus({
        canChooseStatus: false,
        searchUserType: 'Applicant',
        UserId: Hktdc.Config.userID,
        EmployeeId: Hktdc.Config.employeeID,
        CStat: utils.getParameterByName('CStat'),
        ReferID: utils.getParameterByName('ReferID'),
        FDate: utils.getParameterByName('FDate'),
        TDate: utils.getParameterByName('TDate'),
        Appl: utils.getParameterByName('Appl')
      });
      checkStatusModel.set({ mode: 'DRAFT' });
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
    },

    allTask: function() {
      console.debug('[ routes/mainRouter.js ] - draft route handler');
      var checkStatusModel = new Hktdc.Models.CheckStatus({
        searchUserType: 'Sharing User',
        canChooseStatus: true,
        UserId: Hktdc.Config.userID,
        EmployeeId: Hktdc.Config.employeeID,
        CStat: utils.getParameterByName('CStat'),
        ReferID: utils.getParameterByName('ReferID'),
        FDate: utils.getParameterByName('FDate'),
        TDate: utils.getParameterByName('TDate'),
        Appl: utils.getParameterByName('Appl')
      });
      checkStatusModel.set({ mode: 'ALL TASKS' });
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
    },

    approvalTask: function() {
      console.debug('[ routes/mainRouter.js ] - draft route handler');
      var checkStatusModel = new Hktdc.Models.CheckStatus({
        canChooseStatus: true,
        searchUserType: 'Sharing User',
        UserId: Hktdc.Config.userID,
        EmployeeId: Hktdc.Config.employeeID,
        CStat: utils.getParameterByName('CStat'),
        ReferID: utils.getParameterByName('ReferID'),
        FDate: utils.getParameterByName('FDate'),
        TDate: utils.getParameterByName('TDate'),
        Appl: utils.getParameterByName('Appl')
      });
      checkStatusModel.set({ mode: 'APPROVAL TASKS' });
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
    },

    /* this handling insert new */
    newRequest: function() {
      console.debug('[ routes/mainRouter.js ] - newRequest route handler');
      $('#mainContent').addClass('compress');
      var referenceIdModel = new Hktdc.Models.ReferenceId();
      referenceIdModel.fetch({
        beforeSend: utils.setAuthHeader,
        success: function() {
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
        error: function(err) {
        }
      });


      /* var referenceIdModel = new Hktdc.Models.ReferenceId();
      referenceIdModel.fetch({
        beforeSend: utils.setAuthHeader,
        success: function() {
        },
        error: function(e) {
          console.log('error on getting reference id');
        }
      }); */
    },

    /* this handling 'edit' old request OR 'read' old request */
    editRequest: function(from, requestId, snOrProcId) {
      console.debug('[ routes/mainRouter.js ] - editRequest route handler');
      $('#mainContent').addClass('compress');

      var requestCollection = new Hktdc.Collections.NewRequest();
      var procId = (snOrProcId && snOrProcId.indexOf('_') > 0)
        ? snOrProcId.split('_')[0]
        : snOrProcId; // SN = '123_456'
      var type;
      if (/\/approval\//.test(Backbone.history.getHash())) {
        type = 'Approval';
      } else if (/\/all\//.test(Backbone.history.getHash())) {
        type = 'Worklist';
      } else if (/\/check\//.test(Backbone.history.getHash())) {
        type = 'Check';
      } else {
        type = 'Draft';
      }
      requestCollection.url = requestCollection.url(requestId, type, procId, snOrProcId);
      requestCollection.fetch({
        beforeSend: utils.setAuthHeader,
        success: function(result, response) {
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
            approval: 'Approval Tasks'
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
          /* special case for preparer enter the review form */
          // if (
          //   rawData.ApplicantUserID !== Hktdc.Config.userID &&
          //   rawData.PreparerUserID === Hktdc.Config.userID &&
          //   requestModel.toJSON().FormStatus === 'Review'
          // ) {
          //   mode = 'read';
          // }
          // console.log(mode);

          requestModel.set({
            mode: getMode(),
            selectedApplicantModel: new Hktdc.Models.Applicant({
              UserId: rawData.ApplicantUserID,
              UserFullName: rawData.ApplicantFNAME
            })
          });

          if (getMode() === 'edit') {
            // console.log(requestModel.toJSON());
            var requestView = new Hktdc.Views.NewRequest({
              model: requestModel
            });
          } else {
            var requestView = new Hktdc.Views.ReadRequest({
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

        error: function(err) {
          console.log(err);
        }
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
      // delegationPageModel.fetch({
      //   beforeSend: utils.setAuthHeader,
      //   success: function() {
      //   },
      //   error: function() {
      //   }
      // });

      // console.log(delegationPageView.el);
    },

    logout: function() {
      var logoutView = new Hktdc.Views.Logout();
      $('#mainContent').html(logoutView.el);
    }
  });
})();
