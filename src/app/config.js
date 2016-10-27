define([
], function (
) {
    var slcSolarServer = 'http://maps.slcgov.com/slcisolar/rest/services/';
    return {
        // errorLogger: ijit.modules.ErrorLogger
        errorLogger: null,

        // app: app.App
        //      global reference to App
        app: null,

        // version: String
        //      The version number.
        version: '0.6.0',

        // apiKey: String
        //      api.mapserv.utah.gov key
        // apiKey: 'AGRC-63E1FF17767822', // localhost
        // apiKey: 'AGRC-1B07B497348512', // mapserv.utah.gov/*
        apiKey: 'AGRC-B256ADB5500988', // 168.177.223.158/*

        // drawSymbolColor: Number[]
        //      The color of the polygon after the drawing is complete
        drawSymbolColor: [255, 255, 0],

        urls: {
            duration: slcSolarServer + 'solar/SLCO_SolarDuration/MapServer',
            radiation: slcSolarServer + 'solar/SLCO_SolarRadiation/MapServer',
            soe: slcSolarServer + 'solar/SLCO_SolarPts/MapServer/exts/SolarCalculatorSoe/CalculateFor?',
            basemap: '??',
            geometry: slcSolarServer + 'Utilities/Geometry/GeometryServer',
            solarByZip: slcSolarServer + 'solar/solarByZipCode/MapServer'
        },

        // maxSqFt: Number
        //      The max square footage of a polygon that is allowed to be sent
        //      to the soe
        maxSqFt: 10000,

        // configs copied from old site...
        /** Electric Generation Factor*/
        ElectricGenerationFactor: 1399, //for SLC area 1kw per year = 1399 kWh
        /** Cost per kWh */
        CostSavingsFactor: 0.075292, //cost per kWh for Rocky Mountain Power (Utah) as of 10/13/10
        /** CO2 output per kWh */
        CO2SavingsFactor: 1.21, //1.21 lbs of C02 per kilowatt hour basedon Rocky Mountain Power (Utah)
        /** Default Roof Usage Percentage */
        RoofUsageFactor: 1.0,
        /** PV panel production rate for given efficiency */
        PVEfficiency: 0.0167 //18% panels at 16.7 W per sq foot
    };
});
