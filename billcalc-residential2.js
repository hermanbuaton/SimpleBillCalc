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