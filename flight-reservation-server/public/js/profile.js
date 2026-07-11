$(document).ready(function() {
    // Toast notification function
    function showToast(message, isError = false) {
        $('#toastText').text(message);
        $('#toastMsg').css('background-color', isError ? '#dc2626' : '#1e293b');
        $('#toastMsg').fadeIn();
        setTimeout(() => $('#toastMsg').fadeOut(), 3000);
    }

    // Avatar upload
    $('#uploadBtn').on('click', function() {
        $('#avatarUpload').click();
    });

    $('#avatarUpload').on('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
            showToast('Please select a valid image (PNG/JPG)', true);
            return;
        }

        // Validate file size
        if (file.size > 2 * 1024 * 1024) {
            showToast('File size must be less than 2MB', true);
            return;
        }

        // Preview image
        const reader = new FileReader();
        reader.onload = function(event) {
            $('#avatarPreview').html(`<img src="${event.target.result}" alt="Profile Picture">`);
            
            // Upload to server
            $.ajax({
                url: '/profile/picture',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ profilePicture: event.target.result }),
                success: function(response) {
                    if (response.success) {
                        showToast('Profile picture updated successfully!');
                    } else {
                        showToast(response.message || 'Error updating profile picture', true);
                    }
                },
                error: function() {
                    showToast('Error uploading profile picture', true);
                }
            });
        };
        reader.readAsDataURL(file);
    });

    // Edit profile form submission
    $('#editProfileForm').on('submit', function(e) {
        e.preventDefault();

        const firstName = $('#firstName').val().trim();
        const lastName = $('#lastName').val().trim();
        const phone = $('#phone').val().trim();
        const dateOfBirth = $('#dateOfBirth').val();
        const passportNumber = $('#passportNumber').val().trim().toUpperCase();
        const nationality = $('#nationality').val().trim();
        const gender = $('#gender').val();

        // Validation
        if (!firstName || !lastName || !phone) {
            showToast('First name, last name, and phone are required', true);
            return;
        }

        // Validate phone format
        const phoneRegex = /^\+63\s?[0-9]{3}\s?[0-9]{3}\s?[0-9]{4}$/;
        if (!phoneRegex.test(phone)) {
            showToast('Valid phone format: +63 9XX XXX XXXX', true);
            return;
        }

        // Validate passport if provided
        if (passportNumber && !/^[A-Z0-9]{6,10}$/.test(passportNumber)) {
            showToast('Passport number must be 6-10 alphanumeric characters', true);
            return;
        }

        $.ajax({
            url: '/profile',
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({
                firstName,
                lastName,
                phone,
                dateOfBirth,
                passportNumber,
                nationality,
                gender
            }),
            success: function(response) {
                if (response.success) {
                    showToast('Profile updated successfully!');
                    setTimeout(() => window.location.href = '/profile', 1500);
                } else {
                    showToast(response.message || 'Error updating profile', true);
                }
            },
            error: function(xhr) {
                const response = xhr.responseJSON;
                showToast(response?.message || 'Error updating profile', true);
            }
        });
    });

    // Change password form submission (AJAX)
    $('#changePasswordForm').on('submit', function(e) {
        e.preventDefault();

        const currentPassword = $('#currentPassword').val();
        const newPassword = $('#newPassword').val();
        const confirmPassword = $('#confirmPassword').val();

        // Validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            showToast('All password fields are required', true);
            return;
        }

        if (newPassword.length < 6) {
            showToast('New password must be at least 6 characters', true);
            return;
        }

        if (newPassword !== confirmPassword) {
            showToast('New passwords do not match', true);
            return;
        }

        $.ajax({
            url: '/profile/password',
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({
                currentPassword,
                newPassword,
                confirmPassword
            }),
            success: function(response) {
                if (response.success) {
                    showToast('Password updated successfully!');
                    $('#changePasswordForm')[0].reset();
                    // Clear error states
                    $('.is-invalid').removeClass('is-invalid');
                } else {
                    showToast(response.message || 'Error updating password', true);
                }
            },
            error: function(xhr) {
                const response = xhr.responseJSON;
                showToast(response?.message || 'Error updating password', true);
            }
        });
    });

    // Cancel button
    $('#cancelBtn').on('click', function() {
        window.location.href = '/profile';
    });

    // Validation for phone (dapat ba andito 'to question mark)
    $('#phone').on('blur', function() {
        const phone = $(this).val().trim();
        const phoneRegex = /^\+63\s?[0-9]{3}\s?[0-9]{3}\s?[0-9]{4}$/;
        if (phone && !phoneRegex.test(phone)) {
            $(this).addClass('is-invalid');
        } else {
            $(this).removeClass('is-invalid');
        }
    });

    // Validation for passport (ito rin)
    $('#passportNumber').on('blur', function() {
        const passport = $(this).val().trim().toUpperCase();
        if (passport && !/^[A-Z0-9]{6,10}$/.test(passport)) {
            $(this).addClass('is-invalid');
        } else {
            $(this).removeClass('is-invalid');
        }
    });

    // Load profile data via AJAX (for dashboard)
    function loadProfileData() {
        $.ajax({
            url: '/profile/data',
            method: 'GET',
            success: function(response) {
                if (response.success) {
                    // Update any dynamic elements
                    const data = response.data;
                    // will update dashboard elements
                }
            },
            error: function() {
                console.error('Error loading profile data');
            }
        });
    }

    // Load profile data on page load if on dashboard
    if ($('#profileDashboard').length) {
        loadProfileData();
    }
});
