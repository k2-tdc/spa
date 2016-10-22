/*global Hktdc, Backbone, JST*/

Hktdc.Views = Hktdc.Views || {};

(function() {
  'use strict';

  Hktdc.Views.CheckStatus = Backbone.View.extend({

    template: JST['app/scripts/templates/checkStatus.ejs'],

    el: '#mainContent',

    events: {
      'click #btnSearchCheckStatus': 'doSearch'
    },

    initialize: function() {
      console.debug('[ views/checkStatus.js ] - Initizing check status views');
      // this.listenTo(this.model, 'change', this.render);
      this.render();

      var statusModel = new Hktdc.Models.Status();
      $('.date').datepicker();

    },

    doSearch: function() {
      this.model.set('CStat', $('#ddindexstatus :selected', this.el).val());
      this.model.set('ReferID', $('#txtindexrefid', this.el).val());
      this.model.set('FDate', $('#txtIndexfromdate', this.el).val());
      this.model.set('TDate', $('#txtIndextodate', this.el).val());
      // this.model.set('Appl', $('#ddIndexapplicant :selected', this.el).val());
      // this.model.set('UserId', $('#ddIndexapplicant :selected', this.el).val());
      this.statusDataTable.ajax.url(this.getAjaxURL()).load();
    },

    getAjaxURL: function() {
      var filterArr = _.map(this.model.toJSON(), function(val, filter) {
        return filter + '=' + val;
      });
      var statusApiURL = Hktdc.Config.apiURL + '/GetRequestDetails?' + filterArr.join('&');

      return statusApiURL;
    },

    render: function() {
      // this.$el.html(this.template(this.model.toJSON()));
      var self = this;
      this.$el.html(this.template());

      /* Use DataTable's AJAX instead of backbone fetch and render */
      /* because to make use of DataTable funciton */
      this.statusDataTable = $("#statusTable").DataTable({
        ajax: {
          url: this.getAjaxURL(),
          // data.statusApiURL
          dataSrc: function(data) {
            // console.log(JSON.stringify({ data: data }, null, 2));
            var modData = _.map(data, function(row) {
              return {
                lastActionDate: row.SubmittedOn,
                applicant: row.ApplicantFNAME,
                summary: self.getSummaryFromRow(row.FormID, row.RequestList),
                status: self.getStatusFrowRow(row.FormStatus, row.ApproverFNAME)
              }
            });
            return modData;
            // return { data: modData, recordsTotal: modData.length };
          }
        },
        columns: [{
          data: "lastActionDate"
        }, {
          data: "applicant"
        }, {
          data: "summary"
        }, {
          data: "status"
        }],
        bRetrieve: true
      });
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

    getStatusFrowRow: function(status, approver) {
      return status + '<br />Recommend by: <br />' + approver;
    }

  });

})();
