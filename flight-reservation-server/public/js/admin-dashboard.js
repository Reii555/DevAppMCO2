$(document).ready(function() {
    console.log("Admin Dashboard Loaded");

    //sidebar toggle
    $('#sidebarButton').click(function(e) {
        e.stopPropagation();
        $('#sidebar').toggleClass('hidden');
        $('#adminFlightsMain').toggleClass('sidebar-open');
    });

    $(".close-btn").click(function() {
        alert("Close button clicked.");
    });

    const ctx = document.getElementById("revenueChart");

    new Chart(ctx, {
        type: "line",
        data: {
            labels: [ "Jan", "Feb", "Mar", "Apr", "May", "Jun"],
            datasets: [{
                label: "Revenue",
                data: [12000, 15000, 18000, 22000, 25000, 27000, 32000]
            }]
        }
    });
});