/**
 *  Constants
 */

// const datasrc = "/en/customer-services/billing-payment-electricity-tariffs/charge-table";
const datasrc = "ChargeTable.html";

const dateFormat = "dd/mm/yy";
const numberOfMonths = 2;
const oneDay = 24 * 60 * 60 * 1000;

var dateValue; //use for getDateValue function
var fromSelectedDate;
var fromfinishedDate;
var today = new Date();
if (today.getFullYear() < 2019)
    today = new Date(2019, 1 - 1, 1);
var defaultStartDate = new Date(today.getFullYear(), 1 - 1, 1);
var defaultEndDate = new Date(today.getFullYear(), 12 - 1, 31);
var yearRange = today.getFullYear() + ':' + today.getFullYear();
var endDate;
var daysOfEachMonth = [];
var totalDays = 0;


/**
 *  
 *  Input Events
 *  
 */

function numericHandler(evt, v, d) {

    var theEvent = evt || window.event;

    var nd = d;
    if (d === undefined) {
        nd = 0;
    }

    // Handle paste
    if (theEvent.type === 'paste') {
        key = event.clipboardData.getData('text/plain');
    } else {
        // Handle key press
        var key = theEvent.keyCode || theEvent.which;
        key = String.fromCharCode(key);
    }

    // Concat
    v = v + key;

    var regex = /[0-9]|\./;
    // var regex = /[0-9]/;
    var rTest = regex.test(key);
    var dTest = ((v.match(/\./g) || []).length <= nd);
    if (!rTest || !dTest) {
        theEvent.returnValue = false;
        if (theEvent.preventDefault) theEvent.preventDefault();
    }

}


/**
 *  
 *  Toggle Handlers
 *  
 *  [@param] ctrlName   incl. class / id identifier, e.g. ".abc" or "#xyz"
 *  
 */

function toggleTriggered(ctrlName) {

    var ctrl = $(ctrlName);

    //if ($(ctrl).hasClass("hke-billCalc-toggle-selected")) {
    //    $(ctrl).removeClass("hke-billCalc-toggle-selected");
    //} else {
    //    $(".hke-billCalc-toggle").removeClass("hke-billCalc-toggle-selected");
    //    $(ctrl).addClass("hke-billCalc-toggle-selected");
    //}

    $(".hke-billCalc-toggle").removeClass("hke-billCalc-toggle-selected");
    $(ctrl).addClass("hke-billCalc-toggle-selected");

}


/**
 *  Get Date from datepicker input
 */

function getDateValue(ctrlName) {

    var n = $(ctrlName);

    try {
        dateValue = $.datepicker.parseDate(dateFormat, n.val());
    } catch (error) {
        dateValue = null;
    }

    return dateValue;

}


/**
 *  Other Common Functions
 */

