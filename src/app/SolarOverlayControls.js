define([
    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/on',
    'dojo/query',
    'dojo/text!./templates/Legend.html',
    'dojo/text!app/templates/SolarOverlayControls.html',
    'dojo/_base/declare',
    'dojo/_base/lang',

    'esri/layers/ArcGISDynamicMapServiceLayer',
    'esri/layers/ArcGISTiledMapServiceLayer'
], function (
    _TemplatedMixin,
    _WidgetBase,
    _WidgetsInTemplateMixin,

    on,
    query,
    legendHTML,
    template,
    declare,
    lang,

    ArcGISDynamicMapServiceLayer,
    ArcGISTiledMapServiceLayer
) {
    // summary:
    //      Contains the controls for toggling the solar layers as well as controlling their transparency.
    return declare('app/SolarOverlayControls', [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        widgetsInTemplate: false,
        templateString: template,
        baseClass: 'solar-overlay-controls',

        // durationLayer: esri/layers/ArcGISTileMapServiceLayer
        durationLayer: null,

        // intensityLayer: esri/layers/ArcGISTiledMapServiceLayer
        intensityLayer: null,

        // solarByZipLayer: esri/layers/ArcGISDynamicMapServiceLayer
        solarByZipLayer: null,

        // showOverlay: Boolean
        //      controls whether the selected layer is displayed on the map
        showOverlay: false,


        // parameters passed into the constructor

        // map: agrc/widgets/map/BaseMap
        map: null,

        postCreate: function () {
            // summary:
            //      dom is ready
            console.log('app/SolarOverlayControls:postCreate', arguments);

            var that = this;
            var makeLayer = function (url, Con) {
                var lyr = new Con(url, {
                    visible: false,
                    opacity: parseInt(that.slider.getAttribute('data-slider-value'), 10) / 100
                });
                that.map.addLayer(lyr);

                return lyr;
            };

            $(this.slider).slider();

            this.durationLayer = makeLayer(AGRC.urls.duration, ArcGISTiledMapServiceLayer);
            this.intensityLayer = makeLayer(AGRC.urls.radiation, ArcGISTiledMapServiceLayer);
            this.solarByZipLayer = makeLayer(AGRC.urls.solarByZip, ArcGISDynamicMapServiceLayer);
            this.solarByZipLayer.hide();
            this.map.addLoaderToLayer(this.solarByZipLayer);

            this.wireEvents();

            query('i', this.domNode).forEach(function (node) {
                $(node).popover({
                    content: legendHTML.replace('{{src}}', node.getAttribute('data-image')),
                    html: true,
                    trigger: 'hover',
                    title: 'Legend',
                    placement: 'bottom'
                });
            });

            this.inherited(arguments);
        },
        wireEvents: function () {
            // summary:
            //      wires the events for this widget
            console.log('app/SolarOverlayControls:wireEvents', arguments);

            var that = this;
            this.own(
                on(this.showCheckBox, 'change', lang.hitch(this, this.onShowToggle)),
                on(this.showCheckBox, 'click', function () {
                    that.showCheckBox.blur();
                    that.showCheckBox.focus();
                })
            );
            query('input[type="radio"]', this.domNode).forEach(function (rdio) {
                that.own(
                on(rdio, 'change', lang.hitch(that, that.onLayerToggle)),
                on(rdio, 'click', function () {
                    rdio.blur();
                    rdio.focus();
                })
            );
            });

            $(this.slider).on('slide', lang.hitch(this, this.onSliderChange));
        },
        onShowToggle: function (evt) {
            // summary:
            //      fires when the checkbox is toggles
            // evt: Event Object
            console.log('app/SolarOverlayControls:onShowToggle', arguments);

            this.showOverlay = evt.target.checked;
            this.updateLayerVisibility();
        },
        onLayerToggle: function () {
            // summary:
            //      fires when the radio buttons are toggled
            console.log('app/SolarOverlayControls:onLayerToggle', arguments);

            this.updateLayerVisibility();
        },
        onSliderChange: function (evt) {
            // summary:
            //      fires when the sliders is dragged
            // evt: Event Object
            console.log('app/SolarOverlayControls:onSliderChange', arguments);

            var opacity = evt.value / 100;

            this.durationLayer.setOpacity(opacity);
            this.intensityLayer.setOpacity(opacity);
            this.solarByZipLayer.setOpacity(opacity);
        },
        updateLayerVisibility: function () {
            // summary:
            //      sets the two layer visibility appropriately taking into account
            //      showOverlay and the radio button values
            console.log('app/SolarOverlayControls:updateLayerVisibility', arguments);

            if (this.showOverlay) {
                var updateLyr = function (lyr, rb) {
                    return (rb.checked) ? lyr.show() : lyr.hide();  // this is cool code. You have to admit :)
                };

                updateLyr(this.durationLayer, this.durationRadioBtn);
                updateLyr(this.intensityLayer, this.intensityRadioBtn);
                updateLyr(this.solarByZipLayer, this.zipRadioBtn);
            } else {
                this.durationLayer.hide();
                this.intensityLayer.hide();
                this.solarByZipLayer.hide();
            }
        }
    });
});
