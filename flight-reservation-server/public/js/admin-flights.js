

//pagination
function updatePagination(totalRows){
    let totalPages = Math.ceil(totalRows / rowsPerPage);

    if(totalPages === 0){
        totalPages = 1;
    }

    $("#currentPage").text(currentPage);

    let start = ((currentPage - 1) * rowsPerPage) + 1;
    let end = Math.min(currentPage * rowsPerPage, totalRows);

    if(totalRows === 0){
        start = 0;
        end = 0;
    }

    $("#paginationInfo").text(`Showing ${start} to ${end} of ${totalRows} flights`);

    $("#previousPage").prop( "disabled", currentPage === 1);

    $("#nextPage").prop("disabled", currentPage === totalPages);
}

function validateFlightForm() {
    let valid = true;

    $(".text-danger").text("");

    $(".form-control").removeClass("is-invalid");
    $(".form-select").removeClass("is-invalid");

    let flightId = $("#flightId").val().trim();
    let airline = $("#airline").val().trim();
    let origin = $("#origin").val().trim();
    let destination = $("#destination").val().trim();

    let departureDate = $("#departureDate").val();
    let departureTime = $("#departureTime").val();

    let arrivalDate = $("#arrivalDate").val();
    let arrivalTime = $("#arrivalTime").val();

    let availableSeats = $("#availableSeats").val();
    let status = $("#status").val();

    // required fields
    if (flightId === ""){
        $("#flightIdError").text("Flight ID is required.");
        $("#flightId").addClass("is-invalid");
        valid = false;
    }
    if (airline === ""){
        $("#airlineError").text("Airline name is required.");
        $("#airline").addClass("is-invalid");
        valid = false;
    }
    if (origin === "" || destination === ""){
        $("#routeError").text("Origin and destination are required.");
        $("#origin").addClass("is-invalid");
        $("#destination").addClass("is-invalid");
        valid = false;
    }
    if (departureDate === "" || departureTime === "") {
        $("#departureError").text("Departure time is required.");
        $("#departureDate").addClass("is-invalid");
        $("#departureTime").addClass("is-invalid");
        valid = false;
    }
    if (arrivalDate === "" || arrivalTime == "") {
        $("#arrivalError").text("Arrival time is required.");
        $("#arrivalDate").addClass("is-invalid");
        $("#arrivalTime").addClass("is-invalid");
        valid = false;
    }
    if (availableSeats === "" || availableSeats === 0){
        $("#availableSeatsError").text("Available seats should be at least more than 0.");
        $("#availableSeats").addClass("is-invalid");
        valid = false;
    }
    if(ticketPrice === "" || Number(ticketPrice) <= 0){
        $("#ticketPriceError").text("Ticket price should be more than 0.");
        $("#ticketPrice").addClass("is-invalid");
        valid = false;
    }
    if (status === "") {
        $("#statusError").text("Flight status is required.");
        $("#status").addClass("is-invalid");
        valid = false;
    }

    //flight id dupes
    let duplicate = flights.some(function(flight){
        return flight.flightId === flightId;
    });

    if(!editMode && duplicate){
        $("#flightIdError").text("Flight ID already exists.");
        $("#flightId").addClass("is-invalid");
        valid = false;
    }

    //route format validation
    // should be MNL - LAX, NOT MNL -> LAX or MNL to LAX
    // "-" checks the text input if it the hypen exist
    if(!route.includes("-") || route.includes(">") || route.includes(" to ")){
        $("#routeError").text("Route format should be origin - destination (ex. MNL - LAX).");
        $("#route").addClass("is-invalid");
        valid = false;
    }

    //date validations
    //arrival date should NOT be before departure date
    //if both departureDate and arrivalDate occurs within the day,
    //arrivalTime should NOT be have the same time or before departureTime
    $("#arrivalError").text("");
    if(departureDate > arrivalDate){
        $("#arrivalError").text("Arrival Date should be after or same as Departure Date.");
        $("#arrivalDate").addClass("is-invalid");
        valid = false;
    } else if (departureDate === arrivalDate){
        if(departureTime >= arrivalTime){
            $("#arrivalError").text("Arrival Time should be after Departure Time.");
            $("#arrivalTime").addClass("is-invalid");
            valid = false;
        }
    }

    return valid;
                     
}

