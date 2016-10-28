define([
    'agrc/widgets/locate/FindAddress',
    'agrc/widgets/map/BaseMap',

    'app/config',
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

    'layer-selector/LayerSelector',

    'bootstrap',
    'bootstrap-slider',
    'dijit/TitlePane'
], function (
    FindAddress,
    BaseMap,

    config,
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
    Draw,

    LayerSelector
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

            config.app = this;

            this.symbol = new SimpleFillSymbol().setColor(new Color(config.drawSymbolColor.concat([0.25])));
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
                apiKey: config.apiKey,
                zoomLevel: 20
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
                useDefaultBaseMap: false,
                extent: new Extent({
                    xmax: -12402133.995934062,
                    xmin: -12512203.316664688,
                    ymax: 4987492.188899369,
                    ymin: 4930164.417685502,

                    // test extent that is zoomed in
                    // xmin: -12455146.508744448,
                    // ymin: 4964198.303111609,
                    // xmax: -12454994.231852163,
                    // ymax: 4964310.2714147605,
                    spatialReference: {
                        wkid: 3857
                    }
                }),
                showAttribution: false
            });

            var layerSelector = new LayerSelector({
                map: this.map,
                quadWord: config.quadWord,
                baseLayers: ['Hybrid']
            });
            layerSelector.startup();

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
