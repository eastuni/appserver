'use strict';

// RequireJS 설정
require.config({
    urlArgs: 'v=' + (new XDate()).toString('yyyyMMdd'),
    paths: {
        text: '../libs/require/text-2.0.10.min'
    }
});

// 다국어 처리
Handlebars.registerHelper('bxMsg', function(keyword) {
    return bxMsg(keyword) || keyword;
});

// String function update
String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

bxMsg.init({
    locale: $.cookie('bxm-admin-locale') || 'ko',
    messageRoot: 'scripts/messages',
    messageList: [
        'common',
        'main-menu',

        'online',
        'batch',
        'deferred',
        'center-cut',
        'trx-setting',
        'app-deploy',
        'setting',
        'dni',
        'scheduler',
        'error-setting',
        'log'
    ]
});

// 메인 시작!
require(
    [
        'common/util',
        'common/config',
        'common/main/main',
        'routers/router'
    ],
    function(
        commonUtil,
        commonConfig,
        MainView,
        Router
    ) {
        commonConfig.brand = commonConfig.brand || 'BXM WEB ADMIN';
        document.title = commonConfig.brand.toUpperCase();

        registerJQuery();
        registerEventHandler();
        registerTooltip();
        registerCommonValidation();
        registerHandlebars();

        new MainView().loadMain();

        new Router();

        Backbone.history.start();

        function registerJQuery() {

            $.elementReady = function(selector, afterRenderFn) {

                var findTime = 0,
                    checkInterval = setInterval(function() {

                        if($(selector).length > 0) {
                            clearInterval(checkInterval);
                            afterRenderFn();
                            return;
                        }

                        findTime += 100;

                        if(findTime >= 2000) {
                            clearInterval(checkInterval);
                            throw 'DOM Ready Time Out By BXT';
                        }

                    }, 100);
            };

            $.fn.redraw = function(){
                $(this).each(function(){
                    var redraw = this.offsetHeight;
                });
            };
        }

        function registerEventHandler() {
            var $body = $('body');
            // resize event
            $(window).resize(function() {
                $('.manual-resize-component:visible').trigger('resize-component');
            });

            // input enter event
            $body.on('keypress', 'input', function(e) {
                if(e.keyCode == 13){
                    $(this).trigger('enter-component');
                }
            });

            // close Sweet Alert popup
            $body.on('click', '.sweet-alert-button-resize div.cancel-swal-btn', function () {
                swal.close();
            });
        }

        function registerTooltip() {
            $('body').tooltip({
                position: {
                    my: "center bottom-20",
                    at: "center top",
                    using: function( position, feedback ) {
                        $(this).css( position );
                        $('<div>').addClass( 'arrow')
                            .addClass( feedback.vertical )
                            .addClass( feedback.horizontal )
                            .appendTo( this );
                    }
                }
            });
        }

        // Event Delegation
        function registerCommonValidation() {
            var $body = $('body');
            $body.on( "keydown", 'input.validate-number', function( event ) {
                commonUtil.validateInput(event, /^[0-9]*$/);
            });

            $body.on( "keydown", 'input.validate-number-4', function( event ) {
                commonUtil.validateInput(event, /^[0-9]{0,4}$/);
            });
        }

        function registerHandlebars() {
            Handlebars.registerHelper('ifIn', function(elem, list, options) {
                if(list.indexOf(elem) > -1) {
                    return options.fn(this);
                }
                return options.inverse(this);
            });
        }
    }
);


