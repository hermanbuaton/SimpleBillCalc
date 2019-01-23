var isSelected = "";

function captureUnit_c() {
    var consumptionUnits = $(".unitsInput_c").val();
    return parseFloat(consumptionUnits);

}


function captureKVA_c() {

    var kVA = $(".kVAInput_c").val();
    return parseFloat(kVA);
}


$(function () {

    if (!window.HKE.parameters.isEditMode) {

        var url = "/en/customer-services/billing-payment-electricity-tariffs/charge-table";
        var sel = ".tariff-data";
        var dest = url + " " + sel;
        $('#tariff-data-nonresidential').load(dest, function (responseTxt, statusTxt, xhr) {

            if (statusTxt == "success") {

                // Retrieve Non-Residential
                valBasicCharge = retrieveBasicCharge("#basicCharge_nr");

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

    if (!window.HKE.parameters.isEditMode) {

        // Input (numeric)
        $(".unitsInput_c").prop("maxlength", "8");
        $(".unitsInput_c").on("keypress", function (event) {
            numericHandler(event, $(this).val());
        });


        $(".kVAInput_c").prop("maxlength", "8");
        $(".kVAInput_c").on("keypress", function (event) {
            numericHandler(event, $(this).val(), 1);
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

            //validateInput();

        });
        $("#to_c").change(function () {

            endDate = new Date(getDateValue("#to_c"));

            // validateInput();

        });


        $(".lv").click(function () {
            isSelected = "lv";//have to place on top
            toggleTriggered("#labelLowVol");


        })


        $(".hv").click(function () {
            isSelected = "hv";//have to place on top
            toggleTriggered("#labelHighVol");


        })

        $(".btnCalTariff_c").click(function () {
            calculate_c();
            displayOutput_c();
        })
    }

})




function md_output_c() {
    if (isSelected == "hv") {
        var result = basicChargeTariffHi + demandChargeTariffHi;
        return result;

    } else if (isSelected == "lv") {
        var result = basicChargeTariffLow + demandChargeTariffLow;
        return result;
    }
}


function nr_output_c() {

    var result = basicChargeTariff
    return result;

}


function removePreviousResult_c() {
    $(".compare__Row").remove();
    $(".compare__Row_remove").remove();
}





function calculate_c() {
    removePreviousResult_c();
    $(".hke-billCalc-form").addClass("hke-billCalc-form-small");

    //max-demand

    MDdemandChargeCalculator(captureKVA_c());
    MDbasicChargeCalculator(captureUnit_c());

    //non-residential
    basicChargeCalculator(captureUnit_c());

}



function displayOutput_c() {
    //display introduction of result table
    var tbody_intro = $(".compareResult .intro_c");
    var row_intro = $('<tr>').addClass('compare__Row');
    if (isSelected == "lv") {
        var cell_intro0 = $('<th>').append(LOW_VOLTAGE);
    } else if (isSelected == "hv") {
        var cell_intro0 = $('<th>').append(HIGH_VOLTAGE);
    }
    var cell_intro1 = $('<th>').append(COMPARE_INTRO_S + captureKVA_c() + COMPARE_INTRO_M + captureUnit_c() + COMPARE_INTRO_E);

    row_intro.append(cell_intro0);
    row_intro.append(cell_intro1);
    tbody_intro.append(row_intro);


    //display content of result table
    var tbody_content = $(".compareResult .content_c");
    var row_content = $('<tr>').addClass('compare__Row');
    if (isSelected == "lv") {
        var cell_content0 = $('<tr>').append(COMPARE_BILLBY_MD + md_output_c());
        var cell_content1 = $('<tr>').append(COMPARE_BILLBY_NR + nr_output_c());

        if (md_output_c() < nr_output_c()) {
            var cell_content2 = $('<tr>').append(COMPARE_SAVING + (nr_output_c() - md_output_c()));
        } else if (md_output_c() > nr_output_c()) {
            var cell_content2 = $('<tr>').append(COMPARE_EXTRA + (md_output_c() - nr_output_c()));
        } else if (md_output_c() == nr_output_c()) {
            cell_content1.addClass('.compare__Row_remove');
        }

    } else if (isSelected == "hv") {
        cell_content0 = $('<tr>').append(COMPARE_BILLBY_MD + md_output_c());
        cell_content1.addClass('.compare__Row_remove');
        cell_content2.addClass('.compare__Row_remove');
    }

    row_content.append(cell_content0);
    row_content.append(cell_content1);
    row_content.append(cell_content2);
    tbody_content.append(row_content);




}