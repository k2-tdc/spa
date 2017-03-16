/* global Hktdc, _, Cookies */
/* all application level methods should be placed here */

window.utils = {

  setURL: function(env) {
    // console.log(env);
    var envConfig = window.Hktdc.Config.environments[env || 'localDev'];
    var host = envConfig.api.host;
    var port = (envConfig.api.port) ? ':' + envConfig.api.port : '';
    var base = envConfig.api.base;
    var protocol = envConfig.api.protocol || 'http';
    Hktdc.Config.apiURL = protocol + '://' + host + port + base;

    // Hktdc.Config.SPADomain = envConfig.SPADomain;
    Hktdc.Config.projectPath = envConfig.projectPath;
    Hktdc.Config.OAuthLoginUrl = envConfig.SPADomain + envConfig.OAuthLoginPath;
    Hktdc.Config.OAuthGetTokenUrl = envConfig.SPADomain + envConfig.OAuthGetTokenPath;
    Hktdc.Config.SPAHomeUrl = envConfig.SPADomain + envConfig.SPAHomePath;
    Hktdc.Config.OAuthGetUserIDURL = envConfig.SPADomain + envConfig.OAuthGetUserIDPath;
    Hktdc.Config.needAuthHeader = envConfig.needAuthHeader;
    Hktdc.Config.logoutURL = envConfig.logoutURL;
    // console.log(Hktdc.Config);
    // console.log(Hktdc.Config.apiURL);
  },

  getParameterByName: function(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
    var results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
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
            if (aux.length === 2)
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

  getQueryString: function(obj) {
    var queryPart = _.map(obj, function(val, key) {
      var value = (_.isNull(val)) ? '' : val;
      return key + '=' + encodeURIComponent(value);
    });
    if (queryPart.length) {
      return '?' + queryPart.join('&');
    }
    return '';
  },

  setAuthHeader: function(xhr) {
    if (Hktdc.Config.needAuthHeader) {
      // console.log('needAuthHeader: ', true);
      xhr.setRequestHeader('Authorization', 'Bearer ' + Cookies.get('ACCESS-TOKEN'));
    }
  },
  // Asynchronously load templates located in separate .html files

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

  makeId: function(length) {
    var text = '';
    length = length || 10;
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < 5; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  },

  // showAlert: function(title, text, klass) {
  //   $('.alert').removeClass('alert-error alert-warning alert-success alert-info');
  //   $('.alert').addClass(klass);
  //   $('.alert').html('<strong>' + title + '</strong> ' + text);
  //   $('.alert').show();
  // },
  //
  // hideAlert: function() {
  //   $('.alert').hide();
  // },

  /* =============================================>>>>>
  = OAuth Login =
  ===============================================>>>>> */
  createCORSRequest: function(method, url) {
    var xhr = new XMLHttpRequest();
    if ('withCredentials' in xhr) {
      // XHR for Chrome/Firefox/Opera/Safari.
      xhr.open(method, url, true);
    } else if (typeof XDomainRequest !== 'undefined') {
      // XDomainRequest for IE.
      xhr = new XDomainRequest();
      xhr.open(method, url);
      alert('IE 8/9');
    } else {
      // CORS not supported.
      xhr = null;
    }
    return xhr;
  },

  getAccessToken: function(onSuccess, onError) {
    var self = this;
    var accessToken = '';
    var refreshToken = Cookies.get('REFRESH-TOKEN');

    var oauthUrl = window.Hktdc.Config.OAuthLoginUrl + '?redirect_uri=' + encodeURI(window.location.href);
    // var oauthUrl = window.Hktdc.Config.OAuthLoginUrl + '?redirect_uri=' + encodeURI(window.Hktdc.Config.SPAHomeUrl);

    /* if no refresh token */
    if (!refreshToken) {

      /* Initiate OAuth login flow */
      window.location.href = oauthUrl;

    /* else have refresh token */
    } else {
      accessToken = Cookies.get('ACCESS-TOKEN');
      console.log('access token:' + accessToken);

      /* if access token is invalid: no accessToken OR accessToken is expiried */
      if (!accessToken) {
        console.log('OAuth refresh token.');
        /* Send GET request to token endpoint for getting access token through AJAX */

        var xhr = self.createCORSRequest('GET', window.Hktdc.Config.OAuthGetTokenUrl);
        if (!xhr) {
          alert('Please use another browser that supports CORS.');
          window.location.href = oauthUrl;
          return false;
        }
        xhr.setRequestHeader('X-REFRESH-TOKEN', refreshToken);

        // Response handlers.
        xhr.onload = function() {
          accessToken = Cookies.get('ACCESS-TOKEN');
          console.log('Refreshed Token, new access token:' + accessToken);
          if (accessToken) {
            onSuccess(accessToken);
          } else {
            onError('Access token empty after refresh.');
          }
        };

        xhr.onerror = function() {
          if (onError && typeof onError === 'function') {
            onError('Can\'t get new access token by refresh token.');
          }
        };

        xhr.send();

      /* access token is valid */
      } else {
        console.debug('use existing token: ', accessToken);
        onSuccess(accessToken);
      }
    }
  },

  getLoginUserIdByToken: function(accessToken, onSuccess, onError) {
    console.log('getLoginUserIdByToken: ', accessToken);
    var Userid = '';
    var self = this;
    var url = window.Hktdc.Config.OAuthGetUserIDURL + '?access_token=' + accessToken;
    var xhr = self.createCORSRequest('GET', url);
    if (!xhr) {
      onError('CORS not supported');
      return;
    }
    // xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);

    // Response handlers.
    xhr.onload = function() {
      var text = xhr.responseText;
      var objLoginUser = JSON.parse(text);
      // console.log(JSON.stringify(objLoginUsers, null, 2));
      Userid = objLoginUser.user_id;

      onSuccess(Userid);
      // alert(Userid);
      // return objLoginUser;
    };

    xhr.onerror = function() {
      var text = xhr.responseText;
      onError(text);
    };
    xhr.async = false;
    xhr.send();
  }

  /* = End of OAuth Login = */
  /* =============================================<<<<< */

};
