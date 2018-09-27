define(
    [
        'bx/common/config',
        'text!app/views/page/CAPCM/307/_CAPCM307.html',
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
        var CAPCM307View = Backbone.View.extend({
            // set tag name
            tagName: 'section',
            // set class name
            className: 'bx-container CAPCM307-page',
            // set Template
            templates: {
                'tpl': tpl
            },
            // set Events
            events: {
                'keydown #searchKey': 'fn_enter',


                'click #btn-tree-search': 'searchTreeList',


                'click #btn-tree-hide': 'hideTree',
                'click #btn-tree-show': 'showTree',


                'click #btn-layout-save': 'saveLayout',


                'click #btn-base-attribute-toggle': 'toggleBaseAttribute',
                'click #btn-layout-toggle': 'toggleLayout'
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
                this.$el.find('.bx-tree-root').html(this.CAPCM307Tree.render());


                this.renderLayoutImages();
                this.loadTreeList();

              //배포처리반영[버튼비활성화]
                fn_btnCheckForDistribution([
                                    		this.$el.find('.CAPCM307-wrap #btn-layout-save')
                                    			   ]);
                return this.$el;
            },


            renderLayoutImages: function () {                
                this.$el.find('#layout-area #layout1').attr('src', '/libs/bx/bx-frame/images/layout1.PNG');
                this.$el.find('#layout-area #layout2').attr('src', '/libs/bx/bx-frame/images/layout2.PNG');
                this.$el.find('#layout-area #layout3').attr('src', '/libs/bx/bx-frame/images/layout3.PNG');
            },


            createTree: function () {
                var that = this;


                that.CAPCM307Tree = new bxTree({
                    fields: {id: 'scrnId', value: 'scrnId'},


                    // Tree Item - Checkbox Use Yn
                    checkAble: false,


                    listeners: {
                        clickItem: function(itemId, itemData, currentTarget, e) {
                            that.inquireLayoutData(itemData);
                            console.log(itemData);
                        }
                    }
                });
            },


            setLayoutAttribute: function (data) {
                this.scrnId = data.scrnId;


                this.$el.find('[data-form-param="pgNm"]').val(data.scrnNm);
                this.$el.find('[data-form-param="pgDesc"]').val(data.scrnDescCntnt);
                this.$el.find('input[value="' + data.slctnScrnId + '"]').prop('checked', true);
            },


            /**
             * load all of tree list
             */
            loadTreeList: function () {
                var that = this;
                var sParam = {};


                sParam.instCd = $.sessionStorage('headerInstCd');


                var linkData = {"header" : fn_getHeader("CAPCM3078400") , "CaStyleSvcScrnLayoutIO" : sParam};


                that.treeList = [];


                bxProxy.post(sUrl, JSON.stringify(linkData),{
                    enableLoading: true,
                    success: function (responseData) {
                        if(fn_commonChekResult(responseData)) {
                            var list = responseData.CaStyleSvcScrnLayoutTreeList.children;


                            if(list != null) {
                                that.CAPCM307Tree.renderItem(list);
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
                    this.CAPCM307Tree.renderItem(this.treeList);
                    return;
                }


                if(this.treeList.length < 1) {
                    return;
                }


                matchingItems = this.findMatchingTreeItems(searchKey);
                this.CAPCM307Tree.renderItem(matchingItems);
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


            inquireLayoutData: function (param) {
                var that = this;
                var sParam = {};


                sParam.instCd       = $.sessionStorage('headerInstCd');
                sParam.scrnId       = param.scrnId;
                sParam.scrnNm       = param.scrnNm;
                sParam.slctnScrnId  = param.slctnScrnId;


                var linkData = {"header": fn_getHeader("CAPCM3078401"), "CaStyleSvcScrnLayoutIO": sParam};


                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: true,
                    success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            var data = responseData.CaStyleSvcScrnLayoutIO;


                            if (data != null) {
                                that.setLayoutAttribute(data);
                            }
                        }
                    }   // end of suucess: fucntion
                }); // end of bxProxy
            },


            saveLayout: function (event) {
                var that = this;

              //배포처리[과제식별자 체크]
                if (!fn_headerTaskIdCheck()){
                    return;
                }
                
                function saveData() {
                    var sParam = {};


                    sParam.instCd       = $.sessionStorage('headerInstCd');
                    sParam.scrnId       = that.scrnId;
                    sParam.scrnNm	    = that.$el.find('[data-form-param="pgNm"]').val();
                    sParam.scrnDescCntnt 	= that.$el.find('[data-form-param="pgDesc"]').val();
                    sParam.slctnScrnId	= that.$el.find('input[name=layoutGroup]:checked').val();


                    console.log(sParam);


                    if(fn_isNull(sParam.scrnId)) {
                        fn_alertMessage("", bxMsg("cbb_err_msg.ABRVTN#failed"));
                        return;
                    }


                    var linkData = {"header": fn_getHeader("CAPCM3078200"), "CaStyleSvcScrnLayoutIO": sParam};


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


            toggleLayout: function () {
                fn_pageLayerCtrl(this.$el.find("#layout-area"), this.$el.find("#btn-layout-toggle"));
            }
        }); // end of Backbone.View.extend({


        return CAPCM307View;
    } // end of define function
); // end of define


