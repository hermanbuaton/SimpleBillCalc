// Tariff Data
var valBasicCharge = [];
var ValFuelCharge = [];
var valFuelRebate = [];
var valSpecialRebate = [];

// Retrieve Data
function retrieveTariffData() {
    
    if (!window.HKE.parameters.isEditMode) {

        var url = datasrc;
        var sel = ".tariff-data";
        var dest = url + " " + sel;
        $('#tariff-data-placeholder').load(dest, function (responseTxt, statusTxt, xhr) {

            if (statusTxt == "success") {

                // Retrieve Data
                valBasicCharge = retrieveBasicCharge("#basicCharge_nr");
                ValFuelCharge = retrieveFuelCharge("#fuelCharge");
                valFuelRebate = retrieveRebate("#fuelRebate");
                valSpecialRebate = retrieveRebate("#specialRebate");

                // Set DefaultEndDate upon Fuel Charge Data
                defaultEndDate = getDefaultEndDate(ValFuelCharge);

            }
            else if (statusTxt == "error") {
                console.log("Error: " + xhr.status + ": " + xhr.statusText);
            }

        });

    }
    
}

// Get Input
function captureUnits() {
    var kwh = $(".unitsInput").val();
    return parseFloat(kwh);
}
function captureStartDate() {
    return new Date(getDateValue("#from"));
}
function captureEndDate() {
    return new Date(getDateValue("#to"));
}

// Validate Input
function validateInput() {

    var valid = true;

    valid = (valid && captureUnits() != "" && captureUnits() != null);
    valid = (valid && captureStartDate().getFullYear() >= 2000);
    valid = (valid && captureEndDate().getFullYear() >= 2000);

    $(".btnCalTariff").attr("disabled", !valid);
    return valid;

}

// Show output
function removePreviousResult() {
    $(".temp__Row").remove();
}
function addSubHeaderRow(title) {
    
    var tableBody = $(".resultTable tbody");

    var row = $('<tr>').addClass('temp__Row').addClass('subHeader__Row');
    var cell0 = $('<td>').append(title);
    var cell1 = $('<td>').append("");

    cell0.attr("colspan", "3");
    row.append(cell0);
    row.append(cell1);
    
    tableBody.append(row);
    
}
function addResultRow(text0, text1, text2) {

    var tableBody = $(".resultTable tbody");

    var row = $('<tr>').addClass('temp__Row');
    var cell0 = $('<td>').append(text0);
    var cell1 = $('<td>').append(text1);
    var cell2 = $('<td>').append(text2);

    row.append(cell0);
    row.append(cell1);
    row.append(cell2);

    tableBody.append(row);

}
function addSubtotalRow(text0, text1, text2) {
    
    var tableBody = $(".resultTable tbody");
    
    var row = $('<tr>').addClass('temp__Row').addClass('subTotal__Row');
    var cell0 = $('<td>').append(text0);
    var cell1 = $('<td>').append(text1);
    var cell2 = $('<td>').append(text2);
    
    row.append(cell0);
    row.append(cell1);
    row.append(cell2);
    
    tableBody.append(row);
    
}
function addFinalRow(text0, text1, text2) {
    
    var tableBody = $(".resultTable tbody");

    var row = $('<tr>').addClass('temp__Row').addClass('final__Row');
    var cell0 = $('<td>').append(text0);
    var cell1 = $('<td>').append(text1);
    var cell2 = $('<td>').append(text2);
    
    row.append(cell0);
    row.append(cell1);
    row.append(cell2);
    
    tableBody.append(row);
    
}
function outputComponents(comps, total) {
    
    // Title
    addSubHeaderRow(comps[0].Category);
    
    // Rows
    var count = comps.length;
    for (var i = 0; i < count; i++) {

        var comp = comps[i];
        
        var text0 = comp.Text1;
        var text1 = comp.Text2;
        var text2 = getOutputTariff(comp.Charge);
        
        addResultRow(text0, text1, text2);

    }
    
    // Subtotal
    if (count > 1) {
        total = getOutputTariff(total);
        addSubtotalRow("", "", total);
    }
    
}

// Calculate
function doCalculation() {
    
    removePreviousResult();
    
    var units = captureUnits();
    var start = captureStartDate();
    var end = captureEndDate();
    
    var basicChargeComp = NonResidentialCalculator.basicChargeCal(valBasicCharge, units);
    var fuelChargeComp = NonResidentialCalculator.fuelChargeCal(ValFuelCharge, start, end, units);
    var fuelRebateComp = NonResidentialCalculator.fuelRebateCal(valFuelRebate, start, end, units);
    var specialRebateComp = NonResidentialCalculator.specialRebateCal(valSpecialRebate, start, end, units);
    
    var basicCharge = sumcomp(basicChargeComp);
    var fuelCharge = sumcomp(fuelChargeComp);
    var fuelRebate = sumcomp(fuelRebateComp);
    var specialRebate = sumcomp(specialRebateComp);
    
    outputComponents(basicChargeComp, basicCharge);
    outputComponents(fuelChargeComp, fuelCharge);
    outputComponents(fuelRebateComp, fuelRebate);
    outputComponents(specialRebateComp, specialRebate);
    
    var finalComp = NonResidentialCalculator.finalOutputCal(basicCharge, fuelCharge, fuelRebate, specialRebate);
    addFinalRow(finalComp.Category, "", finalComp.Charge);
    
}



$(function () {

    // UI
    if (window.HKE.parameters.isEditMode) {
        $(".basicCharge, .fuelCharge, .fuelRebate, .specialRebate, .saveDiscount, .concessionary").show();
    } else {
        $(".basicCharge, .fuelCharge, .fuelRebate, .specialRebate, .saveDiscount, .concessionary ").hide();
    }

    $(".resultTable").hide();
    validateInput();
    
    // Retrieve
    retrieveTariffData();

    // Set Events
    if (!window.HKE.parameters.isEditMode) {

        // Input (numeric)
        $(".unitsInput").prop("maxlength", "8");
        $(".unitsInput").on("keypress", function (event) {
            numericHandler(event);
        });
        $(".unitsInput").change(function (event) {
            validateInput();
        });

        // Datepickers
        var from = $("#from").datepicker({
            dateFormat: "dd/mm/yy",
            yearRange: yearRange,
            minDate: defaultStartDate,
            maxDate: defaultEndDate,
            numberOfMonths: numberOfMonths
        });
        var to = $("#to").datepicker({
            dateFormat: "dd/mm/yy",
            yearRange: yearRange,
            numberOfMonths: numberOfMonths
        });

        $("#from").change(function () {

            fromSelectedDate = new Date(getDateValue("#from"));
            to.datepicker("option", "minDate", fromSelectedDate);

            fromfinishedDate = new Date(fromSelectedDate);
            fromfinishedDate.setDate(fromfinishedDate.getDate() + 33);

            if (fromfinishedDate.getFullYear() > today.getFullYear()) {
                to.datepicker("option", "maxDate", defaultEndDate);
            } else {
                to.datepicker("option", "maxDate", fromfinishedDate);
            }

            validateInput();

        });
        $("#to").change(function () {

            endDate = new Date(getDateValue("#to"));

            validateInput();

        });

        // actions
        $(".btnCalTariff").click(function () {
            
            $(".hke-billCalc-form").addClass("hke-billCalc-form-small");
            
            doCalculation();
            $(".resultTable").show();
            
        });

    }

});