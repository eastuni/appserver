define(
    [
        'bx/common/config',
        'text!app/views/page/CAPCM/310/_CAPCM310.html',
        'bx-component/bx-tree/bx-tree'
    ]
    , function (
        config,
        tpl,
        bxTree
    ) {


        /**
         * Backbone
         */
        var CAPCM310View = Backbone.View.extend({
            // set tag name
            tagName: 'section',
            // set class name
            className: 'bx-container CAPCM310-page',
            // set Template
            templates: {
                'tpl': tpl
            },
            // set Events
            events: {
                'keydown #searchKey': 'fn_enter',
                'change .CAPCM310-lnWidth-wrap': 'changeBorderWidth',
                'change .CAPCM310-shadow-wrap': 'changeShadow',


                'click #btn-tree-search': 'searchTreeList',


                'click #btn-base-attribute-undo': 'undoBlockColor',
                'click #btn-base-attribute-reset': 'resetBlockStyle',


                'click #btn-tree-hide': 'hideTree',
                'click #btn-tree-show': 'showTree',


                'click #btn-base-attribute-save': 'saveBlockStyle',
                'click #btn-base-attribute-delete': 'deleteBlockStyle',


                'click #btn-base-attribute-toggle': 'toggleBaseAttribute',
                'click #btn-style-setting-toggle': 'toggleStyleSetting',
                'click #btn-preview-toggle': 'togglePreview'
            },


            /**
             * initialize
             */
            initialize: function (initData) {
                $.extend(this, initData);


                this.colorSelection = [];
                this.blockSeqNbr = 0;


                this.createTree();
            },


            /**
             * render
             */
            render: function () {
                var that = this;


                // set page template
                this.$el.html(this.tpl());
                this.$el.find('.bx-tree-root').html(this.CAPCM310Tree.render());


                setTimeout(function () {
                    that.initialBackgroundColor = that.$el.find('#preview-wrap').css('background');
                    that.initialBorderColor = that.$el.find('#preview-wrap').css('border-color');
                    that.initialShadowColor = 'rgba(0, 0, 0, 0);';
                    that.initialBorderWidth = '1px';
                    that.initialShadow = '0 0';


                    that.renderColorPickerBySelector('style-setting-area', 'fill-color', that.initialBackgroundColor);
                    that.renderColorPickerBySelector('style-setting-area', 'line-color', that.initialBorderColor);
                    that.renderColorPickerBySelector('style-setting-area', 'shadow-color', that.initialShadowColor);
                }, 0);


                this.loadTreeList();

              //배포처리반영[버튼비활성화]
                fn_btnCheckForDistribution([
                                    		this.$el.find('.CAPCM310-wrap #btn-base-attribute-save')
                                    		,this.$el.find('.CAPCM310-wrap #btn-base-attribute-delete')
                                    			   ]);
                return this.$el;
            },


            renderColorPickerBySelector: function (parentId, elementClass, initialColor) {
                var that = this;
                var selector = '#' + parentId + ' .' + elementClass;


                fn_renderColorPicker(this.$el.find(selector), initialColor);


                this.$el.find(selector).on('change.spectrum', function (e, tinycolor) {
                    var value = tinycolor ? tinycolor.toRgbString() : 'transparent';
                    var attr = '';
                    var shadow = '';
                    var previousColor = '';


                    if(elementClass == 'fill-color') {
                        attr = 'background-color';
                        previousColor = that.$el.find('#preview-area .preview-wrap').css(attr);
                    } else if(elementClass == 'line-color') {
                        attr = 'border-color';
                        previousColor = that.$el.find('#preview-area .preview-wrap').css(attr);
                    } else {
                        attr = 'box-shadow';
                        shadow = that.$el.find('#' + parentId + ' .CAPCM310-shadow-wrap').val();
                        var previousValue = that.$el.find('#preview-area .preview-wrap .dummy').css(attr);
                        previousColor = previousValue.substr(previousValue.indexOf('r'), previousValue.indexOf(')') + 1);
                        that.$el.find('#preview-area .preview-wrap .dummy').css(attr, '1px 1px ' + value);
                        value = shadow + ' ' + value;
                    }


                    var colorInfo = {'parentId': parentId, 'class': elementClass, 'color': previousColor};


                    if(that.colorSelection.length > 9) {
                        that.colorSelection.shift();
                    }


                    that.colorSelection.push(colorInfo);


                    that.$el.find('#preview-area .preview-wrap').css(attr, value);
                });
            },


            createTree: function () {
                var that = this;


                that.CAPCM310Tree = new bxTree({
                    fields: {id: 'blockStyleNm', value: 'blockStyleNm'},


                    // Tree Item - Checkbox Use Yn
                    checkAble: false,


                    listeners: {
                        clickItem: function(itemId, itemData, currentTarget, e) {
                            that.inquireStyleData(itemData);
                            console.log(itemData);
                        }
                    }
                });
            },


            setBlockStyle: function (data) {
                var style = {
                    'background-color': data.bckgrndColorVal,
                    'border-color': data.borderColorVal,
                    'border-width': data.borderWidthVal,
                    'box-shadow': data.boxShadowVal + ' ' + data.boxShadowColorVal
                };


                this.$el.find('[data-form-param="style"]').val(data.blockStyleNm);
                this.$el.find('.fill-color').spectrum('set', fn_checkEmptyColor(data.bckgrndColorVal));
                this.$el.find('.line-color').spectrum('set', fn_checkEmptyColor(data.borderColorVal));
                this.$el.find('.shadow-color').spectrum('set', fn_checkEmptyColor(data.boxShadowColorVal));
                this.$el.find('.CAPCM310-lnWidth-wrap').val(data.borderWidthVal);
                this.$el.find('.CAPCM310-shadow-wrap').val(data.boxShadowVal);


                this.$el.find('#preview-wrap').css(style);


                this.$el.find('[data-form-param="style"]').prop('disabled', true);
            },


            changeBorderWidth: function (e) {
                var borderWidthVal = $(e.target).val();
                this.$el.find('.preview-wrap').css('border-width', borderWidthVal);
            },


            changeShadow: function (e) {
                var shadow = $(e.target).val();


                if(shadow != 'none') {
                    var shadowColor = fn_getSpectrumColorRgb(this.$el.find('#style-setting-area .shadow-color'));
                    shadow += ' ' + shadowColor;
                }


                this.$el.find('#preview-area .preview-wrap').css('box-shadow', shadow);
            },


            /**
             * load all of tree list
             */
            loadTreeList: function () {
                var that = this;
                var sParam = {};


                sParam.instCd = $.sessionStorage('headerInstCd');


                var linkData = {"header" : fn_getHeader("CAPCM3108400") , "CaStyleSvcBlockStyleIO" : sParam};


                that.treeList = [];


                bxProxy.post(sUrl, JSON.stringify(linkData),{
                    enableLoading: true,
                    success: function (responseData) {
                        if(fn_commonChekResult(responseData)) {
                            var list = responseData.CaStyleSvcBlockStyleTreeList.children;


                            that.CAPCM310Tree.renderItem(list);
                            that.treeList = list;
                        }
                    }
                });
            },


            /**
             * search tree list with particular keyword
             */
            searchTreeList: function () {
                var searchKey = this.$el.find('[data-form-param="searchKey"]').val();
                var matchingItems;


                if(!searchKey) {
                    this.CAPCM310Tree.renderItem(this.treeList);
                    return;
                }


                if(this.treeList.length < 1) {
                    return;
                }


                matchingItems = this.findMatchingTreeItems(searchKey);
                this.CAPCM310Tree.renderItem(matchingItems);
            },


            /**
             * find and return matching tree items
             */
            findMatchingTreeItems : function(key) {
                var searchTreeList = [];


                $(this.treeList).each(function(idx, data) {
                    for (var i = 0; i < data.children.length; i++) {
                        var temp001 = data.children[i];
                        if (temp001.inpDtoNm != null && temp001.srvcClassNm != null) {
                            if ((temp001.srvcNm.indexOf(key) > -1 || temp001.srvcCd.indexOf(key) > -1)) {
                                searchTreeList.push(temp001);
                            }
                        }
                    }
                });


                return searchTreeList;
            },


            inquireStyleData: function (param) {
                var that = this;
                var sParam = {};


                sParam.instCd           = $.sessionStorage('headerInstCd');
                sParam.blockStyleNm     = param.blockStyleNm;
                sParam.blockSeqNbr      = param.blockSeqNbr;


                var linkData = {"header": fn_getHeader("CAPCM3108401"), "CaStyleSvcBlockStyleIO": sParam};


                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: true,
                    success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            var data = responseData.CaStyleSvcBlockStyleIO;


                            if (data != null) {
                                that.blockSeqNbr = data.blockSeqNbr;
                                that.setBlockStyle(data);
                            } else {
                                that.resetBlockStyle();
                            }
                        }
                    }   // end of suucess: fucntion
                }); // end of bxProxy
            },


            undoBlockColor: function () {
                if(this.colorSelection.length < 1) return;


                var colorInfo = this.colorSelection.pop();
                var attr = '';


                if(colorInfo.class == 'fill-color') {
                    attr = 'background-color';
                    this.$el.find('#preview-area .preview-wrap').css(attr, colorInfo.color);
                } else if(colorInfo.class == 'line-color') {
                    attr = 'border-color';
                    this.$el.find('#preview-area .preview-wrap').css(attr, colorInfo.color);
                } else {
                    console.log(colorInfo.shadow);
                    console.log(colorInfo.color);
                    attr = 'box-shadow';
                    var shadow = this.$el.find('#' + colorInfo.parentId + ' .CAPCM310-shadow-wrap').val();
                    this.$el.find('#preview-area .preview-wrap').css(attr, shadow + ' ' + colorInfo.color);
                    this.$el.find('#preview-area .preview-wrap .dummy').css(attr, '1px 1px ' + colorInfo.color);
                }


                this.$el.find('#' + colorInfo.parentId + ' .' + colorInfo.class).spectrum('set', colorInfo.color);
            },


            resetBlockStyle: function () {
                this.blockSeqNbr = 0;
                this.colorSelection.slice(0, this.colorSelection.length);
                this.colorSelection = [];


                this.$el.find('[data-form-param="style"]').val("");


                this.$el.find('.fill-color').spectrum('set', this.initialBackgroundColor);
                this.$el.find('.line-color').spectrum('set', this.initialBorderColor);
                this.$el.find('.shadow-color').spectrum('set', this.initialShadowColor);


                this.$el.find('[data-form-param="lnWidth"]').val(this.initialBorderWidth);
                this.$el.find('[data-form-param="shadow"]').val(this.initialShadow);


                this.$el.find('#preview-wrap').css('background', this.initialBackgroundColor);
                this.$el.find('#preview-wrap').css('border-color', this.initialBorderColor);
                this.$el.find('#preview-wrap').css('box-shadow', this.initialShadow);


                this.$el.find('[data-form-param="style"]').prop('disabled', false);
            },


            saveBlockStyle: function (event) {
                var that = this;

              //배포처리[과제식별자 체크]
                if (!fn_headerTaskIdCheck()){
                    return;
                }
                
                function saveData() {
                    var sParam = {};


                    sParam.instCd           = $.sessionStorage('headerInstCd');
                    sParam.blockStyleNm	    = that.$el.find('[data-form-param="style"]').val();
                    sParam.bckgrndColorVal     = fn_getSpectrumColorRgb(that.$el.find('.fill-color'));
                    sParam.borderColorVal 	    = fn_getSpectrumColorRgb(that.$el.find('.line-color'));
                    sParam.borderWidthVal    	= that.$el.find('.CAPCM310-lnWidth-wrap').val();
                    sParam.boxShadow	    = that.$el.find('.CAPCM310-shadow-wrap').val();
                    sParam.boxShadowColorVal   = fn_getSpectrumColorRgb(that.$el.find('.shadow-color'));
                    sParam.blockSeqNbr      = that.blockSeqNbr;


                    if(fn_isNull(sParam.blockStyleNm)) {
                        fn_alertMessage("", bxMsg("cbb_err_msg.ABRVTN#failed"));
                    }


                    var linkData = {"header": fn_getHeader("CAPCM3108100"), "CaStyleSvcBlockStyleIO": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                                // tree 재조회
                                that.resetBlockStyle();
                                that.loadTreeList();
                            }
                        }   // end of suucess: fucntion
                    }); // end of bxProxy
                }


                fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), saveData, this);
            },


            deleteBlockStyle: function (event) {
                var that = this;
                
              //배포처리[과제식별자 체크]
                if (!fn_headerTaskIdCheck()){
                    return;
                }

                function deleteData() {
                    var sParam = {};


                    sParam.instCd           = $.sessionStorage('headerInstCd');
                    sParam.blockStyleNm	    = that.$el.find('[data-form-param="style"]').val();
                    sParam.blockSeqNbr      = that.blockSeqNbr;


                    if(fn_isNull(sParam.blockStyleNm)) {
                        fn_alertMessage("", bxMsg("cbb_err_msg.ABRVTN#failed"));
                    }


                    var linkData = {"header": fn_getHeader("CAPCM3108300"), "CaStyleSvcBlockStyleIO": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                                // tree 재조회
                                that.resetBlockStyle();
                                that.loadTreeList();
                            }
                        }   // end of suucess: fucntion
                    }); // end of bxProxy
                }


                fn_confirmMessage(event, bxMsg('cbb_items.SCRNITM#B_delete'), bxMsg('cbb_items.SCRNITM#data-delete-msg'), deleteData, this);
            },


            /**
             * callback for enter input in tree
             */
            fn_enter: function (event) {
                var event = event || window.event;
                var keyID = (event.which) ? event.which : event.keyCode;
                if(keyID == 13) { //enter
                    this.searchTreeList();
                }
            },


            showTree: function () {
                this.$el.find('.col1').show();
                this.$el.find('.col2').css('left', '260px');
                this.$el.find('#btn-tree-show').hide();
            },


            hideTree: function () {
                this.$el.find('.col1').hide();
                this.$el.find('.col2').css('left', '30px');
                this.$el.find('#btn-tree-show').show();
            },


            toggleBaseAttribute: function () {
                fn_pageLayerCtrl(this.$el.find("#base-attribute-area"), this.$el.find("#btn-base-attribute-toggle"));
            },


            toggleStyleSetting: function () {
                fn_pageLayerCtrl(this.$el.find("#style-setting-area"), this.$el.find("#btn-style-setting-toggle"));
            },


            togglePreview: function () {
                fn_pageLayerCtrl(this.$el.find("#preview-area"), this.$el.find("#btn-preview-toggle"));
            }
        }); // end of Backbone.View.extend({


        return CAPCM310View;
    } // end of define function
); // end of define


