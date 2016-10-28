require([
    'app/SolarOverlayControls',

    'dojo/dom-construct',
    'dojo/on',
    'dojo/_base/window'
],

function (
    SolarOverlayControls,

    domConstruct,
    on,
    win
) {
    describe('app/SolarOverlayControls', function () {
        var testWidget;
        var destroy = function (widget) {
            widget.destroyRecursive();
            widget = null;
        };
        var map;
        beforeEach(function () {
            map = jasmine.createSpyObj('map', ['addLayer', 'addLoaderToLayer']);
            testWidget = new SolarOverlayControls({
                map: map
            }, domConstruct.create('div', {}, win.body()));
            testWidget.startup();
        });
        afterEach(function () {
            destroy(testWidget);
        });
        it('create a valid object', function () {
            expect(testWidget).toEqual(jasmine.any(SolarOverlayControls));
        });
        describe('postCreate', function () {
            it('adds the layers to the map', function () {
                expect(map.addLayer.calls.count()).toBe(3);
                expect(map.addLayer).toHaveBeenCalledWith(testWidget.durationLayer);
            });
        });
        describe('wireEvents', function () {
            it('wires the control events', function () {
                testWidget.showCheckBox.checked = false;
                spyOn(testWidget, 'onShowToggle');
                spyOn(testWidget, 'onLayerToggle');
                spyOn(testWidget, 'onSliderChange');
                testWidget.wireEvents();

                on.emit(testWidget.showCheckBox, 'change', {
                    bubbles: true,
                    cancelable: true
                });

                expect(testWidget.onShowToggle).toHaveBeenCalled();

                testWidget.intensityRadioBtn.click();
                testWidget.durationRadioBtn.click();

                expect(testWidget.onLayerToggle.calls.count()).toBe(2);

                $(testWidget.slider).slider().trigger('slide');

                expect(testWidget.onSliderChange).toHaveBeenCalled();
            });
        });
        describe('onShowToggle', function () {
            it('set the showOverlay property', function () {
                testWidget.onShowToggle({target: {checked: true}});

                expect(testWidget.showOverlay).toBeTruthy();

                testWidget.onShowToggle({target: {checked: false}});

                expect(testWidget.showOverlay).toBeFalsy();
            });
            it('fires updateLayerVisibility', function () {
                spyOn(testWidget, 'updateLayerVisibility');

                testWidget.onShowToggle({target: {checked: true}});

                expect(testWidget.updateLayerVisibility).toHaveBeenCalled();
            });
        });
        describe('updateLayerVisibility', function () {
            beforeEach(function () {
                spyOn(testWidget.durationLayer, 'show');
                spyOn(testWidget.durationLayer, 'hide');
                spyOn(testWidget.intensityLayer, 'show');
                spyOn(testWidget.intensityLayer, 'hide');
                spyOn(testWidget, 'onLayerToggle');
            });
            it('calls show and hide on layers depending on radio button checked status - intensity checked', function () {
                testWidget.showOverlay = true;
                testWidget.intensityRadioBtn.checked = true;

                testWidget.updateLayerVisibility();

                expect(testWidget.durationLayer.hide).toHaveBeenCalled();
                expect(testWidget.intensityLayer.show).toHaveBeenCalled();
                expect(testWidget.durationLayer.show).not.toHaveBeenCalled();
                expect(testWidget.intensityLayer.hide).not.toHaveBeenCalled();
            });
            it('calls show and hide on layers depending on radio button checked status - duration checked', function () {
                testWidget.showOverlay = true;
                testWidget.durationRadioBtn.checked = true;

                testWidget.updateLayerVisibility();

                expect(testWidget.durationLayer.hide).not.toHaveBeenCalled();
                expect(testWidget.intensityLayer.show).not.toHaveBeenCalled();
                expect(testWidget.durationLayer.show).toHaveBeenCalled();
                expect(testWidget.intensityLayer.hide).toHaveBeenCalled();
            });
            it('hides both layers if showOverlay is false', function () {
                testWidget.showOverlay = false;

                testWidget.updateLayerVisibility();

                expect(testWidget.durationLayer.hide).toHaveBeenCalled();
                expect(testWidget.intensityLayer.show).not.toHaveBeenCalled();
                expect(testWidget.durationLayer.show).not.toHaveBeenCalled();
                expect(testWidget.intensityLayer.hide).toHaveBeenCalled();
            });
        });
        describe('onLayerToggle', function () {
            it('calls updateLayerVisibility', function () {
                spyOn(testWidget, 'updateLayerVisibility');

                testWidget.onLayerToggle();

                expect(testWidget.updateLayerVisibility).toHaveBeenCalled();
            });
        });
        describe('onSliderChange', function () {
            it('updates the opacity on both layers', function () {
                spyOn(testWidget.durationLayer, 'setOpacity');
                spyOn(testWidget.intensityLayer, 'setOpacity');
                var value = 80;

                testWidget.onSliderChange({value: value});

                expect(testWidget.durationLayer.setOpacity).toHaveBeenCalledWith(value / 100);
                expect(testWidget.intensityLayer.setOpacity).toHaveBeenCalledWith(value / 100);
            });
        });
    });
});
