$(document).ready(function () {

    console.log("Admin Dashboard Loaded");

    // sidebar toggle
    $("#sidebarButton").click(function (e) {
        e.stopPropagation();
        $("#sidebar").toggleClass("hidden");
        $("#adminMain").toggleClass("sidebar-open");
    });

    // revenue chart
    const revenueCanvas = document.getElementById("revenueChart");
    if (revenueCanvas) {
        $.ajax({
            url: "/admin-dashboard/revenue",
            method: "GET",
            success: function (revenueData) {
                console.log("Revenue data:",revenueData);

                new Chart(
                    revenueCanvas,
                    {
                        type: "line",
                        data: {
                            labels: [
                                "Jan",
                                "Feb",
                                "Mar",
                                "Apr",
                                "May",
                                "Jun",
                                "Jul",
                                "Aug",
                                "Sep",
                                "Oct",
                                "Nov",
                                "Dec"
                            ],
                            datasets: [
                                {
                                    label: "Company Revenue",
                                    data: revenueData,
                                    borderWidth: 1
                                }
                            ]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    display: true
                                },

                                tooltip: {
                                    callbacks: {
                                        label: function (context) {
                                            return "₱" + context.parsed.y.toLocaleString();
                                        }
                                    }
                                }
                            },
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    ticks: {
                                        callback: function (value) {
                                            return "₱" + value.toLocaleString();
                                        }
                                    }
                                }
                            }
                        }
                    }
                );
            },
            error: function (error) {
                console.error("Error loading revenue data:", error);
            }
        });
    }
});