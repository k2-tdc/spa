/* all application level methods should be placed here */
window.utils = {

  setApiURL: function(env) {
    // console.log(env);
    var envConfig = window.Hktdc.Config.environments[env || 'localDev'].api;
    var host = envConfig.host;
    var port = (envConfig.port) ? ':' + envConfig.port : '';
    var base = envConfig.base;
    Hktdc.Config.apiURL = 'http://' + host + port + base;
    console.log(Hktdc.Config.apiURL);
  },

  parseQueryString: function(queryString) {
    var params = {};
    if (queryString) {
      _.each(
        _.map(decodeURI(queryString).split(/&/g), function(el, i) {
          var aux = el.split('='),
            o = {};
          if (aux.length >= 1) {
            var val = undefined;
            if (aux.length == 2)
              val = aux[1];
            o[aux[0]] = val;
          }
          return o;
        }),
        function(o) {
          _.extend(params, o);
        }
      );
    }
    return params;
  },

  // Asynchronously load templates located in separate .html files
  loadTemplate: function(views, callback) {

    var deferreds = [];

    $.each(views, function(index, view) {
      if (window[view]) {
        deferreds.push($.get('scripts/templates/' + view + '.ejs', function(tpl) {
          window[view].prototype.template = _.template(tpl);
        }));
      } else {
        alert(view + " not found");
      }
    });

    $.when.apply(null, deferreds).done(callback);
  },

  displayValidationErrors: function(messages) {
    for (var key in messages) {
      if (messages.hasOwnProperty(key)) {
        this.addValidationError(key, messages[key]);
      }
    }
    this.showAlert('Warning!', 'Fix validation errors and try again', 'alert-warning');
  },

  addValidationError: function(field, message) {
    var controlGroup = $('#' + field).parent().parent();
    controlGroup.addClass('error');
    $('.help-inline', controlGroup).html(message);
  },

  removeValidationError: function(field) {
    var controlGroup = $('#' + field).parent().parent();
    controlGroup.removeClass('error');
    $('.help-inline', controlGroup).html('');
  },

  showAlert: function(title, text, klass) {
    $('.alert').removeClass("alert-error alert-warning alert-success alert-info");
    $('.alert').addClass(klass);
    $('.alert').html('<strong>' + title + '</strong> ' + text);
    $('.alert').show();
  },

  hideAlert: function() {
    $('.alert').hide();
  }

};
