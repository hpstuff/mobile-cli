(function(){
    var Application = mobile.app.Application.extend({
        beforeStart: function(){
            var meta = document.querySelector("meta[name='apple-mobile-web-app-status-bar-style']");

            this.setFullscreen();
        },
        setFullscreen: function(){
            var isiDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
            var version_match = navigator.userAgent.match(/OS (\d)/);
            var iOS7 = isiDevice && version_match[1] && parseInt(version_match[1]) > 6;

            window.d = {
                platform : isiDevice ? "iOS" : "Android"
            }

            if(window.navigator.standalone || (window.device && device.platform === 'iOS')){
                document.body.classList.add('fullscreen');
            }
        },
        onStart: function(){
            var _this = this;

            /* TODO: init you classes here */

            this.base();
        }
    });

    var application = new Application();

    /*TODO: remove on build */
    if(!window.cordova) {
        application.start();
    }
    
    document.addEventListener('deviceready', function(){
        application.start();
    });
})();

