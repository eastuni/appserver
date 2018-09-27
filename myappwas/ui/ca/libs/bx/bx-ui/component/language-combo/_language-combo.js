define(
    [
        'bx/common/config',
        'text!bx-component/language-combo/_language-combo-tpl.html',
    ],
    function (
    	config,
        tpl
        ) {

        var LanguageCombo = Backbone.View.extend({
            tagName: 'select',
            className: 'bx-combo-box bx-form-item bx-compoenent-small',

            templates: {
                tpl: tpl
            },

            initialize: function (initConfig) {
                if(initConfig) {
                    initConfig.attrs && this.$el.attr(initConfig.attrs);
                }
            },

            render: function () {
                this.$el.html(this.tpl({languageList: config.supportedLocaleList}));
                this.$el.val(config.currentLocale);
                return this.$el;
            }
        });

        return LanguageCombo;
    }
);