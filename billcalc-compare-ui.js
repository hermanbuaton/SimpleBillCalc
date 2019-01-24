// Tariff Data
var valMDDemandChargeHigh = [];
var valMDDemandChargeLow = [];
var valMDBasicChargeHigh = [];
var valMDBasicChargeLow = [];
var valNRBasicCharge = [];
var ValFuelCharge = [];
var valSpecialFuelRebate = [];
var valSpecialRebate = [];

// Retrieve Data
function retrieveTariffData() {
    
    if (!window.HKE.parameters.isEditMode) {

        var url = datasrc;
        var sel = ".tariff-data";
        var dest = url + " " + sel;
        $('#tariff-data-placeholder').load(dest, function (responseTxt, statusTxt, xhr) {

            if (statusTxt == "success") {

                // Retrieve Non-Residential
                valNRBasicCharge = retrieveBasicCharge("#basicCharge_nr");

                // Retrieve Max Demand
                valMDDemandChargeHigh = retrieveBasicCharge("#demandChargeHigh_md");
                valMDDemandChargeLow = retrieveBasicCharge("#demandChargeLow_md");
                valMDBasicChargeHigh = retrieveBasicCharge("#basicChargeHigh_md");
                valMDBasicChargeLow = retrieveBasicCharge("#basicChargeLow_md");

                // Retrieve Common
                ValFuelCharge = retrieveFuelCharge("#fuelCharge");
                valSpecialFuelRebate = retrieveRebate("#fuelRebate");
                valSpecialRebate = retrieveRebate("#specialRebate");

                // Set Default End Date
                defaultEndDate = getDefaultEndDate(ValFuelCharge);

            }
            else if (statusTxt == "error") {
                console.log("Error: " + xhr.status + ": " + xhr.statusText);
            }

        });

    }
    
}

// Get Input
function isHVMaxDemand() {
    return $(".hv").hasClass("hke-billCalc-toggle-selected");
}
function isLVMaxDemand() {
    return $(".lv").hasClass("hke-billCalc-toggle-selected");
}
function captureKWH() {
    var kwh = $(".unitsInput_c").val();
    return parseFloat(kwh);
}
function captureKVA() {
    var kva = $(".kVAInput_c").val();
    return parseFloat(kva);
}
function captureStartDate() {
    return new Date(getDateValue("#from_c"));
}
function captureEndDate() {
    return new Date(getDateValue("#to_c"));
}

// Validate Input
function validateInput() {
    
    var valid = true;

    valid = (valid && captureKWH() != "" && captureKWH() != null);
    valid = (valid && captureKVA() != "" && captureKVA() != null);
    valid = (valid && captureStartDate().getFullYear() >= 2000);
    valid = (valid && captureEndDate().getFullYear() >= 2000);

    $(".btnCalTariff_c").attr("disabled", !valid);
    return valid;
    
}

// Show output
function removePreviousResult_c() {
    $(".compare__Row").remove();
    $(".compare__Row_remove").remove();
}
function addFirstRow2(kva, kwh) {
    
    var tbody = $(".compareResult .intro_c");
    var row = $('<tr>').addClass('compare__Row');
    
    var title = (isHVMaxDemand()) ? HIGH_VOLTAGE : LOW_VOLTAGE;
    var content = COMPARE_INTRO_S + kva + COMPARE_INTRO_M + kwh + COMPARE_INTRO_E;
    
    var cell0 = $('<th>').append(title);
    var cell1 = $('<th>').append(content);
    
    row.append(cell0);
    row.append(cell1);
    tbody.append(row);
    
}
function addResultRow2(mdOutput, nrOutput) {
    
    // display content of result table
    var tbody_content = $(".compareResult .content_c");
    var row_content = $('<tr>').addClass('compare__Row');
    
    var cell_content0, cell_content1, cell_content2;
    mdOutput = parseFloat(mdOutput);
    nrOutput = parseFloat(nrOutput);
    
    if (isLVMaxDemand()) {
        
        var md = getOutputTariff(mdOutput);
        var nr = getOutputTariff(nrOutput);
        
        cell_content0 = $('<td>').append(COMPARE_BILLBY_MD + md);
        cell_content1 = $('<td>').append(COMPARE_BILLBY_NR + nr);
        
        if (mdOutput == nrOutput) {
            cell_content1.addClass('.compare__Row_remove');
        } else if (mdOutput < nrOutput) {
            var diff = (nrOutput - mdOutput);
            cell_content2 = $('<td>').append(COMPARE_SAVING + getOutputTariff(diff));
        } else if (mdOutput > nrOutput) {
            var diff = (mdOutput - nrOutput);
            cell_content2 = $('<td>').append(COMPARE_EXTRA + getOutputTariff(diff));
        }

    } else if (isHVMaxDemand()) {
        
        var output = getOutputTariff(mdOutput);
        
        cell_content0 = $('<td>').append(COMPARE_BILLBY_MD + output);
        cell_content1 = $('<td>').addClass('.compare__Row_remove');
        cell_content2 = $('<td>').addClass('.compare__Row_remove');
        
    }

    row_content.append(cell_content0);
    row_content.append(cell_content1);
    row_content.append(cell_content2);
    tbody_content.append(row_content);
    
}

