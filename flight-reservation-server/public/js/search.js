$(document).ready(function(){

    $("#searchBtn").click(function () {

      let origin = $("#origin").val();
      let destination = $("#destination").val();

      let results = flights.filter(flight =>
          flight.origin === origin &&
          flight.destination === destination
      );

      $("#resultsSection").show();
      renderFlights(results);
  });

    $("#sortSelect").on("change", function () {
      let sorted = sortFlights(flights, $(this).val());
      renderFlights(sorted);
    });

});