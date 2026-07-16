$(document).ready(function() {

    // Prevents the page from scrolling to anchor on load
    if (window.location.hash) {
        window.location.hash = '';
    }

    // Smooth scroll to search section
    $('#pressScrollSearch').click(function(e) {
        e.preventDefault();
        
        $('html, body').animate({
            scrollTop: $('#searchFlightContainer').offset().top - 80
        }, 800);
    });

    const airlines = [
        { 
            name: 'Philippine Airlines', 
            desc: 'Flag carrier of the Philippines',
            rating: '4.5',
            icon: 'fa-plane'
        },
        { 
            name: 'Cebu Pacific', 
            desc: 'Low-cost domestic flights',
            rating: '4.2',
            icon: 'fa-plane-departure'
        },
        { 
            name: 'AirAsia', 
            desc: 'Leading Southeast Asian carrier',
            rating: '4.0',
            icon: 'fa-plane'
        },
        { 
            name: 'Emirates Airlines', 
            desc: 'Luxury world-class service',
            rating: '5.0',
            icon: 'fa-crown'
        },
        { 
            name: 'Singapore Airlines', 
            desc: 'Award-winning premium airline',
            rating: '4.8',
            icon: 'fa-star'
        },
        { 
            name: 'Japan Airlines', 
            desc: 'Exceptional Japanese hospitality',
            rating: '4.7',
            icon: 'fa-landmark'
        },
        { 
            name: 'Korean Air', 
            desc: 'Modern fleet with great service',
            rating: '4.6',
            icon: 'fa-flag'
        },
        { 
            name: 'Qatar Airways', 
            desc: 'World-class luxury airline',
            rating: '4.8',
            icon: 'fa-crown'
        }
    ];

    // Auto-suggest functionality
    $('#flightSearch').on('keyup', function() {
        const searchTerm = $(this).val().toLowerCase().trim();
        const suggestionsBox = $('#suggestionsList');
        
        if (searchTerm.length === 0) {
            suggestionsBox.removeClass('active').empty();
            $('.flight-card').removeClass('highlight-card');
            return;
        }
        
        const matches = airlines.filter(function(airline) {
            return airline.name.toLowerCase().includes(searchTerm);
        });
        
        if (matches.length === 0) {
            suggestionsBox.addClass('active').html(
                '<div class="no-results"><i class="fas fa-search"></i> No airlines found</div>'
            );
            return;
        }
        
        let html = '';
        matches.forEach(function(airline, index) {
            html += 
                '<div class="suggestion-item" data-name="' + airline.name + '" data-index="' + index + '">' +
                    '<div class="suggestion-icon">' +
                        '<i class="fas ' + airline.icon + '"></i>' +
                    '</div>' +
                    '<div class="suggestion-name">' + airline.name + '</div>' +
                    '<div class="suggestion-badge">' +
                        '<i class="fas fa-star"></i> ' + airline.rating +
                    '</div>' +
                '</div>';
        });
        
        suggestionsBox.addClass('active').html(html);
    });

    // Click on suggestion
    $(document).on('click', '.suggestion-item', function() {
        const name = $(this).data('name');
        $('#flightSearch').val(name);
        $('#suggestionsList').removeClass('active').empty();
        highlightAndScrollToCard(name);
    });

    // Keyboard navigation
    $(document).on('keydown', function(e) {
        const suggestionsBox = $('#suggestionsList');
        const items = suggestionsBox.find('.suggestion-item');
        
        if (!suggestionsBox.hasClass('active') || items.length === 0) {
            return;
        }
        
        let currentIndex = items.index(items.filter('.active'));
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            currentIndex = Math.min(currentIndex + 1, items.length - 1);
            items.removeClass('active');
            items.eq(currentIndex).addClass('active');
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            currentIndex = Math.max(currentIndex - 1, 0);
            items.removeClass('active');
            items.eq(currentIndex).addClass('active');
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const activeItem = items.filter('.active');
            if (activeItem.length) {
                const name = activeItem.data('name');
                $('#flightSearch').val(name);
                suggestionsBox.removeClass('active').empty();
                highlightAndScrollToCard(name);
            }
        } else if (e.key === 'Escape') {
            suggestionsBox.removeClass('active').empty();
        }
    });

    // Highlight and scroll to card
    function highlightAndScrollToCard(name) {
        $('.flight-card').removeClass('highlight-card');
        
        $('.flight-card').each(function() {
            const cardTitle = $(this).find('.card-title').text().trim();
            if (cardTitle === name) {
                $(this).addClass('highlight-card');
                
                const offset = $(this).offset().top - 120;
                $('html, body').animate({
                    scrollTop: offset
                }, 500);
            }
        });
    }

    // Close suggestions when clicking outside
    $(document).click(function(e) {
        if (!$(e.target).closest('.search-wrapper').length) {
            $('#suggestionsList').removeClass('active').empty();
        }
    });
});