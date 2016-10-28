require([
    'app/App',
    'app/config',

    'dojo/dom-class',
    'dojo/dom-construct',
    'dojo/text!app/tests/data/PolygonGeometry.json',

    'esri/map',
    'esri/toolbars/draw'
], function (
    App,
    config,

    domClass,
    domConstruct,
    polygonJSON,

    Map,
    Draw
) {
    describe('app/App', function () {
        var testWidget;
        var geometry;
        beforeEach(function () {
            testWidget = new App({}, domConstruct.create('div', {}, document.body));
            geometry = JSON.parse(polygonJSON);
            geometry.toJson = function () {};
        });
        afterEach(function () {
            testWidget.destroy();
            testWidget = null;
        });

        describe('constructor', function () {
            it('creates a valid object', function () {
                expect(testWidget).toEqual(jasmine.any(App));
            });
            it('creates a valid symbol', function () {
                expect(testWidget.symbol).toBeDefined();
            });
        });
        describe('postCreate', function () {
            it('calls wireEvents', function () {
                spyOn(testWidget, 'wireEvents');

                testWidget.postCreate();

                expect(testWidget.wireEvents).toHaveBeenCalled();
            });
            it('inits the popup widget', function () {
                expect(testWidget.popup).toBeDefined();
            });
        });
        describe('initMap', function () {
            beforeEach(function () {
                testWidget.initMap();
            });
            it('creates a valid map object', function () {
                expect(testWidget.map).toEqual(jasmine.any(Map));
            });
            it('creates a Draw object', function () {
                expect(testWidget.draw).toEqual(jasmine.any(Draw));
            });
        });
        describe('wireEvents', function () {
            it('wires the draw button', function () {
                spyOn(testWidget, 'onDrawClick');

                testWidget.wireEvents();
                testWidget.drawBtn.click();

                expect(testWidget.onDrawClick).toHaveBeenCalled();
            });
            it('wires the onDrawEnd event', function () {
                spyOn(testWidget, 'onDrawEnd');

                testWidget.wireEvents();
                testWidget.draw.onDrawEnd(geometry);

                expect(testWidget.onDrawEnd).toHaveBeenCalled();
            });
            it('wires the clear button', function () {
                spyOn(testWidget, 'onClearDrawing');

                testWidget.wireEvents();
                testWidget.clearBtn.click();

                expect(testWidget.onClearDrawing).toHaveBeenCalled();
            });
        });
        describe('onDrawClick', function () {
            beforeEach(function () {
                spyOn(testWidget.draw, 'activate');
                spyOn(testWidget.draw, 'deactivate');
                spyOn(testWidget, 'onClearDrawing');
            });
            it('activates the drawing toolbar if the button is activated', function () {
                testWidget.drawBtn.click();

                expect(testWidget.draw.activate).toHaveBeenCalledWith(Draw.POLYGON);
                expect(testWidget.draw.deactivate).not.toHaveBeenCalled();
            });
            it('deactivates drawing toolbar if the button is being deactivated', function () {
                domClass.add(testWidget.drawBtn, 'active');
                testWidget.drawBtn.click();

                expect(testWidget.draw.activate).not.toHaveBeenCalled();
                expect(testWidget.draw.deactivate).toHaveBeenCalled();
            });
            it('clears any existing drawings', function () {
                testWidget.drawBtn.click();

                expect(testWidget.onClearDrawing).toHaveBeenCalled();
            });
        });
        describe('onDrawEnd', function () {
            it('adds the graphic to the map', function () {
                spyOn(testWidget.map.graphics, 'add');

                testWidget.onDrawEnd(geometry);

                expect(testWidget.map.graphics.add).toHaveBeenCalled();
            });
            it('disabled the draw toolbar and button', function () {
                testWidget.drawBtn.click();
                spyOn(testWidget.draw, 'deactivate');

                testWidget.onDrawEnd(geometry);

                expect(testWidget.draw.deactivate).toHaveBeenCalled();
                expect(domClass.contains(testWidget.drawBtn, 'active')).toBe(false);
            });
        });
        describe('onClearDrawing', function () {
            it('clears the map graphics', function () {
                spyOn(testWidget.map.graphics, 'clear');

                testWidget.onClearDrawing();

                expect(testWidget.map.graphics.clear).toHaveBeenCalled();
            });
        });
    });
});
