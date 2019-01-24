// Output Data
var outputChargeData = {};

// Tariff Data
var valDemandChargeHigh = [];
var valDemandChargeLow = [];
var valBasicChargeHigh = [];
var valBasicChargeLow = [];
var ValFuelCharge = [];
var valSpecialFuelRebate = [];
var valSpecialRebate = [];


// Retrieve Tariff Data
function retrieveTariffData() {

    // Retrieve
    if (!window.HKE.parameters.isEditMode) {

        var url = datasrc;
        var sel = ".tariff-data";
        var dest = url + " " + sel;
        $('#tariff-data-placeholder').load(dest, function (responseTxt, statusTxt, xhr) {

            if (statusTxt == "success") {

                // Retrieve Max Demand
                valDemandChargeHigh = retrieveBasicCharge("#demandChargeHigh_md");
                valDemandChargeLow = retrieveBasicCharge("#demandChargeLow_md");
                valBasicChargeHigh = retrieveBasicCharge("#basicChargeHigh_md");
                valBasicChargeLow = retrieveBasicCharge("#basicChargeLow_md");

                // Retrieve Common
                ValFuelCharge = retrieveFuelCharge("#fuelCharge");
                valSpecialFuelRebate = retrieveRebate("#fuelRebate");
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
function captureKVA() {
    var kva = $(".kVAInput").val();
    return parseFloat(kva);
}
function captureKWH() {
    var kwh = $(".unitsInput").val();
    return parseFloat(kwh);
}
function captureStartDate() {
    return new Date(getDateValue("#from"));
}
function captureEndDate() {
    return new Date(getDateValue("#to"));
}

// Show Output
function addFirstRow(title1, title2) {
    
    var tableBody = $(".resultTable tbody");

    var row = $('<tr>').addClass('temp__Row').addClass('first__Row');
    var cell0 = $('<td>').append(title1);
    var cell2 = $('<td>').append(title2);
    
    cell0.attr("colspan", "2");
    cell2.attr("colspan", "2");
    row.append(cell0);
    row.append(cell2);
    
    tableBody.append(row);

}
function addSubHeaderRow(title) {
    
    var tableBody = $(".resultTable tbody");

    var row = $('<tr>').addClass('temp__Row').addClass('subHeader__Row');
    var cell0 = $('<td>').append(title);

    cell0.attr("colspan", "4");
    row.append(cell0);
    
    tableBody.append(row);
    
}
function addResultRow(text0, text1, text2, text3) {

    var tableBody = $(".resultTable tbody");

    var row = $('<tr>').addClass('temp__Row');
    var cell0 = $('<td>').append(text0);
    var cell1 = $('<td>').append(text1);
    var cell2 = $('<td>').append(text2);
    var cell3 = $('<td>').append(text3);

    row.append(cell0);
    row.append(cell1);
    row.append(cell2);
    row.append(cell3);

    tableBody.append(row);

}
function addSubtotalRow(text0, text1, text2, text3) {
    
    var tableBody = $(".resultTable tbody");
    
    var row = $('<tr>').addClass('temp__Row').addClass('subTotal__Row');
    var cell0 = $('<td>').append(text0);
    var cell1 = $('<td>').append(text1);
    var cell2 = $('<td>').append(text2);
    var cell3 = $('<td>').append(text3);
    
    row.append(cell0);
    row.append(cell1);
    row.append(cell2);
    row.append(cell3);
    
    tableBody.append(row);
    
}
function addFinalRow(text0, text1, text2, text3) {
    
    var tableBody = $(".resultTable tbody");

    var row = $('<tr>').addClass('temp__Row').addClass('final__Row');
    var cell0 = $('<td>').append(text0);
    var cell1 = $('<td>').append(text1);
    var cell2 = $('<td>').append(text2);
    var cell3 = $('<td>').append(text3);
    
    row.append(cell0);
    row.append(cell1);
    row.append(cell2);
    row.append(cell3);
    
    tableBody.append(row);
    
}
function outputComponents(hvComps, hvTotal, lvComps, lvTotal) {
    
    // Title
    addSubHeaderRow(hvComps[0].Category);
    
    // Rows
    var count = Math.max(hvComps.length, lvComps.length);
    for (var i = 0; i < count; i++) {

        var hv = hvComps[i];
        var text0 = "";
        var text1 = "";
        if (hv != null) {
            text0 = hv.Text2;
            text1 = getOutputTariff(hv.Charge);
        }
        
        var lv = lvComps[i];
        var text2 = "";
        var text3 = "";
        if (lv != null) {
            text2 = lv.Text2;
            text3 = getOutputTariff(lv.Charge);
        }
        
        addResultRow(text0, text1, text2, text3);

    }
    
    // Subtotal
    if (count > 1) {
        hvTotal = getOutputTariff(hvTotal);
        lvTotal = getOutputTariff(lvTotal);
        addSubtotalRow(SUB_TOTAL, hvTotal, SUB_TOTAL, lvTotal);
    }
    
}

// Calculate
function doCalculation() {
    
    removePreviousResult();
    
    var kva = captureKVA();
    var kwh = captureKWH();
    var start = captureStartDate();
    var end = captureEndDate();
    
    firstRow(HIGH_VOLTAGE, "", LOW_VOLTAGE, "");
    
    var hvDemandChargeComp = MaxDemandCalculator.demandChargeCal(valDemandChargeHigh, kva);
    var lvDemandChargeComp = MaxDemandCalculator.demandChargeCal(valDemandChargeLow, kva);
    var hvBasicChargeComp = MaxDemandCalculator.basicChargeCal(valBasicChargeHigh, kva, kwh);
    var lvBasicChargeComp = MaxDemandCalculator.basicChargeCal(valBasicChargeLow, kva, kwh);
    var fuelChargeComp = MaxDemandCalculator.fuelChargeCal(ValFuelCharge, start, end, kwh);
    var fuelRebateComp = MaxDemandCalculator.fuelRebateCal(valSpecialFuelRebate, start, end, kwh);
    var specialRebateComp = MaxDemandCalculator.specialRebateCal(valSpecialRebate, start, end, kwh);
    
    var hvDemandCharge = sumcomp(hvDemandChargeComp);
    var lvDemandCharge = sumcomp(lvDemandChargeComp);
    var hvBasicCharge = sumcomp(hvBasicChargeComp);
    var lvBasicCharge = sumcomp(lvBasicChargeComp);
    var fuelCharge = sumcomp(fuelChargeComp);
    var fuelRebate = sumcomp(fuelRebateComp);
    var specialRebate = sumcomp(specialRebateComp);
    
    outputComponents(hvDemandChargeComp, hvDemandCharge, lvDemandChargeComp, lvDemandCharge);
    outputComponents(hvBasicChargeComp, hvBasicCharge, lvBasicChargeComp, lvBasicCharge);
    outputComponents(fuelChargeComp, fuelCharge, fuelChargeComp, fuelCharge);
    outputComponents(fuelRebateComp, fuelRebate, fuelRebateComp, fuelRebate);
    outputComponents(specialRebateComp, specialRebate, specialRebateComp, specialRebate);
    
    var hvFinalComp = MaxDemandCalculator.finalOutputCal(hvDemandCharge, hvBasicCharge, fuelCharge, fuelRebate, specialRebate);
    var lvFinalComp = MaxDemandCalculator.finalOutputCal(lvDemandCharge, lvBasicCharge, fuelCharge, fuelRebate, specialRebate);
    
    addFinalRow(hvFinalComp.Category, hvFinalComp.Charge, lvFinalComp.Category, lvFinalComp.Charge);
    
}

// Main
$(function () {


    // UI
    if (window.HKE.parameters.isEditMode) {
        $(".demandChargeHigh, .demandChargeLow, .basicChargeHigh, .basicChargeLow, .fuelCharge, .fuelRebate, .specialRebate, .saveDiscount, .concessionary").show();
    } else {
        $(".demandChargeHigh, .demandChargeLow, .basicChargeHigh, .basicChargeLow, .fuelCharge, .fuelRebate, .specialRebate, .saveDiscount, .concessionary ").hide();
    }

    $(".resultTable,.inputNetRate,.netRate").hide();


    // Retrieve
    retrieveTariffData();


    // Events
    if (!window.HKE.parameters.isEditMode) {

        // Input (numeric)
        $(".unitsInput").prop("maxlength", "8");
        $(".unitsInput").on("keypress", function (event) {
            numericHandler(event, $(this).val());
        });
        $(".kVAInput").prop("maxlength", "8");
        $(".kVAInput").on("keypress", function (event) {
            numericHandler(event, $(this).val(), 1);
        });

        // Datepickers - Init
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

        // Datepickers - Events
        $("#from").change(function () {

            fromSelectedDate = new Date(getDateValue(this));
            to.datepicker("option", "minDate", getDateValue(this));

            fromfinishedDate = new Date(fromSelectedDate);
            fromfinishedDate.setDate(fromfinishedDate.getDate() + 33);

            if (fromfinishedDate.getFullYear() > today.getFullYear()) {
                to.datepicker("option", "maxDate", defaultEndDate);
            } else {
                to.datepicker("option", "maxDate", fromfinishedDate);
            }

        });
        $("#to").change(function () {
            endDate = new Date(getDateValue(this));
        });

        // Net Rate Dropdown
        $(".ySelector").change(function () {
            var r = $(".ySelector :selected").text();
            sYear = r;
            netRateCal();
        });
        $(".mSelector").change(function () {
            var r = $(".mSelector :selected").text();
            sMonth = r;
            netRateCal();
        });

        // toggle
        $("#labelNetRate").click(function () {

            toggleTriggered("#labelNetRate");

            $(".inputNetRate").show();
            $(".inputMD, .btnCalTariff, .resultTable").hide();

            netRateCal();
            $(".netRate").show();

        });
        $("#labellowhiVol").click(function () {

            toggleTriggered("#labellowhiVol");

            $(".inputNetRate, .netRate").hide();
            $(".inputMD, .btnCalTariff").show();

        });

        // actions
        $(".btnCalTariff").click(function () {

            $(".hke-billCalc-form").addClass("hke-billCalc-form-small");
            
            doCalculation();
            $(".resultTable").show();

        });

        /*
        $( ".btnCalNetrate" ).click( function () {
            $( ".hke-billCalc-form" ).addClass( "hke-billCalc-form-small" );
            removePreviousResult();
            netRateCal();
            $( ".netRate" ).show();
        } );
        */


    }

})