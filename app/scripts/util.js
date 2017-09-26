/* global Hktdc, _, Cookies, $, dialogTitle, sprintf, dialogMessage */
/* global Hktdc, _, Cookies, $, dialogTitle, sprintf, dialogMessage */
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
      Hktdc.Config.adminSPAURL = envConfig.SPADomain + envConfig.AdminSPAPath;
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
        if (Cookies.get('ACCESS-TOKEN')) {
          xhr.setRequestHeader('Authorization', 'Bearer ' + Cookies.get('ACCESS-TOKEN'));
        // } else {
        //   window.location.href = window.Hktdc.Config.OAuthLoginUrl + '?redirect_uri=' + encodeURI(window.location.href);
        }
      }
    },
  
    toggleInvalidMessage: function(viewElement, field, message, isShow) {
      var $target = $('[field=' + field + ']', viewElement);
      var $errorContainer = ($target.parents('.container').find('.error-message').length)
      ? $target.parents('.container').find('.error-message')
      : $target.parents().siblings('.error-message');
      if (isShow) {
        $errorContainer.removeClass('hidden');
        $errorContainer.html(message);
        $target.addClass('error-input');
      } else {
        $errorContainer.addClass('hidden');
        $errorContainer.empty();
        $target.removeClass('error-input');
      }
    },
  
    makeId: function(length) {
      var text = '';
      length = length || 10;
      var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
      for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      return text;
    },
  
    apiErrorHandling: function(response, handler) {
      // return format: { request_id: xxx, error: xxxxxxx }
      var errorObject;
      var oauthUrl = window.Hktdc.Config.OAuthLoginUrl + '?redirect_uri=' + encodeURIComponent(window.location.href);
  
      try {
        var responseObj = JSON.parse(response.responseText);
        errorObject = (responseObj.request_id)
          ? responseObj
          : {
            request_id: 'N/A',
            error: sprintf(dialogMessage.common.error.unknown, handler.unknownMessage)
          };
      } catch (e) {
        errorObject = {
          request_id: 'N/A',
          error: sprintf(dialogMessage.common.error.unknown, handler.unknownMessage)
        };
      }
      if (response.status === 401) {
        // this.getAccessToken(function() {
        //   handler[401]();
        // }, function(err) {
        //   errorObject.error = err;
        //   handler.error(errorObject);
        // });
        window.location.href = oauthUrl;
      } else if (response.status === 403) {
        console.error('403 error.');
        // handler.error(errorObject);
      } else if (response.status === 500) {
        // handler['500error'](errorObject);
        console.error(response.responseText);
        Hktdc.Dispatcher.trigger('openAlert', {
          title: dialogTitle.error,
          message: sprintf(dialogMessage.common.error.system, {
            code: errorObject.request_id,
            msg: errorObject.error + ' ' + (errorObject.error_description || '')
          })
        });
      } else {
        console.error('Unknown status code');
        Hktdc.Dispatcher.trigger('openAlert', {
          title: dialogTitle.error,
          message: sprintf(dialogMessage.common.error.system, {
            code: errorObject.request_id || 'Unknown',
            msg: errorObject.error || 'Unknown system error'
          })
        });
      }
    },

  /* =============================================>>>>>
  = Functions to Handle Back Navigation in UI =
  ===============================================>>>>> */
      
      //function to check if back handling is rqeuired or not
      initializeBackHandler:function()
      {
        console.log('initializeBackHandler:-');
        var backHandler=false;
        if(sessionStorage.isBackNavigation==="true"){
          backHandler=true;
          sessionStorage.setItem("isBackNavigation","false");
        }
        else{
           //Reset all session stoarge to original mode...
            sessionStorage.clear();
        }
        console.log('Check for isBackNavigation:-',backHandler);
        return backHandler;
      },
      //end initializeBackHandler

      //gets the cuurent page number selected in the serach result
      getCurrentPageInfo:function(_dataTable){
        console.log('getCurrentPageInfo starts');     
        
        var _storageKey="currentPageNumber";
        var pageInfo=null;
        var self=this;
      
        //get the page info 
        pageInfo = _dataTable.page.info();
        if(pageInfo && pageInfo.page)
          {
            //console.log('_dataTable inside:- ',pageInfo.page)
            sessionStorage.setItem(_storageKey,pageInfo.page);
          }
          else{
            sessionStorage.setItem(_storageKey,"0");
          }
        console.log('getCurrentPageInfo ends',sessionStorage.getItem(_storageKey));
      },
      //getCurrentPageInfo function ends

      //Update the page number based on previous selection back button case
      updateDataTablePageInfo:function(_isBackHandler,_dataTable)
      { 
        console.log('updateDataTablePageInfo start ');      
        var self=this;
        var _storageKey="currentPageNumber";
        var _storageValue=sessionStorage.currentPageNumber;
        if(_isBackHandler && _storageValue!== null && _storageValue!=="0")
          {
            //console.log('updateDataTablePageInfo inside',_storageValue);
            var iPageNum = parseInt(_storageValue);
            _dataTable.page(iPageNum).draw( 'page' );
          }
        console.log('updateDataTablePageInfo end');
      },
      //updateDataTablePageInfo function ends

      //function to Update the Search panel Toggle info based on back navigation
      toggleModeForBackNavigation:function(isShow,_isBackHandler)
      {
        var retVal=false;
        var _storageKey="showToggleAdvanceMode";
        var _storageValue=sessionStorage.showToggleAdvanceMode;
       
        console.log('toggleModeForBackNavigation start:-',isShow,':',_storageValue);
        if(_isBackHandler && _storageValue==="true")
          {
            //console.log('_isBackHandler && _storageValue');
            //sessionStorage.setItem(_storageKey,"false");
            retVal= true;
          }
          else
            {
              sessionStorage.setItem(_storageKey,isShow);
              retVal= isShow;
            }   
        console.log('toggleModeForBackNavigation end ', retVal);
        return retVal;
      },
      //toggleModeForBackNavigation function end

      //Function to get the ddl(applicant/status) original source values from the storage
      refreshSourceFromStorage:function(storageKey,records,_isBackHandler)
      {
        var _retData=records;
        if(_isBackHandler &&
          sessionStorage.getItem(storageKey) !== null)
          {
            console.log('refreshSourceFromStorage is in back navigation:-');
            _retData= JSON.parse(sessionStorage.getItem(storageKey));
            
          }
        else
          {
            console.log('getApplicantPostBackNavigation not in back navigation:-');
            sessionStorage.setItem(storageKey,JSON.stringify(_retData));
          }
          return _retData;
      },

      //Function to get the default applicants
      getDefaultApplicant:function(distinctApplicants,applicant)
      {
          //get the default selected record
          console.log('default selection',distinctApplicants);
          var _selectedApplicantName=null;
          if(distinctApplicants && applicant)
          {
              //To Do :- add employee id in the filter list later
              var filtered = _.where(distinctApplicants, {UserId:applicant});
              if(filtered && filtered.length>0){
                _selectedApplicantName=filtered[0].UserFullName;
              }
          }
        console.log('default selection ends',_selectedApplicantName);
        return _selectedApplicantName;
      },

      //refreshSourceFromStorage Ends

      /* = End of Handle Back Navigation = */
  /* =============================================<<<<< */

  
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
      var defaultError = function() {
        Hktdc.Dispatcher.trigger('openAlert', {
          message: dialogMessage.common.error.accessToken,
          type: 'error',
          title: dialogTitle.error
        });
      };
      if (!(Hktdc.Config.environment === 'uat' || Hktdc.Config.environment === 'chsw')) {
        var msg = 'in local env';
        if (onError && typeof onError === 'function') {
          onError(msg);
        } else {
          defaultError(msg);
        }
        return;
      }
    getAuthAccessToken(window.Hktdc.Config.OAuthLoginUrl,window.Hktdc.Config.OAuthGetTokenUrl,onSuccess, onError);
      
    },
  
    getLoginUserIdByToken: function(accessToken, onSuccess, onError) {
      getAuthLoginUserIdByToken(window.Hktdc.Config.OAuthGetUserIDURL,accessToken, onSuccess, onError)
    }
  
    /* = End of OAuth Login = */
    /* =============================================<<<<< */
  
  };
  