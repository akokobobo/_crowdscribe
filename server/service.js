this.success = function(response_object) {
    return {message: response_object, error: null};
}

this.fail = function(error_code, message) {
    return {message: message || '', error: error_code};
}

this.UNKNOWN_ERROR = 0;
this.EMAIL_TAKEN = -1;
this.INVALID_EMAIL = -2
this.USERNAME_TAKEN = -3;
this.INVALID_USERNAME = -4;
this.INVALID_PASSWORD = -5;