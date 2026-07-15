$(document).ready(function() {

    // le variables
    let filteredReservations = [];
    let totalReservations = 0;
    let currentFilter = 'all';
    let currentSort = 'book_ref';

    // Function to load users from server via AJAX
    function loadUsers() {
        // Show loading state
        const tbody = $('#usersTableBody');
        tbody.html(`
            <tr>
                <td colspan="8" class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-2 text-muted">Loading users...</p>
                </td>
            </tr>
        `);

        // Make AJAX request
        $.ajax({
            url: '/api/admin/users',
            method: 'GET',
            data: {
                page: currentPage,
                limit: rowsPerPage,
                filter: currentFilter,
                sort: currentSort,
                search: currentSearch
            },
            success: function(response) {
                // Store the data
                filteredUsers = response.users || [];
                totalUsers = response.total || 0;
                
                // Populate the table
                populateUserTable();
                
                console.log(`Loaded ${filteredUsers.length} users (Total: ${totalUsers})`);
            },
            error: function(xhr) {
                console.error('Error loading users:', xhr);
                tbody.html(`
                    <tr>
                        <td colspan="8" class="text-center text-danger py-4">
                            <i class="bi bi-exclamation-triangle-fill me-2"></i>
                            Failed to load users. Please try again.
                            <br>
                            <button class="btn btn-outline-primary btn-sm mt-2" onclick="location.reload()">
                                <i class="bi bi-arrow-clockwise"></i> Retry
                            </button>
                        </td>
                    </tr>
                `);
            }
        });
    }

    function populateUserTable() {
        const tbody = $('#usersTableBody');
        
        if (filteredUsers.length === 0) {
            tbody.html(`
                <tr>
                    <td colspan="8" class="text-center text-muted py-4">
                        <i class="bi bi-inbox me-2"></i>
                        No users found matching your criteria.
                    </td>
                </tr>
            `);
            updatePaginationInfo();
            return;
        }

        let rows = '';
        filteredUsers.forEach(user => {
            // Status badge
            const statusBadge = user.status === 'active' 
                ? '<span class="badge bg-success">Active</span>'
                : '<span class="badge bg-danger">Deleted</span>';
            
            // Role badge
            const roleBadge = user.role === 'admin'
                ? '<span class="badge bg-primary">Admin</span>'
                : '<span class="badge bg-secondary">Customer</span>';

            // Format dates
            const createdDate = user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            }) : 'N/A';
            
            const lastLoginDate = user.last_login ? new Date(user.last_login).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }) : 'Never';

            rows += `
                <tr data-id="${user.id}">
                    <td><strong>${user.id}</strong></td>
                    <td>${user.name || 'N/A'}</td>
                    <td>${user.email || 'N/A'}</td>
                    <td>${user.phone || 'N/A'}</td>
                    <td>${createdDate}</td>
                    <td>${lastLoginDate}</td>
                    <td>${statusBadge}</td>
                    <td>${roleBadge}</td>
                </tr>
            `;
        });

        tbody.html(rows);
        updatePaginationInfo();
    }

   function updatePaginationInfo() {
        const total = totalUsers;
        const totalPages = Math.ceil(total / rowsPerPage) || 1;
        const start = total > 0 ? ((currentPage - 1) * rowsPerPage) + 1 : 0;
        const end = Math.min(currentPage * rowsPerPage, total);

        if (total === 0) {
            $('#paginationInfo').text('Showing 0 users');
        } else {
            $('#paginationInfo').text(`Showing ${start} to ${end} of ${total} users`);
        }
        
        $('#currentPage').text(currentPage);
        $('#previousPage').prop('disabled', currentPage <= 1);
        $('#nextPage').prop('disabled', currentPage >= totalPages);
    }

    // Filter/Search/Sort functions
    function applyFilters() {
        currentSearch = $('#searchUsers').val().trim();
        currentFilter = $('#filterUsers').val();
        currentSort = $('#sortUsers').val();
        currentPage = 1; // Reset to first page
        
        loadUsers();
    }

    // Event Handlers

    // Search with debounce
    let searchTimeout;
    $('#searchUsers').on('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            applyFilters();
        }, 300);
    });

    // Filter dropdown
    $('#filterUsers').on('change', function() {
        applyFilters();
    });

    // Sort dropdown
    $('#sortUsers').on('change', function() {
        applyFilters();
    });

    // Previous page
    $('#previousPage').click(function() {
        if (currentPage > 1) {
            currentPage--;
            loadUsers();
        }
    });

    // Next page
    $('#nextPage').click(function() {
        const totalPages = Math.ceil(totalUsers / rowsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            loadUsers();
        }
    });

    // Initial load
    loadUsers();
});

    /*function populateReservationTable() {
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

    console.log(`Loaded ${filteredReservations.length} reservations`);*/