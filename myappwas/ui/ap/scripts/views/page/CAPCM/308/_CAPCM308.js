define(
    [
        'bx/common/config',
        'text!app/views/page/CAPCM/308/_CAPCM308.html',
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
        var CAPCM308View = Backbone.View.extend({
            // set tag name
            tagName: 'section',
            // set class name
            className: 'bx-container CAPCM308-page',
            // set Template
            templates: {
                'tpl': tpl
            },
            // set Events
            events: {
                'keydown #searchKey': 'fn_enter',


                'change .CAPCM308-font-wrap': 'changeFontFamily',
                'change .CAPCM308-fontSize-wrap': 'changeFontSize',
                'change .CAPCM308-lttrSpc-wrap': 'changeLetterSpace',
                'change .CAPCM308-lnHgt-wrap': 'changeLineHeight',


                'click #btn-tree-search': 'searchTreeList',


                'click #btn-base-attribute-undo': 'undoTextColor',
                'click #btn-base-attribute-reset': 'resetTextStyle',


                'click #btn-tree-hide': 'hideTree',
                'click #btn-tree-show': 'showTree',


                'click #btn-base-attribute-save': 'saveTextStyle',
                'click #btn-base-attribute-delete': 'deleteTextStyle',


                'click #bold': 'toggleBoldOption',
                'click #italic': 'toggleItalicOption',
                'click #udrLn': 'toggleUnderLineOption',


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
                this.txtSeqNbr = 0;


                this.createTree();
            },


            /**
             * render
             */
            render: function () {
                var that = this;


                // set page template
                this.$el.html(this.tpl());
                this.$el.find('.bx-tree-root').html(this.CAPCM308Tree.render());


                this.labels = this.$el.find('#preview-wrap').children();


                setTimeout(function () {
                    that.initialLabelFontColor  = that.$el.find('#preview-wrap .bw-label').css('color');
                    that.initialFontFamily      = 'dotum';
                    that.initialFontSize        = '15px';
                    that.initialLetterSpacing   = 'inherit';
                    that.initialLineHeight      = 'inherit';
                    that.renderColorPicker();


                    that.initialStyle = {
                        'color': that.initialLabelFontColor,
                        'font-family': that.initialFontFamily,
                        'font-size': that.initialFontSize,
                        'font-style': 'normal',
                        'font-weight': 'normal',
                        'text-decoration': 'none',
                        'letter-spacing': that.initialLetterSpacing,
                        'line-height': that.initialLineHeight
                    };
                }, 0);


                this.setComboBoxes();
                this.loadTreeList();

              //배포처리반영[버튼비활성화]
                fn_btnCheckForDistribution([
                                    		this.$el.find('.CAPCM308-wrap #btn-base-attribute-save')
                                    		,this.$el.find('.CAPCM308-wrap #btn-base-attribute-delete')
                                    			   ]);
                return this.$el;
            },


            renderColorPicker: function () {
                var that = this;


                fn_renderColorPicker(this.$el.find('[data-form-param="fontColor"]'), this.initialLabelFontColor);


                this.$el.find('[data-form-param="fontColor"]').on('change.spectrum', function (e, tinycolor) {
                    var color = tinycolor ? tinycolor.toRgbString() : 'transparent';
                    var previousColor = that.$el.find('#preview-area #preview-wrap .bw-label').css('color');


                    if(that.colorSelection.length > 9) {
                        that.colorSelection.shift();
                    }


                    that.colorSelection.push(previousColor);


                    $(that.labels).each(function (index, element) {
                        $(element).css('color', color);
                    });
                });
            },


            createTree: function () {
                var that = this;


                that.CAPCM308Tree = new bxTree({
                    fields: {id: 'txtStyleNm', value: 'txtStyleNm'},


                    // Tree Item - Checkbox Use Yn
                    checkAble: false,


                    listeners: {
                        clickItem: function(itemId, itemData, currentTarget, e) {
                            if(itemData.txtSeqNbr) {
                                that.inquireStyleData(itemData);
                                console.log(itemData);
                            }
                        }
                    }
                });
            },


            setComboBoxes: function () {
                var sParam = {};


                // combobox 정보 셋팅
                sParam.className = "CAPCM308-ctgry-wrap";
                sParam.targetId = "category";
                sParam.nullYn = "N";
                sParam.cdNbr = "A0490";
                // 콤보데이터 load
                fn_getCodeList(sParam, this);
            },


            changeFontFamily: function (e) {
                var font = $(e.target).val();


                $(this.labels).each(function (index, element) {
                    $(element).css('font-family', font);
                });
            },


            changeFontSize: function (e) {
                var fontSize = $(e.target).val();


                $(this.labels).each(function (index, element) {
                    $(element).css('font-size', fontSize);
                });
            },


            changeLetterSpace: function (e) {
                var letterSpace = $(e.target).val();


                $(this.labels).each(function (index, element) {
                    $(element).css('letter-spacing', letterSpace);
                });
            },


            changeLineHeight: function (e) {
                var lineHeightVal = $(e.target).val();


                $(this.labels).each(function (index, element) {
                    $(element).css('line-height', lineHeightVal);
                });
            },


            setTextStyle: function (data) {
                var style = {
                    'font-family': data.fontFamilyVal,
                    'font-size': data.fontSize,
                    'color': data.fontColorVal,
                    'letter-spacing': data.letterSpacingVal,
                    'line-height': data.lineHeightVal,
                    'font-weight': data.fontWeightVal,
                    'font-style': data.fontStyleVal,
                    'text-decoration': data.txtDcrtnVal
                };


                this.$el.find('.CAPCM308-ctgry-wrap').val(data.txtStyleDscd);
                this.$el.find('[data-form-param="style"]').val(data.txtStyleNm);


                this.$el.find('.CAPCM308-font-wrap').val(data.fontFamilyVal);
                this.$el.find('.CAPCM308-fontSize-wrap').val(data.fontSize);
               // this.$el.find('[data-form-param="fontColor"]').spectrum('set', fn_checkEmptyColor(data.fontColor));
                this.$el.find('.CAPCM308-lttrSpc-wrap').val(data.letterSpacingVal);
                this.$el.find('.CAPCM308-lnHgt-wrap').val(data.lineHeightVal);


                this.$el.find('[data-form-param="bold"]').prop('checked', (data.fontWeightVal == 'bold'));
                this.$el.find('[data-form-param="italic"]').prop('checked', (data.fontStyleVal == 'italic'));
                this.$el.find('[data-form-param="udrLn"]').prop('checked', (data.txtDcrtnVal == 'underline'));


                this.$el.find('.CAPCM308-ctgry-wrap').prop("disabled", true);
                this.$el.find('[data-form-param="style"]').prop('disabled', true);


                $(this.labels).each(function (index, element) {
                    $(element).css(style);
                })
            },


            /**
             * load all of tree list
             */
            loadTreeList: function () {
                var that = this;
                var sParam = {};


                sParam.instCd = $.sessionStorage('headerInstCd');


                var linkData = {"header" : fn_getHeader("CAPCM3088400") , "CaStyleSvcTextStyleIO" : sParam};


                that.treeList = [];


                bxProxy.post(sUrl, JSON.stringify(linkData),{
                    enableLoading: true,
                    success: function (responseData) {
                        if(fn_commonChekResult(responseData)) {
                            var list = responseData.CaStyleSvcTextStyleTreeList.children;


                            if(list != null && list.length > 0) {
                                that.CAPCM308Tree.renderItem(list);
                                that.treeList = list;
                            }
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
                    this.CAPCM308Tree.renderItem(this.treeList);
                    return;
                }


                if(this.treeList.length < 1) {
                    return;
                }


                matchingItems = this.findMatchingTreeItems(searchKey);
                this.CAPCM308Tree.renderItem(matchingItems);
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


                sParam.instCd       = $.sessionStorage('headerInstCd');
                sParam.txtStyleDscd = param.txtStyleDscd;
                sParam.txtStyleNm   = param.txtStyleNm;
                sParam.txtSeqNbr    = param.txtSeqNbr;


                var linkData = {"header": fn_getHeader("CAPCM3088401"), "CaStyleSvcTextStyleIO": sParam};


                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: true,
                    success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            var data = responseData.CaStyleSvcTextStyleIO;


                            if (data != null) {
                                that.txtSeqNbr = data.txtSeqNbr;
                                that.setTextStyle(data);
                            } else {
                                that.resetTextStyle();
                            }
                        }
                    }   // end of suucess: fucntion
                }); // end of bxProxy
            },


            undoTextColor: function () {
                if(this.colorSelection.length < 1) return;
                console.log(this.colorSelection);


                var color = this.colorSelection.pop();


                this.$el.find('[data-form-param="fontColor"]').spectrum('set', color);
                $(this.labels).each(function (index, element) {
                    $(element).css('color', color);
                });
            },


            resetTextStyle: function () {
                var that = this;


                this.txtSeqNbr = 0;


                this.$el.find('.CAPCM308-ctgry-wrap option:eq(0)').prop('selected', true);
                this.$el.find('[data-form-param="style"]').val("");


                this.$el.find('[data-form-param="font"]').val(this.initialFontFamily);
                this.$el.find('[data-form-param="fontSize"]').val(this.initialFontSize);
                this.$el.find('[data-form-param="fontColor"]').spectrum('set', this.initialLabelFontColor);
                this.$el.find('[data-form-param="lttrSpc"]').val(this.initialLetterSpacing);
                this.$el.find('[data-form-param="lnHgt"]').val(this.initialLineHeight);


                this.$el.find('[data-form-param="bold"]').prop('checked', false);
                this.$el.find('[data-form-param="italic"]').prop('checked', false);
                this.$el.find('[data-form-param="udrLn"]').prop('checked', false);


                this.$el.find('.CAPCM308-ctgry-wrap').prop("disabled", false);
                this.$el.find('[data-form-param="style"]').prop('disabled', false);


                $(this.labels).each(function (index, element) {
                    $(element).css(that.initialStyle);
                });
            },


            saveTextStyle: function (event) {
                var that = this;

              //배포처리[과제식별자 체크]
                if (!fn_headerTaskIdCheck()){
                    return;
                }
                
                function saveData() {
                    var sParam = {};


                    sParam.instCd           = $.sessionStorage('headerInstCd');
                    sParam.txtStyleDscd	    = that.$el.find('.CAPCM308-ctgry-wrap').val();
                    sParam.txtStyleNm       = that.$el.find('[data-form-param="style"]').val();
                    sParam.txtSeqNbr       	= that.txtSeqNbr;
                    sParam.fontFamilyVal  	    = that.$el.find('.CAPCM308-font-wrap').val();
                    sParam.fontSize         = that.$el.find('.CAPCM308-fontSize-wrap').val();
                    //sParam.fontColor        = fn_getSpectrumColorRgb(that.$el.find('[data-form-param="fontColor"]'));
                    sParam.letterSpacingVal    = that.$el.find('.CAPCM308-lttrSpc-wrap').val();
                    sParam.lineHeightVal       = that.$el.find('.CAPCM308-lnHgt-wrap').val();
                    sParam.fontWeightVal       = that.$el.find('[data-form-param="bold"]').prop('checked') ? 'bold' : 'normal';
                    sParam.fontStyleVal        = that.$el.find('[data-form-param="italic"]').prop('checked') ? 'italic' : 'normal';
                    sParam.txtDcrtnVal         = that.$el.find('[data-form-param="udrLn"]').prop('checked') ? 'underline' : 'none';


                    console.log(sParam);


                    if(fn_isNull(sParam.txtStyleDscd) || fn_isNull(sParam.txtStyleNm)) {
                        fn_alertMessage("", bxMsg("cbb_err_msg.ABRVTN#failed"));
                        return;
                    }


                    var linkData = {"header": fn_getHeader("CAPCM3088100"), "CaStyleSvcTextStyleIO": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                                // tree 재조회
                                that.resetTextStyle();
                                that.loadTreeList();
                            }
                        }   // end of suucess: fucntion
                    }); // end of bxProxy
                }


                fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), saveData, this);
            },


            deleteTextStyle: function (event) {
                var that = this;

              //배포처리[과제식별자 체크]
                if (!fn_headerTaskIdCheck()){
                    return;
                }
                
                function deleteData() {
                    var sParam = {};


                    sParam.instCd           = $.sessionStorage('headerInstCd');
                    sParam.txtStyleDscd	    = that.$el.find('.CAPCM308-ctgry-wrap').val();
                    sParam.txtStyleNm       = that.$el.find('[data-form-param="style"]').val();
                    sParam.txtSeqNbr       	= that.txtSeqNbr;


                    console.log(sParam);


                    if(fn_isNull(sParam.txtStyleDscd) || fn_isNull(sParam.txtStyleNm)) {
                        fn_alertMessage("", bxMsg("cbb_err_msg.ABRVTN#failed"));
                        return;
                    }


                    var linkData = {"header": fn_getHeader("CAPCM3088300"), "CaStyleSvcTextStyleIO": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                                // tree 재조회
                                that.resetTextStyle();
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


            toggleBoldOption: function () {
                var isChecked = this.$el.find('[data-form-param="bold"]').attr('checked');
                var value = isChecked ? 'bold' : 'normal';


                $(this.labels).each(function (index, element) {
                    $(element).css('font-weight', value);
                });
            },


            toggleItalicOption: function () {
                var isChecked = this.$el.find('[data-form-param="italic"]').attr('checked');
                var value = isChecked ? 'italic' : 'normal';


                $(this.labels).each(function (index, element) {
                    $(element).css('font-style', value);
                });
            },


            toggleUnderLineOption: function () {
                var isChecked = this.$el.find('[data-form-param="udrLn"]').attr('checked');
                var value = isChecked ? 'underline' : 'none';


                $(this.labels).each(function (index, element) {
                    $(element).css('text-decoration', value);
                });
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


        return CAPCM308View;
    } // end of define function
); // end of define