// Calculate
function doCalculation() {
    
    removePreviousResult_c();
    
    var mdBasicCharge, mdDemandCharge;
    if (isHVMaxDemand()) {
        valMDBasicCharge = valMDBasicChargeHigh;
        valMDDemandCharge = valMDDemandChargeHigh;
    } else if (isLVMaxDemand()) {
        valMDBasicCharge = valMDBasicChargeLow;
        valMDDemandCharge = valMDDemandChargeLow;
    }
    
    var kwh = captureKWH();
    var kva = captureKVA();
    var start = captureStartDate();
    var end = captureEndDate();
    
    var mdDemandChargeComp = MaxDemandCalculator.demandChargeCal(valMDDemandCharge, kva);
    var mdBasicChargeComp = MaxDemandCalculator.basicChargeCal(valMDBasicCharge, kva, kwh);
    var mdDemandCharge = sumcomp(mdDemandChargeComp);
    var mdBasicCharge = sumcomp(mdBasicChargeComp);
    
    var nrBasicChargeComp = NonResidentialCalculator.basicChargeCal(valNRBasicCharge, kwh);
    var nrBasicCharge = sumcomp(nrBasicChargeComp);
    
    var fuelChargeComp = NonResidentialCalculator.fuelChargeCal(ValFuelCharge, start, end, kwh);
    var fuelRebateComp = NonResidentialCalculator.fuelRebateCal(valSpecialFuelRebate, start, end, kwh);
    var specialRebateComp = NonResidentialCalculator.specialRebateCal(valSpecialRebate, start, end, kwh);
    var fuelCharge = sumcomp(fuelChargeComp);
    var fuelRebate = sumcomp(fuelRebateComp);
    var specialRebate = sumcomp(specialRebateComp);
    
    var mdFinalComp = MaxDemandCalculator.finalOutputCal(mdDemandCharge, mdBasicCharge, fuelCharge, fuelRebate, specialRebate);
    var nrFinalComp = NonResidentialCalculator.finalOutputCal(nrBasicCharge, fuelCharge, fuelRebate, specialRebate);
    
    addFirstRow2(kva, kwh);
    addResultRow2(mdFinalComp.Charge, nrFinalComp.Charge);
    
}

$(function () {

    // Retrieve Data
    retrieveTariffData();

    if (!window.HKE.parameters.isEditMode) {
        
        // Toggles
        $(".lv").click(function () {
            isSelected = "lv";//have to place on top
            toggleTriggered("#labelLowVol");
        });
        $(".hv").click(function () {
            isSelected = "hv";//have to place on top
            toggleTriggered("#labelHighVol");
        })
        
        // Input (numeric)
        $(".unitsInput_c").prop("maxlength", "8");
        $(".unitsInput_c").on("keypress", function (event) {
            numericHandler(event, $(this).val());
        });
        $(".unitsInput_c").on("keyup", function (event) {
            validateInput();
        });
        
        $(".kVAInput_c").prop("maxlength", "8");
        $(".kVAInput_c").on("keypress", function (event) {
            numericHandler(event, $(this).val(), 1);
        });
        $(".kVAInput_c").on("keyup", function (event) {
            validateInput();
        });
        
        // Datepickers
        var from = $("#from_c").datepicker({
            dateFormat: "dd/mm/yy",
            yearRange: yearRange,
            minDate: defaultStartDate,
            maxDate: defaultEndDate,
            numberOfMonths: numberOfMonths
        });
        var to = $("#to_c").datepicker({
            dateFormat: "dd/mm/yy",
            yearRange: yearRange,
            numberOfMonths: numberOfMonths
        });

        $("#from_c").change(function () {

            fromSelectedDate = new Date(getDateValue("#from_c"));
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
        $("#to_c").change(function () {
            endDate = new Date(getDateValue("#to_c"));
            validateInput();
        });

        $(".btnCalTariff_c").click(function () {
            
            $(".hke-billCalc-form").addClass("hke-billCalc-form-small");
            
            doCalculation();
            $(".compareResult").show();
            
        })
    }

});