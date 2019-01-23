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

            }
            else if (statusTxt == "error") {
                console.log("Error: " + xhr.status + ": " + xhr.statusText);
            }

        });

    }

}


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


    // Set DefaultEndDate upon Fuel Charge Data
    defaultEndDate = getDefaultEndDate(ValFuelCharge);


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
            removePreviousResult();

            capVal();
            calDaysOfEachMonth();
            calTotalDays();

            demandChargeCalculator(kVA)
            basicChargeCalculator(consumptionUnits);
            fuelCostAdjustmentCalculator();
            specialFuelRebateCalculator();
            specialRebateCalculator();
            finalOutputCalculator();

            buildResultRow();
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