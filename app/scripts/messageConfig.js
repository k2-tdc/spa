// use sprintf syntax to replace data with %s, %d, etc. see https://github.com/alexei/sprintf.js
var dialogTitle = {
  error: 'Error',
  confirmation: 'Confirmation',
  information: 'Information',
  warning: 'Warning'
};

var dialogMessage = {
  menu: {
    load: {
      error: 'Error on rendering menu'
    },
    permission: {
      error: 'Permission denied for accessing this page'
    }
  },
  requestFormButton: {
    // this key should be in lower case and without spaces
    save: {
      success: 'Request is saved',
      fail: 'System error. You are welcomed to contact the Helpdesk 24-hours hotline 852-2892-4848 for questions or further assistance. <br />Error code: %(code)s <br />Error message: %(msg)s',
      confirm: 'Do you want to Save ?'
    },
    sendtoapplicant: {
      success: 'Request is sent to Applicant',
      fail: 'System error. You are welcomed to contact the Helpdesk 24-hours hotline 852-2892-4848 for questions or further assistance. <br />Error code: %(code)s <br />Error message: %(msg)s',
      confirm: 'Do you want to Send to Applicant?'
    },
    sendtoapprover: {
      success: 'Request is sent to Approver',
      fail: 'System error. You are welcomed to contact the Helpdesk 24-hours hotline 852-2892-4848 for questions or further assistance. <br />Error code: %(code)s <br />Error message: %(msg)s',
      confirm: 'Do you want to Send to Approver?'
    },
    delete: {
      success: 'Request is deleted',
      fail: 'System error. You are welcomed to contact the Helpdesk 24-hours hotline 852-2892-4848 for questions or further assistance. <br />Error code: %(code)s <br />Error message: %(msg)s',
      confirm: 'Do you want to Delete?'
    },
    returntopreparer: {
      success: 'Request is returned to Preparer',
      fail: 'System error. You are welcomed to contact the Helpdesk 24-hours hotline 852-2892-4848 for questions or further assistance. <br />Error code: %(code)s <br />Error message: %(msg)s',
      confirm: 'Do you want to return to Preparer?'
    },
    approve: {
      success: 'Request is approved',
      fail: 'System error. You are welcomed to contact the Helpdesk 24-hours hotline 852-2892-4848 for questions or further assistance. <br />Error code: %(code)s <br />Error message: %(msg)s',
      confirm: 'Do you want to Approve?'
    },
    reject: {
      success: 'Request is rejected',
      fail: 'System error. You are welcomed to contact the Helpdesk 24-hours hotline 852-2892-4848 for questions or further assistance. <br />Error code: %(code)s <br />Error message: %(msg)s',
      confirm: 'Do you want to Reject?'
    },
    returntoapplicant: {
      success: 'Request is returned to Applicant',
      fail: 'System error. You are welcomed to contact the Helpdesk 24-hours hotline 852-2892-4848 for questions or further assistance. <br />Error code: %(code)s <br />Error message: %(msg)s',
      confirm: 'Do you want to Return?'
    },
    recall: {
      success: 'Request is recalled',
      fail: 'System error. You are welcomed to contact the Helpdesk 24-hours hotline 852-2892-4848 for questions or further assistance. <br />Error code: %(code)s <br />Error message: %(msg)s',
      confirm: 'Do you want to Recall?'
    },
    resendemailnotificaiton: {
      success: 'Email Notification is resent',
      fail: 'System error. You are welcomed to contact the Helpdesk 24-hours hotline 852-2892-4848 for questions or further assistance. <br />Error code: %(code)s <br />Error message: %(msg)s',
      confirm: 'Do you want to Resend Email Notification?'
    },
    complete: {
      success: 'Request is completed',
      fail: 'System error. You are welcomed to contact the Helpdesk 24-hours hotline 852-2892-4848 for questions or further assistance. <br />Error code: %(code)s <br />Error message: %(msg)s',
      confirm: 'Do you want to Complete?'
    },
    forward: {
      success: 'Request is forwarded',
      fail: 'System error. You are welcomed to contact the Helpdesk 24-hours hotline 852-2892-4848 for questions or further assistance. <br />Error code: %(code)s <br />Error message: %(msg)s',
      confirm: 'Do you want to Forward?'
    },
    cancel: {
      success: 'Request is cancelled',
      fail: 'System error. You are welcomed to contact the Helpdesk 24-hours hotline 852-2892-4848 for questions or further assistance. <br />Error code: %(code)s <br />Error message: %(msg)s',
      confirm: 'Do you want to Cancel?'
    },
    sendtoitsapproval: {
      success: 'Request is sent to ITS Approval',
      fail: 'System error. You are welcomed to contact the Helpdesk 24-hours hotline 852-2892-4848 for questions or further assistance. <br />Error code: %(code)s <br />Error message: %(msg)s',
      confirm: 'Do you want to Send to ITS Approval?'
    },
    recommend: {
      success: 'Request is recommended',
      fail: 'System error. You are welcomed to contact the Helpdesk 24-hours hotline 852-2892-4848 for questions or further assistance. <br />Error code: %(code)s <br />Error message: %(msg)s',
      confirm: 'Do you want to Recommend?'
    },
    default: {
      success: 'Request is submitted',
      fail: 'System error. You are welcomed to contact the Helpdesk 24-hours hotline 852-2892-4848 for questions or further assistance. <br />Error code: %(code)s <br />Error message: %(msg)s',
      confirm: 'Do you want to submit?'
    }
  },
  requestForm: {
    getRefId: {
      error: 'Error on getting new request form ID'
    },
    getDetail: {
      error: 'Error on getting the request data'
    },
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
    delete: {
      error: 'error on deleting record'
    },
    recall: {
      error: 'error on recall record'
    },
    workflowAction: {
      error: 'error on perform workflow action'
    },
    resend: {
      error: 'error on resend email'
    },
    save: {
      error: 'error on saving request form'
    },
    saveAttachment: {
      error: 'error on saving attachment'
    },
    deleteAttachment: {
      error: 'error on deleting attachment'
    },
    validation: {
      // costandservice: 'Please select service and filled the cost field',
      // service: 'Request service notes must be filled',
      general: 'Input is missing/incorrect'
    }
  },
  download: {
    attachment: {
      error: 'error on download the attachment'
    },
    report: {
      error: 'error on download the report'
    }
  },
  common: {
    invalid: {
      form: 'Input is missing/incorrect.'
    },
    error: {
      accessToken: 'Error on getting access token',
      system: 'System error. You are welcomed to contact the Helpdesk 24-hours hotline 852-2892-4848 for questions or further assistance. <br />Error code: %(code)s <br />Error message: %(msg)s',
      script: 'Script error. You are welcomed to contact the Helpdesk 24-hours hotline 852-2892-4848 for questions or further assistance. <br />Error code: %(code)s <br />Error message: %(msg)s',
      unknown: 'Unknown error. <br />%s'
    }
  },
  component: {
    general: {
      error: 'Error on getting component resources.'
    },
    applicantList: {
      error: 'Error on getting user list'
    },
    statusList: {
      error: 'Error on getting status list'
    },
    serviceCatagoryList: {
      error: 'Error on getting service list'
    },
    employeeList: {
      error: 'Error on getting employee list'
    },
    recommendList: {
      error: 'Error on getting approver user list'
    },
    userList: {
      error: 'Error on getting user list'
    },
    applicantDetail: {
      error: 'Error on getting applicant detail'
    },
    fileRule: {
      error: 'Error on getting upload file rules'
    },
    forwardUserList: {
      error: 'error on getting forward users'
    },
    departmentList: {
      error: 'error on getting department list'
    },
    reportApplicantList: {
      error: 'error on getting department list'
    },
  }
};

var validateMessage = {
  required: 'Please fill up this field',
  gt: 'Should be greater than %s',
  eitherRequired: 'Either %s is required.',
  conditionalRequired: '%s is required if %s'
};
