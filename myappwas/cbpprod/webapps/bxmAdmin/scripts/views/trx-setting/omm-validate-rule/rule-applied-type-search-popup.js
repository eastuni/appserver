define(
    [
        'common/util',
        'common/config',
        'common/component/popup/popup',
        'text!views/trx-setting/omm-validate-rule/rule-applied-type-search-popup-tpl.html'
    ],
    function(
        commonUtil,
        commonConfig,
        Popup,
        tpl
    ) {
        return Popup.extend({
            className: 'md-small',

            templates: {
                'tpl': tpl
            },

            events: {
                'click .save-btn': 'saveItem',
                'click .cancel-btn': 'close'
            },

            initialize: function() {},

            render: function(items) {
                this.$el.html(this.tpl());

                this.loadButtons(items);
                this.setDraggable();
                this.show();
            },

            loadButtons: function (items) {
                var currentItems = items.split(', '),
                    buttons = [];

                for (var item in commonConfig.comCdList['BXMAD0030']) {
                    if (commonConfig.comCdList['BXMAD0030'].hasOwnProperty(item)) {
                        buttons.push('<li class="input-wrap w-100">\
                        <button class="input-style-button w-100' + (currentItems.indexOf(item) !== -1 ? ' on' : '') + '" value="' + item + '">' + item + '</button>\
                        </li>');
                    }
                }
                this.$el.find('.bx-search-wrap ul')
                    .html(buttons)
                    .on('click', 'button', function (event) {
                        var $target = $(event.currentTarget);

                        if ($target.hasClass('on')) {
                            $target.removeClass('on');
                        } else {
                            $target.addClass('on');
                        }
                    });
            },

            saveItem: function() {
                var items = [];
                this.$el.find('.bx-search-wrap button.on').each(function (i, item) {
                    items.push($(item).val());
                });

                this.trigger('save-items', items.join(', '));
                this.close();
            }
        });
    }
);