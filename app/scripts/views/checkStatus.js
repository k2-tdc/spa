/*global Hktdc, Backbone, JST*/

Hktdc.Views = Hktdc.Views || {};

(function () {
  'use strict';

  Hktdc.Views.CheckStatus = Backbone.View.extend({

    template: JST['app/scripts/templates/checkStatus.ejs'],

    el: '#mainContent',

    initialize: function () {
      console.debug('[ views/checkStatus.js ] - Initizing check status views');
      // this.listenTo(this.model, 'change', this.render);
      this.render();

      var statusModel = new Hktdc.Models.Status();
      $('.date').datepicker();

    },

    render: function () {
      // this.$el.html(this.template(this.model.toJSON()));
      this.$el.html(this.template());
      var filterArr = _.map(this.model, function(val, filter){
        return filter + '=' + val;
      });
      // console.log(JSON.stringify(filterArr, null, 2));
      var statusApiURL = Hktdc.Config.apiURL+'/GetRequestDetails?' + filterArr.join('&');
      // var statusApiURL = Hktdc.Config.apiURL+'/GetRequestDetails?' + 'CStat=null&ReferID=&FDate=&TDate=&Appl=null&UserId=aachen'
      // console.log(statusApiURL);


      /* Use DataTable's AJAX instead of backbone fetch and render */
      /* because to make use of DataTable funciton */
      $("#statusTable").DataTable({
        ajax: {
          url: statusApiURL,
          // data.statusApiURL
          dataSrc: function(data){
            // console.log(JSON.stringify({ data: data }, null, 2));
            return data;
          }
        },
        stateLoadParams: function (settings, data) {
          console.log('ihfslcmkenlf');
          // data.search.search = "";
        },
        serverSide: true,
        columns: [
          { data: "SubmittedOn" },
          { data: "ApplicantFNAME" },
          { data: "ApplicantFNAME" },
          { data: "FormStatus" }
        ],
        bRetrieve: true
      });
    }

  });

})();
