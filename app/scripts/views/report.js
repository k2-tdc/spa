/* global Hktdc, Backbone, JST, $, utils, _, NProgress, Q, Blob, BlobBuilder, XMLHttpRequest, moment, dialogMessage */

Hktdc.Views = Hktdc.Views || {};

(function() {
  'use strict';

  Hktdc.Views.Report = Backbone.View.extend({

    template: JST['app/scripts/templates/report.ejs'],

    events: {
      'click #btnExport': 'exportHandler',
      'blur .reportField': 'updateModel'
    },

    initialize: function() {
      // this.listenTo(this.model, 'change', this.render);
      var self = this;
      self.render();
      // self.model.on('change:applicantCollection', function() {
      //   console.log('change applicant collection');
      //   self.renderApplicantSelect();
      // });
    },

    render: function() {
      var self = this;
      self.$el.html(self.template(self.model.toJSON()));

      self.renderDatePicker();

      Q.all([
        self.loadDepartment(),
        self.loadApplicant()
      ])
        .then(function(results) {
          var deptCollection = results[0];
          var applicantCollection = results[1];
          self.model.set({
            departmentCollection: deptCollection,
            applicantCollection: applicantCollection
          });

          self.renderDepartmentSelect();
          self.renderApplicantSelect();
        });
    },

    loadDepartment: function() {
      var deferred = Q.defer();
      var departmentCollection = new Hktdc.Collections.Department();
      departmentCollection.url = departmentCollection.url();
      var doFetch = function() {
        departmentCollection.fetch({
          beforeSend: utils.setAuthHeader,
          success: function() {
            // console.log('selectedCCCollection: ', self.model.toJSON().selectedCCCollection);
            // console.log('selectedCCCollection: ', self.model);
            deferred.resolve(departmentCollection);
          },
          error: function(collection, response) {
            utils.apiErrorHandling(response, {
              // 401: doFetch,
              unknownMessage: dialogMessage.component.departmentList.error
            });
          }
        });
      };
      doFetch();
      return deferred.promise;
    },

    loadApplicant: function() {
      var deferred = Q.defer();
      var applicantCollection = new Hktdc.Collections.ReportApplicant();
      applicantCollection.url = applicantCollection.url();
      var doFetch = function() {
        applicantCollection.fetch({
          beforeSend: utils.setAuthHeader,
          success: function() {
            deferred.resolve(applicantCollection);
          },
          error: function(collection, response) {
            utils.apiErrorHandling(response, {
              // 401: doFetch,
              unknownMessage: dialogMessage.component.reportApplicantList.error
            });
          }
        });
      };
      doFetch();
      return deferred.promise;
    },

    renderDepartmentSelect: function() {
      try {
        var self = this;
        var departmentSelectView = new Hktdc.Views.DepartmentSelect({
          collection: self.model.toJSON().departmentCollection,
          selectedDepartment: self.model.toJSON().department,
          onSelect: function(departmentId) {
            self.model.set({
              department: departmentId
            });
          }
        });
        departmentSelectView.render();
        // console.log(self.model.toJSON().departmentCollection.toJSON());
        // console.log(departmentSelectView.el);

        $('.department-container', self.el).html(departmentSelectView.el);
      } catch (e) {
        console.error(e);
      }
    },

    renderDatePicker: function() {
      var self = this;
      var createDateFromView = new Hktdc.Views.DatePicker({
        model: new Hktdc.Models.DatePicker({ placeholder: 'From Date' }),
        onSelect: function(val) {
          self.model.set({
            'create-date-start': (moment(val, 'YYYY-MM-DD').isValid())
              ? moment(val, 'YYYY-MM-DD').format('YYYYMMDD')
              : ''
          });
        }
      });
      var createDateToView = new Hktdc.Views.DatePicker({
        model: new Hktdc.Models.DatePicker({ placeholder: 'To Date' }),
        onSelect: function(val) {
          self.model.set({
            'create-date-end': (moment(val, 'YYYY-MM-DD').isValid())
              ? moment(val, 'YYYY-MM-DD').format('YYYYMMDD')
              : ''
          });
        }
      });
      var completionDateFromView = new Hktdc.Views.DatePicker({
        model: new Hktdc.Models.DatePicker({ placeholder: 'From Date' }),
        onSelect: function(val) {
          self.model.set({
            'completion-date-start': (moment(val, 'YYYY-MM-DD').isValid())
              ? moment(val, 'YYYY-MM-DD').format('YYYYMMDD')
              : ''
          });
        }
      });
      var completionDateToView = new Hktdc.Views.DatePicker({
        model: new Hktdc.Models.DatePicker({ placeholder: 'To Date' }),
        onSelect: function(val) {
          self.model.set({
            'completion-date-end': (moment(val, 'YYYY-MM-DD').isValid())
              ? moment(val, 'YYYY-MM-DD').format('YYYYMMDD')
              : ''
          });
        }
      });

      $('.create-from-datepicker-container', self.el).html(createDateFromView.el);
      $('.create-to-datepicker-container', self.el).html(createDateToView.el);
      $('.complete-from-datepicker-container', self.el).html(completionDateFromView.el);
      $('.complete-to-datepicker-container', self.el).html(completionDateToView.el);
    },

    renderApplicantSelect: function() {
      try {
        var self = this;
        // console.log(self.model.toJSON().applicantCollection.toJSON());
        var applicantSelectView = new Hktdc.Views.ReportApplicantSelect({
          collection: self.model.toJSON().applicantCollection,
          selectedApplicant: self.model.toJSON().applicant,
          onSelect: function(model) {
            var applicantId = model.toJSON().UserID;
            var employeeID = model.toJSON().EmployeeID;
            self.model.set({
              applicant: applicantId,
              'applicant-employee-id': employeeID
            });
          }
        });
        applicantSelectView.render();

        $('.applicant-container', self.el).html(applicantSelectView.el);
      } catch (e) {
        console.error(e);
      }
    },

    exportHandler: function() {
      var queryParams = _.omit(this.model.toJSON(), 'departmentCollection', 'applicantCollection');
      var url = Hktdc.Config.apiURL + '/applications/computer-app/usage-report' + utils.getQueryString(queryParams);
      var xhr = new XMLHttpRequest();
      xhr.addEventListener('loadstart', function() {
        NProgress.start();
      });
      xhr.addEventListener('loadend', function() {
        NProgress.done();
      });

      xhr.open('GET', url, true);
      xhr.setRequestHeader('Authorization', 'Bearer ' + Hktdc.Config.accessToken);
      xhr.responseType = 'blob';
      xhr.onreadystatechange = function() {
        var anchorLink;
        if (xhr.readyState === 4 && xhr.status === 200) {
          if (typeof window.navigator.msSaveBlob !== 'undefined') {
            var blob;
            try {
              blob = new Blob([xhr.response], {
                type: 'application/octet-stream'
              });
            } catch (e) {
              // Old browser, need to use blob builder
              window.BlobBuilder = window.BlobBuilder ||
                                   window.WebKitBlobBuilder ||
                                   window.MozBlobBuilder ||
                                   window.MSBlobBuilder;
              if (window.BlobBuilder) {
                var bb = new BlobBuilder();
                bb.append(xhr.response);
                blob = bb.getBlob('application/octet-stream');
              }
            }
            if (blob) {
              window.navigator.msSaveBlob(blob, 'report.xls');
            }
          } else {
            // Trick for making downloadable link
            anchorLink = document.createElement('a');
            anchorLink.href = window.URL.createObjectURL(xhr.response);
            // Give filename you wish to download
            anchorLink.download = 'report.xls';
            anchorLink.style.display = 'none';
            document.body.appendChild(anchorLink);
            anchorLink.click();
          }
        } else {
          utils.apiErrorHandling(xhr, {
            // 401: doFetch,
            unknownMessage: dialogMessage.download.report.error
          });
        }
      };
      xhr.send(null);
    },

    updateModel: function(ev) {
      var updateObject = {};
      updateObject[$(ev.target).attr('name')] = $(ev.target).val();
      this.model.set(updateObject);
    }

  });
})();
