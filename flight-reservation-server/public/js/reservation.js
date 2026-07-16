$(document).ready(function() {
    
    // ============================================================
    // TOAST NOTIFICATION FUNCTION
    // ============================================================
    function showToast(message, type) {
        var toast = $('#toastMsg');
        var toastText = $('#toastText');
        var toastIcon = toast.find('i');
        
        toast.removeClass('success error warning info show');
        
        if (type === 'success') {
            toast.addClass('success');
            toastIcon.removeClass().addClass('fas fa-check-circle');
        } else if (type === 'error') {
            toast.addClass('error');
            toastIcon.removeClass().addClass('fas fa-exclamation-circle');
        } else if (type === 'warning') {
            toast.addClass('warning');
            toastIcon.removeClass().addClass('fas fa-exclamation-triangle');
        } else {
            toast.addClass('info');
            toastIcon.removeClass().addClass('fas fa-info-circle');
        }
        
        toastText.text(message);
        toast.addClass('show');
        
        if (toast.data('timeout')) {
            clearTimeout(toast.data('timeout'));
        }
        
        var timeout = setTimeout(function() {
            toast.removeClass('show');
        }, 4000);
        toast.data('timeout', timeout);
    }
    
    $('#toastMsg').on('click', function() {
        $(this).removeClass('show');
        if ($(this).data('timeout')) {
            clearTimeout($(this).data('timeout'));
        }
    });

    // ============================================================
    // MEAL PRICES 
    // ============================================================
    var mealPrices = {
        'Standard': 0,
        'Vegetarian': 150,
        'Vegan': 200,
        'Halal': 300, 
        'Kosher': 350,
        'Gluten-Free': 250
    };

    // Update meal price display
    function updateMealPrice() {
        var selectedMeal = $('#editMealPreference').val();
        var price = mealPrices[selectedMeal] || 0;
        if (price > 0) {
            $('#mealPriceDisplay').text('(+₱' + price + '.00)');
        } else {
            $('#mealPriceDisplay').text('(Included)');
        }
    }

    // ============================================================
    // EXPAND/CONTRACT RESERVATION DETAILS
    // ============================================================
    $(document).on('click', '.res-expand-icon', function(e) {
        e.stopPropagation();
        var item = $(this).closest('.reservation-item');
        item.find('.res-detail').slideToggle();
        $(this).toggleClass('fa-chevron-down fa-chevron-up');
    });

    $(document).on('click', '.res-summary', function() {
        var icon = $(this).find('.res-expand-icon');
        var item = $(this).closest('.reservation-item');
        item.find('.res-detail').slideToggle();
        icon.toggleClass('fa-chevron-down fa-chevron-up');
    });

    // ============================================================
    // VIEW DETAILS MODAL
    // ============================================================
    $(document).on('click', '.view-details', function(e) {
        e.preventDefault();
        var reservationId = $(this).data('id');
        
        $('#detailsContent').html('<div class="text-center py-4"><i class="fas fa-spinner fa-spin fa-2x"></i><p class="mt-2">Loading details...</p></div>');
        
        $.ajax({
            url: '/reservations/details/' + reservationId,
            method: 'GET',
            success: function(response) {
                if (response.success) {
                    var data = response.data;
                    var html = '';
                    
                    var bookingDate = new Date(data.booking_date);
                    var formattedDate = bookingDate.toLocaleDateString('en-PH', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                    
                    var departureDate = new Date(data.flight.departureTime);
                    var formattedDeparture = departureDate.toLocaleDateString('en-PH', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                    
                    var statusClass = '';
                    if (data.status === 'Confirmed') {
                        statusClass = 'success';
                    } else if (data.status === 'Pending') {
                        statusClass = 'warning';
                    } else if (data.status === 'Cancelled') {
                        statusClass = 'danger';
                    } else {
                        statusClass = 'secondary';
                    }
                    
                    var mealPrice = mealPrices[data.mealPreference] || 0;
                    
                    html += '<div class="row">';
                    html += '  <div class="col-md-6">';
                    html += '    <p><strong>Booking Reference:</strong> ' + data.booking_ref + '</p>';
                    html += '    <p><strong>Passenger:</strong> ' + data.passengerName + '</p>';
                    html += '    <p><strong>Flight:</strong> ' + data.flight.flight_number + ' (' + data.flight.airline + ')</p>';
                    html += '    <p><strong>Route:</strong> ' + data.flight.origin + ' → ' + data.flight.destination + '</p>';
                    html += '    <p><strong>Departure:</strong> ' + formattedDeparture + '</p>';
                    html += '  </div>';
                    html += '  <div class="col-md-6">';
                    html += '    <p><strong>Seat:</strong> ' + data.seatNumber + '</p>';
                    html += '    <p><strong>Meal:</strong> ' + data.mealPreference + ' ' + (mealPrice > 0 ? '(+₱' + mealPrice + '.00)' : '') + '</p>';
                    html += '    <p><strong>Status:</strong> <span class="badge bg-' + statusClass + '">' + data.status + '</span></p>';
                    html += '    <p><strong>Total Price:</strong> ₱' + data.total_price + '.00</p>';
                    html += '    <p><strong>Booked On:</strong> ' + formattedDate + '</p>';
                    html += '  </div>';
                    html += '</div>';
                    
                    if (data.specialRequests) {
                        html += '<hr>';
                        html += '<p><strong>Special Requests:</strong> ' + data.specialRequests + '</p>';
                    }
                    
                    if (data.passengerDetails) {
                        html += '<hr>';
                        html += '<h6>Passenger Details</h6>';
                        html += '<div class="row">';
                        html += '  <div class="col-md-6">';
                        html += '    <p><strong>Full Name:</strong> ' + data.passengerDetails.fullName + '</p>';
                        html += '    <p><strong>Email:</strong> ' + data.passengerDetails.email + '</p>';
                        html += '    <p><strong>Contact:</strong> ' + data.passengerDetails.contactNumber + '</p>';
                        html += '  </div>';
                        html += '  <div class="col-md-6">';
                        html += '    <p><strong>Passport:</strong> ' + data.passengerDetails.passportNumber + '</p>';
                        html += '    <p><strong>Nationality:</strong> ' + data.passengerDetails.nationality + '</p>';
                        html += '    <p><strong>Gender:</strong> ' + data.passengerDetails.gender + '</p>';
                        html += '  </div>';
                        html += '</div>';
                    }
                    
                    $('#detailsContent').html(html);
                    $('#detailsModal').modal('show');
                } else {
                    showToast(response.message || 'Error loading reservation details', 'error');
                }
            },
            error: function(xhr) {
                var response = xhr.responseJSON;
                var errorMsg = response ? response.message : 'Error loading reservation details';
                showToast(errorMsg, 'error');
                $('#detailsContent').html('<p class="text-danger text-center">Error loading details. Please try again.</p>');
            }
        });
    });

    // ============================================================
    // EDIT SEAT MODAL - FIXED
    // ============================================================
    var currentReservationId = null;
    var selectedSeat = null;
    var currentSeatNumber = null;
    var currentFlightId = null;
    var currentMeal = null;
    var currentTotalPrice = null;
    
    $(document).on('click', '.edit-seat', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        var reservationId = $(this).data('id');
        var seat = $(this).data('seat');
        var meal = $(this).data('meal');
        var price = $(this).data('price');
        
        console.log('Edit seat clicked - ID:', reservationId, 'Seat:', seat, 'Meal:', meal);
        
        if (!reservationId) {
            showToast('Invalid reservation ID', 'error');
            return;
        }
        
        currentReservationId = reservationId;
        currentSeatNumber = seat || 'None';
        currentMeal = meal || 'Standard';
        selectedSeat = seat || null;
        currentTotalPrice = parseFloat(price) || 0;
        currentFlightId = null;
        
        // Reset modal
        $('#editReservationId').val(reservationId);
        $('#editSelectedSeat').text(currentSeatNumber);
        $('#editMealPreference').val(currentMeal);
        $('#editSpecialRequests').val('');
        $('#editCurrentPrice').text('₱' + currentTotalPrice.toFixed(2));
        $('#editTotalPrice').text('₱' + currentTotalPrice.toFixed(2));
        updateMealPrice();
        
        // Show loading
        $('#editSeatGrid').html('<div class="text-center py-4"><i class="fas fa-spinner fa-spin fa-2x"></i><p class="mt-2">Loading seats...</p></div>');
        $('#editFlightInfo').html('<div class="text-center py-2"><i class="fas fa-spinner fa-spin"></i> Loading flight info...</div>');
        
        // Get flight details
        $.ajax({
            url: '/reservations/details/' + reservationId,
            method: 'GET',
            success: function(detailResponse) {
                console.log('Details response:', detailResponse);
                if (detailResponse.success) {
                    var data = detailResponse.data;
                    var flightData = data.flight;
                    currentFlightId = flightData._id || flightData.id;
                    
                    var departureDate = new Date(flightData.departureTime);
                    var formattedDeparture = departureDate.toLocaleDateString('en-PH', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                    
                    $('#editFlightInfo').html(
                        '<p><strong>' + flightData.flight_number + '</strong> - ' + flightData.airline + '</p>' +
                        '<p>' + flightData.origin + ' → ' + flightData.destination + '</p>' +
                        '<p>Departure: ' + formattedDeparture + '</p>'
                    );
                    
                    // Load seats
                    if (currentFlightId) {
                        loadSeats(currentFlightId, reservationId);
                    } else {
                        $('#editSeatGrid').html('<p class="text-danger text-center">Could not find flight ID</p>');
                    }
                } else {
                    showToast(detailResponse.message || 'Error loading flight', 'error');
                    $('#editFlightInfo').html('<p class="text-danger text-center">Error loading flight info</p>');
                }
            },
            error: function() {
                showToast('Error loading flight information', 'error');
                $('#editFlightInfo').html('<p class="text-danger text-center">Error loading flight info</p>');
            }
        });
        
        $('#editSeatModal').modal('show');
    });
    
    function loadSeats(flightId, reservationId) {
        console.log('Loading seats for flight:', flightId);
        
        $.ajax({
            url: '/reservations/seats/' + flightId + '/' + reservationId,
            method: 'GET',
            success: function(response) {
                console.log('Seats response:', response);
                if (response.success) {
                    var data = response.data;
                    var seatsHtml = '<div class="seat-grid">';
                    
                    for (var i = 0; i < data.allSeats.length; i++) {
                        var seat = data.allSeats[i];
                        var seatClass = 'seat-available';
                        var isDisabled = '';
                        var titleText = '';
                        
                        if (seat.isBooked && !seat.isCurrent) {
                            seatClass = 'seat-booked';
                            isDisabled = 'disabled';
                            titleText = 'title="This seat is already booked"';
                        } else if (seat.isCurrent) {
                            seatClass = 'seat-current';
                            titleText = 'title="Your current seat"';
                            if (selectedSeat === null) {
                                selectedSeat = seat.seat;
                            }
                        } else if (selectedSeat === seat.seat) {
                            seatClass = 'seat-selected';
                        }
                        
                        seatsHtml += '<button type="button" class="seat-btn ' + seatClass + '" data-seat="' + seat.seat + '" ' + isDisabled + ' ' + titleText + '>' + seat.seat + '</button>';
                    }
                    
                    seatsHtml += '</div>';
                    $('#editSeatGrid').html(seatsHtml);
                    
                    if (selectedSeat) {
                        $('#editSelectedSeat').text(selectedSeat);
                    }
                    
                    $('#availableSeatsCount').text(data.availableSeats + ' seats available');
                    
                    // Click handler for seats - USING ON WITH PREVENT DEFAULT
                    $(document).on('click', '.seat-btn:not(:disabled)', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        var seat = $(this).data('seat');
                        selectedSeat = seat;
                        $('#editSelectedSeat').text(seat);
                        
                        $('.seat-btn').removeClass('seat-selected');
                        $(this).addClass('seat-selected');
                        console.log('Seat selected:', seat);
                    });
                    
                } else {
                    showToast(response.message || 'Error loading seats', 'error');
                    $('#editSeatGrid').html('<p class="text-danger text-center">Error loading seats</p>');
                }
            },
            error: function() {
                showToast('Error loading seats', 'error');
                $('#editSeatGrid').html('<p class="text-danger text-center">Error loading seats</p>');
            }
        });
    }

    // ============================================================
    // MEAL PREFERENCE CHANGE
    // ============================================================
    $('#editMealPreference').on('change', function() {
        var selectedMeal = $(this).val();
        var mealPrice = mealPrices[selectedMeal] || 0;
        var currentMealPrice = mealPrices[currentMeal] || 0;
        var basePrice = currentTotalPrice - currentMealPrice;
        var newTotal = basePrice + mealPrice;
        
        $('#editTotalPrice').text('₱' + newTotal.toFixed(2));
        updateMealPrice();
    });

    // ============================================================
    // SAVE SEAT EDIT
    // ============================================================
    $('#saveSeatEdit').on('click', function(e) {
        e.preventDefault();
        
        var reservationId = $('#editReservationId').val();
        var mealPreference = $('#editMealPreference').val();
        var specialRequests = $('#editSpecialRequests').val().trim();
        
        if (!selectedSeat) {
            showToast('Please select a seat', 'error');
            return;
        }
        
        var submitBtn = $(this);
        submitBtn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin me-1"></i> Saving...');
        
        $.ajax({
            url: '/reservations/' + reservationId + '/seat',
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({
                seatNumber: selectedSeat,
                mealPreference: mealPreference,
                specialRequests: specialRequests
            }),
            success: function(response) {
                if (response.success) {
                    showToast('Reservation updated successfully!', 'success');
                    
                    var newPrice = response.data.total_price || 0;
                    $('#editTotalPrice').text('₱' + newPrice.toFixed(2));
                    
                    updateReservationItem(reservationId, selectedSeat, mealPreference, newPrice);
                    
                    setTimeout(function() {
                        $('#editSeatModal').modal('hide');
                        submitBtn.prop('disabled', false).html('<i class="fas fa-save me-1"></i> Save Changes');
                    }, 1000);
                } else {
                    showToast(response.message || 'Error updating reservation', 'error');
                    submitBtn.prop('disabled', false).html('<i class="fas fa-save me-1"></i> Save Changes');
                }
            },
            error: function(xhr) {
                var response = xhr.responseJSON;
                showToast(response?.message || 'Error updating reservation', 'error');
                submitBtn.prop('disabled', false).html('<i class="fas fa-save me-1"></i> Save Changes');
            }
        });
    });
    
    function updateReservationItem(reservationId, newSeat, newMeal, newPrice) {
        var item = $('.reservation-item[data-id="' + reservationId + '"]');
        if (item.length) {
            // Update seat in route
            var routeText = item.find('.res-route').text();
            var updatedRoute = routeText.replace(/Seat \S+/, 'Seat ' + newSeat);
            item.find('.res-route').text(updatedRoute);
            
            // Update meal
            var detailRows = item.find('.detail-row');
            if (detailRows.length >= 2) {
                var mealValue = detailRows.eq(1).find('.value').eq(0);
                if (mealValue.length) {
                    var mealPrice = mealPrices[newMeal] || 0;
                    mealValue.text(newMeal + (mealPrice > 0 ? ' (+₱' + mealPrice + '.00)' : ''));
                }
            }
            
            // Update price
            item.find('.res-price').html('₱' + newPrice + ' <i class="fas fa-chevron-down res-expand-icon"></i>');
            
            // Update button data
            var editBtn = item.find('.edit-seat');
            editBtn.data('seat', newSeat);
            editBtn.data('meal', newMeal);
            editBtn.data('price', newPrice);
            
            // Flash effect
            item.css('border', '2px solid #22c55e');
            setTimeout(function() {
                item.css('border', '');
            }, 2000);
        }
    }

    // ============================================================
    // CANCEL RESERVATION
    // ============================================================
    var cancelReservationId = null;
    
    $(document).on('click', '.cancel-reservation', function(e) {
        e.preventDefault();
        cancelReservationId = $(this).data('id');
        var bookingRef = $(this).data('ref');
        var passengerName = $(this).data('passenger');
        
        $('#modalBookingRef').text(bookingRef || 'N/A');
        $('#modalBookingPassenger').text(passengerName || 'N/A');
        $('#cancelModal').modal('show');
    });
    
    $('#modalConfirmCancel').on('click', function(e) {
        e.preventDefault();
        
        if (!cancelReservationId) {
            showToast('No reservation selected', 'error');
            return;
        }
        
        var submitBtn = $(this);
        submitBtn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin me-1"></i> Cancelling...');
        
        $.ajax({
            url: '/reservations/' + cancelReservationId + '/cancel',
            method: 'PATCH',
            success: function(response) {
                if (response.success) {
                    showToast('Reservation cancelled successfully!', 'success');
                    
                    var item = $('.reservation-item[data-id="' + cancelReservationId + '"]');
                    if (item.length) {
                        var statusSpan = item.find('.res-status');
                        statusSpan.text('Cancelled');
                        statusSpan.removeClass('status-Pending status-Confirmed');
                        statusSpan.addClass('status-Cancelled');
                        item.find('.detail-actions .btn-edit, .detail-actions .btn-cancel').hide();
                    }
                    
                    $('#cancelModal').modal('hide');
                } else {
                    showToast(response.message || 'Error cancelling reservation', 'error');
                }
                submitBtn.prop('disabled', false).html('Yes, Cancel');
            },
            error: function(xhr) {
                var response = xhr.responseJSON;
                showToast(response?.message || 'Error cancelling reservation', 'error');
                submitBtn.prop('disabled', false).html('Yes, Cancel');
            }
        });
    });

    // ============================================================
    // SEARCH, FILTER, SORT, PAGINATION
    // ============================================================
    $('#searchInput').on('keyup', function() {
        var searchTerm = $(this).val().toLowerCase();
        $('.reservation-item').each(function() {
            var text = $(this).text().toLowerCase();
            $(this).toggle(text.indexOf(searchTerm) > -1);
        });
    });
    
    $('#filterStatus').on('change', function() {
        var status = $(this).val();
        $('.reservation-item').each(function() {
            var itemStatus = $(this).find('.res-status').text().trim();
            $(this).toggle(status === 'all' || itemStatus === status);
        });
    });

    $('#sortSelect').on('change', function() {
        var sortValue = $(this).val();
        if (!sortValue) return;
        
        var container = $('#reservationsList');
        var items = container.find('.reservation-item').get();
        
        items.sort(function(a, b) {
            var aVal, bVal;
            switch(sortValue) {
                case 'priceAsc':
                    aVal = parseFloat($(a).find('.res-price').text().replace('₱', '').trim());
                    bVal = parseFloat($(b).find('.res-price').text().replace('₱', '').trim());
                    return aVal - bVal;
                case 'priceDesc':
                    aVal = parseFloat($(a).find('.res-price').text().replace('₱', '').trim());
                    bVal = parseFloat($(b).find('.res-price').text().replace('₱', '').trim());
                    return bVal - aVal;
                case 'status':
                    aVal = $(a).find('.res-status').text().trim();
                    bVal = $(b).find('.res-status').text().trim();
                    return aVal.localeCompare(bVal);
                case 'dateAsc':
                    aVal = new Date($(a).data('date'));
                    bVal = new Date($(b).data('date'));
                    return aVal - bVal;
                case 'dateDesc':
                    aVal = new Date($(a).data('date'));
                    bVal = new Date($(b).data('date'));
                    return bVal - aVal;
                default:
                    return 0;
            }
        });
        
        container.empty();
        $.each(items, function(_, item) {
            container.append(item);
        });
    });

    $('#prevPage').on('click', function(e) {
        e.preventDefault();
        var text = $('.active-page').text();
        if (text) {
            var parts = text.split('/');
            if (parts.length === 2) {
                var current = parseInt(parts[0].trim());
                if (current > 1) {
                    window.location.href = '/reservations?page=' + (current - 1);
                }
            }
        }
    });
    
    $('#nextPage').on('click', function(e) {
        e.preventDefault();
        var text = $('.active-page').text();
        if (text) {
            var parts = text.split('/');
            if (parts.length === 2) {
                var current = parseInt(parts[0].trim());
                var total = parseInt(parts[1].trim());
                if (current < total) {
                    window.location.href = '/reservations?page=' + (current + 1);
                }
            }
        }
    });

    $('#goBackBtn').on('click', function(e) {
        e.preventDefault();
        window.history.back();
    });
});