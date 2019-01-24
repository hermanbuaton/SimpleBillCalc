//var tempRow1;
var row0;
var row1;
var row2;
var row3;
var row4;
var finalRow;
var schemeChecker = false;

var consumptionUnits = 0.0;
var basicChargeTariff = 0.0;
var fuelCostAjustmentFee = 0.0;
var specialFuelRebate = 0.0;
var specialRebate = 0.0;
var allDiscount = 0.0;
//var saveDiscount = 0.0;
//var concessioary = 0.0;
var finalOutput = 0.0;

var valBasicCharge = [];
var ValFuelCharge = [];
var valSpecialFuelRebate = [];
var valSpecialRebate = [];
var valSaveDiscount = [];
var valConcessionary = [];

var compBasicCharge = [];
var compFuelCharge = [];
var compSpecialFuelRebate = [];
var compSpecialRebate = [];
var compSaveDiscount = [];
var compConcessionary = [];



function capUnitsVal() {
    consumptionUnits = $(".unitsInput").val();
    return consumptionUnits;
}

function getStartDate() {
    return new Date(getDateValue("#from"));
}
function getEndDate() {
    return new Date(getDateValue("#to"));
}

function validateInput() {

    var valid = true;

    valid = (valid && capUnitsVal() != "" && capUnitsVal() != null);
    valid = (valid && getStartDate().getFullYear() >= 2000);
    valid = (valid && getEndDate().getFullYear() >= 2000);

    $(".btnCalTariff").attr("disabled", !valid);
    return valid;

}

function addRow(rowClass, text0, text1, text2, text3) {

    var tableBody = $(".resultTable tbody");

    if (text0 != "") {

        var row = $('<tr>').addClass('temp__Row').addClass('subHeader__Row');
        var cell0 = $('<td>').append(text0);
        var cell1 = $('<td>');
        var cell2 = $('<td>');

        row.append(cell0);
        row.append(cell1);
        row.append(cell2);
        tableBody.append(row);

    }

    var row = $('<tr>').addClass('temp__Row').addClass(rowClass);
    // var cell0 = $('<td>').append(text0);
    var cell1 = $('<td>').append(text1);
    var cell2 = $('<td>').append(text2);
    var cell3 = $('<td>').append(text3);

    // row.append(cell0);
    row.append(cell1);
    row.append(cell2);
    row.append(cell3);

    tableBody.append(row);

}
function addResultRow(text0, text1, text2, text3) {
    addRow("", text0, text1, text2, text3);
}
function addSubtotalRow(text0, text1, text2, text3) {
    addRow("subTotal__Row", text0, text1, text2, text3);
}
function removePreviousResult() {
    $(".temp__Row").remove();
}

function sumcomp(components) {

    var total = 0.0;
    for (var i = 0; i < components.length; i++) {
        var comp = parseFloat(components[i].Charge);
        total += comp;
    }

    total = round(total, 2);
    return total;

}
function output(components) {

    var lastTitle = "";
    for (var i = 0; i < components.length; i++) {

        var component = components[i];
        var title = component.Category;

        var text0 = "";
        if (lastTitle != title) {
            text0 = title;
            lastTitle = title;
        }

        var text1 = component.Text1;
        var text2 = component.Text2;
        var text3 = getOutputTariff(component.Charge);

        addResultRow(text0, text1, text2, text3);

    }

}

function doCalc() {


    // UI
    $(".hke-billCalc-form").addClass("hke-billCalc-form-small");

    // Init Result
    removePreviousResult();
    // firstRow();


    // Get Input
    capUnitsVal();
    calDaysOfEachMonth();
    calTotalDays();


    // Basic Charge
    compBasicCharge = basicChargeCalculator(consumptionUnits);
    basicChargeTariff = sumcomp(compBasicCharge);
    output(compBasicCharge);
    addSubtotalRow("", "", SUB_TOTAL, getOutputTariff(basicChargeTariff));

    // Fuel Charge
    compFuelCharge = fuelCostAdjustmentCalculator(consumptionUnits, fromSelectedDate, endDate);
    fuelCostAjustmentFee = sumcomp(compFuelCharge);
    output(compFuelCharge);
    addSubtotalRow("", "", SUB_TOTAL, getOutputTariff(fuelCostAjustmentFee));

    // Fuel Rebate
    compSpecialFuelRebate = specialFuelRebateCalculator(consumptionUnits);
    specialFuelRebate = sumcomp(compSpecialFuelRebate);
    output(compSpecialFuelRebate);

    // Special Rebate
    compSpecialRebate = specialRebateCalculator(consumptionUnits);
    specialRebate = sumcomp(compSpecialRebate);
    output(compSpecialRebate);

    // Final
    finalOutputCalculator();
    $(".resultTable").show();


}

function calTotalDays() {

    totalDays = 0.0;
    for (var k = 0; k < daysOfEachMonth.length; k++) {
        var dayRange = Math.round(Math.abs((daysOfEachMonth[k].start.getTime() - daysOfEachMonth[k].end.getTime()) / (oneDay))) + 1;
        totalDays += dayRange;
    }

}



/**
 *
 *  basicChargeCalculator()         =>  return POSITIVE
 *  fuelCostAdjustmentCalculator()  =>  return POSITIVE
 *  specialFuelRebateCalculator()   =>  return NEGATIVE
 *  specialRebateCalculator()       =>  return NEGATIVE
 *
 *  discountCalculator()            =>  return NEGATIVE
 *
 */

