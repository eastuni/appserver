define(
    [
     	'bx-component/date-picker/_date-picker'
    ],
    function (DatePicker) {
        var DatePickerManager = Backbone.View.extend({

            initialize: function (config) {
                var that = this;
                $.extend(that, config);
            }

            , render: function () {
                return this.$el;
            }
            
            , makeDataPicker : function(that, key, src) {
            	that.subViews[key] && that.subViews[key].remove();
        		that.subViews[key] = new DatePicker({
        	       inputAttrs: {'data-form-param': key},
        	       setTime: false
        	    });
        		that.$el.find(src).html(that.subViews[key].render());
            }

           
        });

        return DatePickerManager;
    } // end function
); // end difine