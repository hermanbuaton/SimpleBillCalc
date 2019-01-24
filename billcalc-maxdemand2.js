const KVA = "kVA";

//const dateFormat = "dd/mm/yy";
//const numberOfMonths = 2;
//const oneDay = 24 * 60 * 60 * 1000;

//var dateValue; //use for getDateValue function
//var fromSelectedDate;
//var fromfinishedDate;
//var today = new Date();
//if (today.getFullYear() < 2019)
//    today = new Date(2019, 1 - 1, 1);
//var defaultStartDate = new Date(today.getFullYear(), 1 - 1, 1);
//var defaultEndDate = new Date(today.getFullYear(), 12 - 1, 31);
//var yearRange = today.getFullYear() + ':' + today.getFullYear();
//var endDate;
//var daysOfEachMonth = [];
//var totalDays = 0;

var sYear;
var sMonth = 1;
//var tempRow1;
var row0;
var row1;
var row2;
var row3;
var row4;
var finalRow;

var kVA = 0.0;
var consumptionUnits = 0.0;
var basicChargeTariffHi = 0.0;
var basicChargeTariffLow = 0.0;
var demandChargeTariffHi = 0.0;
var demandChargeTariffLow = 0.0;
var fuelCostAjustmentFee = 0.0;
var specialFuelRebate = 0.0;
var specialRebate = 0.0;


function netRateAddRow(text0, text1, text2, method) {


    var tableBody = $(".netRate tbody");
    var type = method;

    var row = $('<tr>').addClass('netRate__Row');
    if (type == 3) {
        row = $('<tr>').addClass('netRate__Row').addClass('subTotal__Row');
    } else if (type == 4) {
        row = $('<tr>').addClass('netRate__Row').addClass('subHeader__Row');
    }


    var cell0 = $('<td>').append(text0);
    var cell1 = $('<td>').append(text1);
    var cell2 = $('<td>').append(text2);



    row.append(cell0);
    row.append(cell1);
    row.append(cell2);
    /*
    if ( type == 5 ) {
        cell1.attr( "colspan", "2" );
        row.append( cell0 );
        row.append( cell1 );
    }
    */
    tableBody.append(row);


}
function netRateCal() {

    var text0, text1, text2;
    var tempNetRate = 0.0;
    var first200LowVol = 0.0;
    var first200HighVol = 0.0;
    var otherLowVol = 0.0;
    var otherHighVol = 0.0;

    removePreviousResult();

    text0 = "Energy Charge (cents/unit) (Monthly consumption)";
    text1 = "Low Voltage";
    text2 = "High Voltage";
    netRateAddRow(text0, text1, text2, 4);

    text0 = "For each of the first 200 units supplied per month per kVA of maximum demand in the month (subject to a minimum of 100 kVA)";
    text1 = "";
    text2 = "";
    netRateAddRow(text0, text1, text2, 5);

    for (var i = 0; i < valBasicChargeLow.length - 1; i++) {
        text0 = BASIC_CHARGE;
        text1 = valBasicChargeLow[i].Charge;
        first200LowVol += text1;
        text2 = valBasicChargeHigh[i].Charge;
        first200HighVol += text2;
        netRateAddRow(text0, text1, text2, "");
    }

    text0 = FUEL_CHARGE;
    text1 = ValFuelCharge[sMonth - 1].Charge;
    first200LowVol += text1;
    text2 = ValFuelCharge[sMonth - 1].Charge;
    first200HighVol += text2;
    netRateAddRow(text0, text1, text2, "");



    for (var i = 0; i < valSpecialFuelRebate.length; i++) {
        text0 = FUEL_REBATE;
        text1 = valSpecialFuelRebate[i].Rebate;
        first200LowVol -= text1;
        text2 = valSpecialFuelRebate[i].Rebate;
        first200HighVol -= text2;
        netRateAddRow(text0, text1, text2, "");
    }

    for (var i = 0; i < valSpecialRebate.length; i++) {
        text0 = SPECIAL_REBATE;
        text1 = valSpecialRebate[i].Rebate;
        first200LowVol -= text1;
        text2 = valSpecialRebate[i].Rebate;
        first200HighVol -= text2;
        netRateAddRow(text0, text1, text2, "");
    }

    first200LowVol = first200LowVol.toFixed(3);
    first200HighVol = first200HighVol.toFixed(3);
    netRateAddRow(NET_Rate, first200LowVol, first200HighVol, 3);

    text0 = "For each additional unit supplied in the month";
    text1 = "";
    text2 = "";
    netRateAddRow(text0, text1, text2, 2);

    for (var i = 0; i < valBasicChargeLow.length; i++) {
        if (i = valBasicChargeLow.length - 1) {
            text0 = BASIC_CHARGE;
            text1 = valBasicChargeLow[i].Charge;
            otherLowVol += text1;
            text2 = valBasicChargeHigh[i].Charge;
            otherHighVol += text2;
            netRateAddRow(text0, text1, text2, 5);
        }
    }

    text0 = FUEL_CHARGE;
    text1 = ValFuelCharge[sMonth - 1].Charge;
    otherLowVol += text1;
    text2 = ValFuelCharge[sMonth - 1].Charge;
    otherHighVol += text2;
    netRateAddRow(text0, text1, text2, "");

    for (var i = 0; i < valSpecialFuelRebate.length; i++) {

        text0 = FUEL_REBATE;
        text1 = valSpecialFuelRebate[i].Rebate;
        otherLowVol -= text1;
        text2 = valSpecialFuelRebate[i].Rebate;
        otherHighVol -= text2;
        netRateAddRow(text0, text1, text2, "");

    }

    for (var i = 0; i < valSpecialRebate.length; i++) {

        text0 = SPECIAL_REBATE;
        text1 = valSpecialRebate[i].Rebate;
        otherLowVol -= text1;
        text2 = valSpecialRebate[i].Rebate;
        otherHighVol -= text2;
        netRateAddRow(text0, text1, text2, "");

    }

    otherLowVol = otherLowVol.toFixed(3);
    otherHighVol = otherHighVol.toFixed(3);
    netRateAddRow(NET_Rate, otherLowVol, otherHighVol, 3);

}


