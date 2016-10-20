/*global Hktdc, Backbone*/

Hktdc.Collections = Hktdc.Collections || {};

(function() {
  'use strict';

  Hktdc.Collections.Applicant = Backbone.Collection.extend({

    model: Hktdc.Models.Applicant,

    queryParams: {
      RuleID: Hktdc.Config.RuleCode,
      WorkId: '',
      UserId: Hktdc.Config.userID
    },

    url: function() {
      var qsArr = _.map(this.queryParams, function(val, key){
        return key + '=' + val;
      });

      return Hktdc.Config.apiURL + '/GetEmployee?' + qsArr.join('&');
    },

    initialize: function() {
      console.debug('[collections/applicant.js] - initialize');
      var that = this;
      this.fetch({
        // headers: {
        //   "Authorization": 'Bearer ' + Hktdc.Config.accessToken
        // },
        success: function() {
          that.renderApplicantView();
        },
        error: function(model, response) {
          console.log(JSON.stringify(response, null, 2));
          // alert(JSON.stringify(response.responseJSON.Message));
        }
      });

      this.on("reset", this.loadapplicantindex, this);
    },

    loadapplicantindex: function() {
      this.renderApplicantView();
    },

    renderApplicantView: function() {
      console.log(this);
      var applicantView = new Hktdc.Views.Applicant({collection: this});
      applicantView.render();

    }
  });

})();
