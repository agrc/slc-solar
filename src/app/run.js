(function () {
    var projectUrl;
    if (typeof location === 'object') {
        // running in browser
        projectUrl = location.pathname.replace(/\/[^\/]+$/, "");

        // jasmine unit tests
        if (window.jasmine) {
            projectUrl += '/src/';
        }
    } else {
        // running in build system
        projectUrl = '';
    }
    var config = {packagePaths: {}};
    config.packagePaths[projectUrl] = [
        'app',
        'agrc',
        'ijit',
        'bootstrap',
        'slider'
    ];
    require(config, ['app', 'bootstrap/js/jquery-1.9.1']);
})();