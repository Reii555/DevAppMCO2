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
            $("#activeFlights").text(flights.filter(flight => flight.status === "Active").length);
            $("#delayedFlights").text(flights.filter(flight => flight.status === "Delayed").length);
            $("#cancelledFlights").text(flights.filter(flight => flight.status === "Cancelled").length);
        },

        error: function (error) {
            console.error("Error updating statistics:", error);
        }
    });
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
                <td>${flight.origin}</td>
                <td>${flight.destination}</td>

                <td>
                    ${formatDate(flight.departureDate)}
                    <br>
                    ${flight.departureTime}
                </td>

                <td>
                    ${formatDate(flight.arrivalDate)}
                    <br>
                    ${flight.arrivalTime}
                </td>

                <td>${flight.availableSeats}</td>
                <td>${flight.status}</td>

            </tr>
        `;
    });

    $("#flightsTableBody").html(html);

    updatePagination(data.length);
}


//formating date
function formatDate(date) {

    if (!date) {
        return "";
    }

    let formattedDate = new Date(date);

    return formattedDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
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

            filteredFlights = flights;

            // sorting
            filteredFlights.sort(function (a, b) {

                if (sortOption === "flightId") {
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


    let flightNumber = $("#flightNumber").val().trim();
    let airline = $("#airline").val().trim();
    let origin = $("#origin").val().trim();
    let destination = $("#destination").val().trim();
    let departureDate = $("#departureDate").val();
    let departureTime = $("#departureTime").val();
    let arrivalDate = $("#arrivalDate").val();
    let arrivalTime = $("#arrivalTime").val();
    let availableSeats = $("#availableSeats").val();
    let ticketPrice = $("#ticketPrice").val();
    let status = $("#status").val();


    //empty inputs
    if (flightNumber === "") {

        $("#flightNumberError").text("Flight number is required.");
        $("#flightNumber").addClass("is-invalid");

        valid = false;
    }
    if (airline === "") {

        $("#airlineError").text("Airline is required.");
        $("#airline").addClass("is-invalid");

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
    if (ticketPrice === "" || Number(ticketPrice) <= 0) {

        $("#ticketPriceError").text("Ticket price must be greater than 0.");
        $("#ticketPrice").addClass("is-invalid");
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
    //ticket price validations
    //price cannot be negative
    if (Number(ticketPrice) < 0){
        $("#ticketPriceError").text("Ticket price cannot be negative.");
        $("#ticketPrice").addClass("is-invalid");
        valid = false;
    }
    return valid;
}


//clear form
function clearFlightForm() {

    $("#flightNumber").val("");
    $("#airline").val("");
    $("#origin").val("");
    $("#destination").val("");
    $("#departureDate").val("");
    $("#departureTime").val("");
    $("#arrivalDate").val("");
    $("#arrivalTime").val("");
    $("#availableSeats").val("");
    $("#ticketPrice").val("");
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

        if (selectedFlightIndex < 0) { return; }

        editMode = true;

        let flight = filteredFlights[selectedFlightIndex];

        $("#modalTitle").text("Edit Flight");
        $("#flightNumber").val(flight.flight_number);
        $("#airline").val(flight.airline);
        $("#origin").val(flight.origin);
        $("#destination").val(flight.destination);
        $("#departureDate").val(flight.departureDate);
        $("#departureTime").val(flight.departureTime);
        $("#arrivalDate").val(flight.arrivalDate);
        $("#arrivalTime").val(flight.arrivalTime);
        $("#availableSeats").val(flight.availableSeats);
        $("#ticketPrice").val(flight.ticketPrice);
        $("#status").val(flight.status);

        let modal = new bootstrap.Modal(
            document.getElementById("flightModal")
        );
        modal.show();
    });


    // SAVE FLIGHT
    $("#saveFlight").click(function () {

        if (!validateFlightForm()) { return; }


        let flightData = {

            flight_number: $("#flightNumber").val().trim(),
            airline: $("#airline").val().trim(),
            origin: $("#origin").val().trim(),
            destination: $("#destination").val().trim(),
            departureDate: $("#departureDate").val(),
            departureTime: $("#departureTime").val(),
            arrivalDate: $("#arrivalDate").val(),
            arrivalTime: $("#arrivalTime").val(),
            availableSeats: Number($("#availableSeats").val()),
            ticketPrice: Number($("#ticketPrice").val()),
            status: $("#status").val()
        };

        let url = "/admin-flights";
        let method = "POST";

        if (editMode) {

            url ="/admin-flights/" + selectedFlightId;
            method = "PUT";
        }


        $.ajax({

            url: url,
            method: method,
            contentType: "application/json",
            data: JSON.stringify(flightData),

            success: function () {
                applyFilters();
                updateStatistics();
                bootstrap.Modal.getInstance(document.getElementById("flightModal")).hide();
                clearFlightForm();
            },

            error: function (error) {
                console.error("Error saving flight:", error);
                alert("Error saving flight.");
            }
        });
    });


    // DELETE FLIGHT
    $("#deleteBtn").click(function () {

        if (selectedFlightId === null) { return; }


        let modal = new bootstrap.Modal(document.getElementById("deleteModal"));
        modal.show();
    });


    // CONFIRM DELETE
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


    // PREVIOUS PAGE
    $("#previousPage").click(function () {

        if (currentPage > 1) {

            currentPage--;

            renderFlights(
                filteredFlights
            );
        }
    });


    // NEXT PAGE
    $("#nextPage").click(function () {

        let totalPages = Math.ceil(filteredFlights.length /rowsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderFlights(filteredFlights);
        }
    });

});