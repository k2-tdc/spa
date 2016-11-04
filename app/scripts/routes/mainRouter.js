/*global Hktdc, Backbone*/

Hktdc.Routers = Hktdc.Routers || {};

(function() {
  'use strict';

  Hktdc.Routers.Main = Backbone.Router.extend({
    routes: {
      '': 'checkStatus',
      'check_status': 'checkStatus',
      'request': 'newRequest',
      'request/:requestId': 'editRequest',
      'draft': 'draft'
    },

    initialize: function() {},

    checkStatus: function() {
      console.debug('[ routes/mainRouter.js ] - checkStatus route handler');
      var checkStatus = new Hktdc.Models.CheckStatus({
        UserId: Hktdc.Config.userID
      });

      // TODO: get filter params from query string
      var csView = new Hktdc.Views.CheckStatus({
        model: checkStatus
      });
    },

    newRequest: function() {
      console.debug('[ routes/mainRouter.js ] - newRequest route handler');
      var referenceIdModel = new Hktdc.Models.ReferenceId();
      referenceIdModel.fetch({
        beforeSend: utils.setAuthHeader,
        success: function() {
          var newRequestModel = new Hktdc.Models.NewRequest({
            refId: referenceIdModel.toJSON().ReferenceID,
            PreparerFNAME: Hktdc.Config.userName,
            preparedByUserId: Hktdc.Config.userID,
            CreatedOn: window.moment().format('DD MMM YYYY'),

            /* set the default selected applicant is self */
            selectedApplicantModel: new Hktdc.Models.Applicant({
              UserId: Hktdc.Config.userID,
              UserFullName: Hktdc.Config.userName
            })
          });
          var nrView = new Hktdc.Views.NewRequest({
            model: newRequestModel,
            mode: 'new'
          });

        },
        error: function(e) {
          console.log('error on getting reference id');
        }
      })
    },

    editRequest: function(requestId) {
      console.debug('[ routes/mainRouter.js ] - editRequest route handler');
      var requestCollection = new Hktdc.Collections.NewRequest();
      requestCollection.url = requestCollection.url(requestId);
      requestCollection.fetch({
        beforeSend: utils.setAuthHeader,
        success: function(result, response) {
          var rawData = response[0];
          var requestModel = new Hktdc.Models.NewRequest(rawData);
          // console.log(rawData.RequestCC);
          requestModel.set({
            mode: 'read',
            selectedApplicantModel: new Hktdc.Models.Applicant({
              UserId: rawData.ApplicantUserID,
              UserFullName: rawData.ApplicantFNAME
            })
          });
          // console.log(requestModel.toJSON());
          var requestView = new Hktdc.Views.NewRequest({
            model: requestModel,
            mode: 'read'
          });
        },
        error: function(err) {
          console.log(err);
        }
      });
    },

    draft: function() {
      console.debug('[ routes/mainRouter.js ] - draft route handler');
      var draftView = new Hktdc.Views.Draft();
    }

  });

})();