function isHalfBlock(startDate, endDate) {
    var totalDays = (endDate - startDate) / (oneDay);
    return (totalDays <= 15);
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

function getEndOfMonth(year, month) {

    // Set Month to 0-based index
    month--;

    // Next Month
    var nextMonth = new Date(year, month + 1, 1);

    // End of Month
    var monthEnd = new Date(nextMonth);
    monthEnd.setDate(monthEnd.getDate() - 1);

    return monthEnd;

}
function getDefaultEndDate(valFC) {

    var maxFC = 190000;

    for (var i = 1; i < valFC.length ; i++) {

        var fci = valFC[i];

        var yy = fci.Year.toFixed(0);
        var mm = fci.Month.toFixed(0);
        mm = getOutputMonth(mm);

        var strr = yy.concat(mm);
        var maxx = parseInt(strr);

        if (maxx > maxFC) {
            maxFC = maxx;
        }

    }

    var final = maxFC.toFixed(0);
    var yy = final.substr(0, 4);
    var mm = final.substr(4, 2);
    var monthEnd = getEndOfMonth(yy, mm);

    return monthEnd;

}

function calDaysOfEachMonth() {

    daysOfEachMonth = []; //initialize the array
    daysOfEachMonth = process(fromSelectedDate, endDate, consumptionUnits);
    
}
function process3(startDate, endDate, totalConsumed) {

    var result = [];

    // No. of Days
    var daysDiff = (endDate - startDate) / (1000 * 60 * 60 * 24);
    var noOfDays = daysDiff + 1;

    // No. of Months
    var noOfMonth = endDate.getMonth() - startDate.getMonth();
    if (noOfMonth < 0) {
        noOfMonth += 12
    }

    // Calc
    var tempDate = new Date(startDate);
    var tempConsumed = 0;
    var maxPeriod = {
        Index: -1,
        PeriodL: -1
    };
    for (i = 0; i <= noOfMonth; i++) {

        // Next Month
        var nextMonth = new Date(tempDate.getFullYear(), tempDate.getMonth() + 1, 1);

        // End of Month
        var monthEnd = new Date(nextMonth);
        monthEnd.setDate(monthEnd.getDate() - 1);

        // Determine End of Period
        if (monthEnd.getMonth() == endDate.getMonth()) {
            if (monthEnd.getDate() > endDate.getDate()) {
                monthEnd.setDate(endDate.getDate());
            }
        }

        // Length of Period
        var periodLength = monthEnd.getDate() - tempDate.getDate() + 1;

        // Consumption
        var consumption = totalConsumed * (periodLength / noOfDays);
        consumption = Math.round(consumption);
        
        // Max Period
        if (periodLength >= maxPeriod.PeriodL) {
            maxPeriod = {
                Index: i,
                PeriodL: periodLength
            };
        }

        // Assign
        var tempResult = {
            start: tempDate,
            end: monthEnd,
            consumption: consumption
        };
        result.push(tempResult);

        // ROLL
        tempDate = nextMonth;
        tempConsumed += consumption;

    }

    // Remainder
    if (tempConsumed != totalConsumed) {
        result[maxPeriod.Index].consumption += (totalConsumed - tempConsumed);
    }

    return result;

}

function process(startDate, endDate, totalConsumed) {
    
    var result = [];
    result = getIntervalsByMonth(startDate, endDate);
    result = mergeIntervalsByMonth(ValFuelCharge, result);
    result = calUnitsOfEachInterval(startDate, endDate, result, totalConsumed);
    
    return result;
    
}
function process2(tariffComps, startDate, endDate, kwh) {
    
    var result = [];
    result = getIntervalsByMonth(startDate, endDate);
    result = mergeIntervalsByMonth(tariffComps, result);
    result = calUnitsOfEachInterval(startDate, endDate, result, kwh);
    
    return result;
    
}
function getIntervalsByMonth(startDate, endDate) {

    var intervals = [];

    // No. of Days
    var daysDiff = (endDate - startDate) / (1000 * 60 * 60 * 24);
    var noOfDays = daysDiff + 1;

    // No. of Months
    var noOfMonth = endDate.getMonth() - startDate.getMonth();
    if (noOfMonth < 0) {
        noOfMonth += 12
    }

    // Calc
    var tempDate = new Date(startDate);
    for (i = 0; i <= noOfMonth; i++) {
        
        // Next Month
        var nextMonth = new Date(tempDate.getFullYear(), tempDate.getMonth() + 1, 1);
        
        // End of Month
        var monthEnd = new Date(nextMonth);
        monthEnd.setDate(monthEnd.getDate() - 1);
        
        // Determine End of Period
        if (monthEnd.getMonth() == endDate.getMonth()) {
            if (monthEnd.getDate() > endDate.getDate()) {
                monthEnd.setDate(endDate.getDate());
            }
        }
        
        // Length of Period
        var periodLength = monthEnd.getDate() - tempDate.getDate() + 1;
        
        // Assign
        var component = {
            start: tempDate,
            end: monthEnd,
            noOfDays: periodLength
        };
        intervals.push(component);

        // ROLL
        tempDate = nextMonth;

    }

    return intervals;

}
function mergeIntervalsByMonth(chargeComponents, intervals) {
    
    var merged = [];
    var pointer = -1;
    
    for (i = 0; i < intervals.length; i++) {
        
        var year = intervals[i].start.getFullYear();
        var month = intervals[i].start.getMonth() + 1;
        var noOfDays = intervals[i].noOfDays;
        var comp = getComponentByYearMonth(chargeComponents, year, month);
        
        var start = intervals[i].start;
        if (merged.length > 0) {
            
            var sameCharge = (merged[pointer].charge == comp.Charge);
            if (sameCharge) {
                merged[pointer].end = intervals[i].end;
                merged[pointer].noOfDays += intervals[i].noOfDays;
                continue;
            }
            
        }
        
        var result = {
            start: intervals[i].start,
            end: intervals[i].end,
            noOfDays: intervals[i].noOfDays,
            charge: comp.Charge
        }
        merged.push(result);
        
        pointer++;
        
    }
    
    return merged;
    
}
function calUnitsOfEachInterval(startDate, endDate, intervals, kwh) {
    
    var result = [];

    // No. of Days
    var daysDiff = (endDate - startDate) / (oneDay);
    var noOfDays = daysDiff + 1;
    
    // Calculate units
    var tempConsumed = 0;
    var maxPeriod = {
        Index: -1,
        PeriodL: -1
    };
    for (i = 0; i < intervals.length; i++) {
        
        // Length of Period
        var periodLength = (intervals[i].end - intervals[i].start) / (oneDay);
        periodLength += 1;

        // Consumption
        var consumption = (kwh) * (periodLength / noOfDays);
        consumption = Math.round(consumption);
        
        // Max Period
        if (periodLength > maxPeriod.PeriodL) {
            maxPeriod = {
                Index: i,
                PeriodL: periodLength
            };
        } else if (periodLength == maxPeriod.PeriodL) {
            maxPeriod = {
                Index: intervals.length - 1,
                PeriodL: 999
            };
        }

        // Assign
        var tempResult = {
            start: intervals[i].start,
            end: intervals[i].end,
            consumption: consumption,
            charge: intervals[i].charge
        };
        result.push(tempResult);

        // ROLL
        tempConsumed += consumption;
        
    }

    // Remainder
    if (tempConsumed != kwh) {
        result[maxPeriod.Index].consumption += (kwh - tempConsumed);
    }
    
    return result;
    
}


/**
 *  Output Formatting
 */

function round(num, dec) {

    //var r = Math.round(num * Math.pow(10, length)) / Math.pow(10, length);
    //var roundNum = parseFloat(r);
    //return roundNum;

    var exp = Math.pow(10, dec + 2);
    var t = parseFloat(num);
    var str = t.toFixed(dec + 1);
    var n = parseFloat(str);

    if (n >= 0) {
        n += (1 / exp);
    } else {
        n -= (1 / exp);
    }

    n = n.toFixed(dec);
    return parseFloat(n);

}

function getOutputDay(d) {

    var dd = d;

    if (dd < 10) {
        dd = "0" + dd;
    }

    return dd;

}
function getOutputMonth(m) {

    var mm = m;

    if (mm < 10) {
        mm = "0" + mm;
    }

    return mm;

}
function getOutputDate(date) {

    var dd = date.getDate();
    var mm = date.getMonth() + 1;
    var yyyy = date.getFullYear();

    dd = getOutputDay(dd);
    mm = getOutputMonth(mm);

    return (dd + "/" + mm + "/" + yyyy);

}

function getOutputUnits(units) {

    var text3;
    if (units < 0) {
        var a = round((units * -1), 2);
        var v = parseFloat(a);
        text3 = "-" + v.toLocaleString(undefined, { minimumFractionDigits: 0 }) + " " + UNITS;
    } else {
        var v = parseFloat(units);
        text3 = v.toLocaleString(undefined, { minimumFractionDigits: 0 }) + " " + UNITS;
    }

    return text3;

}
function getOutputTariff(tariff) {

    var text3;
    if (tariff < 0) {
        var a = (tariff * -1);
        var v = parseFloat(a);
        text3 = "-" + CURRENCY + v.toLocaleString(undefined, { minimumFractionDigits: 2 });
    } else {
        var v = parseFloat(tariff);
        text3 = CURRENCY + v.toLocaleString(undefined, { minimumFractionDigits: 2 });
    }

    return text3;

}