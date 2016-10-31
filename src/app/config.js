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
        version: '2.0.0-2',

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

        // configs from Utah Clean Energy
        // Electric Generation Factor
        ElectricGenerationFactor: 1399,
        // CO2 output per kWh
        CO2SavingsFactor: 1.85,
        // PV panel production rate for given efficiency
        PVEfficiency: 0.01389
    };

    if (has('agrc-build') === 'prod') {
        // www.solarsimplified.org
        config.quadWord = 'short-eddie-andrea-betty';
        config.apiKey = 'AGRC-17BAFE9E795504';
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
