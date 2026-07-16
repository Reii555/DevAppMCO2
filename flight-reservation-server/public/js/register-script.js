$(document).ready(function() {
    console.log('✅ Register script loaded');

    // Password validation
    $('#confirmPassword').on('keyup', function() {
        const password = $('#password').val();
        const confirm = $(this).val();
        
        if (password !== confirm) {
            $(this).addClass('is-invalid');
        } else {
            $(this).removeClass('is-invalid');
        }
    });

    // Auto-dismiss alerts
    setTimeout(function() {
        $('.alert').fadeOut('slow');
    }, 5000);
});