/**
 * @author wb-yanggwikim
 *
 * @version $$id: , v 0.1 15. 2. 5. 오후 1:27 wb-yealeekim Exp $$
 */

define(
    [

    ],
    function() {

        function BXForm($el, config) {
            var that = this;

            that.$el = $el;

            that.$el.on('change', 'select[data-form-param]', function(e) {
                var $select = $(this);
                $select.prev('.bx-form-select-view').val($select.val());
            });

            that.$el.find('[data-value-link]').each(function(i, el) {
                var $displayEl = $(this),
                    valueLink = $displayEl.attr('data-value-link'),
                    value = $displayEl.val(),
                    $targetItem;

                $targetItem = that.$el.find('[name='+valueLink+'][value='+value+']');

                if($targetItem[0].tagName === 'SELECT') {
                    $targetItem.val(value);
                }else {
                    $targetItem.prop('checked', true);
                }

            });

            if(config && config.mode) {
                that.changeMode(config.mode);
            }else {
                that.changeMode('view');
            }
        }

        BXForm.prototype = {
            constructor: 'BXForm',

            getData: function(option) {
                return bxUtil.makeParamFromForm(this.$el, option);
            },
            changeMode: function(mode) {
                this.$el.attr('data-mode', mode);

                this.$el.find('[data-edit]').prop('disabled', true);
                this.$el.find('[data-edit~="'+mode+'"]').prop('disabled', false);

                this.$el.find('[data-view]').hide();

                (mode === 'new') && this.reset();

                this.$el.find('[data-view~="'+mode+'"]').show();
            },
            reset: function() {
                this.$el.find('.bx-form-item').val('');
                this.$el.find('.bx-form-item[type=checkbox]').prop('checked', false);
                this.$el.find("select option:eq(0)").prop("selected", true);
            },
            html: function() {
                this.$el.html();
            },
            remove: function() {
                this.$el.remove();
            }
        };

        return BXForm;

    }
);