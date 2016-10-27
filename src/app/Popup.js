define([
    'agrc/modules/Formatting',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/dom-class',
    'dojo/dom-geometry',
    'dojo/dom-style',
    'dojo/fx',
    'dojo/on',
    'dojo/text!app/templates/Popup.html',
    'dojo/_base/array',
    'dojo/_base/declare',
    'dojo/_base/fx',
    'dojo/_base/lang',
    'dojo/_base/window',

    'dojox/charting/Chart',
    'dojox/charting/plot2d/Areas',
    'dojox/charting/themes/PlotKit/orange',

    'esri/domUtils',
    'esri/request',
    'esri/tasks/AreasAndLengthsParameters',
    'esri/tasks/GeometryService',

    'dojox/charting/axis2d/Default'
], function (
    Formatting,

    _TemplatedMixin,
    _WidgetBase,
    _WidgetsInTemplateMixin,

    domClass,
    domGeom,
    domStyle,
    coreFx,
    on,
    template,
    array,
    declare,
    fx,
    lang,
    win,

    Chart,
    Areas,
    theme,

    domUtils,
    esriRequest,
    AreasAndLengthsParameters,
    GeometryService
) {
    // summary:
    //      Handles retrieving and displaying the data in the popup.
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        widgetsInTemplate: true,
        templateString: template,
        baseClass: 'popup-widget',

        // chart: Chart
        chart: null,

        // errMsg: String
        errMsg: 'There was an error getting the solar data!',

        // durationData: Array
        durationData: null,

        // intensityData: Array
        intensityData: null,

        // durationTitle: String
        durationTitle: 'Solar Duration (hours)',

        // intensityTitle: String
        intensityTitle: 'Solar Intensity (kWH/m2)',

        // sliderInit: Boolean
        //      switch to track if the slider has been initialized
        //      see showCalculations
        sliderInit: false,

        // geoService: GeometryService
        geoService: null,

        // geometry: Geometry
        //      The drawing geometry
        geometry: null,


        constructor: function () {
            console.log(this.declaredClass + '::constructor', arguments);
        },
        postCreate: function () {
            // summary:
            //      dom is ready
            console.log(this.declaredClass + '::postCreate', arguments);

            this.chart = new Chart(this.chartDiv)
                .addPlot('default', {
                    type: Areas,
                    tension: 'S',
                    hAxis: 'months',
                    vAxis: 'values'
                })
                .addAxis('months', {
                    labels: [
                        {value: 1, text: 'Jan'},
                        {value: 2, text: 'Feb'},
                        {value: 3, text: 'Mar'},
                        {value: 4, text: 'Apr'},
                        {value: 5, text: 'May'},
                        {value: 6, text: 'Jun'},
                        {value: 7, text: 'Jul'},
                        {value: 8, text: 'Aug'},
                        {value: 9, text: 'Sep'},
                        {value: 10, text: 'Oct'},
                        {value: 11, text: 'Nov'},
                        {value: 12, text: 'Dec'}
                    ],
                    majorTick: {length: 3}
                })
                .setTheme(theme);
            this.chart.render();

            this.inherited(arguments);

            this.wireEvents();

            // manually set display to none to make sure that slider
            // gets initialized correctly
            domUtils.hide(this.calculationsDiv);

            this.resize();

            this.width = domGeom.getMarginBox(this.domNode).w;
            var that = this;
            this.showAni = coreFx.combine([
                fx.animateProperty({
                    node: this.domNode,
                    properties: {
                        right: '0'
                    }
                }),
                fx.animateProperty({
                    node: this.map.container,
                    properties: {
                        width: (domGeom.getMarginBox(this.map.container).w - this.width).toString()
                    },
                    onEnd: function () {
                        that.map.resize(true);

                        that.map.setExtent(that.map.graphics.graphics[0].geometry.getExtent(), true);
                    }
                })
            ]);
            this.hideAni = coreFx.combine([
                fx.animateProperty({
                    node: this.domNode,
                    properties: {
                        right: '-' + this.width
                    }
                }),
                fx.animateProperty({
                    node: this.map.container,
                    properties: {
                        width: {
                            start: ((domGeom.getMarginBox(this.map.container).w /
                                    domGeom.getMarginBox(win.body()).w) * 100).toString(),
                            end: '100',
                            units: '%'
                        }
                    },
                    onEnd: function () {
                        that.map.resize(true);
                    }
                })
            ]);
        },
        resize: function () {
            // summary:
            //      resets the height of the div
            console.log(this.declaredClass + '::resize', arguments);

            domStyle.set(this.domNode, 'height', (domGeom.getMarginBox(win.body()).h - 41) + 'px');
        },
        wireEvents: function () {
            // param: type or return: type
            console.log(this.declaredClass + '::wireEvents', arguments);

            var that = this;

            this.own(
                on(this.durationBtn, 'click', function () {
                    that.renderChart(that.durationData, that.durationTitle);
                }),
                on(this.intensityBtn, 'click', function () {
                    that.renderChart(that.intensityData, that.intensityTitle);
                }),
                on(this.calculationsBtn, 'click', function () {
                    that.showCalculations();
                })
            );

            this.geoService = new GeometryService(AGRC.urls.geometry);
            $(this.usableSlider).on('slide', function (evt) {
                that.updateCalculationValues(evt.value);
            });
        },
        setData: function (geometry) {
            // summary:
            //      description
            // geometry: Polygon
            console.log(this.declaredClass + '::setData', arguments);

            var params = new AreasAndLengthsParameters();

            domUtils.show(this.loader);
            domUtils.hide(this.chartDiv);

            params.areaUnit = GeometryService.UNIT_SQUARE_FEET;
            params.calculationType = 'preserveShape';
            params.lengthUnit = GeometryService.UNIT_FOOT;
            params.polygons = [geometry];

            this.geoService.areasAndLengths(params, lang.hitch(this, this.onAreasAndLengthsReturn), function (err) {
                window.alert('There was an error with the geometry service', err.message);
            });

            if (!this.graphicClickHandler) {
                this.graphicClickHandler = this.map.graphics.on('click', lang.hitch(this, this.show));
            }

            this.geometry = geometry;
        },
        sendDataToSOE: function (geometry) {
            // summary:
            //      sends the data to the soe and wires callbacks
            // geometry: Polygon
            console.log(this.declaredClass + '::sendDataToSOE', arguments);

            esriRequest({
                url: AGRC.urls.soe,
                content: {
                    f: 'json',
                    geometry: this.formatGeometry(geometry),
                    durationThreshold: '300'
                },
                handleAs: 'json',
                callbackParamName: 'callback'
            }).then(
                lang.hitch(this, this.onSOEReturn),
                lang.hitch(this, this.onSOEError)
            );
        },
        formatGeometry: function (geometry) {
            // summary:
            //      flattens all coordinates into a single number array
            //      that suitable for the soe input
            // geometry: Polygon
            console.log(this.declaredClass + '::formatGeometry', arguments);

            var a = [];

            array.forEach(geometry.rings[0], function (coord) {
                a = a.concat(coord);
            });

            return JSON.stringify(a);
        },
        onSOEReturn: function (json) {
            // summary:
            //      callback for soe request
            // json: Object
            console.log(this.declaredClass + '::onSOEReturn', arguments);

            this.durationData = this.formatDataForChart(json.solarPotential.duration, 1);
            this.intensityData = this.formatDataForChart(json.solarPotential.radiation, 1000);

            if (domClass.contains(this.durationBtn, 'active')) {
                this.renderChart(this.durationData, this.durationTitle);
            } else if (domClass.contains(this.intensityBtn, 'active')) {
                this.renderChart(this.intensityData, this.intensityTitle);
            } else {
                this.showCalculations();
            }

            domUtils.hide(this.loader);
        },
        renderChart: function (data, title) {
            // summary:
            //      updates the chart data and re-renders
            // data: Array
            //      The new data
            // title: String
            //      The new chart title
            console.log(this.declaredClass + '::renderChart', arguments);

            domUtils.show(this.chartDiv);
            domUtils.hide(this.calculationsDiv);

            // addSeries doesn't duplicate, if the name is the same as an existing series
            this.chart.addSeries('series', data);
            this.chart.addAxis('values', {
                vertical: true,
                fixUpper: 'major',
                minorLabels: false,
                title: title,
                titleGap: 7,
                titleFontColor: '#888c76'
            });
            this.chart.render();
        },
        onSOEError: function (err) {
            // summary:
            //      Error callback
            // err: Error Object
            console.log(this.declaredClass + '::onSOEError', arguments);

            console.error(err);

            window.alert(this.errMsg);
            domUtils.hide(this.loader);
        },
        formatDataForChart: function (data, factor) {
            // summary:
            //      flattens the data into an array
            // data: Object
            // factor: Number
            console.log(this.declaredClass + '::formatDataForChart', arguments);

            var array = [];
            for (var prop in data) {
                if (data.hasOwnProperty(prop)) {
                    array.push(data[prop] / factor);
                }
            }

            return array;
        },
        showCalculations: function () {
            // summary:
            //      shows the calculations div
            console.log(this.declaredClass + '::showCalculations', arguments);

            domUtils.hide(this.chartDiv);
            domUtils.show(this.calculationsDiv);

            // this needs to be done after the element is visible or
            // the sizing is all messed up
            if (!this.sliderInit) {
                $(this.usableSlider).slider({
                    formater: function (value) {
                        return value + '%';
                    }
                });
                this.sliderInit = true;
            }
        },
        show: function () {
            // summary:
            //      description
            console.log(this.declaredClass + '::show', arguments);

            this.showAni.play();
        },
        hide: function () {
            // summary:
            //      description
            console.log(this.declaredClass + '::hide', arguments);

            this.hideAni.play();
        },
        onAreasAndLengthsReturn: function (results) {
            // summary:
            //      callback for areasAndLengths geometry service
            // results: {areas: Number[], lengths: Number[]}
            console.log(this.declaredClass + '::onAreasAndLengthsReturn', arguments);

            var area = Math.round(results.areas[0], 10);
            var areaTxt = this.formatNumber(area, 'sq ft');

            if (area > AGRC.maxSqFt) {
                window.alert('Your area is: ' + area + ' square feet. Areas more than 10,000 sqft are not allowed. Try drawing a smaller area.');
                this.hide();
            } else {
                this.sendDataToSOE(this.geometry);

                this.totalAreaTxt.innerHTML = areaTxt;
                this.totalArea = area;
                this.updateCalculationValues(100);
            }
        },
        formatNumber: function (number, type) {
            // summary:
            //      formats a number suitable for a text box
            // number: Number
            // type: String (sqft | )
            console.log(this.declaredClass + '::formatNumber', arguments);

            return Formatting.addCommas(number) + ' ' + type;
        },
        updateCalculationValues: function (usable) {
            // summary:
            //      updates all of the values on the calculations tab
            //      based upon the usable percentage
            // usable: Number
            //      percentage of usable roof area
            console.log(this.declaredClass + '::updateCalculationValues', arguments);

            var sqft = this.totalArea * (usable / 100.0);
            var size = sqft * AGRC.PVEfficiency;
            var output = size * AGRC.ElectricGenerationFactor;
            var co2 = output * AGRC.CO2SavingsFactor;

            this.usableRoofAreaTxt.innerHTML = this.formatNumber(Math.round(sqft), 'sq ft');
            this.potentialSysSizeTxt.innerHTML =
                this.formatNumber(Math.round(size * 10) / 10, 'kW');
            this.estElecTxt.innerHTML = this.formatNumber(Math.round(output), 'kWh/year');
            this.estCO2Txt.innerHTML = this.formatNumber(Math.round(co2), 'lbs/yr');
        }
    });
});
