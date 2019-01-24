// Tariff Data
var valBasicCharge = [];
var ValFuelCharge = [];
var valFuelRebate = [];
var valSpecialRebate = [];
var valSaveDiscount = [];
var valConcessionary = [];

// Retrieve Data
function retrieveTariffData() {
    
    if (!window.HKE.parameters.isEditMode) {

        var url = datasrc;
        var sel = ".tariff-data";
        var dest = url + " " + sel;
        $('#tariff-data-placeholder').load(dest, function (responseTxt, statusTxt, xhr) {

            if (statusTxt == "success") {

                // Retrieve
                valBasicCharge = retrieveBasicCharge("#basicCharge_r");
                ValFuelCharge = retrieveFuelCharge("#fuelCharge");
                valFuelRebate = retrieveRebate("#fuelRebate");
                valSpecialRebate = retrieveRebate("#specialRebate");
                valSaveDiscount = retrieveSaveDiscount("#saveDiscount");
                valConcessionary = retrieveConcessionary("#concessionaryDiscount");

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
function isOrdinary() {
    return $("#ordinary").hasClass("hke-billCalc-toggle-selected");
}
function isConcessionary() {
    return $("#concessionary").hasClass("hke-billCalc-toggle-selected");
}

// Validate Input
function validateInput() {

    var valid = true;

    valid = (isOrdinary() || isConcessionary());
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
    var lastTitle = "";
    var count = comps.length;
    
    // Rows
    for (var i = 0; i < count; i++) {

        var comp = comps[i];
        
        if (lastTitle != comp.Category) {
            lastTitle = comp.Category;
            addSubHeaderRow(comp.Category);
        }
        
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
    
    var calculator = new ResidentialCalculator(valBasicCharge, ValFuelCharge, valFuelRebate, valSpecialRebate, valSaveDiscount, valConcessionary);
    
    var basicChargeComp = calculator.basicChargeCal(units);
    var fuelChargeComp = calculator.fuelChargeCal(start, end, units);
    var fuelRebateComp = calculator.fuelRebateCal(start, end, units);
    var specialRebateComp = calculator.specialRebateCal(start, end, units);
    
    var basicCharge = sumcomp(basicChargeComp);
    var fuelCharge = sumcomp(fuelChargeComp);
    var fuelRebate = sumcomp(fuelRebateComp);
    var specialRebate = sumcomp(specialRebateComp);
    
    var discountComp = calculator.discountCal(isConcessionary(), start, end, units, basicCharge, fuelCharge, fuelRebate, specialRebate);
    var discount = sumcomp(discountComp);
    
    outputComponents(basicChargeComp, basicCharge);
    outputComponents(fuelChargeComp, fuelCharge);
    outputComponents(fuelRebateComp, fuelRebate);
    outputComponents(specialRebateComp, specialRebate);
    outputComponents(discountComp, discount);
    
    var finalComp = calculator.finalOutputCal(basicCharge, fuelCharge, fuelRebate, specialRebate, discount);
    addFinalRow(finalComp.Category, "", finalComp.Charge);
    
}

$(function () {
    
    // UI
    if (window.HKE.parameters.isEditMode) {
        $(".basicCharge, .fuelCharge, .fuelRebate, .specialRebate, .saveDiscount, .concessionary").show();
    } else {
        $(".basicCharge, .fuelCharge, .fuelRebate, .specialRebate, .saveDiscount, .concessionary ").hide();
    }

    validateInput();
    $(".resultTable").hide();
    
    // Retrieve Data
    retrieveTariffData();

    // Events
    if (!window.HKE.parameters.isEditMode) {

        // toggles
        $(".ordinary").click(function () {
            toggleTriggered(".ordinary");
            validateInput();
        });
        $(".checkTarScheme").click(function () {
            toggleTriggered(".checkTarScheme");
            validateInput();
        });

        // Default toggle
        toggleTriggered(".ordinary");

        // Input (numeric)
        $(".unitsInput").prop("maxlength", "8");
        $(".unitsInput").on("keypress", function (event) {
            numericHandler(event, $(this).val());
        });
        $(".unitsInput").on("keyup", function (event) {
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