define([
    'agrc/widgets/locate/FindAddress',
    'agrc/widgets/map/BaseMap',

    'app/Popup',
    'app/SolarOverlayControls',

    'dijit/registry',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/aspect',
    'dojo/dom',
    'dojo/dom-class',
    'dojo/on',
    'dojo/text!app/templates/App.html',
    'dojo/_base/Color',
    'dojo/_base/declare',
    'dojo/_base/lang',

    'esri/geometry/Extent',
    'esri/graphic',
    'esri/symbols/SimpleFillSymbol',
    'esri/toolbars/draw',

    'bootstrap/js/bootstrap',
    'dijit/TitlePane',
    'slider/js/bootstrap-slider'
], function (
    FindAddress,
    BaseMap,

    Popup,
    SolarOverlayControls,

    registry,
    _TemplatedMixin,
    _WidgetBase,
    _WidgetsInTemplateMixin,

    aspect,
    dom,
    domClass,
    on,
    template,
    Color,
    declare,
    lang,

    Extent,
    Graphic,
    SimpleFillSymbol,
    Draw
) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // summary:
        //      The main widget for the app

        widgetsInTemplate: true,
        templateString: template,
        baseClass: 'app',

        // map: agrc.widgets.map.Basemap
        map: null,

        // findAddress: agrc/widgets/locate/FindAddress
        findAddress: null,

        // solarOverlayControls: app/SolarOverlayControls
        solarOverlayControls: null,

        // symbol: esri/symbol/SimpleFillSymbol
        //      description
        symbol: null,

        // popup: Popup
        popup: null,

        constructor: function () {
            // summary:
            //      first function to fire after page loads
            console.log('app/App:constructor', arguments);

            // AGRC.errorLogger = new ErrorLogger({appName: 'SolarMapWidget'});
            AGRC.app = this;

            this.symbol = new SimpleFillSymbol().setColor(new Color(AGRC.drawSymbolColor.concat([0.25])));
        },
        postCreate: function () {
            // summary:
            //      Fires when
            console.log('app/App:postCreate', arguments);

            this.initMap();

            var that = this;
            this.map.on('load', function () {
                that.map.graphics.on('click', function () {
                    that.map.infoWindow.show();
                });
            });
            this.findAddress = new FindAddress({
                map: this.map,
                apiKey: AGRC.apiKey
            }, this.findAddressDiv);

            this.solarOverlayControls = new SolarOverlayControls({
                map: this.map
            }, this.solarOverlayControlsDiv);

            this.wireEvents();
            this.popup = new Popup({map: this.map}, this.sideBar);

            $('.tooltip-a').tooltip({container: 'body'});
        },
        initMap: function () {
            // summary:
            //      Sets up the map
            console.log('app/App:initMap', arguments);

            this.map = new BaseMap(this.mapDiv, {
                defaultBaseMap: 'Hybrid',
                extent: new Extent({
                    'type': 'extent',
                    'xmin': 406719.3295027474,
                    'ymin': 4486834.867579307,
                    'xmax': 435956.49282178795,
                    'ymax': 4516607.090096343,
                    'spatialReference': {
                        'wkid': 26912
                    }
                })
            });

            this.draw = new Draw(this.map);
        },
        wireEvents: function () {
            // summary:
            //      wires the events for this widget
            console.log(this.declaredClass + '::wireEvents', arguments);

            this.own(
                on(this.drawBtn, 'click', lang.hitch(this, this.onDrawClick), true),
                aspect.after(this.draw, 'onDrawEnd', lang.hitch(this, this.onDrawEnd), true),
                on(this.clearBtn, 'click', lang.hitch(this, this.onClearDrawing), true),
                on(window, 'resize', lang.hitch(this, this.resize))
            );
        },
        onDrawClick: function () {
            // summary:
            //      fires when the user clicks on the draw button
            console.log(this.declaredClass + '::onDrawClick', arguments);

            this.onClearDrawing();

            var activating = !domClass.contains(this.drawBtn, 'active');

            if (activating) {
                this.draw.activate(Draw.POLYGON);
            } else {
                this.draw.deactivate();
            }

            this.map.infoWindow.hide();
        },
        onDrawEnd: function (geometry) {
            // summary:
            //      fires when the user completes their drawing
            // geometry: esri/geometry/Poylgon
            console.log(this.declaredClass + '::onDrawEnd', arguments);

            var graphic = new Graphic(geometry, this.symbol);

            this.map.graphics.add(graphic);

            this.draw.deactivate();
            domClass.remove(this.drawBtn, 'active');

            this.popup.setData(geometry);

            this.popup.show();
        },
        onClearDrawing: function () {
            // summary:
            //      clears the drawing on the map
            console.log(this.declaredClass + '::onClearDrawing', arguments);

            this.map.graphics.clear();
            this.popup.hide();
        },
        resize: function () {
            // summary:
            //      resizes the map and popup divs
            console.log(this.declaredClass + '::resize', arguments);

            if (this.map) {
                this.map.resize();
            }
            if (this.popup) {
                this.popup.resize();
            }
        }
    });
});
