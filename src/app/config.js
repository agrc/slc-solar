define([
    'dojo/has',
    'dojo/request/xhr'
], function (
    has,
    xhr
) {
    var slcSolarServer = 'http://maps.slcgov.com/slcisolar/rest/services/';
    var config = {
        // errorLogger: ijit.modules.ErrorLogger
        errorLogger: null,

        // app: app.App
        //      global reference to App
        app: null,

        // version: String
        //      The version number.
        version: '0.6.0',

        apiKey: null,

        // drawSymbolColor: Number[]
        //      The color of the polygon after the drawing is complete
        drawSymbolColor: [255, 255, 0],

        urls: {
            duration: slcSolarServer + 'solar/SLCO_SolarDuration_EPSG_3857/MapServer',
            radiation: slcSolarServer + 'solar/SLCO_SolarRadiation_EPSG_3857/MapServer',
            soe: slcSolarServer + 'solar/SLCO_SolarPts/MapServer/exts/SolarCalculatorSoe/CalculateFor?',
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

    if (has('agrc-build') === 'prod') {
        // www.solarsimplified.org
        config.apiKey = '??';
        config.quadWord = '??';
    } else if (has('agrc-build') === 'stage') {
        // test.mapserv.utah.gov
        config.quadWord = 'opera-event-little-pinball';
        config.apiKey = 'AGRC-AC122FA9671436';
    } else {
        // localhost
        xhr(require.baseUrl + 'secrets.json', {
            handleAs: 'json',
            sync: true
        }).then(function (secrets) {
            config.quadWord = secrets.quadWord;
            config.apiKey = secrets.apiKey;
        }, function () {
            throw 'Error getting secrets!';
        });
    }

    return config;
});
