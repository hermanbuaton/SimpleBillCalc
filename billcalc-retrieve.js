/**
 *  RETRIEVE
 */

// Basic Charge
function retrieveBasicCharge(tName) {

    var table = $(tName);

    var hBasicCharge = [];
    var vBasicCharge = [];

    table.find("tbody").each(function () {

        $(this).find("th").each(function (colIndex, c) {
            var colName = c.textContent.trim();
            hBasicCharge.push(colName);
        });

        $(this).find("tr").each(function (rowIndex, r) {

            var year = null;
            var sequence = null;
            var range = null;
            var charge = null;

            if ($(this).find("td").length == 0) {
                return true;
            }

            $(this).find("td").each(function (colIndex, c) {

                var colName = hBasicCharge[colIndex];
                var colVal = c.textContent;

                if (colName == "Year") {
                    year = parseInt(colVal);
                } else if (colName == "Sequence") {
                    sequence = parseInt(colVal);
                } else if (colName == "Block") {
                    range = parseInt(colVal);
                } else if (colName == "Charge") {
                    charge = parseFloat(colVal);
                }

            });


            if (year != null && range >= 0 && charge != null) {

                var val = {
                    Year: year,
                    Sequence: sequence,
                    Block: range,
                    Charge: charge
                };
                vBasicCharge.push(val);

            }

        });

    });

    return vBasicCharge;

}

// Fuel Clause Charge
function retrieveFuelCharge(tName) {

    var table = $(tName);

    var hFuelCharge = [];
    var vFuelCharge = [];

    table.find("tbody").each(function () {

        $(this).find("th").each(function (colIndex, c) {
            var colName = c.textContent.trim();
            hFuelCharge.push(colName);
        });

        table.find("tr").each(function (rowIndex, r) {

            var year = null;
            var month = null;
            var charge = null;

            if ($(this).find("td").length == 0) {
                return true;
            }

            $(this).find("td").each(function (colIndex, c) {

                var colName = hFuelCharge[colIndex];
                var colVal = c.textContent;

                if (colName == "Year") {
                    year = parseInt(colVal);
                } else if (colName == "Month") {
                    month = parseInt(colVal);
                } else if (colName == "Charge") {
                    charge = parseFloat(colVal);
                }

            });

            if (year != null && month != null && charge != null) {

                var record = {
                    Year: year,
                    Month: month,
                    Charge: charge
                };
                vFuelCharge.push(record);

            }

        });

    });

    return vFuelCharge;

}

// Rebate
function retrieveRebate(tName) {

    var table = $(tName);

    var hRebate = [];
    var vRebate = [];

    table.find("tbody").each(function () {

        $(this).find("th").each(function (colIndex, c) {
            var colName = c.textContent.trim();
            hRebate.push(colName);
        });

        table.find("tr").each(function (rowIndex, r) {

            var year = null;
            var rebate = null;

            if ($(this).find("td").length == 0) {
                return true;
            }

            $(this).find("td").each(function (colIndex, c) {

                var colName = hRebate[colIndex];
                var colVal = c.textContent;

                if (colName == "Year") {
                    year = parseInt(colVal);
                } else if (colName == "Rebate") {
                    rebate = parseFloat(colVal);
                }

            });

            if (year != null && rebate != null) {

                var record = {
                    Year: year,
                    Rebate: rebate,
                };
                vRebate.push(record);

            }

        });

    });

    return vRebate;

}

function retrieveSpecialFuelRebate(tName) {
    return retrieveRebate(tName);
}
function retrieveSpecialRebate(tName) {
    return retrieveRebate(tName);
}

// Discount
function retrieveSaveDiscount(tName) {

    var table = $(tName);

    var hSaveDiscount = [];
    var vSaveDiscount = [];

    table.find("tbody").each(function () {

        $(this).find("th").each(function (colIndex, c) {
            var colName = c.textContent.trim();
            hSaveDiscount.push(colName);
        });

        table.find("tr").each(function (rowIndex, r) {

            var year = null;
            var maxUnits = null;
            var discount = null;

            if ($(this).find("td").length == 0) {
                return true;
            }

            $(this).find("td").each(function (colIndex, c) {

                var colName = hSaveDiscount[colIndex];
                var colVal = c.textContent.trim();

                if (colName == "Year") {
                    year = parseInt(colVal);
                } else if (colName == "Max Units Consumed") {
                    maxUnits = parseInt(colVal);
                } else if (colName == "Discount") {
                    discount = (parseFloat(colVal)) / 100;
                }

            });

            if (year != null && maxUnits != null && discount != null) {

                var record = {
                    Year: year,
                    MaxUnits: maxUnits,
                    Discount: discount,
                };
                vSaveDiscount.push(record);

            }

        });

    });

    return vSaveDiscount;

}
function retrieveConcessionary(tName) {

    var table = $(tName);

    var hConcessionary = [];
    var vConcessionary = [];

    table.find("tbody").each(function () {

        $(this).find("th").each(function (colIndex, c) {
            var colName = c.textContent.trim();
            hConcessionary.push(colName);
        });

        table.find("tr").each(function (rowIndex, r) {

            var year = null;
            var concessionaryUnits = null;
            var discount = null;

            if ($(this).find("td").length == 0) {
                return true;
            }

            $(this).find("td").each(function (colIndex, c) {

                var colName = hConcessionary[colIndex];
                var colVal = c.textContent.trim();

                if (colName == "Year") {
                    year = parseInt(colVal);
                } else if (colName == "Units to be discounted") {
                    concessionaryUnits = parseInt(colVal);
                } else if (colName == "Discount") {
                    discount = (parseFloat(colVal)) / 100;
                }

            });

            if (year != null && concessionaryUnits != null && discount != null) {

                var record = {
                    Year: year,
                    MaxUnits: concessionaryUnits,
                    Discount: discount,
                };
                vConcessionary.push(record);

            }

        });

    });

    return vConcessionary;

}


/**
 *  GET
 */

// Common
function getComponentByYear(components, year) {

    var result = components.filter(function (comp) {
        return (comp.Year == year);
    })

    if (result.length > 0) {
        return result[0];
    } else {
        return -1;
    }

}
function getComponentByYearMonth(components, year, month) {

    var result = components.filter(function (comp) {
        return (comp.Year == year && comp.Month == month);
    })

    if (result.length > 0) {
        return result[0];
    } else {
        return -1;
    }

}


// WRAPPER
function getFuelCharge(year, month) {
    return getComponentByYearMonth(ValFuelCharge, year, month);
}
function getSaveDiscount(year) {
    return getComponentByYear(valSaveDiscount, year);
}
function getConcessionary(year) {
    return getComponentByYear(valConcessionary, year);
}
