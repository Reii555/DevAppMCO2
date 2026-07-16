$(document).ready(function() {
    // Toggle Password Visibility
        $('#togglePassword').click(function() {
            const passwordInput = $('#password');
            const icon = $(this).find('i');
                
            if (passwordInput.attr('type') === 'password') {
                passwordInput.attr('type', 'text');
                icon.removeClass('fa-eye').addClass('fa-eye-slash');
            } else {
                passwordInput.attr('type', 'password');
                icon.removeClass('fa-eye-slash').addClass('fa-eye');
            }
        });

        // Auto-dismiss alerts after 5 seconds
        setTimeout(function() {
            $('.alert').fadeOut('slow');
            }, 5000);
});