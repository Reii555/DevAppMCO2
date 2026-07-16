let currentPage = 1;
let rowsPerPage = 5;

let selectedFlightIndex = -1;
let filteredFlights = [];

let editMode = false;
let selectedFlightId = null;


//statistics
function updateStatistics() {

    $.ajax({
        url: "/admin-flights/data",
        method: "GET",

        success: function (flights) {
            $("#totalFlights").text(flights.length);
            $("#ongoingFlights").text(flights.filter(flight => flight.status === "Ongoing").length);
            $("#delayedFlights").text(flights.filter(flight => flight.status === "Delayed").length);
            $("#cancelledFlights").text(flights.filter(flight => flight.status === "Cancelled").length);
        },

        error: function (error) {
            console.error("Error updating statistics:", error);
        }
    });
}

//initialize
function initializeFlight(flight) {

    $("#flight_number").val(flight.flight_number);
    $("#airline").val(flight.airline);
    $("#cabinClass").val(flight.cabinClass);

    $("#origin").val(flight.origin);
    $("#destination").val(flight.destination);

    $("#departureDate").val(flight.departureDate);
    $("#departureTime").val(flight.departureTime);

    $("#arrivalDate").val(flight.arrivalDate);
    $("#arrivalTime").val(flight.arrivalTime);

    $("#availableSeats").val(flight.availableSeats);
    $("#basePrice").val(flight.basePrice);

    $("#status").val(flight.status);
}

//render
function renderFlights(data) {

    let startIndex = (currentPage - 1) * rowsPerPage;
    let endIndex = startIndex + rowsPerPage;
    let paginatedData = data.slice(startIndex, endIndex);

    let html = "";

    paginatedData.forEach(function (flight, index) {

        let actualIndex = startIndex + index;
        let rowClass = "";

        if (actualIndex === selectedFlightIndex) {
            rowClass = "selected-row";
        }

        html += `
            <tr 
                class="flight-row ${rowClass}"
                data-index="${actualIndex}"
                data-id="${flight._id}">

                <td>${flight.flight_number}</td>
                <td>${flight.airline}</td>
                <td>${flight.cabinClass}</td>
                <td>${flight.origin}</td>
                <td>${flight.departureTime}</td>
                <td>${flight.arrivalTime}</td>
                <td>${flight.availableSeats}</td>
                <td>₱${flight.basePrice}</td>
                <td>${flight.status}</td>

            </tr>
        `;
        
    });

    $("#flightsTableBody").html(html);

    updatePagination(data.length);
}

// AJAX for search and filter
function applyFilters() {

    let searchValue = $("#searchFlight").val();
    let airlineFilter = $("#airlineFilter").val();
    let statusFilter = $("#statusFilter").val();
    let sortOption = $("#sortFlight").val();

    $.ajax({

        url: "/admin-flights/search",
        method: "GET",
        data: {

            search: searchValue,
            airline: airlineFilter,
            status: statusFilter
        },

        success: function (flights) {

            console.log("Flights:", flights); // ADDED FOR DEBUG !!

            filteredFlights = flights;

            // sorting
            filteredFlights.sort(function (a, b) {

                if (sortOption === "flight_number") {
                    return a.flight_number.localeCompare(b.flight_number);
                }
                if (sortOption === "airline") {
                    return a.airline.localeCompare(b.airline);
                }
                if (sortOption === "status") {
                    return a.status.localeCompare(b.status);
                }
                return 0;
            });


            currentPage = 1;
            selectedFlightIndex = -1;
            selectedFlightId = null;

            $("#editBtn").prop("disabled", true);
            $("#deleteBtn").prop("disabled", true);
            $("#selectedFlightLabel").text("No flight selected");

            renderFlights(filteredFlights);
        },

        error: function (error) {

            console.error("Error searching flights:", error);
        }
    });
}

//pagination
function updatePagination(totalRows) {

    let totalPages = Math.ceil(totalRows / rowsPerPage);

    if (totalPages === 0) { 
        totalPages = 1; 
    }

    $("#currentPage").text(currentPage);

    let start = ((currentPage - 1) * rowsPerPage) + 1;

    let end = Math.min(currentPage * rowsPerPage, totalRows);

    if (totalRows === 0) {
        start = 0;
        end = 0;
    }

    $("#paginationInfo").text( `Showing ${start} to ${end} of ${totalRows} flights`);

    $("#previousPage").prop( "disabled", currentPage === 1);

    $("#nextPage").prop("disabled", currentPage === totalPages);
}


