(function() {
    CS.namespace('player');
    
    $(document).ready(function(){
		$('.register form').submit(function() {
			var form = $(this);
			if(isRegistrationFormValid(form) != true) return false;
			
			CS.player.register(form.serialize(), function(data) {
				if (data == 'false')
				    form.find('.error').html('email and username must be unique.');
				else
				    location.href = '/browse.html';
			})
			return false;
		});

		$('.login form').submit(function() {
			var form = $(this);
			if(isRegistrationFormValid(form) != true) return false;
			
			CS.player.authenticate(form.serialize(), function(data) {
			    if(data == 'false')
				form.find('.error').html('email or password incorrect.');
			    else
				location.href = '/browse.html';
			    
			})
			return false;
		});
		
		function isRegistrationFormValid(form) {
		    var error = form.find('.error');
		    error.html('');
		    var no_errors = true;
		    if (!isEmailValid(form.find('#email').val()))
			no_errors = error.html(error.html() + 'email is not valid<br />');
		    
		    if (!isValidUsername(form.find('#username').val()))
			no_errors = error.html(error.html() + 'username is not valid<br />');
		    
		    var passLen = form.find('#password').val().length;
		    if (passLen < 4 || passLen > 32)
			no_errors = error.html(error.html() + 'password must be between 4 and 32 char<br />');
		    
		    var confirmPass = form.find('#confirm_password').val();
		    if(form.find('#confirm_password').length && confirmPass != form.find('#password').val())
			no_errors = error.html(error.html() + 'password and confirm password must match<br />');
		    
		    return no_errors;
		}
		
		function isEmailValid(email) {
		    return /^[a-zA-Z0-9._%+-]+\@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email);
		}
		
		function isValidUsername(username) {
		    return /^[A-Za-z0-9\_\-]+$/.test(username);
		}
    });
    
    /**
     * Registers Player
     */
    CS.player.register = function(data, callback) {
        $.get('/player/register', data, callback);
    }

    /**
     * Authenticates Player
     */
    CS.player.authenticate = function(data, callback) {
       $.get('/player/login', data, callback);
    }
    
    /**
     * Validates Player
     */
    CS.player.validate = function() {
        
    }

    
})();