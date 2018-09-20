define(
    [
        'common/config',
        'text!views/online/online-monitoring/_online-monitoring-tpl.html'
    ],
    function(
        commonConfig,
        tpl
    ) {
        return Backbone.View.extend({

            tagName: 'section',

            templates: {
                'tpl': tpl
            },

            events: {},

            initialize: function() {
                this.$el.html(this.tpl()).addClass('clr-mg');
            },

            render: function() {
                return this.$el;
            },

            afterRender: function (renderInfo) {
                if (renderInfo && renderInfo['enPharos']) {
                    var enPharosMenu = commonConfig.pageInfo[location.hash.substring(1)]['desc'];
                    if (!commonConfig.enPharosRendered) {
                        var params = {
                                quality: "high",
                                bgcolor: "#ffffff",
                                allowscriptaccess: "sameDomain",
                                allowfullscreen: "true"
                            },
                            attributes = {
                                id: "TRACE",
                                name: "TRACE",
                                align: "middle"
                            },
                            flashVars = {
                                selectedMenu: enPharosMenu
                            };

                        swfobject.embedSWF(
                            "libs/enpharos/TRACE.swf", "flashContent",
                            "100%", "100%",
                            "20.0.0", "libs/enpharos/expressInstall.swf",
                            flashVars, params, attributes);

                        // JavaScript enabled so display the flashContent div in case it is not replaced with a swf object.
                        swfobject.createCSS("#flashContent", "display:block;text-align:left;");

                        commonConfig.enPharosRendered = true;
                    } else {
                        var enpharosTRACE = document.getElementById("TRACE");
                        if (enpharosTRACE)
                        {
                            enpharosTRACE.changeMenu(enPharosMenu);
                        }
                    }
                }
            }
        });
    }
);