$(document).ready(function() {

    console.log("Admin Flights Management Loaded.");

    //sidebar toggle
    $('#sidebarButton').click(function(e) {
        e.stopPropagation();
        $('#sidebar').toggleClass('hidden');
        $('#adminFlightsMain').toggleClass('sidebar-open');
    });

    updateStatistics();
    renderFlights(filteredFlights);

    $("#searchFlight").on("keyup", applyFilters);
    $("#airlineFilter").on("change", applyFilters);
    $("#statusFilter").on("change", applyFilters);
    $("#sortFlights").on("change", applyFilters);

    $(document).on("click", ".flight-row", function() {

        $(".flight-row").removeClass("selected-row");
        $(this).addClass("selected-row");

        selectedFlightIndex = parseInt($(this).attr("data-index"));

        $("#editBtn").prop("disabled", false);
        $("#deleteBtn").prop("disabled", false);

        $("#selectedFlightLabel").text(
            "Selected: " + filteredFlights[selectedFlightIndex].flightId
        );
    });

    $("#addBtn").click(function () {

        editMode = false;

        $("#modalTitle").text("Add Flight");

        $("#flightId").val("");
        $("#airline").val("");
        $("#route").val("");
        $("#departureDate").val("");
        $("#departureTime").val("");
        $("#arrivalDate").val("");
        $("#arrivalTime").val("");
        $("#seats").val("");
        $("#status").val("");
    });

    $("#editBtn").click(function() {

        if(selectedFlightIndex < 0){ return; }

        editMode = true;

        let flight = filteredFlights[selectedFlightIndex];

        $("#modalTitle").text("Edit Flight");

        $("#flightId").val(flight.flightId);
        $("#airline").val(flight.airline);
        $("#route").val(flight.route);
        $("#departureDate").val(flight.departureDate);
        $("#departureTime").val(flight.departureTime);
        $("#arrivalDate").val(flight.arrivalDate);
        $("#arrivalTime").val(flight.arrivalTime);
        $("#seats").val(flight.seats);
        $("#status").val(flight.status);

        let modal = new bootstrap.Modal(
            document.getElementById("flightModal")
        );

        modal.show();
    });

    $("#saveFlight").click(function () {

        //checks input validations before saving
        if(!validateFlightForm()){
            return;
        }

        let flightData = {
            flightId: $("#flightId").val().trim(),
            airline: $("#airline").val().trim(),
            route: $("#route").val().trim(),
            departureDate: $("#departureDate").val(),
            departureTime: $("#departureTime").val(),
            arrivalDate: $("#arrivalDate").val(),
            arrivalTime: $("#arrivalTime").val(),
            seats: $("#seats").val(),
            status: $("#status").val()
        }

        if(!editMode){
            flights.push(flightData);
        } else {
            let selectedFlight = filteredFlights[selectedFlightIndex];

            let originalIndex = flights.findIndex(
                flight => flight.flightId === selectedFlight.flightId
            );
            flights[originalIndex] = flightData;
        }

        updateStatistics();
        applyFilters();

        bootstrap.Modal
            .getInstance(
                document.getElementById("flightModal")
            )
            .hide();
        
    });

    $("#deleteBtn").click(function() {
        if(selectedFlightIndex < 0){ return; }

        let modal = new bootstrap.Modal(
            document.getElementById("deleteModal")
        );

        modal.show();
    })

    $("#confirmDelete").click(function () {

        let selectedFlight = filteredFlights[selectedFlightIndex];
        let originalIndex = flights.findIndex(
            flight => flight.flightId === selectedFlight.flightId
        );

        flights.splice(originalIndex, 1);

        updateStatistics();
        applyFilters();

        bootstrap.Modal
            .getInstance(
                document.getElementById("deleteModal")
            )
            .hide();
    });

    $("#previousPage").click(function () {
        if(currentPage > 1){
            currentPage--;

            renderFlights(filteredFlights);
        }
    });

    $("#nextPage").click(function () {
        let totalPages = Math.ceil(filteredFlights.length / rowsPerPage);

        if(currentPage < totalPages){
            currentPage++;
            renderFlights(filteredFlights);
        }
    });
});
