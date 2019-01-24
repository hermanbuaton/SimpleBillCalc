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


function capVal() {
    consumptionUnits = $(".unitsInput").val();
    kVA = $(".kVAInput").val();
}

function isVaildVal() {

    var block = valBasicChargeHigh[0].Block;
    var val = kVA * block;

    if (val > consumptionUnits) {
        $(".validValReminder").text("Please enter a valid number of Maximum Demand.").css("color", "red");

        return false
    }


}

function calTotalDays() {

    totalDays = 0.0;
    for (var k = 0; k < daysOfEachMonth.length; k++) {
        var dayRange = Math.round(Math.abs((daysOfEachMonth[k].start.getTime() - daysOfEachMonth[k].end.getTime()) / (oneDay))) + 1;
        totalDays += dayRange;
    }

}

function firstRow() {

    var tableBody = $(".resultTable tbody");

    // first row
    var firstRow = $('<tr>').addClass('temp__Row');
    var firstRowCell0 = $('<th>').append("If you consume " + consumptionUnits + " unit(s) in a month, the electricity charge will be as follows:");
    var firstRowCell1 = $('<th>').append("");
    var firstRowCell2 = $('<th>').append("");
    var firstRowCell3 = $('<th>').append("");

    firstRow.append(firstRowCell0);
    firstRow.append(firstRowCell1);
    firstRow.append(firstRowCell2);
    firstRow.append(firstRowCell3);
    tableBody.append(firstRow);

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
function output(hvComps, lvComps) {
    
    var count = Math.max(hvComps.length, lvComps.length);

    var lastTitle = "";
    for (var i = 0; i < count; i++) {

        var component = hvComps[i];
        var title = hvComps.Category;

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

function simpleDemandChargeCal(tariffComps, kva) {

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
function simpleBasicChargeCal(tariffComps, kva, kwh) {

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
function simpleFuelChargeCal(tariffComps, startDate, endDate, kwh) {

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
function simpleFuelRebateCal(tariffComps, startDate, endDate, kwh) {
    
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
function simpleSpecialRebateCal(tariffComps, startDate, endDate, kwh) {
    
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

function simpleFinalOutputCalculator(demandCharge, basicCharge, fuelCharge, fuelRebate, specialRebate) {
    
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

function demandChargeCalculator(totalConsumed) {

    var kVA = totalConsumed;

    var tempDemandChargeTariffHi = 0.00;
    var tempDemandChargeTariffLow = 0.00;
    
    var demCharHiDataSum = [];
    var demCharLowDataSum = [];

    var remainUnits = kVA;
    if (remainUnits <= 100) {
        remainUnits = 100;
    }

    // calculate
    for (var i = 0; i < valDemandChargeHigh.length; i++) {

        var charge = valDemandChargeHigh[i].Charge;
        var block = valDemandChargeHigh[i].Block;

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

        tempDemandChargeTariffHi += partialCharge;

        var demCharHiData = {
            Punit: partialUnits,
            Pcharge: partialCharge
        }


        demCharHiDataSum.push(demCharHiData);

        outputChargeData.demCharHiDataSum = demCharHiDataSum;



        if (remainUnits <= 0) {
            break;
        }

    } //end of FOR LOOP

    demandChargeTariffHi = round(tempDemandChargeTariffHi, 2);
    outputChargeData.demCharHiDataSum.Charge = demandChargeTariffHi;



    remainUnits = kVA;
    if (remainUnits <= 100) {
        remainUnits = 100;
    }


    for (var k = 0; k < valDemandChargeLow.length; k++) {

        var charge = valDemandChargeLow[k].Charge;
        var block = valDemandChargeLow[k].Block;

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
        tempDemandChargeTariffLow += partialCharge;

        var demCharLowData = {
            Punit: partialUnits,
            Pcharge: partialCharge
        }



        demCharLowDataSum.push(demCharLowData);

        outputChargeData.demCharLowDataSum = demCharLowDataSum;
        if (remainUnits <= 0) {
            break;
        }

    } //end of FOR LOOP



    demandChargeTariffLow = round(tempDemandChargeTariffLow, 2);
    outputChargeData.demCharLowDataSum.Charge = demandChargeTariffLow;
}
function basicChargeCalculator(units) {

    var tempBasicChargeTariffHi = 0.00;
    var tempBasicChargeTariffLow = 0.0;
    var remainUnits = units;

    var basCharHiDataSum = [];
    var basCharLowDataSum = [];



    // calculate
    for (var i = 0; i < valBasicChargeHigh.length; i++) {

        var charge = valBasicChargeHigh[i].Charge;
        var block = valBasicChargeHigh[i].Block;
        var kVolAmp = kVA;
        if (kVolAmp <= 100) {
            kVolAmp = 100;
        }
        var counter = 0.0;
        counter = kVolAmp * block;

        if (block > 0) {

            if (counter <= remainUnits) {
                var partialCharge = counter * charge;

            } else if (counter > remainUnits) {
                var partialCharge = remainUnits * charge;
                tempBasicChargeTariffHi += partialCharge;

                var basCharHiData = {
                    Punit: remainUnits,
                    Pcharge: partialCharge,
                }
                basCharHiDataSum.push(basCharHiData);
                outputChargeData.basCharHiDataSum = basCharHiDataSum;
                break;
            }

        } else if (block == 0) {
            counter = remainUnits;
            var partialCharge = counter * charge;
        }
        remainUnits -= counter;
        tempBasicChargeTariffHi += partialCharge;

        var basCharHiData = {
            Punit: counter,
            Pcharge: partialCharge,
        }

        basCharHiDataSum.push(basCharHiData);
        outputChargeData.basCharHiDataSum = basCharHiDataSum;

        if (block == 0) {
            break;
        }
    }
    basicChargeTariffHi = tempBasicChargeTariffHi;
    outputChargeData.basCharHiDataSum.Charge = basicChargeTariffHi;

    var remainUnits = units;

    for (var t = 0; t < valBasicChargeLow.length; t++) {

        var charge = valBasicChargeLow[t].Charge;
        var block = valBasicChargeLow[t].Block;
        var kVolAmp = kVA;
        if (kVolAmp <= 100) {
            kVolAmp = 100;
        }
        var counter = 0.0;
        counter = kVolAmp * block;

        if (block > 0) {

            if (counter <= remainUnits) {
                var partialCharge = counter * charge;

            } else if (counter > remainUnits) {
                var partialCharge = remainUnits * charge;
                tempBasicChargeTariffLow += partialCharge;

                var basCharLowData = {
                    Punit: remainUnits,
                    Pcharge: partialCharge,
                }
                basCharLowDataSum.push(basCharLowData);
                outputChargeData.basCharLowDataSum = basCharLowDataSum;
                break;
            }

        } else if (block == 0) {
            counter = remainUnits;
            var partialCharge = counter * charge;
        }
        remainUnits -= counter;
        tempBasicChargeTariffLow += partialCharge;

        var basCharLowData = {
            Punit: counter,
            Pcharge: partialCharge,
        }

        basCharLowDataSum.push(basCharLowData);
        outputChargeData.basCharLowDataSum = basCharLowDataSum;

        if (block == 0) {
            break;
        }
    }
    basicChargeTariffLow = tempBasicChargeTariffLow;
    outputChargeData.basCharLowDataSum.Charge = basicChargeTariffLow;

    basCharLowDataSum = [];//initialize
    basCharHiDataSum = [];//initialize
}
function fuelCostAdjustmentCalculator() {

    var rounderVal = 0.0000;
    var eachMonthFee = [];
    var decVal = 0.0000;
    var tempFuelCostAjustmentFee = 0.000;
    var fuelCostDataSum = [];

    for (var k = 0; k < daysOfEachMonth.length; k++) {

        var year = daysOfEachMonth[k].start.getFullYear();
        var month = daysOfEachMonth[k].start.getMonth() + 1;
        var component = getFuelCharge(year, month);

        var chargeCheck = component.Charge;
        var uunits = daysOfEachMonth[k].consumption;

        var formula = chargeCheck * uunits;
        eachMonthFee[k] = formula;
        tempFuelCostAjustmentFee += eachMonthFee[k];

        var dayRange = Math.round(Math.abs((daysOfEachMonth[k].start.getTime() - daysOfEachMonth[k].end.getTime()) / (oneDay))) + 1;

        var fuelCostData = {
            Uunits: uunits,
            Pcharge: chargeCheck,
            Fee: eachMonthFee[k],
            DayRange: dayRange
        }

        fuelCostDataSum.push(fuelCostData);

        outputChargeData.fuelCostDataSum = fuelCostDataSum;


    } // end of FOR LOOP

    fuelCostAjustmentFee = tempFuelCostAjustmentFee;

    outputChargeData.fuelCostDataSum.Charge = fuelCostAjustmentFee;


    totalDays = 0; //initialize

}
function specialFuelRebateCalculator() {

    var tempSpecialFuelRebate = 0.0000;
    var fuelRebateDataSum = [];
    for (var i = 0; i < valSpecialFuelRebate.length; i++) {

        tempSpecialFuelRebate = valSpecialFuelRebate[i].Rebate * consumptionUnits;

        var fuelRebateData = { Rebate: valSpecialFuelRebate[i].Rebate, Pcharge: tempSpecialFuelRebate }
        fuelRebateDataSum.push(fuelRebateData);
        outputChargeData.fuelRebateDataSum = fuelRebateDataSum;
    }

    specialFuelRebate = tempSpecialFuelRebate;
    outputChargeData.fuelRebateDataSum.Charge = specialFuelRebate;



}
function specialRebateCalculator() {

    var tempSpecialRebate = 0.0000;
    var rebateDataSum = [];

    for (var i = 0; i < valSpecialRebate.length; i++) {

        tempSpecialRebate = valSpecialRebate[i].Rebate * consumptionUnits;

        var rebateData = { Rebate: valSpecialRebate[i].Rebate, Pcharge: tempSpecialRebate }
        rebateDataSum.push(rebateData);
        outputChargeData.rebateDataSum = rebateDataSum;
    }
    specialRebate = tempSpecialRebate;
    outputChargeData.rebateDataSum.Charge = specialRebate;

}

function finalOutputCalculator() {

    var tempFinalOutputHi = 0.0;
    var tempFinalOutputLow = 0.0;
    var finalResultDataSumHi = [];
    var finalResultDataSumLow = [];
    //high vol
    tempFinalOutputHi = (basicChargeTariffHi + demandChargeTariffHi + fuelCostAjustmentFee - specialFuelRebate - specialRebate)
    if (tempFinalOutputHi <= 14.9) {
        tempFinalOutputHi = 14.9;
    }

    var finalResultDataHi = { result: tempFinalOutputHi }
    finalResultDataSumHi.push(finalResultDataHi);
    outputChargeData.finalResultDataSumHi = finalResultDataSumHi;

    finalOutputHi = round(tempFinalOutputHi, 2)
    outputChargeData.finalResultDataSumHi.Charge = finalOutputHi;
    // low vol
    tempFinalOutputLow = (basicChargeTariffLow + demandChargeTariffLow + fuelCostAjustmentFee - specialFuelRebate - specialRebate)
    if (tempFinalOutputLow <= 14.9) {
        tempFinalOutputLow = 14.9;
    }

    var finalResultDataLow = { result: tempFinalOutputLow }
    finalResultDataSumLow.push(finalResultDataLow);
    outputChargeData.finalResultDataSumLow = finalResultDataSumLow;

    finalOutputLow = round(tempFinalOutputLow, 2)
    outputChargeData.finalResultDataSumLow.Charge = finalOutputLow;



}


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

function buildResultRow() {
    
    console.log(" outputChargeData: ");
    console.log(outputChargeData)
    
    var text0, text1, text2, text3;
    var outTotalHi;
    var outTotalLow;

    text0 = "High Voltage";
    text1 = "";
    text2 = "Low Voltage";
    text3 = "";
    firstRow(text0, text1, text2, text3);

    //output high and low voltage demand charge 
    text0 = DEMAND_CHARGE;
    text1 = "";
    text2 = "";
    text3 = "";
    addSubHeaderRow(text0, text1, text2, text3);

    // 11:11 14JAN added round function to text0
    for (var i = 0; i < outputChargeData.demCharHiDataSum.length; i++) {
        
        text0 = round(outputChargeData.demCharHiDataSum[i].Punit, 2).toFixed(2) + " " + KVA + " x " + getOutputTariff(valDemandChargeHigh[i].Charge);
        text1 = getOutputTariff(outputChargeData.demCharHiDataSum[i].Pcharge.toFixed(2));
        text2 = round(outputChargeData.demCharLowDataSum[i].Punit, 2).toFixed(2) + " " + KVA + " x " + getOutputTariff(valDemandChargeLow[i].Charge);
        text3 = getOutputTariff(outputChargeData.demCharLowDataSum[i].Pcharge.toFixed(2));

        addResultRow(text0, text1, text2, text3);

    }

    outTotalHi = getOutputTariff(outputChargeData.demCharHiDataSum.Charge.toFixed(2));
    outTotalLow = getOutputTariff(outputChargeData.demCharLowDataSum.Charge.toFixed(2));
    addSubtotalRow(SUB_TOTAL, outTotalHi, "", outTotalLow);

    //output high and low voltage  basic charge
    text0 = BASIC_CHARGE;
    text1 = "";
    text2 = "";
    text3 = "";
    addSubHeaderRow(text0, text1, text2, text3);


    for (var n = 0; n < outputChargeData.basCharHiDataSum.length; n++) {


        text0 = kVA + " x " + valBasicChargeHigh[n].Block + " " + UNITS + " x " + getOutputTariff(valBasicChargeHigh[n].Charge);
        if (n == (outputChargeData.basCharHiDataSum.length - 1)) {
            text0 = outputChargeData.basCharHiDataSum[n].Punit + " " + UNITS + " x " + getOutputTariff(valBasicChargeHigh[n].Charge);
            if (kVA * valBasicChargeHigh[n].Block == consumptionUnits) {
                text0 = null;
            }
        }
        text1 = getOutputTariff(round(outputChargeData.basCharHiDataSum[n].Pcharge, 2).toFixed(2));
        text2 = kVA + " x " + valBasicChargeLow[n].Block + " " + UNITS + " x " + getOutputTariff(valBasicChargeLow[n].Charge);
        if (n == (outputChargeData.basCharLowDataSum.length - 1)) {
            text2 = outputChargeData.basCharLowDataSum[n].Punit + " " + UNITS + " x " + getOutputTariff(valBasicChargeLow[n].Charge);
        }
        text3 = getOutputTariff(round(outputChargeData.basCharLowDataSum[n].Pcharge, 2).toFixed(2));

        addResultRow(text0, text1, text2, text3);


    }

    outTotalHi = getOutputTariff(round(outputChargeData.basCharHiDataSum.Charge, 2).toFixed(2));
    outTotalLow = getOutputTariff(round(outputChargeData.basCharLowDataSum.Charge, 2).toFixed(2));
    addSubtotalRow(SUB_TOTAL, outTotalHi, "", outTotalLow);


    //output fuel cost fee

    text0 = FUEL_CHARGE;
    text1 = "";
    text2 = "";
    text3 = "";
    addSubHeaderRow(text0, text1, text2, text3);


    for (var x = 0; x < outputChargeData.fuelCostDataSum.length; x++) {

        text0 = daysOfEachMonth[x].start.getDate() + "/" + (daysOfEachMonth[x].start.getMonth() + 1) +
            "/" + daysOfEachMonth[x].start.getFullYear() + " ~ " + daysOfEachMonth[x].end.getDate() + "/"
            + (daysOfEachMonth[x].end.getMonth() + 1) + "/" + daysOfEachMonth[x].end.getFullYear() + " : " /*+ outputChargeData.fuelCostDataSum[x].DayRange  " " + DAYS + " ==>" */ + "<br>" +
            outputChargeData.fuelCostDataSum[x].Uunits + " " + UNITS + " x " + outputChargeData.fuelCostDataSum[x].Pcharge;

        text1 = getOutputTariff(round(outputChargeData.fuelCostDataSum[x].Fee, 2).toFixed(2));
        text2 = daysOfEachMonth[x].start.getDate() + "/" + (daysOfEachMonth[x].start.getMonth() + 1) +
"/" + daysOfEachMonth[x].start.getFullYear() + " ~ " + daysOfEachMonth[x].end.getDate() + "/"
+ (daysOfEachMonth[x].end.getMonth() + 1) + "/" + daysOfEachMonth[x].end.getFullYear() + " : " /*+ outputChargeData.fuelCostDataSum[x].DayRange + " " + DAYS + " ==>" */ + "<br>" +
outputChargeData.fuelCostDataSum[x].Uunits + " " + UNITS + " x " + outputChargeData.fuelCostDataSum[x].Pcharge;

        text3 = getOutputTariff(round(outputChargeData.fuelCostDataSum[x].Fee, 2).toFixed(2));

        addResultRow(text0, text1, text2, text3);
    }
    outTotalHi = getOutputTariff(round(outputChargeData.fuelCostDataSum.Charge, 2).toFixed(2));
    outTotalLow = getOutputTariff(round(outputChargeData.fuelCostDataSum.Charge, 2).toFixed(2));
    addSubtotalRow(SUB_TOTAL, outTotalHi, "", outTotalLow);

    //output special fuel rebate
    text0 = FUEL_REBATE;
    text1 = "";
    text2 = "";
    text3 = "";
    addSubHeaderRow(text0, text1, text2, text3);


    for (var y = 0; y < outputChargeData.fuelRebateDataSum.length; y++) {
        text0 = consumptionUnits + " " + UNITS + " x " + "-" + getOutputTariff(outputChargeData.fuelRebateDataSum[y].Rebate);
        text1 = "-" + getOutputTariff(round(outputChargeData.fuelRebateDataSum[y].Pcharge, 2).toFixed(2));
        text2 = consumptionUnits + " " + UNITS + " x " + "-" + getOutputTariff(outputChargeData.fuelRebateDataSum[y].Rebate);
        text3 = "-" + getOutputTariff(round(outputChargeData.fuelRebateDataSum[y].Pcharge, 2).toFixed(2));
        addResultRow(text0, text1, text2, text3);
    }

    //output special rebate
    text0 = SPECIAL_REBATE;
    text1 = "";
    text2 = "";
    text3 = "";
    addSubHeaderRow(text0, text1, text2, text3);



    for (var z = 0; z < outputChargeData.rebateDataSum.length; z++) {
        text0 = consumptionUnits + " " + UNITS + " x " + "-" + getOutputTariff(outputChargeData.rebateDataSum[z].Rebate);
        text1 = "-" + getOutputTariff(outputChargeData.rebateDataSum[z].Pcharge.toFixed(2));
        text2 = consumptionUnits + " " + UNITS + " x " + "-" + getOutputTariff(outputChargeData.rebateDataSum[z].Rebate);
        text3 = "-" + getOutputTariff(outputChargeData.rebateDataSum[z].Pcharge.toFixed(2));
        addResultRow(text0, text1, text2, text3);
    }



    //output final result
    text0 = TOTAL_AMOUNT;
    text1 = getOutputTariff(outputChargeData.finalResultDataSumHi.Charge.toFixed(2));
    text2 = "";
    text3 = getOutputTariff(outputChargeData.finalResultDataSumLow.Charge.toFixed(2));

    addFinalRow(text0, text1, text2, text3);



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