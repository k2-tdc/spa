/* global Hktdc, Backbone, utils, _, $ */

Hktdc.Routers = Hktdc.Routers || {};

(function() {
  'use strict';

  Hktdc.Routers.Main = Backbone.Router.extend({
    routes: {
      '': 'checkStatus',
      'check_status': 'checkStatus',
      'request': 'newRequest',
      'request/draft/:requestId': 'editRequest',
      'request/all/:requestId/:sn': 'editRequest',
      'request/approval/:requestId/:sn': 'editRequest',
      'draft': 'draft',
      'alltask': 'allTask',
      'approvaltask': 'approvalTask'
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
      var newRequestModel = new Hktdc.Models.NewRequest({
        // ReferenceID: referenceIdModel.toJSON().ReferenceID,
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
    editRequest: function(requestId, sn) {
      console.debug('[ routes/mainRouter.js ] - editRequest route handler');
      var requestCollection = new Hktdc.Collections.NewRequest();
      var procId = (sn) ? sn.split('_')[0] : false; // SN = '123_456'
      var type;
      if (/\/approval\//.test(Backbone.history.getHash())) {
        type = 'Approval';
      } else if (/\/all\//.test(Backbone.history.getHash())) {
        type = 'Worklist';
      } else {
        type = 'Draft';
      }
      requestCollection.url = requestCollection.url(requestId, type, procId, sn);
      requestCollection.fetch({
        beforeSend: utils.setAuthHeader,
        success: function(result, response) {
          var rawData = response[0];
          var requestModel = new Hktdc.Models.NewRequest(rawData);

          /* ----------- IMPORTANT: pre-set the request mode  ----------- */
          var modeMapping = [
            {
              name: 'read',
              status: [
                'Approval',
                'Process Task',
                'ITS Approval',
                'Approved by ITS',
                'Rejected by ITS',
                'Reject',
                'Completed',
                'Cancelled',
                'Deleted',
                'Recall'
              ]
            },
            {
              name: 'edit',
              status: ['Draft', 'Review', 'Return']
            }
          ];
          var modeObj = _.find(modeMapping, function(modeObj) {
            // console.log(_.contains(modeObj.status, requestModel.toJSON().FormStatus));
            return _.contains(modeObj.status, requestModel.toJSON().FormStatus);
          });
          var mode = (modeObj) ? modeObj.name : 'read';
          // console.log(mode);
          requestModel.set({
            mode: mode,
            selectedApplicantModel: new Hktdc.Models.Applicant({
              UserId: rawData.ApplicantUserID,
              UserFullName: rawData.ApplicantFNAME
            })
          });
          // console.log(requestModel.toJSON());
          var requestView = new Hktdc.Views.NewRequest({
            model: requestModel
          });

          $('#mainContent').empty().html(requestView.el);

          var subheaderMenuListCollection = new Hktdc.Collections.SubheaderMenu();
          var subheaderMenuListView = new Hktdc.Views.SubheaderMenuList({
            collection: subheaderMenuListCollection,
            currentPageName: 'Edit Request'
          });
          subheaderMenuListView.render();
          // console.log($('.subheader-menu-container'));

          $('.subheader-menu-container').html(subheaderMenuListView.el);
        },

        error: function(err) {
          console.log(err);
        }
      });
    }
  });
})();
