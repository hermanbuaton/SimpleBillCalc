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
    if (!window.HKE.parameters.isEditMode) {

        var url = datasrc;
        var sel = ".tariff-data";
        var dest = url + " " + sel;
        $('#tariff-data-placeholder').load(dest, function (responseTxt, statusTxt, xhr) {

            if (statusTxt == "success") {

                // Retrieve Data
                valBasicCharge = retrieveBasicCharge("#basicCharge_nr");
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
            doCalc();
        });

    }

});