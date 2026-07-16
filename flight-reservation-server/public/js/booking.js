let passengerCount = 1;

// FUNCTIONS
// Passenger Validation
function validatePassenger() {
    let valid = true;

    let fullName = $("#fullName").val().trim(); 
    let email = $("#email").val().trim(); 
    let contact = $("#contactNum").val().trim(); 
    let passportNum = $("#passportNum").val();  
    let nationality = $("#nationality").val();  
    let birthDate = $("#birthDate").val();  
    let gender = $("#gender").val();  

    if(fullName === "") {
        $("#nameError").text("Full Name cannot be empty.");
        valid = false;
    } else {
        $("#nameError").text(" ");
    }

    if(!email.includes("@")) {
        $("#emailError").text("Email Invalid.");
        valid = false;
    } else {
        $("#emailError").text(" ");
    }

    if(contact.length < 11) {
        $("#contactError").text("Contact Number Invalid.");
        valid = false;
    } else {
        $("#contactError").text(" ");
    }

    if(passportNum === "") {
        $("#passportError").text("Passport Number cannot be empty.");
        valid = false;
    } else {
        $("#passportError").text(" ");
    }

    if(nationality === "") {
        $("#nationalityError").text("Nationality cannot be empty.");
        valid = false;
    } else {
        $("#nationalityError").text(" ");
    }

    if(birthDate === "") {
        $("#birthDateError").text("Date of Birth cannot be empty.");
        valid = false;
    } else {
        $("#birthDateError").text(" ");
    }

    if(gender === "") {
        $("#genderError").text("Gender cannot be empty.");
        valid = false;
    } else {
        $("#genderError").text(" ");
    }

    return valid;
}

// Emergency Contact Validation
function validateEmergency() {
    let valid = true;

    let fullName = $("#name_emergency").val().trim();
    let email = $("#email_emergency").val().trim(); 
    let contact = $("#contact_emergency").val().trim(); 
    let relationship = $("#rel_emergency").val();  

    if(fullName === "") {
        $("#name_emError").text("Full Name cannot be empty.");
        valid = false;
    } else {
        $("#name_emError").text(" ");
    }

    if(!email.includes("@")) {
        $("#email_emError").text("Email Invalid.");
        valid = false;
    } else {
        $("#email_emError").text(" ");
    }

    if(contact.length < 11) {
        $("#contact_emError").text("Contact Number Invalid.");
        valid = false;
    } else {
        $("#contact_emError").text(" ");
    }

    if(relationship == "") {
        $("#rel_emError").text("Relationship cannot be empty.");
        valid = false;
    } else {
        $("#rel_emError").text(" ");
    }

    return valid;
}

// Get and Update Selected Seats 
function updateSelectedSeats() {

    let selected = [];

    $('.seat.selected').each(function () {
        selected.push($(this).text());
       });

    // update sidebar
    if (selected.length == 0) {
        $('#selectedSeat').text('None');
    } else {
        $('#selectedSeat').text(selected.join(', '));
    }
}

// Get and Update Selected Meal 
function updateSelectedMeal() {

    let selected = [];

    $('.meal-card.selected h5').each(function () {
        selected.push($(this).text());
    });

    // update sidebar
    if (selected.length == 0) {
        $('#selectedMeal').text('Standard');
    } else {
        $('#selectedMeal').text(selected);
    }
}

// Get and Update Passenger Count 
function updatePassengerCount() {
    $('#passengerCount').text(passengerCount);
}

function updateExtraServices() {

    let baggageTotal = $('#checkedBag').val() * checkedBaggage;
    let carryTotal = $('#carryBag').val() * carryBaggage;

    let priorityTotal = 0;
    let insuranceTotal = 0;
    let loungeTotal = 0;

    if ($('#priorityBoard').prop('checked')) {
        priorityTotal = priority;
    }

    if ($('#travelIns').prop('checked')) {
        insuranceTotal = insurance;
    }

    if ($('#loungeAccess').prop('checked')) {
        loungeTotal = loungeAccess;
    }

    $('#baggageCost').text('₱' + baggageTotal);
    $('#carryonCost').text('₱' + carryTotal);
    $('#priorityCost').text('₱' + priorityTotal);
    $('#insuranceCost').text('₱' + insuranceTotal);
    $('#loungeCost').text('₱' + loungeTotal);

    let total =
        baggageTotal +
        carryTotal +
        priorityTotal +
        insuranceTotal +
        loungeTotal;

    $('#extrasTotal').text(total);

    return total;
}

// get meal price

function getMealPrice() {

    let price = $('.meal-card.selected .meal_price').text();

    if (price === "" || price === "Included") {
        return 0;
    }

    return parseInt(price.replace('+ ₱', ''));
}

// calculate and update total book price
function updateTotalPrice() {
    let mealPrice = getMealPrice();
    let extraPrice = updateExtraServices();

    // get number of seats
    let count = $('.seat.selected').length;

    let total = baseFlightPrice;

    $('.seat.selected').each(function () {

        let seat = $(this).text().trim();

        // get the number from the seat code (if 1-3, there's premium fee)
        let row = parseInt(seat);

        if (row <= 3) {
            total += baseSeatPrice + premiumFee;
        } else {
            total += baseSeatPrice;
        }

    });

    total += mealPrice + extraPrice;

    $('#totalPrice').text("₱" + total);
}

