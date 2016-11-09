/* global Hktdc, Backbone, utils, _, $ */

Hktdc.Routers = Hktdc.Routers || {};

(function() {
  'use strict';

  Hktdc.Routers.Main = Backbone.Router.extend({
    routes: {
      '': 'checkStatus',
      'check_status': 'checkStatus',
      'request': 'newRequest',
      'request/:requestId': 'editRequest',
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
        UserId: Hktdc.Config.userID,
        canChooseStatus: true,
        CStat: utils.getParameterByName('CStat'),
        ReferID: utils.getParameterByName('ReferID'),
        FDate: utils.getParameterByName('FDate'),
        TDate: utils.getParameterByName('TDate'),
        Appl: utils.getParameterByName('Appl')
      });
      checkStatusModel.set({ mode: 'checkStatus' });
      var csView = new Hktdc.Views.CheckStatus({
        model: checkStatusModel
      });

      var subheaderMenuListCollection = new Hktdc.Collections.SubheaderMenu();
      var subheaderMenuListView = new Hktdc.Views.SubheaderMenuList({
        collection: subheaderMenuListCollection,
        currentPageName: 'Check Status'
      });
      subheaderMenuListView.render();
      $('.subheader-menu-container').html(subheaderMenuListView.el);
    },

    draft: function() {
      console.debug('[ routes/mainRouter.js ] - draft route handler');

      var checkStatusModel = new Hktdc.Models.CheckStatus({
        UserId: Hktdc.Config.userID,
        canChooseStatus: false,
        CStat: utils.getParameterByName('CStat'),
        ReferID: utils.getParameterByName('ReferID'),
        FDate: utils.getParameterByName('FDate'),
        TDate: utils.getParameterByName('TDate'),
        Appl: utils.getParameterByName('Appl')
      });
      checkStatusModel.set({ mode: 'draft' });
      var csView = new Hktdc.Views.CheckStatus({
        model: checkStatusModel
      });

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
        UserId: Hktdc.Config.userID,
        canChooseStatus: true,
        CStat: utils.getParameterByName('CStat'),
        ReferID: utils.getParameterByName('ReferID'),
        FDate: utils.getParameterByName('FDate'),
        TDate: utils.getParameterByName('TDate'),
        Appl: utils.getParameterByName('Appl')
      });
      checkStatusModel.set({ mode: 'allTask' });
      var csView = new Hktdc.Views.CheckStatus({
        model: checkStatusModel
      });

      var subheaderMenuListCollection = new Hktdc.Collections.SubheaderMenu();
      var subheaderMenuListView = new Hktdc.Views.SubheaderMenuList({
        collection: subheaderMenuListCollection,
        currentPageName: 'Draft list'
      });
      subheaderMenuListView.render();

      $('.subheader-menu-container').html(subheaderMenuListView.el);
    },

    approvalTask: function() {
      console.debug('[ routes/mainRouter.js ] - draft route handler');
      var checkStatusModel = new Hktdc.Models.CheckStatus({
        UserId: Hktdc.Config.userID,
        canChooseStatus: true,
        CStat: utils.getParameterByName('CStat'),
        ReferID: utils.getParameterByName('ReferID'),
        FDate: utils.getParameterByName('FDate'),
        TDate: utils.getParameterByName('TDate'),
        Appl: utils.getParameterByName('Appl')
      });
      checkStatusModel.set({ mode: 'approval' });
      var csView = new Hktdc.Views.CheckStatus({
        model: checkStatusModel
      });

      var subheaderMenuListCollection = new Hktdc.Collections.SubheaderMenu();
      var subheaderMenuListView = new Hktdc.Views.SubheaderMenuList({
        collection: subheaderMenuListCollection,
        currentPageName: 'Draft list'
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

      var subheaderMenuListCollection = new Hktdc.Collections.SubheaderMenu();
      var subheaderMenuListView = new Hktdc.Views.SubheaderMenuList({
        collection: subheaderMenuListCollection,
        currentPageName: 'New Request'
      });
      subheaderMenuListView.render();
      console.log($('.subheader-menu-container'));

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

    /* this handling edit old request OR reading old request */
    editRequest: function(requestId) {
      console.debug('[ routes/mainRouter.js ] - editRequest route handler');
      var requestCollection = new Hktdc.Collections.NewRequest();
      requestCollection.url = requestCollection.url(requestId);
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
                'Review',
                'Rework',
                'ReCall',
                'Complete',
                'Approval',
                'Submitted',
                'ProcessTasks'
              ]
            },
            {
              name: 'edit',
              status: ['Draft']
            }
          ];
          var mode = _.find(modeMapping, function(modeObj) {
            // console.log(_.contains(modeObj.status, requestModel.toJSON().FormStatus));
            return _.contains(modeObj.status, requestModel.toJSON().FormStatus);
          }).name || 'read';
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
        },
        error: function(err) {
          console.log(err);
        }
      });
    },

  });
})();
