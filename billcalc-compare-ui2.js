var isSelected = "";
var output_c = {};

// Tariff Data
var valNRBasicCharge = [];
var valMDDemandChargeHigh = [];
var valMDDemandChargeLow = [];
var valMDBasicChargeHigh = [];
var valMDBasicChargeLow = [];
var ValFuelCharge = [];
var valSpecialFuelRebate = [];
var valSpecialRebate = [];

// Retrieve Data
function retrieveTariffData() {
    
    if ( !window.HKE.parameters.isEditMode ) {

        var url = datasrc;
        var sel = ".tariff-data";
        var dest = url + " " + sel;
        $( '#tariff-data-placeholder' ).load( dest, function ( responseTxt, statusTxt, xhr ) {

            if ( statusTxt == "success" ) {

                // Retrieve Non-Residential
                valNRBasicCharge = retrieveBasicCharge( "#basicCharge_nr" );

                // Retrieve Max Demand
                valMDDemandChargeHigh = retrieveBasicCharge( "#demandChargeHigh_md" );
                valMDDemandChargeLow = retrieveBasicCharge( "#demandChargeLow_md" );
                valMDBasicChargeHigh = retrieveBasicCharge( "#basicChargeHigh_md" );
                valMDBasicChargeLow = retrieveBasicCharge( "#basicChargeLow_md" );

                // Retrieve Common
                ValFuelCharge = retrieveFuelCharge( "#fuelCharge" );
                valSpecialFuelRebate = retrieveRebate( "#fuelRebate" );
                valSpecialRebate = retrieveRebate( "#specialRebate" );

            }
            else if ( statusTxt == "error" ) {
                console.log( "Error: " + xhr.status + ": " + xhr.statusText );
            }

        } );

    }
    
}

// Get Input
function isHVMaxDemand() {
    return (isSelected == "hv");   
}
function isLVMaxDemand() {
    return (isSelected == "lv");
}
function captureUnit_c() {
    var consumptionUnits = $( ".unitsInput_c" ).val();
    return parseFloat( consumptionUnits );
}
function captureKVA_c() {
    var kVA = $( ".kVAInput_c" ).val();
    return parseFloat( kVA );
}
function captureStartDate() {
    return new Date(getDateValue("#from_c"));
}
function captureEndDate() {
    return new Date(getDateValue("#to_c"));
}

// Show Output
function removePreviousResult_c() {
    $( ".compare__Row" ).remove();
    $( ".compare__Row_remove" ).remove();
}
function addIntroRow(title, kva, kwh) {
    
    // style
    $( ".compareResult" ).css( "text-align", "left" );
    var tbody = $(".compareResult tbody");
    
    // i for intro
    var irow = $('<tr>').addClass('compare__Row');
    var icell = $('<th>');
    var icontent = "";
    icontent += (title + LINEBREAK);
    icontent += (COMPARE_INTRO_S + kva + COMPARE_INTRO_M + kwh + COMPARE_INTRO_E);
    
    icell.append(icontent);
    irow.append(icell);
    tbody.append(irow);
    
}
function addResultRow(isHV, mdCharge, nrCharge) {
    
    // style
    $( ".compareResult" ).css( "text-align", "left" );
    var tbody = $(".compareResult tbody");
    
    // r for result
    var rrow = $('<tr>').addClass('compare__Row');
    var rcell = $('<td>');
    
    var rmd = ( getOutputTariff(mdCharge) );
    var rnr = ( getOutputTariff(nrCharge) );
    var diff = ( getOutputTariff( Math.abs(mdCharge - nrCharge) ) );
    
    var rcontent = "";
    if (isHV) {
        rcontent += (COMPARE_BILLBY_MD + rmd + LINEBREAK);
    } else {
        rcontent += (COMPARE_BILLBY_MD + rmd + LINEBREAK);
        rcontent += (COMPARE_BILLBY_NR + rnr + LINEBREAK);
        if (mdCharge < nrCharge) {
            rcontent += (COMPARE_SAVING + diff + LINEBREAK);
        } else if (mdCharge > nrCharge) {
            rcontent += (COMPARE_EXTRA + diff + LINEBREAK);
        }
    }
    
    rcell.append(rcontent);
    rrow.append(rcell);
    tbody.append(rrow);
    
}
function displayOutput_c() {
    
    var title = (isHVMaxDemand()) ? HIGH_VOLTAGE : LOW_VOLTAGE;
    var kva = captureKVA_c();
    var kwh = captureUnit_c();
        
    // i for intro
    addIntroRow(title, kva, kwh);
    
    // calculation
    // ? WHY PUT IN display() ?
    // ? WHY NOT USE written functions ?
    var mdDC = (isHVMaxDemand()) ? output_c.hvDemandCharge : output_c.lvDemandCharge;
    var mdBC = (isHVMaxDemand()) ? output_c.hvBasicCharge : output_c.hvBasicCharge;
    var mdCharge = MaxDemandCalculator.finalOutputCal(
        mdDC, 
        mdBC, 
        output_c.fuelCharge, 
        output_c.fuelRebate, 
        output_c.specialRebate
    );
    var nrCharge = NonResidentialCalculator.finalOutputCal(
        output_c.basicCharge,
        output_c.fuelCharge,
        output_c.fuelRebate,
        output_c.specialRebate
    );
    // var commonFactor = output_c.fuelCharge + output_c.fuelRebate + output_c.specialRebate;
    // var lvCharge = output_c.lvDemandCharge + output_c.lvBasicCharge + commonFactor;
    // var hvCharge = output_c.hvDemandCharge + output_c.hvBasicCharge + commonFactor;
    // var nCharge = output_c.basicCharge + commonFactor;
    
    // r for result
    addResultRow(isHVMaxDemand(), mdCharge.Charge, nrCharge.Charge);

}

