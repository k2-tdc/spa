// use sprintf syntax to replace data with %s, %d, etc. see https://github.com/alexei/sprintf.js

var dialogMessage = {

  requestFormButton: {
    // this key should be in lower case and without spaces
    save: {
      success: 'Request is saved',
      fail: 'System error. You are welcomed to contact the Helpdesk 24-hours hotline 852-2892-4848 for questions or further assistance. <br />Error code: %s',
      confirm: 'Do you want to Save ?'
    },
    sendtoapplicant: {
      success: 'Request is sent to Applicant',
      fail: 'System error. You are welcomed to contact the Helpdesk 24-hours hotline 852-2892-4848 for questions or further assistance. <br />Error code: %s',
      confirm: 'Do you want to Send to Applicant?'
    },
    sendtoapprover: {
      success: 'Request is sent to Approver',
      fail: 'System error. You are welcomed to contact the Helpdesk 24-hours hotline 852-2892-4848 for questions or further assistance. <br />Error code: %s',
      confirm: 'Do you want to Send to Approver?'
    },
    delete: {
      success: 'Request is deleted',
      fail: 'System error. You are welcomed to contact the Helpdesk 24-hours hotline 852-2892-4848 for questions or further assistance. <br />Error code: %s',
      confirm: 'Do you want to Delete?'
    },
    returntopreparer: {
      success: 'Request is returned to Preparer',
      fail: 'System error. You are welcomed to contact the Helpdesk 24-hours hotline 852-2892-4848 for questions or further assistance. <br />Error code: %s',
      confirm: 'Do you want to return to Preparer?'
    },
    approve: {
      success: 'Request is approved',
      fail: 'System error. You are welcomed to contact the Helpdesk 24-hours hotline 852-2892-4848 for questions or further assistance. <br />Error code: %s',
      confirm: 'Do you want to Approve?'
    },
    reject: {
      success: 'Request is rejected',
      fail: 'System error. You are welcomed to contact the Helpdesk 24-hours hotline 852-2892-4848 for questions or further assistance. <br />Error code: %s',
      confirm: 'Do you want to Reject?'
    },
    returntoapplicant: {
      success: 'Request is returned to Applicant',
      fail: 'System error. You are welcomed to contact the Helpdesk 24-hours hotline 852-2892-4848 for questions or further assistance. <br />Error code: %s',
      confirm: 'Do you want to Return?'
    },
    recall: {
      success: 'Request is recalled',
      fail: 'System error. You are welcomed to contact the Helpdesk 24-hours hotline 852-2892-4848 for questions or further assistance. <br />Error code: %s',
      confirm: 'Do you want to Recall?'
    },
    resendemailnotificaiton: {
      success: 'Email Notification is resent',
      fail: 'System error. You are welcomed to contact the Helpdesk 24-hours hotline 852-2892-4848 for questions or further assistance. <br />Error code: %s',
      confirm: 'Do you want to Resend Email Notification?'
    },
    complete: {
      success: 'Request is completed',
      fail: 'System error. You are welcomed to contact the Helpdesk 24-hours hotline 852-2892-4848 for questions or further assistance. <br />Error code: %s',
      confirm: 'Do you want to Complete?'
    },
    forward: {
      success: 'Request is forwarded',
      fail: 'System error. You are welcomed to contact the Helpdesk 24-hours hotline 852-2892-4848 for questions or further assistance. <br />Error code: %s',
      confirm: 'Do you want to Forward?'
    },
    cancel: {
      success: 'Request is cancelled',
      fail: 'System error. You are welcomed to contact the Helpdesk 24-hours hotline 852-2892-4848 for questions or further assistance. <br />Error code: %s',
      confirm: 'Do you want to Cancel?'
    },
    sendtoitsapproval: {
      success: 'Request is sent to ITS Approval',
      fail: 'System error. You are welcomed to contact the Helpdesk 24-hours hotline 852-2892-4848 for questions or further assistance. <br />Error code: %s',
      confirm: 'Do you want to Send to ITS Approval?'
    },
    recommend: {
      success: 'Request is recommended',
      fail: 'System error. You are welcomed to contact the Helpdesk 24-hours hotline 852-2892-4848 for questions or further assistance. <br />Error code: %s',
      confirm: 'Do you want to Recommend?'
    },
    default: {
      success: 'Request is submitted',
      fail: 'System error. You are welcomed to contact the Helpdesk 24-hours hotline 852-2892-4848 for questions or further assistance. <br />Error code: %s',
      confirm: 'Do you want to submit?'
    }
  },

  requestForm: {
    clearitem: {
      confirm: 'Are you sure to clear all of the %s item(s)?'
    },
    preparedata: {
      fail: 'Error on prepare data'
    },
    getformid: {
      fail: 'Error on getting new request form ID'
    },
    rulecode: {
      fail1: 'Exception case: RuleCode IT0009, Approver === Applicant',
      fail2: 'Exception case: RuleCode IT0008, unknown situation',
      fail3: 'unacceptable rule code: !== (IT0008 || IT0009)'
    },
    validation: {
      // costandservice: 'Please select service and filled the cost field',
      // service: 'Request service notes must be filled',
      general: 'At least one mandatory field is missing.'
    }
  },

  common: {
    getaccesstoken: {
      fail: 'Error on getting access token'
    },
    servererror: {
      fail: 'System error. You are welcomed to contact the Helpdesk 24-hours hotline 852-2892-4848 for questions or further assistance. <br />Error code: %s'
    }
  }
};

var validateMessage = {
  required: 'Please fill up this field.'
};
