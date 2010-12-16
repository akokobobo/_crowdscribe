(function() {
    CS.namespace('account');
    
    /**
     * Submits the registration form
     */
    CS.account.register_frm = function() {
        $('.general-error').hide();
        var is_form_valid = true;
        for(var field in validate)
            if(!validate[field]()) is_form_valid = false;
            
        if(is_form_valid == false) return false;
        
        $.get('/player/register', $(this).serialize(), function(result){
            if(typeof result == 'string') result = JSON.parse(result);
            
            if(result.error == null) location.href = '/browse.html';
            else if(result.error == -1) {
                get_form().find('input#email')
                    .next().html('Your email has been taken')
                    .parent().addClass('error');
            }
            else $('.general-error').show();
        });
        
        return false;
    }
    
    CS.account.login_frm = function() {
        
    }
    
    $(document).ready(function() { 
        /**
         *Setup register form events
        */
        $('form.register').submit(CS.account.register_frm);
        $('form.register input')
            .focus(function(){
                $(this).parent().removeClass('error');
            })
            .blur(function() {
                try{
                    if(validate[$(this).attr('id')])
                        validate[$(this).attr('id')]();
                } catch(e) { throw(e); }
            });
    });
    
    CS.account.is_email_valid = function(email) {
        return /^[a-zA-Z0-9._%+-]+\@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(email);
    }
    
    CS.account.is_username_valid = function() {
        
    }
    
    CS.account.is_password_valid = function(password) {
        return password.length >= 6 && password.length <= 36
    }
    
    
    function get_form() { return $('form.account'); }
    
    var validate = {
        email: function() {
            var form = get_form();
            if(!CS.account.is_email_valid(form.find('input#email').val())) {
                form.find('input#email')
                    .next().html('Invalid Email')
                    .parent().addClass('error');
                return false;
            }
            return true;
        },
        password: function() {
            var form = get_form();
            if(!CS.account.is_password_valid(form.find('input#password').val())) {
                form.find('input#password')
                    .next().html('Invalid password length')
                    .parent().addClass('error');
                return false;
            }
            return true;
        },
        confirm_password: function() {
            var form = get_form();
            if(form.find('input#password').val() != form.find('input#confirm_password').val()) {
                form.find('input#confirm_password')
                    .next().html('Password confirmation doesn\'t match')
                    .parent().addClass('error');
                return false;
            }
            return true;
        }
    }
    
})();