// EVENTS
$(document).ready(function(){
    updateTotalPrice(); 

    // If [add passenger] is clicked, another passenger card is created
    $("#addPassenger").click(function(){

        passengerCount++;
        updatePassengerCount();

        $("#passengerContainer").append(`
        <div class="card border p-3 mb-3 passenger-card">
            <h5>Passenger ${passengerCount}</h5>

            <div class="row g-3">

                <div class="col-md-6">
                    <label class="form-label">Full Name</label> 
                    <input type="text" class="form-control" id="fullName">
                    <div class="text-danger small" id="nameError"></div>
                </div>

                <div class="col-md-6">
                    <label class="form-label">Email Address</label>
                    <input type="email" class="form-control" id="email">
                    <div class="text-danger small" id="emailError"></div>
                </div>

                <div class="col-md-6">
                    <label class="form-label">Contact Number</label>
                    <input type="tel" class="form-control" id="contactNum">
                    <div class="text-danger small" id="contactError"></div>
                </div>

                <div class="col-md-6">
                    <label class="form-label">Passport Number</label>
                    <input type="text" class="form-control" id="passportNum">
                    <div class="text-danger small" id="passportError"></div>
                </div>

                <div class="col-md-4">
                    <label class="form-label">Nationality</label>
                    <select class="form-select" id="nationality">
                        <option>Filipino</option>
                    </select>
                    <div class="text-danger small" id="nationalityError"></div>
                </div>

                <div class="col-md-4">
                    <label class="form-label">Date of Birth</label>
                        <input type="date" class="form-control" id="birthDate">
                        <div class="text-danger small" id="birthDateError"></div>
                </div>

                <div class="col-md-4">
                    <label class="form-label">Gender</label>
                    <select class="form-select" id="gender">
                        <option>Male</option>
                        <option>Female</option>
                    </select>
                    <div class="text-danger small" id="genderError"></div>
                </div>

                <button type="button" class="btn btn-primary" id="savePassenger">Save Passenger</button>
            </div>
        </div>
        `);

    });

    // If a meal card is clicked, it's either selected or removed
    $(".meal-card").click(function(){

        $(".meal-card").removeClass("selected");

        $(this).addClass("selected");

        updateSelectedMeal();
        updateTotalPrice(); 

    });

    // if save passenger button is pressed but data is invalid/data is valid
    $("#savePassenger").click(function (){

        if(!validatePassenger()){
                return;
        }
    });


    // if save passenger button is pressed but data is invalid/data is valid
    $("#saveEmergency").click(function (){

        if(!validateEmergency()){
                return;
        }
    });

    // create the seat map
    const seats = ['A', 'B', 'C', 'D', 'E', 'F'];

    for(let row = 1; row <= 20; row++) {

        // display row numbers
        let seatRow = `
            <div class="row text-center mb-2 align-items-center">
                <div class="col">${row}</div>
        `;

        // display seats for the left side of the aisle
        for(let i = 0; i < 3; i++) {
            
            let seatClass;

            if (row <= 3) {
                seatClass = 'btn-outline-warning premium';
            } else {
                seatClass = 'btn-outline-success';
            }

            seatRow += `
                <div class="col">
                    <button class="btn ${seatClass} seat">
                        ${row}${seats[i]}
                    </button>
                </div>
            `;

            // seatRow is now = [row#Letter]
        }

        seatRow += `<div class="col"></div>`; // spacer for the aisle

        // display seats for the right side of the aisle
        for(let i = 3; i < 6; i++) {

            let seatClass;

            if (row <= 3) {
                seatClass = 'btn-outline-warning premium';
            } else {
                seatClass = 'btn-outline-success';
            }

            seatRow += `
                <div class="col">
                    <button class="btn ${seatClass} seat">
                        ${row}${seats[i]}
                    </button>
                </div>
            `;
        }

        seatRow += `</div>`;

        $('#seatRows').append(seatRow);
    }

    // change occupied seats in the seat map
    $('.seat').each(function (){

        let seat = $(this).text().trim();

        if (occupiedSeats.includes(seat)) {

            $(this)
                .removeClass('btn-outline-success btn-outline-warning selected')
                .addClass('btn-secondary')
                .prop('disabled', true);
        }
    });

    // when a seat is chosen
    $(".seat").click(function (){

        let seat = $(this).text();

        // if occupied, nothing happens
        if (occupiedSeats.includes(seat)) {
            return; 
        }

        // if not occupied and is already selected
        if ($(this).hasClass('selected')) {
            $(this).removeClass('selected btn-success text-white');

        // if not occupied and is not yet selected
        } else {

            $(this).addClass('selected btn-success text-white');
        }

        updateSelectedSeats();
        updateTotalPrice(); 
    });

    // when an extra service is updated
    $(".extra_serv").click(function (){
        updateExtraServices();
        updateTotalPrice(); 
    });

});