function firstRow(text0, text1, text2, text3) {
    var tableBody = $(".resultTable tbody");

    var row = $('<tr>').addClass('temp__Row').addClass('first__Row');
    var cell0 = $('<td>').append(text0);
    var cell1 = $('<td>').append(text1);
    var cell2 = $('<td>').append(text2);
    var cell3 = $('<td>').append(text3);

    cell0.attr("colspan", "2");
    cell2.attr("colspan", "2");
    row.append(cell0);

    row.append(cell2);



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
function addSubHeaderRow(text0, text1, text2, text3) {


    var tableBody = $(".resultTable tbody");

    var row = $('<tr>').addClass('temp__Row').addClass('subHeader__Row');
    var cell0 = $('<td>').append(text0);
    var cell1 = $('<td>').append(text1);
    var cell2 = $('<td>').append(text2);
    var cell3 = $('<td>').append(text3);

    cell0.attr("colspan", "3");

    row.append(cell0);
    row.append(cell3);
    tableBody.append(row);

}

function removePreviousResult() {
    $(".temp__Row").remove();
    $(".netRate__Row").remove();
}



class MaxDemandCalculator {
    
    static demandChargeCal(tariffComps, kva) {

        // Init
        var chargeComps = [];

        var remainUnits = kva;
        if (remainUnits <= 100) {
            remainUnits = 100;
        }

        // calculate
        for (var i = 0; i < tariffComps.length; i++) {

            var charge = tariffComps[i].Charge;
            var block = tariffComps[i].Block;

            var partialUnits = 0;
            if (block == 0) {
                partialUnits = remainUnits;
                remainUnits -= remainUnits;
            } else if (remainUnits <= block) {
                partialUnits = remainUnits;
                remainUnits -= remainUnits;
            } else if (remainUnits > block) {
                partialUnits = block;
                remainUnits -= block;
            }

            var partialCharge = round((partialUnits * charge), 2);

            var unitStr = getOutputUnits(partialUnits);
            var tariffStr = getOutputTariff(charge);
            var comp = {
                Category: DEMAND_CHARGE,
                Text1: "",
                Text2: unitStr + " x " + tariffStr,
                Charge: partialCharge
            }
            chargeComps.push(comp);

            if (remainUnits <= 0) {
                break;
            }

        } //end of FOR LOOP

        return chargeComps;

    }
    static basicChargeCal(tariffComps, kva, kwh) {

        // Init
        var chargeComps = [];

        var remainUnits = kwh;
        var kVolAmp = kva;
        if (kVolAmp <= 100) {
            kVolAmp = 100;
        }

        // calculate
        for (var i = 0; i < tariffComps.length; i++) {

            var charge = tariffComps[i].Charge;
            var block = tariffComps[i].Block;

            var counter = kVolAmp * block;

            var partialUnits = 0;
            if (block == 0) {
                partialUnits = remainUnits;
                remainUnits -= remainUnits;
            } else if (remainUnits < counter) {
                partialUnits = remainUnits;
                remainUnits -= remainUnits;
            } else if (remainUnits >= counter) {
                partialUnits = counter;
                remainUnits -= counter;
            }

            var partialCharge = round((partialUnits * charge), 2);

            var unitStr = getOutputUnits(partialUnits);
            var tariffStr = getOutputTariff(charge);
            var comp = {
                Category: BASIC_CHARGE,
                Text1: "",
                Text2: unitStr + " x " + tariffStr,
                Charge: partialCharge
            }
            chargeComps.push(comp);

            if (remainUnits <= 0) {
                break;
            }

        }

        return chargeComps;

    }
    static fuelChargeCal(tariffComps, startDate, endDate, kwh) {

        var chargeComps = [];

        var intervals = process2(tariffComps, startDate, endDate, kwh);
        for (var k = 0; k < intervals.length; k++) {

            var consumption = intervals[k].consumption;
            var charge = intervals[k].charge;

            var partialCharge = consumption * charge;
            partialCharge = round(partialCharge, 2);

            var dateRng = getOutputDate(intervals[k].start) + " - " + getOutputDate(intervals[k].end);
            var unitStr = getOutputUnits(consumption);
            var tariffStr = getOutputTariff(charge);

            var component = {
                Category: FUEL_CHARGE,
                Text1: dateRng,
                Text2: unitStr + " x " + tariffStr,
                Charge: partialCharge
            }
            chargeComps.push(component);

        } // end of FOR LOOP

        return chargeComps;

    }
    static fuelRebateCal(tariffComps, startDate, endDate, kwh) {

        var chargeComps = [];

        var year = startDate.getFullYear();
        var rebate = getComponentByYear(tariffComps, year);
        var consumption = kwh;

        var partialRebate = consumption * rebate.Rebate * -1;
        partialRebate = round(partialRebate, 2);

        var unitStr = getOutputUnits(consumption);
        var tariffStr = getOutputTariff(rebate.Rebate * -1);

        var component = {
            Category: FUEL_REBATE,
            Text1: "",
            Text2: unitStr + " x " + tariffStr,
            Charge: partialRebate
        }
        chargeComps.push(component);

        return chargeComps;

    }
    static specialRebateCal(tariffComps, startDate, endDate, kwh) {

        var chargeComps = [];

        var year = startDate.getFullYear();
        var rebate = getComponentByYear(tariffComps, year);
        var consumption = kwh;

        var partialRebate = consumption * rebate.Rebate * -1;
        partialRebate = round(partialRebate, 2);

        var unitStr = getOutputUnits(consumption);
        var tariffStr = getOutputTariff(rebate.Rebate * -1);

        var component = {
            Category: SPECIAL_REBATE,
            Text1: "",
            Text2: unitStr + " x " + tariffStr,
            Charge: partialRebate
        }
        chargeComps.push(component);

        return chargeComps;

    }

    static finalOutputCal(demandCharge, basicCharge, fuelCharge, fuelRebate, specialRebate) {

        var final = (basicCharge + demandCharge + fuelCharge + fuelRebate + specialRebate);
        final = round(final, 2);

        var isMinCharge = (final < 14.9);
        if (isMinCharge) {
            final = 14.9;
        }

        var title = (isMinCharge) ? MIN_CHARGE : TOTAL_AMT;
        var chargeStr = getOutputTariff(final);

        var component = {
            Category: title,
            Text1: "",
            Text2: "",
            Charge: chargeStr
        }
        return component;

    }
    
}