//validations
function validateFlightForm() {

    let valid = true;

    $(".text-danger").text("");
    $(".form-control").removeClass("is-invalid");
    $(".form-select").removeClass("is-invalid");


    let flight_number = $("#flight_number").val().trim();
    let airline = $("#airline").val().trim();
    let cabinClass = $("#cabinClass").val();
    let origin = $("#origin").val().trim();
    let destination = $("#destination").val().trim();
    let departureDate = $("#departureDate").val();
    let departureTime = $("#departureTime").val();
    let arrivalDate = $("#arrivalDate").val();
    let arrivalTime = $("#arrivalTime").val();
    let availableSeats = $("#availableSeats").val();
    let basePrice = $("#basePrice").val();
    let status = $("#status").val();


    //empty inputs
    if (flight_number === "") {

        $("#flightNumberError").text("Flight number is required.");
        $("#flight_number").addClass("is-invalid");
        valid = false;
    }
    if (airline === "") {

        $("#airlineError").text("Airline is required.");
        $("#airline").addClass("is-invalid");
        valid = false;
    }
    if (cabinClass === "") {
        $("#cabinClassError").text("Cabin Class is required.");
        $("#cabinClass").addClass("is-invalid");
        valid = false;
    }
    if (origin === "") {

        $("#originError").text("Origin is required.");
        $("#origin").addClass("is-invalid");
        valid = false;
    }
    if (destination === "") {

        $("#destinationError").text("Destination is required.");
        $("#destination").addClass("is-invalid");
        valid = false;
    }
    if (departureDate === "" || departureTime === "") {

        $("#departureError").text("Departure date and time are required.");
        $("#departureDate").addClass("is-invalid");
        $("#departureTime").addClass("is-invalid");
        valid = false;
    }
    if (arrivalDate === "" || arrivalTime === "") {

        $("#arrivalError").text("Arrival date and time are required.");
        $("#arrivalDate").addClass("is-invalid");
        $("#arrivalTime").addClass("is-invalid");
        valid = false;
    }
    if (availableSeats === "" || Number(availableSeats) <= 0) {

        $("#availableSeatsError").text("Available seats must be greater than 0.");
        $("#availableSeats").addClass("is-invalid");
        valid = false;
    }
    if (basePrice === "" || Number(basePrice) <= 0) {

        $("#basePriceError").text("Base price must be greater than 0.");
        $("#basePrice").addClass("is-invalid");
        valid = false;
    }
    if (status === "") {
        $("#statusError").text("Flight status is required.");
        $("#status").addClass("is-invalid");
        valid = false;
    }

    //date validations
    //arrival date should NOT be before departure date
    //if both departureDate and arrivalDate occurs within the day,
    //arrivalTime should NOT be have the same time or before departureTime
    if (departureDate !== "" && arrivalDate !== "" && departureTime !== "" && arrivalTime !== "") {
        if (departureDate > arrivalDate) {
            $("#arrivalError").text("Arrival date should be after or same as departure date.");
            $("#arrivalDate").addClass("is-invalid");
            valid = false;
        } else if (departureDate === arrivalDate && departureTime >= arrivalTime) {
            $("#arrivalError").text("Arrival time should be after departure time.");
            $("#arrivalTime").addClass("is-invalid");
            valid = false;
        }
    }
    return valid;
}


//clear form
function clearFlightForm() {

    $("#flight_number").val("");
    $("#airline").val("");
    $("#origin").val("");
    $("#destination").val("");
    $("#departureDate").val("");
    $("#departureTime").val("");
    $("#arrivalDate").val("");
    $("#arrivalTime").val("");
    $("#availableSeats").val("");
    $("#basePrice").val("");
    $("#status").val("");
    $(".text-danger").text("");

    $(".form-control").removeClass("is-invalid");
    $(".form-select").removeClass("is-invalid");
}


