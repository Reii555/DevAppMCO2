$(document).ready(function() {
    
    //sidebar toggle
    $('#sidebarButtones').click(function(e) {
        e.stopPropagation();
        
        // Toggles the 'hidden' class on sidebar
        $('#sidebar').toggleClass('hidden');
        
        // Toggles the 'sidebar-open' class on main content
        $('#adminReservationsMain').toggleClass('sidebar-open');
        
    });

    const reservations = [
        {
            booking_ref: "ABCDE12345",
            pass_name: "Sof Donor",
            flight_route: "MNL to NYC",
            seat_no: "12A",
            status: "Confirmed",
            total_price: 5000.00,
        },
        {
            booking_ref: "FGHIJ67890",
            pass_name: "Raienz",
            flight_route: "MNL to AKL",
            seat_no: "12B",
            status: "Confirmed",
            total_price: 5000.00,
        },
        {
            booking_ref: "KLMNO54321",
            pass_name: "Wally Bayola",
            flight_route: "FLL to MNL",
            seat_no: "10B",
            status: "Confirmed",
            total_price: 5000.67,
        },
        {
            booking_ref: "PQRST09876",
            pass_name: "Kim Dokja",
            flight_route: "SK to MNL",
            seat_no: "19A",
            status: "Confirmed",
            total_price: 1202.00,
        },
        {
            booking_ref: "UVWXY13579",
            pass_name: "Yoo Joonghyuk",
            flight_route: "SK to MNL",
            seat_no: "11A",
            status: "Confirmed",
            total_price: 3008.00,
        },
        {
            booking_ref: "ZABCD24680",
            pass_name: "Hiromi Higuruma",
            flight_route: "JP to MNL",
            seat_no: "06B",
            status: "Cancelled",
            total_price: 10000.00,
        },
        {
            booking_ref: "COOOL67676",
            pass_name: "Reina Lagos",
            flight_route: "JP to MNL",
            seat_no: "06C",
            status: "Cancelled",
            total_price: 10000.00,
        },
        {
            booking_ref: "ELFMA56789",
            pass_name: "Renji Olsen",
            flight_route: "FLL to MNL",
            seat_no: "20C",
            status: "Confirmed",
            total_price: 8000.00,
        },
        {
            booking_ref: "ZZXCV09876",
            pass_name: "Meet Skiey",
            flight_route: "JP to NYC",
            seat_no: "11C",
            status: "Cancelled",
            total_price: 8000.00,
        },
        {
            booking_ref: "YUHJK54321",
            pass_name: "Diluc Ragnvindir",
            flight_route: "SK to AKL",
            seat_no: "18A",
            status: "Confirmed",
            total_price: 80000.00,
        },
    ];

    let currentPage = 1;
    const rowsPerPage = 5;
    let filteredReservations = [...reservations];
    let editMode = false;

    function populateReservationTable() {
        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const pageData = filteredReservations.slice(start, end);

        let rows = '';
        pageData.forEach(reservation => {
            // Status badge or dropdown based on editMode
            let statusHtml = '';
            if (editMode) {
                // Show dropdown when in edit mode
                statusHtml = `
                    <select class="form-select form-select-sm status-dropdown" 
                            data-booking="${reservation.booking_ref}" 
                            style="min-width: 120px; display: inline-block; width: auto;">
                        <option value="Confirmed" ${reservation.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                        <option value="Cancelled" ${reservation.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                `;
            } else {
                // Show badge when not in edit mode
                let badgeClass = '';
                if (reservation.status === 'Confirmed') {
                    badgeClass = 'bg-success';
                } else if (reservation.status === 'Cancelled') {
                    badgeClass = 'bg-danger';
                }

                statusHtml = `
                    <span class="badge ${badgeClass}" style="padding: 6px 14px;">
                        ${reservation.status}
                    </span>
                `;
            }

            // Price formatting
            const formattedPrice = '₱' + reservation.total_price.toFixed(2);

            rows += `
                <tr class="reservation-row" data-booking="${reservation.booking_ref}">
                    <td><strong>${reservation.booking_ref}</strong></td>
                    <td>${reservation.pass_name}</td>
                    <td>${reservation.flight_route}</td>
                    <td>${reservation.seat_no}</td>
                    <td class="status-cell">${statusHtml}</td>
                    <td>${formattedPrice}</td>
                </tr>
            `;
        });

        if (rows === '') {
            rows = `
                <tr>
                    <td colspan="6" class="text-center text-muted py-4">
                        No reservations found matching your criteria.
                    </td>
                </tr>
            `;
        }

        $('#reservationsTableBody').html(rows);
        paginationTable();
        buttonState();
    }

    function buttonState() {
        if (editMode) {
            $('#editReservationBtn')
                .removeClass('btn-primary')
                .addClass('btn-success')
                .html('<i class="bi bi-check2"></i> Save');
        } else {
            $('#editReservationBtn')
                .removeClass('btn-success')
                .addClass('btn-primary')
                .html('<i class="bi bi-pencil-fill"></i> Edit');
        }
    }

    function filterReservations() {
        const search = $('#searchReservations').val().toLowerCase();
        const filter = $('#filterReservations').val();
        const sort = $('#sortReservations').val();

        // Filter reservations
        filteredReservations = reservations.filter(reservation => {
            // Search: check if search term matches
            const matchSearch = reservation.pass_name.toLowerCase().includes(search) || 
                                reservation.booking_ref.toLowerCase().includes(search) ||
                                reservation.flight_route.toLowerCase().includes(search) ||
                                reservation.seat_no.toLowerCase().includes(search);
            
            // Filter: check if status matches
            const matchFilter = filter === 'all' || reservation.status === filter;
            
            return matchSearch && matchFilter;
        });

        // Sort reservations
        filteredReservations.sort((a, b) => {
            if (sort === 'book_ref') return a.booking_ref.localeCompare(b.booking_ref);
            if (sort === 'pass_name') return a.pass_name.localeCompare(b.pass_name);
            if (sort === 'flight_route') return a.flight_route.localeCompare(b.flight_route);
            if (sort === 'seat_no') return a.seat_no.localeCompare(b.seat_no);
            if (sort === 'status') return a.status.localeCompare(b.status);
            if (sort === 'total_price') return a.total_price - b.total_price;
            if (sort === 'last_login') return a.last_login.localeCompare(b.last_login);
            if (sort === 'status') return a.status.localeCompare(b.status);
            return 0;
        });

        // Reset to page 1 when filtering
        currentPage = 1;
        
        // Re-render the table
        populateReservationTable();
    }

    function paginationTable() {
        const total = filteredReservations.length;
        const totalPages = Math.ceil(total / rowsPerPage) || 1;
        const start = (currentPage - 1) * rowsPerPage + 1;
        const end = Math.min(currentPage * rowsPerPage, total);

        // Update pagination info text
        if (total === 0) {
            $('#paginationInfo').text('Showing 0 reservations');
        } else {
            $('#paginationInfo').text(`Showing ${start} to ${end} of ${total} reservations`);
        }
        
        // Update current page display
        $('#currentPage').text(currentPage);

        // Enable/disable Previous and Next buttons
        $('#previousPage').prop('disabled', currentPage <= 1);
        $('#nextPage').prop('disabled', currentPage >= totalPages);
    }

    // event handlers

    $('#editReservationBtn').click(function() {
        // Toggle edit mode
        editMode = !editMode;
        
        // If turning off edit mode, save all pending changes
        if (!editMode) {
            // Save all changes automatically
            saveAllChanges();
        }
        
        // Re-render the table
        populateReservationTable();
    });

    // Save all changes when exiting edit mode
    function saveAllChanges() {
        // Get all dropdowns
        $('.status-dropdown').each(function() {
            const bookingRef = $(this).data('booking');
            const newStatus = $(this).val();
            
            const reservation = reservations.find(r => r.booking_ref === bookingRef);
            if (reservation && reservation.status !== newStatus) {
                reservation.status = newStatus;
            }
        });
    }

    // Search input - trigger filter on keyup
    $('#searchReservations').on('keyup', function() {
        filterReservations();
    });

    // Filter dropdown - trigger on change
    $('#filterReservations').on('change', function() {
        filterReservations();
    });

    // Sort dropdown - trigger on change
    $('#sortReservations').on('change', function() {
        filterReservations();
    });

    // Previous page button
    $('#previousPage').click(function() {
        if (currentPage > 1) {
            currentPage--;
            populateReservationTable();
        }
    });

    // Next page button
    $('#nextPage').click(function() {
        const totalPages = Math.ceil(filteredReservations.length / rowsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            populateReservationTable();
        }
    });

    filterReservations();

    console.log(`Loaded ${filteredReservations.length} reservations`);
});