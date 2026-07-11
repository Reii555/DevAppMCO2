$(document).ready(function() {
    
    //sidebar toggle
    $('#sidebarButtones').click(function(e) {
        e.stopPropagation();
        
        // Toggles the 'hidden' class on sidebar
        $('#sidebar').toggleClass('hidden');
        
        // Toggles the 'sidebar-open' class on main content
        $('#adminUsersMain').toggleClass('sidebar-open');
        
    });

    const users = [
        {
            id: 1,
            name: 'Admin',
            email: 'admin67@mail.ggg',
            phone: '09171751689',
            created_at: '2019-12-31 11:59:50',
            last_login: '2026-06-01 09:05:00',
            role: 'admin',
            status: 'active'
        },
        {
            id: 2,
            name: 'Sof Donor',
            email: 'sofdonor@mail.ggg',
            phone: '0912376789',
            created_at: '2024-03-23 23:30:00',
            last_login: '2024-06-01 11:15:00',
            role: 'customer',
            status: 'active'
        },
        {
            id: 3,
            name: 'Raienz',
            email: 'raienz@mail.ggg',
            phone: '0912376000',
            created_at: '2020-12-21 13:36:00',
            last_login: '2024-06-01 21:05:00',
            role: 'customer',
            status: 'deleted'
        },
        {
            id: 4,
            name: 'Wally Bayola',
            email: 'wally_bayola@mail.ggg',
            phone: '0917176789',
            created_at: '2024-01-15 10:30:00',
            last_login: '2024-06-01 14:45:00',
            role: 'customer',
            status: 'active'
        },
        {
            id: 5,
            name: 'Kim Dokja',
            email: 'kdjORV@mail.ggg',
            phone: '0917176009',
            created_at: '2025-02-12 00:30:00',
            last_login: '2024-08-01 14:45:00',
            role: 'customer',
            status: 'deleted'
        },
        {
            id: 6,
            name: 'Yoo Joonghyuk',
            email: 'yjhORVa@mail.ggg',
            phone: '0917156789',
            created_at: '2023-05-15 10:30:00',
            last_login: '2024-01-01 14:56:00',
            role: 'customer',
            status: 'active'
        },
        {
            id: 7,
            name: 'Hiromi Higuruma',
            email: 'hiroSoPogi@mail.ggg',
            phone: '0917167676',
            created_at: '2025-05-03 10:30:00',
            last_login: '2026-05-02 04:16:00',
            role: 'customer',
            status: 'active'
        },
        {
            id: 8,
            name: 'Reina Lagos',
            email: 'ReiforHiro@mail.ggg',
            phone: '09171741466',
            created_at: '2025-05-02 10:30:00',
            last_login: '2026-05-03 04:13:00',
            role: 'customer',
            status: 'active'
        },
    ];

    let currentPage = 1;
    const rowsPerPage = 5;
    let filteredUsers = [...users];

    function populateUserTable() {
        // Calculate which rows to show based on pagination
        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const pageData = filteredUsers.slice(start, end);

        // Build HTML for each row
        let rows = '';
        pageData.forEach(user => {
            // Status badge (green for active, red for deleted)
            const statusBadge = user.status === 'active' 
                ? '<span class="badge bg-success">Active</span>'
                : '<span class="badge bg-danger">Deleted</span>';
            
            // Role badge (blue for admin, gray for customer)
            const roleBadge = user.role === 'admin'
                ? '<span class="badge bg-primary">Admin</span>'
                : '<span class="badge bg-secondary">Customer</span>';

            // Build the row
            rows += `
                <tr>
                    <td>${user.id}</td>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td>${user.phone}</td>
                    <td>${user.created_at}</td>
                    <td>${user.last_login}</td>
                    <td>${statusBadge}</td>
                    <td>${roleBadge}</td>
                </tr>
            `;
        });

        // If no users found, show a message
        if (rows === '') {
            rows = `
                <tr>
                    <td colspan="8" class="text-center text-muted py-4">
                        No users found matching your criteria.
                    </td>
                </tr>
            `;
        }

        // Insert rows into the table body
        $('table tbody').html(rows);
        
        // Update pagination info
        paginationTable();
    }

    function filterUsers() {
        const search = $('#searchUsers').val().toLowerCase();
        const filter = $('#filterUsers').val();
        const sort = $('#sortUsers').val();

        // Filter users
        filteredUsers = users.filter(user => {
            // Search: check if search term matches name, email, or phone
            const matchSearch = user.name.toLowerCase().includes(search) || 
                               user.email.toLowerCase().includes(search) ||
                               user.phone.includes(search);
            
            // Filter: check if status matches
            const matchFilter = filter === 'all' || user.status === filter;
            
            return matchSearch && matchFilter;
        });

        // Sort users
        filteredUsers.sort((a, b) => {
            if (sort === 'id') return a.id - b.id;
            if (sort === 'name') return a.name.localeCompare(b.name);
            if (sort === 'email') return a.email.localeCompare(b.email);
            if (sort === 'created_at') return a.created_at.localeCompare(b.created_at);
            if (sort === 'last_login') return a.last_login.localeCompare(b.last_login);
            if (sort === 'status') return a.status.localeCompare(b.status);
            return 0;
        });

        // Reset to page 1 when filtering
        currentPage = 1;
        
        // Re-render the table
        populateUserTable();
    }

    function paginationTable() {
        const total = filteredUsers.length;
        const totalPages = Math.ceil(total / rowsPerPage) || 1;
        const start = (currentPage - 1) * rowsPerPage + 1;
        const end = Math.min(currentPage * rowsPerPage, total);

        // Update pagination info text
    if (total === 0) {
        $('#paginationInfo').text('Showing 0 users');
    } else {
        $('#paginationInfo').text(`Showing ${start} to ${end} of ${total} users (Page ${currentPage} of ${totalPages})`);
    }
    
    // Update current page display
    $('#currentPage').text(currentPage);

    // Enable/disable Previous and Next buttons
    $('#previousPage').prop('disabled', currentPage <= 1);
    $('#nextPage').prop('disabled', currentPage >= totalPages);
    }

    // event handlerz
    
    // Search input - trigger filter on keyup
    $('#searchUsers').on('keyup', function() {
        filterUsers();
    });

    // Filter dropdown - trigger on change
    $('#filterUsers').on('change', function() {
        filterUsers();
    });

    // Sort dropdown - trigger on change
    $('#sortUsers').on('change', function() {
        filterUsers();
    });

    // Previous page button
    $('#previousPage').click(function() {
        if (currentPage > 1) {
            currentPage--;
            populateUserTable();
        }
    });

    // Next page button
    $('#nextPage').click(function() {
        const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            populateUserTable();
        }
    });
    
    filterUsers();

    console.log(`Loaded ${users.length} users`);
});