function basicChargeCalculator(units) {

    var components = [];
    var tempBasicChargeTariff = 0.00;

    var remainUnits = units;
    var blockCounter = 0.0;

    var isHalfBlocks = (totalDays <= 15);

    // calculate
    for (var i = 0; i < valBasicCharge.length; i++) {

        var charge = valBasicCharge[i].Charge;
        var block = valBasicCharge[i].Block;
        if (isHalfBlocks) {
            block = round((block / 2), 2);
        }

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
        tempBasicChargeTariff += partialCharge;

        blockCounter += block;

        var component = {
            Category: BASIC_CHARGE,
            Text1: "",
            Text2: partialUnits + " " + UNITS + " x " + CURRENCY + valBasicCharge[i].Charge,
            Charge: partialCharge.toFixed(2)
        }

        components.push(component);

        if (remainUnits <= 0) {
            break;
        }

    } //end of FOR LOOP

    // Return
    return components;

}
function fuelCostAdjustmentCalculator(units, startDate, endDate) {

    var rounderVal = 0.0000;
    var eachMonthFee = [];
    var decVal = 0.0000;

    var components = [];
    var tempFuelCostAjustmentFee = 0.000;

    var intervals = process(startDate, endDate, units);
    for (var k = 0; k < intervals.length; k++) {

        var year = intervals[k].start.getFullYear();
        var month = intervals[k].start.getMonth() + 1;
        var details = getFuelCharge(year, month);

        var chargeCheck = details.Charge;
        var uunits = intervals[k].consumption;

        var formula = chargeCheck * uunits;
        eachMonthFee[k] = round(formula, 2);
        tempFuelCostAjustmentFee += eachMonthFee[k];

        var dayRange = Math.round(Math.abs((intervals[k].start.getTime() - intervals[k].end.getTime()) / (oneDay))) + 1;
        var dateRng = getOutputDate(intervals[k].start) + " - " + getOutputDate(intervals[k].end);
        var unitStr = uunits + " " + UNITS;
        var chargeStr = CURRENCY + chargeCheck;

        var component = {
            Category: FUEL_CHARGE,
            Text1: dateRng,
            Text2: unitStr + " x " + chargeStr,
            Charge: eachMonthFee[k].toFixed(2)
        }

        components.push(component);

    } // end of FOR LOOP

    // Return
    return components;

}
function specialFuelRebateCalculator(units) {

    var components = [];
    var tempSpecialFuelRebate = 0.0000;

    for (var i = 0; i < valSpecialFuelRebate.length; i++) {

        tempSpecialFuelRebate = valSpecialFuelRebate[i].Rebate * units * -1;
        tempSpecialFuelRebate = round(tempSpecialFuelRebate, 2);

        var component = {
            Category: FUEL_REBATE,
            Text1: "",
            Text2: units + " " + UNITS + " x " + "-" + CURRENCY + valSpecialFuelRebate[i].Rebate,
            Charge: tempSpecialFuelRebate.toFixed(2)
        }

        components.push(component);

    }

    // Return
    return components;

}
function specialRebateCalculator(units) {

    var components = [];
    var tempSpecialRebate = 0.0000;

    for (var i = 0; i < valSpecialRebate.length; i++) {

        tempSpecialRebate = valSpecialRebate[i].Rebate * units * -1;
        tempSpecialRebate = round(tempSpecialRebate, 2);

        var component = {
            Category: SPECIAL_REBATE,
            Text1: "",
            Text2: units + " " + UNITS + " x " + "-" + CURRENCY + valSpecialRebate[i].Rebate,
            Charge: tempSpecialRebate.toFixed(2)
        }

        components.push(component);

    }

    // Return
    return components;

}

function finalOutputCalculator() {

    var tempFinalOutput = 0.0;
    tempFinalOutput = (basicChargeTariff + fuelCostAjustmentFee + specialFuelRebate + specialRebate);

    var isMinCharge = (tempFinalOutput < 35);
    if (isMinCharge) {
        tempFinalOutput = 35;
    }

    finalOutput = round(tempFinalOutput, 2)

    var tableBody = $(".resultTable tbody");
    var row = $('<tr>').addClass('temp__Row').addClass('final__Row');

    var title = "";
    if (isMinCharge) {
        title = MIN_CHARGE;
    } else {
        title = TOTAL_AMT;
    }
    var cell1 = $('<td>').append(title);

    var cell2 = $('<td>').append("");
    var cell3 = $('<td>').append(getOutputTariff(finalOutput));

    row.append(cell1);
    row.append(cell2);
    row.append(cell3);
    tableBody.append(row);

}


/**
 * DEPRECIATED
 */
function firstRow() {

    var tableBody = $(".resultTable tbody");

    var firstRow = $('<tr>').addClass('temp__Row');
    var firstRowCell0 = $('<th>');

    firstRowCell0.attr("colspan", "3");
    firstRowCell0.append("If you consume " + consumptionUnits + " unit(s) in a month, the electricity charge will be as follows:");

    firstRow.append(firstRowCell0);
    tableBody.append(firstRow);

}


class NonResidentialCalculator {
    
    static basicChargeCal(tariffComps, units) {

        // Init
        var chargeComps = [];
        var isHalfBlocks = isHalfBlock();

        // calculate
        var remainUnits = units;
        for (var i = 0; i < tariffComps.length; i++) {

            var charge = tariffComps[i].Charge;
            var block = tariffComps[i].Block;
            if (isHalfBlocks) {
                block = round((block / 2), 2);
            }

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
    
    static finalOutputCal(basicCharge, fuelCharge, fuelRebate, specialRebate) {
        
        var final = (basicCharge + fuelCharge + fuelRebate + specialRebate);
        final = round(final, 2);

        var isMinCharge = (final < 35);
        if (isMinCharge) {
            final = 35;
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