$(document).ready(function () {


    //load
    applyFilters();
    updateStatistics();

    //search
    $("#searchFlight").on("keyup", applyFilters);


    //apply filter
    $("#airlineFilter").on("change", applyFilters);
    $("#statusFilter").on("change",applyFilters);

    //sort
    $("#sortFlight").on("change",applyFilters);

    //select flight
    $(document).on("click",".flight-row", function () {

            $(".flight-row").removeClass( "selected-row");
            $(this).addClass("selected-row");

            selectedFlightIndex = parseInt($(this).attr("data-index"));
            selectedFlightId = $(this).attr("data-id");

            $("#editBtn").prop("disabled",false);
            $("#deleteBtn").prop("disabled", false);

            $("#selectedFlightLabel").text("Selected: " + filteredFlights[selectedFlightIndex].flight_number);
        }
    );


    //Add flight
    $("#addBtn").click(function () {

        editMode = false;
        $("#modalTitle").text("Add Flight");
        clearFlightForm();
    });


    //edit flight
    $("#editBtn").click(function () {

        if (selectedFlightIndex < 0) {
            return;
        }

        editMode = true;

        let flight = filteredFlights[selectedFlightIndex];

        $("#modalTitle").text("Edit Flight");

        initializeFlight(flight);

        let modal = new bootstrap.Modal(
            document.getElementById("flightModal")
        );

        modal.show();
    });


    // SAVE FLIGHT
    $("#saveFlight").click(function () {

        if (!validateFlightForm()) { return; }

        const departureDate = $("#departureDate").val();
        const departureTime = $("#departureTime").val();
        const departureDateTime = new Date(`${departureDate}T${departureTime}`);

        const arrivalDate = $("#arrivalDate").val();
        const arrivalTime = $("#arrivalTime").val();
        const arrivalDateTime = new Date(`${arrivalDate}T${arrivalTime}`);


        const flightData = {

            flight_number: $("#flight_number").val().trim(),
            airline: $("#airline").val().trim(),
            cabinClass: $("#cabinClass").val(),
            origin: $("#origin").val().trim(),
            destination: $("#destination").val().trim(),

            departureTime: departureDateTime,
            arrivalTime: arrivalDateTime,

            availableSeats: Number($("#availableSeats").val()),
            basePrice: Number($("#basePrice").val()),
            status: $("#status").val(),

            duration: $("#duration").val(),
            tripType: $("#tripType").val(),
            checkedIn: Number($("#checkedIn").val()),
            carryOn: Number($("#carryOn").val())

        };

        console.log("Saving flight:", flightData);

        let url = "/admin-flights";
        let method = "POST";

        if (editMode) {
            $.ajax({
                url: `/admin-flights/${selectedFlightId}`,
                type: "PUT",
                contentType: "application/json",
                data: JSON.stringify(flightData),

                success: function(response){
                    console.log("Flight updated:", response);
                    $("#flightModal").modal("hide");
                    alert("Flight updated successfully.");
                    location.reload();
                },

                error: function(xhr){
                    console.error("Update error:", xhr.responseText);
                    alert("Error updating flight.");
                }
            });
        } else {
            $.ajax({
                url: "/admin-flights",
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(flightData),

                success: function(response){
                    console.log("Flight added:", response);
                    $("#flightModal").modal("hide");
                    alert("Flight added successfully.");
                    location.reload();
                },

                error: function(xhr){
                    console.error("Create error:", xhr.responseText);
                    alert("Error adding flight.");
                }
            });
        }
    });


    //delete
    $("#deleteBtn").click(function () {

        if (selectedFlightId === null) { return; }


        let modal = new bootstrap.Modal(document.getElementById("deleteModal"));
        modal.show();
    });


    //confirm delete
    $("#confirmDelete").click(function () {
        $.ajax({

            url: "/admin-flights/" + selectedFlightId,
            method: "DELETE",

            success: function () {
                applyFilters();
                updateStatistics();
                selectedFlightIndex = -1;
                selectedFlightId = null;

                $("#editBtn").prop("disabled", true);
                $("#deleteBtn").prop("disabled",true);
                $("#selectedFlightLabel").text("No flight selected");

                bootstrap.Modal.getInstance(document.getElementById("deleteModal")).hide();
            },

            error: function (error) {
                console.error("Error deleting flight:",error);
                alert("Error deleting flight.");
            }
        });
    });


    //prev page
    $("#previousPage").click(function () {

        if (currentPage > 1) {
            currentPage--;
            renderFlights(filteredFlights);
        }
    });


    //next page
    $("#nextPage").click(function () {

        let totalPages = Math.ceil(filteredFlights.length /rowsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderFlights(filteredFlights);
        }
    });

});