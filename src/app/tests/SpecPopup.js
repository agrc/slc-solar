require([
    'app/config',
    'app/Popup',

    'dojo/dom-construct',
    'dojo/dom-style',
    'dojo/text!app/tests/data/CalculateForReturn.json',
    'dojo/text!app/tests/data/PolygonGeometry.json',
    'dojo/_base/lang',
    'dojo/_base/window',

    'stubmodule'
], function (
    config,
    Popup,

    domConstruct,
    domStyle,
    CalculateForReturnJSON,
    polygonGeometryJSON,
    lang,
    win,

    stubmodule
) {
    describe('app/Popup', function () {
        if (!/PhantomJS/.test(navigator.userAgent)) {
            window.alert = function () {};
        }
        var testWidget;
        var destroy = function (widget) {
            widget.destroyRecursive();
            widget = null;
        };
        var geometry = JSON.parse(polygonGeometryJSON);
        geometry.toJson = function () {};
        var numbers = '[419386.0797017351,4504446.884500817,419401.60597310076,4504446.287336534,419401.3073909591,4504429.566736602,419385.18395531015,4504430.462483027,419386.0797017351,4504446.884500817]';
        var seriesData = [93.374449339207047, 118.77533039647577, 192.0660792951542, 251.03964757709252, 297.37004405286342, 278.85022026431716, 288.61233480176213, 273.88986784140968, 204.08810572687224, 154.90308370044053, 98.475770925110126, 67.859030837004411];
        var map = {
            container: domConstruct.create('div'),
            graphics: {
                on: function () {}
            }
        };
        var AGRCclone = lang.clone(config);
        beforeEach(function () {
            testWidget = new Popup({
                map: map
            }, domConstruct.create('div', {}, win.body()));
            testWidget.startup();
            config = AGRCclone;
        });
        afterEach(function () {
            destroy(testWidget);
        });
        it('create a valid object', function () {
            expect(testWidget).toEqual(jasmine.any(Popup));
        });
        describe('postCreate', function () {
            it('creates a pie chart', function () {
                expect(testWidget.chart).toBeDefined();
            });
        });
        describe('setData', function () {
            it('send data to geometry service', function () {
                spyOn(testWidget.geoService, 'project');

                testWidget.setData(geometry);

                expect(testWidget.geoService.project).toHaveBeenCalled();
            });
        });
        describe('sendDataToSOE', function () {
            var requestSpy;
            var testWidget2;
            beforeEach(function (done) {
                requestSpy = jasmine.createSpy('request').and.returnValue({then: function () {}});
                stubmodule('app/Popup', {
                    'esri/request': requestSpy
                }).then(function (StubbedPopup) {
                    testWidget2 = new StubbedPopup({map: map});
                    testWidget2.startup();

                    done();
                });

            });
            it('send the geometry to the service', function () {
                testWidget2.sendDataToSOE(geometry);

                expect(requestSpy).toHaveBeenCalledWith({
                    url: config.urls.soe,
                    content: {
                        f: 'json',
                        geometry: numbers,
                        durationThreshold: '300'
                    },
                    handleAs: 'json',
                    callbackParamName: 'callback'
                });
            });
        });
        describe('formatGeometry', function () {
            it('flattens the coordinate pars', function () {
                var result = testWidget.formatGeometry(geometry);

                expect(result).toEqual(numbers);
            });
        });
        describe('onSOEError', function () {
            it('display an alert', function () {
                spyOn(window, 'alert');

                testWidget.onSOEError();

                expect(window.alert).toHaveBeenCalledWith(testWidget.errMsg);
            });
        });
        describe('formatDataForChart', function () {
            it('flatten all of the values into an array', function () {
                var input = JSON.parse(CalculateForReturnJSON).solarPotential.duration;

                expect(testWidget.formatDataForChart(input, 1)).toEqual(seriesData);
            });
            it('uses a division factor', function () {
                var input = JSON.parse(CalculateForReturnJSON).solarPotential.radiation;

                expect(testWidget.formatDataForChart(input, 1000)[0]).toEqual(33.757634361233485);
            });
        });
        describe('onSOEReturn', function () {
            it('stores chart data', function () {
                testWidget.onSOEReturn(JSON.parse(CalculateForReturnJSON));

                expect(testWidget.durationData.length).toBe(12);
                expect(testWidget.intensityData.length).toBe(12);
            });
            it('should render the correct chart', function () {
                spyOn(testWidget, 'showCalculations');
                spyOn(testWidget, 'renderChart');

                testWidget.intensityBtn.click();

                testWidget.onSOEReturn(JSON.parse(CalculateForReturnJSON));

                expect(testWidget.renderChart).toHaveBeenCalledWith(testWidget.intensityData, testWidget.intensityTitle);
                expect(testWidget.showCalculations).not.toHaveBeenCalled();
            });
            it('shows the calculations tab if selected', function () {
                spyOn(testWidget, 'showCalculations');
                spyOn(testWidget, 'renderChart');

                testWidget.calculationsBtn.click();

                testWidget.onSOEReturn(JSON.parse(CalculateForReturnJSON));

                expect(testWidget.renderChart).not.toHaveBeenCalled();
                expect(testWidget.showCalculations).toHaveBeenCalled();
            });
        });
        describe('renderChart', function () {
            it('add\'s new data and title and renders', function () {
                spyOn(testWidget.chart, 'addSeries');
                spyOn(testWidget.chart, 'render');
                var title = 'blah';

                testWidget.renderChart(seriesData, title);

                expect(testWidget.chart.addSeries).toHaveBeenCalledWith('series', seriesData);
                expect(testWidget.chart.render).toHaveBeenCalled();
                expect(testWidget.chart.axes.values.opt.title).toEqual(title);
            });
        });
        describe('showCalculations', function () {
            it('hide the chart and show the calculations div', function () {
                testWidget.showCalculations();

                expect(domStyle.get(testWidget.chartDiv, 'display')).toEqual('none');
                expect(domStyle.get(testWidget.calculationsDiv, 'display')).toEqual('block');
            });
        });
        describe('onAreasAndLengthsReturn', function () {
            beforeEach(function () {
                spyOn(testWidget, 'sendDataToSOE');
            });
            it('check the max area', function () {
                testWidget.onAreasAndLengthsReturn({
                    areas: [config.maxSqFt + 1],
                    lengths: [10]
                });

                expect(testWidget.sendDataToSOE).not.toHaveBeenCalled();

                testWidget.onAreasAndLengthsReturn({
                    areas: [config.maxSqFt - 1],
                    lengths: [10]
                });

                expect(testWidget.sendDataToSOE).toHaveBeenCalled();
            });
            it('sets the fields in the calculations tab', function () {
                var value = 1000;
                var expected = '1,000 sq ft';

                testWidget.onAreasAndLengthsReturn({areas: [value]});

                expect(testWidget.totalAreaTxt.innerHTML).toEqual(expected);
                expect(testWidget.usableRoofAreaTxt.innerHTML).toEqual(expected);
            });
            it('sets the totalArea property', function () {
                var value = 1000;

                testWidget.onAreasAndLengthsReturn({areas: [value]});

                expect(testWidget.totalArea).toEqual(value);
            });
        });
        describe('formatNumber', function () {
            it('formats sq ft', function () {
                expect(testWidget.formatNumber(1000, 'sq ft')).toEqual('1,000 sq ft');
            });
        });
        describe('updateCalculationValues', function () {
            it('updates the values based upon the slider and total sq ft', function () {
                testWidget.totalArea = 1842;
                testWidget.updateCalculationValues(50);

                // overriding these values to make the tests less brittle if the
                // configs in the production app are changed in the future...
                config.PVEfficiency = 0.0167;
                config.ElectricGenerationFactor = 1399;
                config.CO2SavingsFactor = 1.21;

                expect(testWidget.usableRoofAreaTxt.innerHTML).toEqual('921 sq ft');
                expect(testWidget.potentialSysSizeTxt.innerHTML).toEqual('15.4 kW');
                expect(testWidget.estElecTxt.innerHTML).toEqual('21,518 kWh/year');
                expect(testWidget.estCO2Txt.innerHTML).toEqual('26,036 lbs/yr');
            });
        });
        config = AGRCclone;
    });
});
