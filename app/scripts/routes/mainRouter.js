/*global Hktdc, Backbone*/

Hktdc.Routers = Hktdc.Routers || {};

(function() {
  'use strict';

  Hktdc.Routers.Main = Backbone.Router.extend({
    routes: {
      '': 'checkStatus',
      'check_status': 'checkStatus',
      'check_status/:statusId': 'statusDetail',
      'new_request': 'newRequest',
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
            preparedByUserName: Hktdc.Config.userName,
            preparedByUserId: Hktdc.Config.userID,
            createDate: window.moment().format('DD MMM YYYY'),

            /* set the default selected applicant is self */
            selectedApplicantModel: new Hktdc.Models.Applicant({
              UserId: Hktdc.Config.userID,
              UserFullName: Hktdc.Config.userName
            })
          });
          var nrView = new Hktdc.Views.NewRequest({model: newRequestModel});

        },
        error: function(e) {
          console.log('error on getting reference id');
        }
      })
    },

    statusDetail: function() {
      console.debug('[ routes/mainRouter.js ] - statusList route handler');
    },

    draft: function() {
      console.debug('[ routes/mainRouter.js ] - draft route handler');
      var draftView = new Hktdc.Views.Draft();
    }

  });

})();
