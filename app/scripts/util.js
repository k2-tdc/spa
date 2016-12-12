/* global Hktdc, Backbone, _ */
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
      return key + '=' + value;
    });
    if (queryPart.length) {
      return '?' + queryPart.join('&');
    }
    return '';
  },

  setAuthHeader: function(xhr) {
    if (Hktdc.Config.needAuthHeader) {
      // console.log('needAuthHeader: ', true);
      xhr.setRequestHeader('Authorization', 'Bearer ' + Hktdc.Config.accessToken);
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

  getCookie: function(cname) {
    var name = cname + '=';
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return '';
  },

  createCORSRequest: function(method, url) {
    var xhr = new XMLHttpRequest();
    if ('withCredentials' in xhr) {
      // XHR for Chrome/Firefox/Opera/Safari.
      xhr.open(method, url, true);
    } else if (typeof XDomainRequest != 'undefined') {
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
    var refreshToken = self.getCookie('REFRESH-TOKEN');

    var oauthUrl = window.Hktdc.Config.OAuthLoginUrl + '?redirect_uri=' + encodeURI(window.location.href);
    // var oauthUrl = window.Hktdc.Config.OAuthLoginUrl + '?redirect_uri=' + encodeURI(window.Hktdc.Config.SPAHomeUrl);

    // if no refresh token
    if (!refreshToken) {
      // Initiate OAuth login flow
      // console.log(oauthUrl);
      window.location.href = oauthUrl;

    // else have refresh token
    } else {
      accessToken = self.getCookie('ACCESS-TOKEN');
      console.log('accessToken:' + accessToken);

      // if access token is invalid: no accessToken OR accessToken is expiried
      if (!accessToken || accessToken === '' || accessToken === undefined) {
        // Send GET request to token endpoint for getting access token through AJAX
        console.log('oauth get token url:', window.Hktdc.Config.OAuthGetTokenUrl);
        var xhr = self.createCORSRequest('GET', window.Hktdc.Config.OAuthGetTokenUrl);
        if (!xhr) {
          onError('CORS not supported');
          return false;
        }
        xhr.setRequestHeader('X-REFRESH-TOKEN', refreshToken);

        // Response handlers.
        xhr.onload = function() {
          var text = xhr.responseText;
          console.log('After AJAX, result:' + text + ',  accessToken:' + accessToken);

          accessToken = self.getCookie('ACCESS-TOKEN');
          onSuccess(accessToken);
        };

        xhr.onerror = function() {
          var text = xhr.responseText;
          onError(text);
          // alert(text);
        };

        xhr.send();
      // access token is valid
      } else {
        console.debug('use existing token: ', accessToken);
        // window.location.href = oauthUrl;
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
