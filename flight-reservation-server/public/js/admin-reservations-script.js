$(document).ready(function() {

    // Variables for reservations
    let currentPage = 1;
    const rowsPerPage = 5;
    let filteredReservations = [];
    let totalReservations = 0;
    let currentFilter = 'all';
    let currentSort = 'book_ref';
    let currentSearch = '';

    // Function to load reservations from server via AJAX
    function loadReservations() {
        // Show loading state
        const tbody = $('#reservationsTableBody');
        tbody.html(`
            <tr>
                <td colspan="6" class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-2 text-muted">Loading reservations...</p>
                </td>
            </tr>
        `);

        // Make AJAX request
        $.ajax({
            url: '/admin/reservations/api',
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
                filteredReservations = response.reservations || [];
                totalReservations = response.total || 0;
                
                // Populate the table
                populateReservationTable();
                
                console.log(`Loaded ${filteredReservations.length} reservations (Total: ${totalReservations})`);
            },
            error: function(xhr) {
                console.error('Error loading reservations:', xhr);
                tbody.html(`
                    <tr>
                        <td colspan="6" class="text-center text-danger py-4">
                            <i class="bi bi-exclamation-triangle-fill me-2"></i>
                            Failed to load reservations. Please try again.
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

    function populateReservationTable() {
        const tbody = $('#reservationsTableBody');
        
        if (filteredReservations.length === 0) {
            tbody.html(`
                <tr>
                    <td colspan="6" class="text-center text-muted py-4">
                        <i class="bi bi-inbox me-2"></i>
                        No reservations found matching your criteria.
                    </td>
                </tr>
            `);
            updatePaginationInfo();
            return;
        }

        let rows = '';
        filteredReservations.forEach(reservation => {
            // Status badge
            let statusBadge = '';
            if (reservation.status === 'Confirmed') {
                statusBadge = '<span class="badge bg-success">Confirmed</span>';
            } else if (reservation.status === 'Cancelled') {
                statusBadge = '<span class="badge bg-danger">Cancelled</span>';
            } else {
                statusBadge = '<span class="badge bg-warning text-dark">Pending</span>';
            }

            rows += `
                <tr data-id="${reservation.id}" data-status="${reservation.status}">
                    <td><strong>${reservation.book_ref || 'N/A'}</strong></td>
                    <td>${reservation.pass_name || 'N/A'}</td>
                    <td>${reservation.flight_route || 'N/A'}</td>
                    <td>${reservation.seat_no || 'N/A'}</td>
                    <td>${statusBadge}</td>
                    <td>₱${reservation.total_price || '0.00'}</td>
                </tr>
            `;
        });

        tbody.html(rows);
        updatePaginationInfo();
    }

    function updatePaginationInfo() {
        const total = totalReservations;
        const totalPages = Math.ceil(total / rowsPerPage) || 1;
        const start = total > 0 ? ((currentPage - 1) * rowsPerPage) + 1 : 0;
        const end = Math.min(currentPage * rowsPerPage, total);

        // Update pagination info
        if (total === 0) {
            $('#paginationInfo').text('Showing 0 reservations');
        } else {
            $('#paginationInfo').text(`Showing ${start} to ${end} of ${total} reservations`);
        }
        
        $('#currentPage').text(currentPage);
        $('#previousPage').prop('disabled', currentPage <= 1);
        $('#nextPage').prop('disabled', currentPage >= totalPages);
    }

    // Filter/Search/Sort functions
    function applyFilters() {
        currentSearch = $('#searchReservations').val().trim();
        currentFilter = $('#filterReservations').val();
        currentSort = $('#sortReservations').val();
        currentPage = 1; // Reset to first page
        
        loadReservations();
    }

    // Event Handlers

    // Search with debounce
    let searchTimeout;
    $('#searchReservations').on('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            applyFilters();
        }, 300);
    });

    // Filter dropdown
    $('#filterReservations').on('change', function() {
        applyFilters();
    });

    // Sort dropdown
    $('#sortReservations').on('change', function() {
        applyFilters();
    });

    // Previous page
    $('#previousPage').click(function() {
        if (currentPage > 1) {
            currentPage--;
            loadReservations();
        }
    });

    // Next page
    $('#nextPage').click(function() {
        const totalPages = Math.ceil(totalReservations / rowsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            loadReservations();
        }
    });

    // Edit button (placeholder for now)
    $('#editReservationBtn').click(function() {
        alert('Edit functionality coming soon!');
    });

    // Initial load
    loadReservations();
});