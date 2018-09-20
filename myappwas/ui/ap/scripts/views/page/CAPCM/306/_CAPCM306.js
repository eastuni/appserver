define(
    [
        'bx/common/config',
        'text!app/views/page/CAPCM/306/_CAPCM306.html',
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
        var CAPCM306View = Backbone.View.extend({
            // set tag name
            tagName: 'section',
            // set class name
            className: 'bx-container CAPCM306-page',
            // set Template
            templates: {
                'tpl': tpl
            },
            // set Events
            events: {
                'keydown #searchKey': 'fn_enter',


                'click #btn-tree-search': 'searchTreeList',


                'click #btn-text-content-reset': 'resetTextContent',


                'click #btn-tree-hide': 'hideTree',
                'click #btn-tree-show': 'showTree',


                'click #btn-text-content-save': 'saveTextContent',


                'click #btn-base-attribute-toggle': 'toggleBaseAttribute',
                'click #btn-text-content-toggle': 'toggleTextContent'
            },


            /**
             * initialize
             */
            initialize: function (initData) {
                $.extend(this, initData);


                this.createTree();
            },


            /**
             * render
             */
            render: function () {
                // set page template
                this.$el.html(this.tpl());
                this.$el.find('.bx-tree-root').html(this.CAPCM306Tree.render());


                this.renderEditor();
                this.loadTreeList();

              //배포처리반영[버튼비활성화]
                fn_btnCheckForDistribution([
                                    		this.$el.find('.CAPCM306-wrap #btn-text-content-save')
                                    			   ]);
                return this.$el;
            },


            renderEditor: function () {
                this.$el.find('#text-content').ckeditor({
                    uiColor: '#dedede',
                    autoParagraph: false,
                    font_names: 'Dotum/Dotum; Gulim/Gulim; Batang/Batang; Helvetica/Helvetica; Verdana/Verdana; Georgia/Georgia'
                        + 'Courier/Courier; Noto Sans KR/"Noto Sans KR", sans-serif; Noto Sans SC/"Noto Sans SC", sans-serif;',
                    fontSize_sizes: '10/10px; 11/11px; 12/12px; 13/13px; 14/14px; 15/15px; 16/16px; 17/17px; 18/18px; 19/19px; 20/20px;'
                        + '22/22px; 24/24px; 32/32px; 48/48px; 64/64px;'
                    // enterMode : CKEDITOR.ENTER_BR,
                    // shiftEnterMode: CKEDITOR.ENTER_BR,
                });
            },


            createTree: function () {
                var that = this;


                that.CAPCM306Tree = new bxTree({
                    fields: {id: 'vwNm', value: 'vwNm'},


                    // Tree Item - Checkbox Use Yn
                    checkAble: false,


                    listeners: {
                        clickItem: function(itemId, itemData, currentTarget, e) {
                            if(itemData.txtKeyVal) {
                                that.inquireTextContentData(itemData);
                                console.log(itemData);
                            }
                        }
                    }
                });
            },


            setBaseAttribute: function (data) {
                this.scrnId = data.scrnId;
                this.seqNbr = data.seqNbr;


                this.$el.find('[data-form-param="pgNm"]').val(data.scrnNm);
                this.$el.find('[data-form-param="pgDesc"]').val(data.scrnDescCntnt);
                this.$el.find('[data-form-param="txtTitle"]').val(data.txtKeyVal);
                this.$el.find('[data-form-param="link"]').val(data.scrnUrlAddr);
                this.$el.find('.text-content').val(data.txtCntnt);
            },


            /**
             * load all of tree list
             */
            loadTreeList: function () {
                var that = this;
                var sParam = {};


                sParam.instCd = $.sessionStorage('headerInstCd');


                var linkData = {"header" : fn_getHeader("CAPCM3068400") , "CaStyleSvcScrnTextIO" : sParam};


                that.treeList = [];


                bxProxy.post(sUrl, JSON.stringify(linkData),{
                    enableLoading: true,
                    success: function (responseData) {
                        if(fn_commonChekResult(responseData)) {
                            if(fn_commonChekResult(responseData)) {
                                var list = responseData.CaStyleSvcScrnTextTreeList.children;


                                if(list != null && list.length > 0) {
                                    that.CAPCM306Tree.renderItem(list);
                                    that.treeList = list;
                                }
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
                    this.CAPCM306Tree.renderItem(this.treeList);
                    return;
                }


                if(this.treeList.length < 1) {
                    return;
                }


                matchingItems = this.findMatchingTreeItems(searchKey);
                this.CAPCM306Tree.renderItem(matchingItems);
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


            inquireTextContentData: function (param) {
                var that = this;
                var sParam = {};


                sParam.instCd       = $.sessionStorage('headerInstCd');
                sParam.scrnId       = param.scrnId;
                sParam.scrnNm       = param.scrnNm;
                sParam.seqNbr       = param.seqNbr;
                sParam.txtKeyVal    = param.txtKeyVal;
                sParam.txtCntnt     = param.txtCntnt;


                var linkData = {"header": fn_getHeader("CAPCM3068401"), "CaStyleSvcScrnTextIO": sParam};


                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: true,
                    success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            var data = responseData.CaStyleSvcScrnTextIO;


                            if(data != null) {
                                that.setBaseAttribute(data);
                            }
                        }
                    }   // end of suucess: fucntion
                }); // end of bxProxy
            },


            resetTextContent: function () {
                this.$el.find('.text-content').val('');
            },


            saveTextContent: function (event) {
                var that = this;

              //배포처리[과제식별자 체크]
                if (!fn_headerTaskIdCheck()){
                    return;
                }
                
                function saveData() {
                    var sParam = {};


                    sParam.instCd       = $.sessionStorage('headerInstCd');
                    sParam.scrnId       = that.scrnId;
                    sParam.scrnNm       = that.$el.find('[data-form-param="pgDesc"]').val();
                    sParam.seqNbr       = that.seqNbr;
                    sParam.txtKeyVal    = that.$el.find('[data-form-param="txtTitle"]').val();
                    sParam.txtCntnt     = that.$el.find('.text-content').val();


                    if(fn_isNull(sParam.srvcPrflNm)) {
                        fn_alertMessage("", bxMsg("cbb_err_msg.ABRVTN#failed"));
                    }


                    var linkData = {"header": fn_getHeader("CAPCM3068100"), "CaStyleSvcScrnTextIO": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                            }
                        }   // end of suucess: fucntion
                    }); // end of bxProxy
                }


                fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), saveData, this);
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


            toggleTextContent: function () {
                fn_pageLayerCtrl(this.$el.find("#text-content-area"), this.$el.find("#btn-text-content-toggle"));
            }
        }); // end of Backbone.View.extend({


        return CAPCM306View;
    } // end of define function
); // end of define


