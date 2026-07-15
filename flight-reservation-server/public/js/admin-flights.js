
let flights = [
    {
        flightId: "PR101",
        airline: "Philippine Airlines",
        route: "MNL - JFK",
        departureDate: "2026-05-27",
        departureTime: "08:00",
        arrivalDate: "2026-05-28",
        arrivalTime: "16:00",
        seats: 35,
        status: "Active"
    },
    {
        flightId: "5J205",
        airline: "Cebu Pacific",
        route: "MNL - TKO",
        departureDate: "2026-05-27",
        departureTime: "09:00",
        arrivalDate: "2026-05-27",
        arrivalTime: "17:00",
        seats: 35,
        status: "Delayed"
    },
    {
        flightId: "AK555",
        airline: "AirAsia",
        route: "MNL - HKG",
        departureDate: "2026-05-28",
        departureTime: "10:00",
        arrivalDate: "2026-05-29",
        arrivalTime: "08:00",
        seats: 35,
        status: "Active"
    },
    {
        flightId: "AK777",
        airline: "AirAsia",
        route: "MNL - TPE",
        departureDate: "2026-07-30",
        departureTime: "10:00",
        arrivalDate: "2026-07-30",
        arrivalTime: "13:00",
        seats: 35,
        status: "Delayed"
    },
    {
        flightId: "PR103",
        airline: "Philippine Airlines",
        route: "MNL - JFK",
        departureDate: "2026-04-30",
        departureTime: "10:00",
        arrivalDate: "2026-05-1",
        arrivalTime: "23:00",
        seats: 40,
        status: "Cancelled"
    },
    {
        flightId: "5J217",
        airline: "Cebu Pacific",
        route: "MNL - SIN",
        departureDate: "2026-03-30",
        departureTime: "09:00",
        arrivalDate: "2026-03-30",
        arrivalTime: "14:00",
        seats: 35,
        status: "Active"
    },
    {
        flightId: "5J204",
        airline: "Cebu Pacific",
        route: "MNL - CEB",
        departureDate: "2026-05-27",
        departureTime: "09:00",
        arrivalDate: "2026-05-27",
        arrivalTime: "10:45",
        seats: 35,
        status: "Cancelled"
    },
    {
        flightId: "5J201",
        airline: "Cebu Pacific",
        route: "MNL - ISA",
        departureDate: "2026-04-15",
        departureTime: "09:00",
        arrivalDate: "2026-04-15",
        arrivalTime: "12:00",
        seats: 25,
        status: "Delayed"
    },
    {
        flightId: "AK789",
        airline: "AirAsia",
        route: "MNL - HAN",
        departureDate: "2026-08-19",
        departureTime: "10:00",
        arrivalDate: "2026-08-19",
        arrivalTime: "12:45",
        seats: 45,
        status: "Active"
    },
    {
        flightId: "PR111",
        airline: "Philippine Airlines",
        route: "MNL - LAX",
        departureDate: "2026-09-11",
        departureTime: "10:00",
        arrivalDate: "2026-09-12",
        arrivalTime: "8:00",
        seats: 40,
        status: "Active"
    }
];

let currentPage = 1;
let rowsPerPage = 5;
let selectedFlightIndex = -1;
let filteredFlights = [...flights];
let editMode = false;

function updateStatistics(){
    $("#totalFlights").text(flights.length);
    $("#activeFlights").text(flights.filter(flight => flight.status === "Active").length);
    $("#delayedFlights").text(flights.filter(flight => flight.status === "Delayed").length);
    $("#cancelledFlights").text(flights.filter(flight => flight.status === "Cancelled").length);
}

function renderFlights(data) {

    let startIndex = (currentPage - 1) * rowsPerPage;
    let endIndex = startIndex + rowsPerPage;

    let paginatedData =
        data.slice(startIndex, endIndex);

    let html = "";

    paginatedData.forEach((flight, index) => {

        let actualIndex = startIndex + index;

        let rowClass = "";

        if (actualIndex === selectedFlightIndex) {
            rowClass = "selected-row";
        }

        html += `
            <tr
                class="flight-row ${rowClass}"
                data-index="${actualIndex}">
                <td>${flight.flightId}</td>
                <td>${flight.airline}</td>
                <td>${flight.route}</td>
                <td>${flight.departureDate}</td>
                <td>${flight.departureTime}</td>
                <td>${flight.arrivalDate}</td>
                <td>${flight.arrivalTime}</td>
                <td>${flight.seats}</td>
                <td>${flight.status}</td>
            </tr>
        `;
    });

    $("#flightsTableBody").html(html);

    updatePagination(data.length);
}

function applyFilters(){
    let searchValue = $("#searchFlight").val().toLowerCase();
    let airlineFilter = $("#airlineFilter").val();
    let statusFilter = $("#statusFilter").val();
    let sortOption = $("#sortFlights").val();
    currentPage = 1;

    filteredFlights = flights.filter(flight => {

        let matchesSearch = flight.flightId.toLowerCase().includes(searchValue) || flight.airline.toLowerCase().includes(searchValue);

        let matchesAirline = airlineFilter === "ALL" || flight.airline === airlineFilter;

        let matchesStatus = statusFilter === "ALL" || flight.status === statusFilter;

        return matchesSearch && matchesAirline && matchesStatus;
    });

    filteredFlights.sort((a, b) => {
        if(sortOption === "flightId"){
            return a.flightId.localeCompare(b.flightId);
        }

        if(sortOption === "airline"){
            return a.airline.localeCompare(b.airline);
        }

        if(sortOption === "status"){
            return a.status.localeCompare(b.status);
        }

        return 0;
    });

    selectedFlightIndex = -1;
    $("#editBtn").prop("disabled", true);
    $("#deleteBtn").prop("disabled", true);

    $("#selectedFlightLabel").text("No flight selected");

    renderFlights(filteredFlights);

}

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
    let route = $("#route").val().trim();
    let departureDate = $("#departureDate").val();
    let departureTime = $("#departureTime").val();
    let arrivalDate = $("#arrivalDate").val();
    let arrivalTime = $("#arrivalTime").val();
    let seats = $("#seats").val();
    let status = $("#status").val();

    //empty inputs
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
    if (route === ""){
        $("#routeError").text("Flight route is required.");
        $("#route").addClass("is-invalid");
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
    if (seats === "" || seats === 0){
        $("#seatsError").text("Seats should be at least more than 0.");
        $("#seats").addClass("is-invalid");
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
