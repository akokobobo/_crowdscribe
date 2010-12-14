this.success = function(response_object) {
    return JSON.stringify({message: response_object, error: null});
}

this.fail = function(message, error_code) {
    return JSON.stringify({message: message, error: error_code});
}

this.EMAIL_TAKEN = -1;
this.INVALID_EMAIL = -2
this.USERNAME_TAKEN = -3;
this.INVALID_USERNAME = -4;
this.INVALID_PASSWORD = -5;