// Calculate
function calculate_c() {
    
    removePreviousResult_c();
    $( ".hke-billCalc-form" ).addClass( "hke-billCalc-form-small" );
    
    var kwh = captureUnit_c();
    var kva = captureKVA_c();
    var start = captureStartDate();
    var end = captureEndDate();

    // max-demand
    var hvDemandChargeComp = MaxDemandCalculator.demandChargeCal( valMDDemandChargeHigh, kva );
    var lvDemandChargeComp = MaxDemandCalculator.demandChargeCal( valMDDemandChargeLow, kva );
    var hvBasicChargeComp = MaxDemandCalculator.basicChargeCal( valMDBasicChargeHigh, kva, kwh );
    var lvBasicChargeComp = MaxDemandCalculator.basicChargeCal( valMDBasicChargeLow, kva, kwh );
    var hvDemandCharge = sumcomp( hvDemandChargeComp );
    var lvDemandCharge = sumcomp( lvDemandChargeComp );
    var hvBasicCharge = sumcomp( hvBasicChargeComp );
    var lvBasicCharge = sumcomp( lvBasicChargeComp );

    //non-residential
    var basicChargeComp = NonResidentialCalculator.basicChargeCal( valNRBasicCharge, kwh );
    var basicCharge = sumcomp( basicChargeComp );
    
    // common factor
    var fuelChargeComp = NonResidentialCalculator.fuelChargeCal(ValFuelCharge, start, end, kwh);
    var fuelRebateComp = NonResidentialCalculator.fuelRebateCal(valSpecialFuelRebate, start, end, kwh);
    var specialRebateComp = NonResidentialCalculator.specialRebateCal(valSpecialRebate, start, end, kwh);
    var fuelCharge = sumcomp(fuelChargeComp);
    var fuelRebate = sumcomp(fuelRebateComp);
    var specialRebate = sumcomp(specialRebateComp);

    output_c = {
        hvDemandCharge: hvDemandCharge,
        lvDemandCharge: lvDemandCharge,
        hvBasicCharge: hvBasicCharge,
        lvBasicCharge: lvBasicCharge,
        basicCharge: basicCharge,
        fuelCharge: fuelCharge,
        fuelRebate: fuelRebate,
        specialRebate: specialRebate
    }
    
}

$( function () {

    // Retrieve Data
    retrieveTariffData();

    if ( !window.HKE.parameters.isEditMode ) {
        
        // Toggle
        $( ".lv" ).click( function () {
            isSelected = "lv";//have to place on top
            toggleTriggered( "#labelLowVol" );
        } );
        $( ".hv" ).click( function () {
            isSelected = "hv";//have to place on top
            toggleTriggered( "#labelHighVol" );
        } );
        
        // Input (numeric)
        $( ".unitsInput_c" ).prop( "maxlength", "8" );
        $( ".unitsInput_c" ).on( "keypress", function ( event ) {
            numericHandler( event, $( this ).val() );
        } );
        $( ".kVAInput_c" ).prop( "maxlength", "8" );
        $( ".kVAInput_c" ).on( "keypress", function ( event ) {
            numericHandler( event, $( this ).val(), 1 );
        } );
        
        // Datepickers
        var from = $( "#from_c" ).datepicker( {
            dateFormat: "dd/mm/yy",
            yearRange: yearRange,
            minDate: defaultStartDate,
            maxDate: defaultEndDate,
            numberOfMonths: numberOfMonths
        } );
        var to = $( "#to_c" ).datepicker( {
            dateFormat: "dd/mm/yy",
            yearRange: yearRange,
            numberOfMonths: numberOfMonths
        } );

        $( "#from_c" ).change( function () {

            fromSelectedDate = new Date( getDateValue( "#from_c" ) );
            to.datepicker( "option", "minDate", fromSelectedDate );

            fromfinishedDate = new Date( fromSelectedDate );
            fromfinishedDate.setDate( fromfinishedDate.getDate() + 33 );

            if ( fromfinishedDate.getFullYear() > today.getFullYear() ) {
                to.datepicker( "option", "maxDate", defaultEndDate );
            } else {
                to.datepicker( "option", "maxDate", fromfinishedDate );
            }

            //validateInput();

        } );
        $( "#to_c" ).change( function () {
            endDate = new Date( getDateValue( "#to_c" ) );
            // validateInput();
        } );

        $( ".btnCalTariff_c" ).click( function () {
            
            calculate_c();
            displayOutput_c();
            
            $(".compareResult").show();
            
        } );
        
    }

} );



/*********************************************************************************************************************************************************
**********************************************************************************************************************************************************
*****************    *********   *********    ********                 ***************              *********   *********    *********    ****************
**************        *******     *******      ******              **********************            *******     *******      *******       **************
*************         *******     *******      ******            *********         ********          *******     *******      *******        *************
************          *******     *******      ******           *********           ********         *******     *******      *******         ************
***********           *******     *******      ******          **********           *********        *******     *******      *******          ***********
***********           *******     *******      ******          **********           *********        *******     *******      *******          ***********
***********           *******************************          **********           *********        *******     *******      *******          ***********
***********           *******************************          **********           *********        *******     *******      *******          ***********
***********           *******************************          **********           *********        *******     *******      *******          ***********
***********           *******     *******      ******          **********           *********        *******     *******      *******          ***********
***********           *******     *******      ******          **********           *********        *******     *******      *******          ***********
***********           *******     *******      ******           *********           ********         *******     *******     ********          ***********
************          *******     *******      ******            *********         ********           *******   *********   ********          ************
*************         *******     *******      ******              **********************               ****************************         *************
****************     *********   *********    ********                 ***************                    ************************          **************
**********************************************************************************************************************************************************
*********************************************************************************************************************************************************/
