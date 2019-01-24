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