$("#searchBtn").click(function (e) {


    e.preventDefault();

    $.ajax({
        url: "/search",
        type: "POST",
        data: $("form").serialize(),

        success: function(html) {

            $("#flightResults").html(html);

            $("#numFlights").text(
                "Showing " + $("#flightResults .card").length + " Flights"
            );
        }

    });

});