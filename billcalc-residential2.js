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



function calTotalDays() {

    totalDays = 0.0;
    for (var k = 0; k < daysOfEachMonth.length; k++) {
        var dayRange = Math.round(Math.abs((daysOfEachMonth[k].start.getTime() - daysOfEachMonth[k].end.getTime()) / (oneDay))) + 1;
        totalDays += dayRange;
    }

}

function doCalc() {


    // UI
    $(".hke-billCalc-form").addClass("hke-billCalc-form-small");

    // Init Result
    removePreviousResult();
    

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

    // Super Save & Concessionary
    compDiscount = discountCalculator(consumptionUnits, fromSelectedDate, endDate, basicChargeTariff, fuelCostAjustmentFee, specialFuelRebate, specialRebate);
    allDiscount = sumcomp(compDiscount);
    output(compDiscount);


    // Final
    finalOutputCalculator();
    $(".resultTable").show();


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

    var isHalfBlocks = isHalfBlock();

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
            Text2: getOutputUnits(partialUnits) + " x " + CURRENCY + valBasicCharge[i].Charge,
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
    // var intervals = getIntervalsByMonth(startDate, endDate, ValFuelCharge, units);
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
        var unitStr = getOutputUnits(uunits);
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
            Text2: getOutputUnits(units) + " x " + "-" + CURRENCY + valSpecialFuelRebate[i].Rebate,
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
            Text2: getOutputUnits(units) + " x " + "-" + CURRENCY + valSpecialRebate[i].Rebate,
            Charge: tempSpecialRebate.toFixed(2)
        }

        components.push(component);

    }

    // Return
    return components;

}

function discountCalculator(units, startDate, endDate, basicCharge, fuelCharge, fuelRebate, specialRebate) {

    // TODO: Across Year
    var components = [];
    var superSave = getSaveDiscount(startDate.getFullYear());
    var conScheme = getConcessionary(startDate.getFullYear());

    // Eligible for Save Discount
    if (superSave == -1) {
        return false;
    }

    // Calculate Discount Amt
    var tmpSaveDiscountAmt = 0.0;
    if (units <= superSave.MaxUnits) {

        var dBasicCharge = round((basicCharge * superSave.Discount), 2);
        basicCharge = round((basicCharge - dBasicCharge), 2);
        tmpSaveDiscountAmt = round((tmpSaveDiscountAmt + dBasicCharge), 2);

        var dFuelCharge = round((fuelCharge * superSave.Discount), 2);
        fuelCharge = round((fuelCharge - dFuelCharge), 2);
        tmpSaveDiscountAmt = round((tmpSaveDiscountAmt + dFuelCharge), 2);

        var dFuelRebate = round((fuelRebate * superSave.Discount), 2);
        fuelRebate = round((fuelRebate - dFuelRebate), 2);
        tmpSaveDiscountAmt = round((tmpSaveDiscountAmt + dFuelRebate), 2);

        var dSpecialRebate = round((specialRebate * superSave.Discount), 2);
        specialRebate = round((specialRebate - dSpecialRebate), 2);
        tmpSaveDiscountAmt = round((tmpSaveDiscountAmt + dSpecialRebate), 2);

        // Convert to Negative
        tmpSaveDiscountAmt = round((tmpSaveDiscountAmt * -1), 2);

        // Component
        var component = {
            Category: SAVE_DISCOUNT,
            Text1: "",
            Text2: "",
            Charge: tmpSaveDiscountAmt.toFixed(2)
        }
        components.push(component);

    }

    // Calculate Concessionary Discount
    var tmpConcessionary = 0.0;
    if (isConcessionary()) {

        var uunits = conScheme.MaxUnits;
        var ddiscount = conScheme.Discount;

        if (isHalfBlock()) {
            uunits = uunits / 2;
        }

        if (units >= uunits) {

            var tmpBasicCharge = basicChargeCalculator(uunits);
            basicCharge = sumcomp(tmpBasicCharge);

            var tmpFuelCharge = fuelCostAdjustmentCalculator(uunits, startDate, endDate);
            fuelCharge = sumcomp(tmpFuelCharge);

            var tmpFuelRebate = specialFuelRebateCalculator(uunits);
            fuelRebate = sumcomp(tmpFuelRebate);

            var tmpSpecialRebate = specialRebateCalculator(uunits);
            specialRebate = sumcomp(tmpSpecialRebate);

        }

        var cBasicCharge = round((basicCharge * ddiscount), 2);
        tmpConcessionary = round((tmpConcessionary + cBasicCharge), 2);;

        var cFuelCharge = round((fuelCharge * ddiscount), 2);
        tmpConcessionary = round((tmpConcessionary + cFuelCharge), 2);;

        var cFuelRebate = round((fuelRebate * ddiscount), 2);
        tmpConcessionary = round((tmpConcessionary + cFuelRebate), 2);;

        var cSpecialRebate = round((specialRebate * ddiscount), 2);
        tmpConcessionary = round((tmpConcessionary + cSpecialRebate), 2);;

        // Convert to Negative
        tmpConcessionary = round((tmpConcessionary * -1), 2);

        // Component
        var component = {
            Category: CONCESSIONARY,
            Text1: "",
            Text2: "",
            Charge: tmpConcessionary.toFixed(2)
        }
        components.push(component);

    }


    // Return
    return components;

}

