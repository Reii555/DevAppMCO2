$(document).ready(function() {

    let currentPage = 1;
    const rowsPerPage = 5;
    let filteredReservations = [];
    let totalReservations = 0;
    let currentFilter = 'all';
    let currentSort = 'book_ref';
    let currentSearch = '';
    let editMode = false;

    function loadReservations() {
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

        $.ajax({
            url: '/admin-reservations/api',
            method: 'GET',
            data: {
                page: currentPage,
                limit: rowsPerPage,
                filter: currentFilter,
                sort: currentSort,
                search: currentSearch
            },
            success: function(response) {
                filteredReservations = response.reservations || [];
                totalReservations = response.total || 0;
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
                        No reservations found.
                    </td>
                </tr>
            `);
            updatePaginationInfo();
            return;
        }

        let rows = '';
        filteredReservations.forEach(reservation => {
            const currentStatus = reservation.status || 'Pending';
            
            let statusHtml = '';
            if (editMode) {
                statusHtml = `
                    <select class="form-select form-select-sm status-dropdown" 
                            data-id="${reservation.id}" 
                            style="min-width: 120px; display: inline-block; width: auto;">
                        <option value="Pending" ${currentStatus === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="Confirmed" ${currentStatus === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                        <option value="Completed" ${currentStatus === 'Completed' ? 'selected' : ''}>Completed</option>
                        <option value="Cancelled" ${currentStatus === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                `;
            } else {
                let badgeClass = '';
                if (currentStatus === 'Confirmed') {
                    badgeClass = 'bg-success';
                } else if (currentStatus === 'Cancelled') {
                    badgeClass = 'bg-danger';
                } else if (currentStatus === 'Completed') {
                    badgeClass = 'bg-secondary';
                } else {
                    badgeClass = 'bg-warning text-dark';
                }
                statusHtml = `<span class="badge ${badgeClass}">${currentStatus}</span>`;
            }

            rows += `
                <tr data-id="${reservation.id}" data-status="${currentStatus}">
                    <td><strong>${reservation.book_ref || 'N/A'}</strong></td>
                    <td>${reservation.pass_name || 'N/A'}</td>
                    <td>${reservation.flight_route || 'N/A'}</td>
                    <td>${reservation.seat_no || 'N/A'}</td>
                    <td class="status-cell">${statusHtml}</td>
                    <td>₱${reservation.total_price || '0.00'}</td>
                </tr>
            `;
        });

        tbody.html(rows);
        updatePaginationInfo();
    }

    $('#editReservationBtn').click(function() {
        editMode = !editMode;
        
        if (editMode) {
            $(this)
                .removeClass('btn-warning')
                .addClass('btn-success')
                .html('<i class="bi bi-check2"></i> Done');
            
            $('.status-cell').each(function() {
                const row = $(this).closest('tr');
                const currentStatus = row.data('status') || 'Pending';
                
                $(this).html(`
                    <select class="form-select form-select-sm status-dropdown" 
                            data-id="${row.data('id')}" 
                            style="min-width: 120px; display: inline-block; width: auto;">
                        <option value="Pending" ${currentStatus === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="Confirmed" ${currentStatus === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                        <option value="Completed" ${currentStatus === 'Completed' ? 'selected' : ''}>Completed</option>
                        <option value="Cancelled" ${currentStatus === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                `);
            });
            
            $('<div class="alert alert-info alert-dismissible fade show" id="editModeAlert" style="position:fixed;bottom:20px;right:20px;z-index:9999;max-width:350px;">' +
                '<i class="bi bi-info-circle me-2"></i>' +
                'Edit mode ON. Change statuses and click <strong>Done</strong> to save.' +
                '<button type="button" class="btn-close" data-bs-dismiss="alert"></button>' +
                '</div>').appendTo('body');
            
            setTimeout(function() {
                $('#editModeAlert').alert('close');
            }, 5000);
            
        } else {
            saveAllStatusChanges();
            $(this)
                .removeClass('btn-success')
                .addClass('btn-warning')
                .html('<i class="bi bi-pencil-fill"></i> Edit');
        }
    });

    function saveAllStatusChanges() {
        let updates = [];
        let errors = 0;
        
        $('.status-dropdown').each(function() {
            const id = $(this).data('id');
            const newStatus = $(this).val();
            const row = $(this).closest('tr');
            const currentStatus = row.data('status');
            
            if (newStatus !== currentStatus) {
                updates.push({ id, status: newStatus });
            }
        });

        if (updates.length === 0) {
            loadReservations();
            return;
        }

        const alertId = 'savingAlert';
        $('body').append(`
            <div id="${alertId}" class="alert alert-info" style="position:fixed;bottom:20px;right:20px;z-index:9999;max-width:350px;">
                <i class="bi bi-hourglass-split me-2"></i>
                Saving ${updates.length} status change(s)...
            </div>
        `);

        let completed = 0;
        let successCount = 0;
        
        updates.forEach(update => {
            $.ajax({
                url: `/admin-reservations/${update.id}/status`,
                method: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify({ status: update.status }),
                success: function(response) {
                    if (response.success) {
                        successCount++;
                    }
                    completed++;
                    checkCompletion();
                },
                error: function() {
                    errors++;
                    completed++;
                    checkCompletion();
                }
            });
        });

        function checkCompletion() {
            if (completed === updates.length) {
                $(`#${alertId}`).remove();
                
                let message = '';
                if (errors === 0) {
                    message = `Successfully updated ${successCount} reservation(s)!`;
                } else {
                    message = `Updated ${successCount} reservation(s), but ${errors} failed.`;
                }
                
                $('body').append(`
                    <div class="alert ${errors === 0 ? 'alert-success' : 'alert-warning'} alert-dismissible fade show" 
                         style="position:fixed;bottom:20px;right:20px;z-index:9999;max-width:350px;">
                        <i class="bi ${errors === 0 ? 'bi-check-circle' : 'bi-exclamation-triangle'} me-2"></i>
                        ${message}
                        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                    </div>
                `);
                
                setTimeout(function() {
                    loadReservations();
                }, 1000);
            }
        }
    }

    function updatePaginationInfo() {
        const total = totalReservations;
        const totalPages = Math.ceil(total / rowsPerPage) || 1;
        const start = total > 0 ? ((currentPage - 1) * rowsPerPage) + 1 : 0;
        const end = Math.min(currentPage * rowsPerPage, total);

        if (total === 0) {
            $('#paginationInfo').text('Showing 0 reservations');
        } else {
            $('#paginationInfo').text(`Showing ${start} to ${end} of ${total} reservations`);
        }
        
        $('#currentPage').text(currentPage);
        $('#previousPage').prop('disabled', currentPage <= 1);
        $('#nextPage').prop('disabled', currentPage >= totalPages);
    }

    function applyFilters() {
        currentSearch = $('#searchReservations').val().trim();
        currentFilter = $('#filterReservations').val();
        currentSort = $('#sortReservations').val();
        currentPage = 1;
        loadReservations();
    }

    let searchTimeout;
    $('#searchReservations').on('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(applyFilters, 300);
    });

    $('#filterReservations').on('change', applyFilters);
    $('#sortReservations').on('change', applyFilters);

    $('#previousPage').click(function() {
        if (currentPage > 1) {
            currentPage--;
            loadReservations();
        }
    });

    $('#nextPage').click(function() {
        const totalPages = Math.ceil(totalReservations / rowsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            loadReservations();
        }
    });

    loadReservations();
});