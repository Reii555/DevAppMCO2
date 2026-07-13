$(document).ready(function() {
    // Toast notification
    function showToast(message, isError = false) {
        $('#toastText').text(message);
        $('#toastMsg').css('background-color', isError ? '#dc2626' : '#1e293b');
        $('#toastMsg').fadeIn();
        setTimeout(() => $('#toastMsg').fadeOut(), 3000);
    }

    // ========== EXPAND RESERVATION DETAILS ==========
    $('.reservation-item').on('click', function(e) {
        if (!$(e.target).closest('.detail-actions').length) {
            $(this).toggleClass('expanded');
        }
    });

    // ========== VIEW DETAILS ==========
    $(document).on('click', '.view-details', function(e) {
        e.stopPropagation();
        const id = $(this).data('id');
        
        $.ajax({
            url: `/reservations/details/${id}`,
            method: 'GET',
            success: function(response) {
                if (response.success) {
                    const r = response.data;
                    const content = `
                        <div class="row">
                            <div class="col-md-6">
                                <p><strong>Booking Reference:</strong> ${r.bookingRef}</p>
                                <p><strong>Passenger:</strong> ${r.passengerName}</p>
                                <p><strong>Email:</strong> ${r.passengerEmail}</p>
                                <p><strong>Phone:</strong> ${r.passengerPhone}</p>
                                <p><strong>Passport:</strong> ${r.passportNumber || 'N/A'}</p>
                            </div>
                            <div class="col-md-6">
                                <p><strong>Flight:</strong> ${r.flightId.flightId}</p>
                                <p><strong>Route:</strong> ${r.flightId.route}</p>
                                <p><strong>Seat:</strong> ${r.seatNumber}</p>
                                <p><strong>Status:</strong> <span class="badge status-${r.status}">${r.status}</span></p>
                                <p><strong>Price:</strong> ₱${r.totalPrice}</p>
                                <p><strong>Departure:</strong> ${formatDate(r.flightId.departureDate)} at ${r.flightId.departureTime}</p>
                            </div>
                        </div>
                        ${r.specialRequests ? `<div class="mt-3"><strong>Special Requests:</strong> ${r.specialRequests}</div>` : ''}
                    `;
                    $('#detailsContent').html(content);
                    $('#detailsModal').modal('show');
                } else {
                    showToast('Error loading details', true);
                }
            },
            error: function() {
                showToast('Error loading details', true);
            }
        });
    });

    // ========== CANCEL RESERVATION ==========
    let currentCancelId = null;

    $(document).on('click', '.cancel-reservation', function(e) {
        e.stopPropagation();
        currentCancelId = $(this).data('id');
        $('#modalBookingRef').text($(this).data('ref'));
        $('#modalBookingPassenger').text($(this).data('passenger'));
        $('#cancelModal').modal('show');
    });

    $('#modalConfirmCancel').on('click', function() {
        if (!currentCancelId) return;

        const btn = $(this);
        btn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin me-1"></i> Cancelling...');

        $.ajax({
            url: `/reservations/${currentCancelId}/cancel`,
            method: 'PATCH',
            success: function(response) {
                if (response.success) {
                    showToast('Reservation cancelled successfully');
                    $('#cancelModal').modal('hide');

                    const item = $(`.reservation-item[data-id="${currentCancelId}"]`);
                    item.find('.res-status')
                        .removeClass('status-Pending status-Confirmed')
                        .addClass('status-Cancelled')
                        .text('Cancelled');
                    
                    // Remove action buttons
                    item.find('.detail-actions .btn-edit, .detail-actions .btn-cancel').remove();
                    
                    // Add cancelled badge to summary
                    currentCancelId = null;
                } else {
                    showToast(response.message || 'Error cancelling reservation', true);
                }
                btn.prop('disabled', false).html('Yes, Cancel');
            },
            error: function(xhr) {
                const response = xhr.responseJSON;
                showToast(response?.message || 'Error cancelling reservation', true);
                btn.prop('disabled', false).html('Yes, Cancel');
            }
        });
    });

    // ========== EDIT SEAT ==========
    $(document).on('click', '.edit-seat', function(e) {
        e.stopPropagation();
        const id = $(this).data('id');
        const currentSeat = $(this).data('seat');
        const currentMeal = $(this).data('meal');

        $('#editReservationId').val(id);
        $('#editSelectedSeat').text(currentSeat);

        // Set meal preference
        $('#editMealPreference').val(currentMeal || 'Standard');
        $('#editSpecialRequests').val('');

        // Load available seats
        loadAvailableSeats(id);
        
        $('#editSeatModal').modal('show');
    });

    function loadAvailableSeats(reservationId) {
        // First get the reservation to get flightId
        $.ajax({
            url: `/reservations/details/${reservationId}`,
            method: 'GET',
            success: function(response) {
                if (response.success) {
                    const reservation = response.data;
                    const flightId = reservation.flightId._id;
                    
                    // Update flight info
                    $('#editFlightInfo').html(`
                        <div class="row">
                            <div class="col-md-6">
                                <strong>Flight:</strong> ${reservation.flightId.flightId} - ${reservation.flightId.route}
                            </div>
                            <div class="col-md-6 text-md-end">
                                <strong>Departure:</strong> ${formatDate(reservation.flightId.departureDate)} at ${reservation.flightId.departureTime}
                            </div>
                        </div>
                    `);

                    // Load seats for this flight
                    $.ajax({
                        url: `/reservations/seats/${flightId}/${reservationId}`,
                        method: 'GET',
                        success: function(seatResponse) {
                            if (seatResponse.success) {
                                renderSeatGrid(seatResponse.data, reservation.seatNumber);
                            } else {
                                showToast('Error loading seats', true);
                            }
                        },
                        error: function() {
                            showToast('Error loading seats', true);
                        }
                    });
                }
            },
            error: function() {
                showToast('Error loading reservation details', true);
            }
        });
    }

    function renderSeatGrid(data, currentSeat) {
        const grid = $('#editSeatGrid');
        grid.empty();

        let selectedSeat = null;

        data.allSeats.forEach(seat => {
            const col = $('<div class="col-2">');
            let btnClass = 'btn-outline-success';
            let disabled = false;
            
            if (seat.isBooked && !seat.isCurrent) {
                btnClass = 'btn-danger';
                disabled = true;
            } else if (seat.isCurrent) {
                btnClass = 'btn-warning';
            }
            
            const btn = $(`<button class="btn btn-sm w-100 seat-btn ${btnClass}" 
                           data-seat="${seat.seat}" 
                           data-booked="${seat.isBooked}"
                           ${disabled ? 'disabled' : ''}>
                           ${seat.seat}
                           ${seat.isCurrent ? ' ✓' : ''}
                       </button>`);
            
            if (!seat.isBooked || seat.isCurrent) {
                btn.on('click', function() {
                    // Deselect previous
                    $('.seat-btn').not('.btn-danger').removeClass('btn-primary btn-success').addClass('btn-outline-success');
                    
                    if (selectedSeat === seat.seat) {
                        selectedSeat = null;
                        $('#editSelectedSeat').text(data.currentSeat || 'None');
                        return;
                    }
                    
                    btn.removeClass('btn-outline-success').addClass('btn-primary');
                    selectedSeat = seat.seat;
                    $('#editSelectedSeat').text(seat.seat);
                });
            }
            
            col.append(btn);
            grid.append(col);
        });

        // Store selected seat for form submission
        window.selectedSeat = null;
        $(document).on('click', '.seat-btn:not(.btn-danger)', function() {
            const seat = $(this).data('seat');
            if (!$(this).hasClass('btn-danger')) {
                window.selectedSeat = seat;
            }
        });
    }

    // ========== SAVE SEAT EDIT ==========
    $('#saveSeatEdit').on('click', function() {
        const id = $('#editReservationId').val();
        const seatNumber = window.selectedSeat || $('#editSelectedSeat').text();
        const mealPreference = $('#editMealPreference').val();
        const specialRequests = $('#editSpecialRequests').val().trim();

        if (!seatNumber || seatNumber === 'None') {
            showToast('Please select a seat', true);
            return;
        }

        const btn = $(this);
        btn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin me-1"></i> Saving...');

        $.ajax({
            url: `/reservations/${id}/seat`,
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({ 
                seatNumber: seatNumber, 
                mealPreference, 
                specialRequests 
            }),
            success: function(response) {
                if (response.success) {
                    showToast('Seat updated successfully!');
                    $('#editSeatModal').modal('hide');
                    
                    const item = $(`.reservation-item[data-id="${id}"]`);
                    item.find('.res-route').html(`<i class="fas fa-plane"></i> ${response.data.flightId.route} | Seat ${response.data.seatNumber}`);
                    item.find('.detail-row .value').filter(function() {
                        return $(this).closest('.detail-row').find('.label').text().trim() === 'Meal:';
                    }).text(response.data.mealPreference);

                    item.find('.edit-seat').data('seat', response.data.seatNumber);
                    item.find('.edit-seat').data('meal', response.data.mealPreference);
                    
                    setTimeout(() => location.reload(), 1500);
                } else {
                    showToast(response.message || 'Error updating seat', true);
                }
                btn.prop('disabled', false).html('<i class="fas fa-save me-1"></i> Save Changes');
            },
            error: function(xhr) {
                const response = xhr.responseJSON;
                showToast(response?.message || 'Error updating seat', true);
                btn.prop('disabled', false).html('<i class="fas fa-save me-1"></i> Save Changes');
            }
        });
    });

    // ========== SEARCH AND FILTER ==========
    let searchTimeout;

    $('#searchInput').on('keyup', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => applyFilters(), 500);
    });

    $('#filterStatus').on('change', applyFilters);

    function applyFilters() {
        const search = $('#searchInput').val().toLowerCase();
        const status = $('#filterStatus').val();

        $('.reservation-item').each(function() {
            const item = $(this);
            const text = item.text().toLowerCase();
            const itemStatus = item.find('.res-status').text().trim();
            
            const matchesSearch = text.includes(search);
            const matchesStatus = status === 'all' || itemStatus === status;
            
            if (matchesSearch && matchesStatus) {
                item.show();
            } else {
                item.hide();
            }
        });
    }

    // ========== PAGINATION ==========
    $('#prevPage, #nextPage').on('click', function() {
        const direction = $(this).attr('id') === 'prevPage' ? -1 : 1;
        const currentPage = parseInt($('.active-page').text().split('/')[0]);
        const newPage = currentPage + direction;
        const totalPages = parseInt($('.active-page').text().split('/')[1]);
        
        if (newPage < 1 || newPage > totalPages) return;
        
        window.location.href = `/reservations?page=${newPage}`;
    });

    // ========== GO BACK ==========
    $('#goBackBtn').on('click', function() {
        window.location.href = '/';
    });

    // ========== HELPER FUNCTIONS ==========
    function formatDate(dateStr) {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }
});