function finalOutputCalculator() {

    var tempFinalOutput = 0.0;
    tempFinalOutput = (basicChargeTariff + fuelCostAjustmentFee + specialFuelRebate + specialRebate + allDiscount);

    var isMinCharge = (tempFinalOutput < 14.9);
    if (isMinCharge) {
        tempFinalOutput = 14.9;
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

function activateTarScheme() {


    //if (checkBox.checked == true)
    // console.log("checkBox.checked")

    var partial1 = 0.0;
    var partial2 = 0.0;
    var currentCounter = 0.0;
    var previousCounter = 0.0;


    for (var i = 0; i < valBasicCharge.length; i++) {


        var units = valConcessionary[0].MaxUnits;


        currentCounter += valBasicCharge[i].Block;

        if (units <= currentCounter) {

            partial1 = units - previousCounter;
            partial2 = valBasicCharge[i].Block - partial1;


            var record = {
                Year: valBasicCharge[i].Year,
                Sequence: valBasicCharge[i].Sequence,
                Block: partial1,
                Charge: valBasicCharge[i].Charge
            };



            var record2 = {
                Year: valBasicCharge[i].Year,
                Sequence: valBasicCharge[i].Sequence,
                Block: partial2,
                Charge: valBasicCharge[i].Charge
            };


            valBasicCharge.splice(i, 1, record);
            if (units != currentCounter) {
                valBasicCharge.splice((i + 1), 0, record2);
            }


            i = valBasicCharge.length;

        }
        if (i != valBasicCharge.length) {
            previousCounter += valBasicCharge[i].Block;
        }

    }

}
function concessionaryCalculator(units) {

    if (!isConcessionary()) {
        return false;
    }

    var discountUnits = valConcessionary[0].MaxUnits;
    var discount = valConcessionary[0].Discount;

    if (discountUnits < units) {
        remainUnits = discountUnits;
    }

    calTotalDays();
    var isHalfBlocks = isHalfBlock();
    if (isHalfBlocks) {
        discountUnits = discountUnits / 2;
    }

    var remainUnits = units;
    if (discountUnits < remainUnits) {
        remainUnits = discountUnits;
    }

    var discountAmount = 0.0;
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
        var discountCharge = round((partialCharge * discount), 2);
        discountAmount += discountCharge;

        if (remainUnits <= 0) {
            break;
        }

    }

    var text0 = CONCESSIONARY;
    var text1 = "";
    var text2 = "";
    var text3 = "-" + CURRENCY + discountAmount.toFixed(2);

    concessioary = discountAmount;
    addResultRow(text0, text1, text2, text3);

}


class ResidentialCalculator {
    
    constructor(basicCharge, fuelCharge, fuelRebate, specialRebate, saveDiscount, conScheme) {
        this.valBasicCharge = basicCharge;
        this.valFuelCharge = fuelCharge;
        this.valFuelRebate = fuelRebate;
        this.valSpecialRebate = specialRebate;
        this.valSaveDiscount = saveDiscount;
        this.valConScheme = conScheme;
    }
    
    basicChargeCal(units) {

        var tariffComps = valBasicCharge;
        var chargeComps = [];
        
        // Parameters
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
    fuelChargeCal(startDate, endDate, kwh) {

        var tariffComps = this.valFuelCharge;
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
    fuelRebateCal(startDate, endDate, kwh) {

        var tariffComps = this.valFuelRebate
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
    specialRebateCal(startDate, endDate, kwh) {

        var tariffComps = this.valSpecialRebate;
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
    discountCal(isConc, startDate, endDate, units, basicCharge, fuelCharge, fuelRebate, specialRebate) {

        // Init
        var saveComps = this.valSaveDiscount;
        var concComps = this.valConScheme;
        var chargeComps = [];

        // Calculate Discount Amt
        var tmpSaveDiscountAmt = 0.0;
        var superSave = getComponentByYear(saveComps, startDate.getFullYear());
        if (units <= superSave.MaxUnits) {

            var dBasicCharge = round((basicCharge * superSave.Discount), 2);
            var dFuelCharge = round((fuelCharge * superSave.Discount), 2);
            var dFuelRebate = round((fuelRebate * superSave.Discount), 2);
            var dSpecialRebate = round((specialRebate * superSave.Discount), 2);
            
            basicCharge = round((basicCharge - dBasicCharge), 2);
            fuelCharge = round((fuelCharge - dFuelCharge), 2);
            fuelRebate = round((fuelRebate - dFuelRebate), 2);
            specialRebate = round((specialRebate - dSpecialRebate), 2);
            
            tmpSaveDiscountAmt = round((tmpSaveDiscountAmt + dBasicCharge), 2);
            tmpSaveDiscountAmt = round((tmpSaveDiscountAmt + dFuelCharge), 2);
            tmpSaveDiscountAmt = round((tmpSaveDiscountAmt + dFuelRebate), 2);
            tmpSaveDiscountAmt = round((tmpSaveDiscountAmt + dSpecialRebate), 2);

            // Convert to Negative
            tmpSaveDiscountAmt = round((tmpSaveDiscountAmt * -1), 2);

            // Component
            var component = {
                Category: SAVE_DISCOUNT,
                Text1: "",
                Text2: "",
                Charge: tmpSaveDiscountAmt
            }
            chargeComps.push(component);

        }
        
        // Calculate Concessionary Discount
        var tmpConcessionary = 0.0;
        var conScheme = getComponentByYear(concComps, startDate.getFullYear());
        if (isConc) {

            var uunits = conScheme.MaxUnits;
            var ddiscount = conScheme.Discount;

            if (isHalfBlock()) {
                uunits = uunits / 2;
            }

            if (units >= uunits) {

                var tmpBasicCharge = this.basicChargeCal(uunits);
                var tmpFuelCharge = this.fuelChargeCal(startDate, endDate, uunits);
                var tmpFuelRebate = this.fuelRebateCal(startDate, endDate, uunits);
                var tmpSpecialRebate = this.specialRebateCal(startDate, endDate, uunits);
                
                basicCharge = sumcomp(tmpBasicCharge);
                fuelCharge = sumcomp(tmpFuelCharge);
                fuelRebate = sumcomp(tmpFuelRebate);
                specialRebate = sumcomp(tmpSpecialRebate);

            }

            var cBasicCharge = round((basicCharge * ddiscount), 2);
            var cFuelCharge = round((fuelCharge * ddiscount), 2);
            var cFuelRebate = round((fuelRebate * ddiscount), 2);
            var cSpecialRebate = round((specialRebate * ddiscount), 2);
            
            tmpConcessionary = round((tmpConcessionary + cBasicCharge), 2);;
            tmpConcessionary = round((tmpConcessionary + cFuelCharge), 2);;
            tmpConcessionary = round((tmpConcessionary + cFuelRebate), 2);;
            tmpConcessionary = round((tmpConcessionary + cSpecialRebate), 2);;

            // Convert to Negative
            tmpConcessionary = round((tmpConcessionary * -1), 2);

            // Component
            var component = {
                Category: CONCESSIONARY,
                Text1: "",
                Text2: "",
                Charge: tmpConcessionary.toFixed(2)
            }
            chargeComps.push(component);

        }


        // Return
        return chargeComps;

    }
    
    finalOutputCal(basicCharge, fuelCharge, fuelRebate, specialRebate, allDiscount) {
        
        var final = (basicCharge + fuelCharge + fuelRebate + specialRebate + allDiscount);
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