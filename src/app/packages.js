require({
    packages: [
        'agrc',
        'app',
        'dgrid',
        'dgauges',
        'dijit',
        'dojo',
        'dojox',
        'esri',
        'ijit',
        'layer-selector',
        'moment',
        'put-selector',
        'xstyle',
        {
            name: 'bootstrap',
            location: './bootstrap',
            main: 'dist/js/bootstrap'
        }, {
            name: 'bootstrap-slider',
            location: './seiyria-bootstrap-slider',
            main: 'dist/bootstrap-slider'
        }, {
            name: 'jquery',
            location: './jquery/dist',
            main: 'jquery'
        }, {
            name: 'ladda',
            location: './ladda-bootstrap',
            main: 'dist/ladda'
        }, {
            name: 'mustache',
            location: './mustache',
            main: 'mustache'
        }, {
            name: 'proj4',
            location: './proj4/dist',
            main: 'proj4'
        }, {
            name: 'spin',
            location: './spinjs',
            main: 'spin'
        }, {
            name: 'stubmodule',
            location: './stubmodule',
            main: 'src/stub-module'
        }
    ]
});
