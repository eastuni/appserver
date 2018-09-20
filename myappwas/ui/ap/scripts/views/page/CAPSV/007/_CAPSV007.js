define(
    [
        'bx/common/config',
        'text!app/views/page/CAPSV/007/_CAPSV007.html',
        'bx-component/bx-tree/bx-tree',
        'app/views/page/popup/CAPSV/popup-attribute-search',
        'app/views/page/popup/CAPCM/popup-code-search'
    ]
    , function (
        config,
        tpl,
        bxTree,
        PopupAttributeSearch,
        PopupCodeSearch
    ) {


        /**
         * Backbone
         */
        var CAPSV007View = Backbone.View.extend({
            // set tag name
            tagName: 'section',
            // set class name
            className: 'bx-container CAPSV007-page',
            // set Template
            templates: {
                'tpl': tpl
            },
            // set Events
            events: {
                'keydown #searchKey': 'fn_enter',


                'click #btn-tree-search': 'searchTreeList',


                'click #btn-standard-attribute-search': 'openStandardAttributeSearchPopup',
                'click #btn-code-search': 'openCodeSearchPopup',
                'click #btn-service-profile-attribute-reset': 'resetServiceProfileAttribute',


                'click #btn-tree-hide': 'hideTree',
                'click #btn-tree-show': 'showTree',


                'change .atrbtVldtnWayCd-wrap': 'changeAtrbtVldtnWayCd',


                'click #btn-service-profile-attribute-save': 'saveServiceProfileAttribute',
                'click #btn-service-profile-attribute-delete': 'deleteServiceProfileAttribute',


                'click #btn-service-profile-attribute-toggle': 'toggleServiceProfileAttribute'
            },


            changeAtrbtVldtnWayCd : function() {
            	var AtrbtVldtnWayCd = this.$el.find('#service-profile-attribute-area [data-form-param="atrbtVldtnWayCd"]').val();


            	if(AtrbtVldtnWayCd) {
            		if(AtrbtVldtnWayCd != "T") {


            			this.$el.find('#btn-code-search').prop("disabled", AtrbtVldtnWayCd == "C" ? false : true);
                		this.$el.find('#buttonType').show();
                		this.$el.find('#selectTyle').hide();
                	}
                	else {
                		this.$el.find('#buttonType').hide();
                		this.$el.find('#selectTyle').show();
                	}
            	}
            	else {
            		this.$el.find('#buttonType').show();
            		this.$el.find('#selectTyle').hide();
            		this.$el.find('#btn-code-search').prop("disabled", true);
            	}


            	this.$el.find('#buttonType [data-form-param="atrbtVldtnRuleCntnt"]').val("");
            	this.$el.find('#selectTyle [data-form-param="atrbtVldtnRuleCntnt"]').val("ArrangementService");
            },


            /**
             * initialize
             */
            initialize: function (initData) {
                $.extend(this, initData);


                this.atrbtVldtnWayCd = '';
                this.createTree();
            },


            /**
             * render
             */
            render: function () {
                // set page template
                this.$el.html(this.tpl());
                this.$el.find('.bx-tree-root').html(this.CAPSV007Tree.render());


                this.loadTreeList();


                var sParam = {};
                sParam.className = "atrbtVldtnWayCd-wrap";
                sParam.targetId = "atrbtVldtnWayCd";
                sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#all'); // 전체
                sParam.cdNbr = "10002";


                // 콤보데이터 load
                fn_getCodeList(sParam, this);


                sParam = {};
                sParam.className = "atrbtVldtnRuleCntnt-wrap";
                sParam.targetId = "atrbtVldtnRuleCntnt";
                sParam.nullYn = "N";
                sParam.cdNbr = "A0112";


                // 콤보데이터 load
                fn_getCodeList(sParam, this);

              //배포처리반영[버튼비활성화]
                fn_btnCheckForDistribution([
                                    		this.$el.find('.CAPSV007-wrap #btn-service-profile-attribute-save')
                                    		,this.$el.find('.CAPSV007-wrap #btn-service-profile-attribute-delete')
                                    			   ]);

                return this.$el;
            },


            createTree: function () {
                var that = this;


                that.CAPSV007Tree = new bxTree({
                    fields: {id: 'srvcPrflAtrbtNm', value: 'srvcPrflNm'},


                    // Tree Item - Checkbox Use Yn
                    checkAble: false,


                    listeners: {
                        clickItem: function(itemId, itemData, currentTarget, e) {
                            that.inquireServiceData(itemData);
                            console.log(itemData);
                        }
                    }
                });
            },


            setServiceProfileAttribute: function (data) {


                this.$el.find('#service-profile-attribute-area [data-form-param="atrbtVldtnWayCd"]').val(data.atrbtVldtnWayCd);
                this.$el.find('#service-profile-attribute-area [data-form-param="atrbtCd"]').val(data.srvcPrflAtrbtNm);
                this.$el.find('#service-profile-attribute-area [data-form-param="atrbtNm"]').val(data.srvcPrflNm);
                this.$el.find('#service-profile-attribute-area [data-form-param="loginLngAtrbtNm"]').val(data.useLngAtrbtNm);


                if(data.atrbtVldtnWayCd) {
                	if(data.atrbtVldtnWayCd != "T") {
                		this.$el.find('#btn-code-search').prop("disabled", data.atrbtVldtnWayCd == "C" ? false : true);
                    	this.$el.find('#buttonType').show();
                		this.$el.find('#selectTyle').hide();
                		this.$el.find('#buttonType [data-form-param="atrbtVldtnRuleCntnt"]').val(data.atrbtVldtnRuleCntnt);
                    }
                    else {
                    	this.$el.find('#buttonType').hide();
                		this.$el.find('#selectTyle').show();


                		this.$el.find('#selectTyle [data-form-param="atrbtVldtnRuleCntnt"]').val(data.atrbtVldtnRuleCntnt);
                    }
                }
                else {
                	this.$el.find('#btn-code-search').prop("disabled", true);
                	this.$el.find('#buttonType').show();
            		this.$el.find('#selectTyle').hide();
            		this.$el.find('#buttonType [data-form-param="atrbtVldtnRuleCntnt"]').val(data.atrbtVldtnRuleCntnt);
                }


//                this.$el.find('#service-profile-attribute-area [data-form-param="atrbtVldtnRuleCntnt"]').val(data.atrbtVldtnRule);


                this.$el.find('#service-profile-attribute-area [data-form-param="atrbtVldtnXtnRule"]').val(data.atrbtVldtnXtnRuleCntnt);


                this.$el.find('#service-profile-attribute-area [data-form-param="atrbtCd"]').prop('disabled', true);
                this.$el.find('#service-profile-attribute-area [data-form-param="atrbtNm"]').prop('disabled', true);
                this.$el.find('#service-profile-attribute-area [data-form-param="loginLngAtrbtNm"]').prop('disabled', true);


                this.$el.find('#service-profile-attribute-area [data-form-param="atrbtVldtnWayCd"]').prop('disabled', false);
                this.$el.find('#service-profile-attribute-area [data-form-param="atrbtVldtnRuleCntnt"]').prop('disabled', false);
                this.$el.find('#service-profile-attribute-area [data-form-param="atrbtVldtnXtnRule"]').prop('disabled', false);
            },


            /**
             * load all of tree list
             */
            loadTreeList: function () {
                 var that = this;
                 var sParam = {};
                 var linkData = {"header" : fn_getHeader("CAPSV0078401") , "CaSrvcPrflMgmtSvcIO" : sParam};


                 that.treeList = [];
                 bxProxy.post(sUrl, JSON.stringify(linkData),{
                     enableLoading: true,
                     success: function (responseData) {


                         if(fn_commonChekResult(responseData)) {
                             that.CAPSV007Tree.renderItem(responseData.CaSrvcPrflMgmtSvcIOListOut.srvcPrflAtrbtList);
                             that.treeList = responseData.CaSrvcPrflMgmtSvcIOListOut.srvcPrflAtrbtList;
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
                    this.CAPSV007Tree.renderItem(this.treeList);
                    return;
                }


                if(this.treeList.length < 1) {
                    return;
                }


                matchingItems = this.findMatchingTreeItems(searchKey);
                this.CAPSV007Tree.renderItem(matchingItems);
            },


            /**
             * find and return matching tree items
             */
            findMatchingTreeItems : function(key) {
                var searchTreeList = [];
//             
               $(this.treeList).each(function(idx, data) {
                   var temp001 = data;
                   if (temp001.srvcPrflNm != null || temp001.srvcPrflAtrbtNm != null) {
                       if ((temp001.srvcPrflNm.indexOf(key) > -1 || temp001.srvcPrflAtrbtNm.indexOf(key) > -1)) {
                           searchTreeList.push(temp001);
                       }
                   }
               });


                return searchTreeList;
            },


            inquireServiceData: function (param) {
//                 header 정보 set
                 var that = this;
                 var sParam = {};


                 sParam.srvcPrflNm = param.srvcPrflNm;
                 sParam.srvcPrflAtrbtNm = param.srvcPrflAtrbtNm;


                 var linkData = {"header": fn_getHeader("CAPSV0078401"), "CaSrvcPrflMgmtSvcIO": sParam};


                 // ajax호출
                 bxProxy.post(sUrl, JSON.stringify(linkData), {
                     enableLoading: true,
                     success: function (responseData) {
                         if (fn_commonChekResult(responseData)) {
                             var data = responseData.CaSrvcPrflMgmtSvcIOListOut.srvcPrflAtrbtList[0];


                             // 목록이 1건만 나옴.


                            if (data != null) {
                                that.atrbtVldtnWayCd = data.atrbtVldtnWayCd;
                                that.setServiceProfileAttribute(data);
                            } else {
                                that.resetServiceProfileAttribute();
                            }
                         }
                     }   // end of suucess: fucntion
                 }); // end of bxProxy
            },


            resetServiceProfileAttribute: function () {
                this.$el.find('#service-profile-attribute-area [data-form-param="atrbtCd"]').val("");
                this.$el.find('#service-profile-attribute-area [data-form-param="atrbtNm"]').val("");
                this.$el.find('#service-profile-attribute-area [data-form-param="loginLngAtrbtNm"]').val("");
                this.$el.find('#service-profile-attribute-area [data-form-param="atrbtVldtnWayCd"]').val("");
                this.$el.find('#service-profile-attribute-area [data-form-param="atrbtVldtnRuleCntnt"]').val("");
                this.$el.find('#service-profile-attribute-area [data-form-param="atrbtVldtnXtnRule"]').val("");


                this.$el.find('#service-profile-attribute-area [data-form-param="atrbtNm"]').prop('disabled', false);
                this.$el.find('#service-profile-attribute-area [data-form-param="loginLngAtrbtNm"]').prop('disabled', false);
                this.$el.find('#service-profile-attribute-area [data-form-param="atrbtVldtnWayCd"]').prop('disabled', false);
                this.$el.find('#service-profile-attribute-area [data-form-param="atrbtVldtnRuleCntnt"]').prop('disabled', false);
                this.$el.find('#service-profile-attribute-area [data-form-param="atrbtVldtnXtnRule"]').prop('disabled', false);


                this.$el.find('#buttonType').show();
        		this.$el.find('#selectTyle').hide();
        		this.$el.find('#btn-code-search').prop("disabled", true);


        		this.$el.find('#buttonType [data-form-param="atrbtVldtnRuleCntnt"]').val("");
            	this.$el.find('#selectTyle [data-form-param="atrbtVldtnRuleCntnt"]').val("");
            },


            saveServiceProfileAttribute: function (event) {
                var that = this;
              //배포처리[과제식별자 체크]
                if (!fn_headerTaskIdCheck()){
                    return;
                }

                function saveData() {
                    var sParam = {};


                    sParam.srvcPrflNm 		    = that.$el.find('#service-profile-attribute-area [data-form-param="atrbtCd"]').val();
//                    sParam.srvcPrflAtrbtNm	    = that.$el.find('#service-profile-attribute-area [data-form-param="atrbtNm"]').val();
                    sParam.srvcPrflAtrbtNm	    = sParam.srvcPrflNm;
                    sParam.useLngAtrbtNm	    = that.$el.find('#service-profile-attribute-area [data-form-param="loginLngAtrbtNm"]').val();
                    sParam.atrbtVldtnWayCd 	    = that.$el.find('#service-profile-attribute-area [data-form-param="atrbtVldtnWayCd"]').val();
                    sParam.atrbtVldtnRuleCntnt 	    = that.$el.find('#service-profile-attribute-area [data-form-param="atrbtVldtnRuleCntnt"]').val();


                    if(sParam.atrbtVldtnWayCd) {
                    	if(sParam.atrbtVldtnWayCd != "T") {
                    		sParam.atrbtVldtnRuleCntnt = that.$el.find('#buttonType [data-form-param="atrbtVldtnRuleCntnt"]').val();
                    	}
                    	else {
                    		sParam.atrbtVldtnRuleCntnt = that.$el.find('#selectTyle [data-form-param="atrbtVldtnRuleCntnt"]').val();
                    	}
                    }
                    else {
                    	sParam.atrbtVldtnRuleCntnt = "";
                    }




                    sParam.atrbtVldtnRuleCntnt	= that.$el.find('#service-profile-attribute-area [data-form-param="atrbtVldtnRuleCntnt"]').val();


                    if(fn_isNull(sParam.srvcPrflNm)) {
                        fn_alertMessage("", bxMsg("cbb_err_msg.ABRVTN#failed"));
                    }


                    var linkData = {"header": fn_getHeader("CAPSV0078201"), "CaSrvcPrflMgmtSvcIO": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                                // tree 재조회
                                that.loadTreeList();
                            }
                        }   // end of suucess: fucntion
                    }); // end of bxProxy
                }


                fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#srvcPrflSave'), saveData, this);
            },


            deleteServiceProfileAttribute: function (event) {
                var that = this;
              //배포처리[과제식별자 체크]
                if (!fn_headerTaskIdCheck()){
                    return;
                }

                function deleteData() {
                    var sParam = {};


                    sParam.srvcPrflNm 		    = that.$el.find('#service-profile-attribute-area [data-form-param="atrbtCd"]').val();
//                    sParam.srvcPrflAtrbtNm	    = that.$el.find('#service-profile-attribute-area [data-form-param="atrbtNm"]').val();
                    sParam.srvcPrflAtrbtNm	    = sParam.srvcPrflNm;
                    sParam.useLngAtrbtNm	    = that.$el.find('#service-profile-attribute-area [data-form-param="loginLngAtrbtNm"]').val();
                    sParam.atrbtVldtnRuleCntnt 	    = that.$el.find('#service-profile-attribute-area [data-form-param="atrbtVldtnRuleCntnt"]').val();
                    sParam.atrbtVldtnRuleCntnt	= that.$el.find('#service-profile-attribute-area [data-form-param="atrbtVldtnXtnRule"]').val();
                    sParam.atrbtVldtnWayCd	    = that.atrbtVldtnWayCd;


                    if(fn_isNull(sParam.srvcPrflNm)) {
                        fn_alertMessage("", bxMsg("cbb_err_msg.ABRVTN#failed"));
                    }


                    var linkData = {"header": fn_getHeader("CAPSV0078301"), "CaSrvcPrflMgmtSvcIO": sParam};


                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
                                // tree 재조회
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


            openStandardAttributeSearchPopup: function () {
                var that = this;


                this.popupAttributeSearch = new PopupAttributeSearch();
                this.popupAttributeSearch.render();
                this.popupAttributeSearch.on('popUpSetData', function (data) {


                    that.$el.find('#service-profile-attribute-area [data-form-param="atrbtCd"]').val(data.atrbtCd);
//                    that.$el.find('#service-profile-attribute-area [data-form-param="atrbtNm"]').val(data.atrbtNm);
                    that.$el.find('#service-profile-attribute-area [data-form-param="atrbtNm"]').val(data.loginLngAtrbtNm);
                });
            },


            openCodeSearchPopup: function () {
            	var that = this;


            	this.popupCodeSearch = new PopupCodeSearch();
            	this.popupCodeSearch.render();
            	this.popupCodeSearch.on('popUpSetData', function (data) {
            		console.log(data);
            		that.$el.find('#buttonType [data-form-param="atrbtVldtnRuleCntnt"]').val(data.cdNbr);
            	});
            },


            /**
             * show or hide service profile attribute section
             */
            toggleServiceProfileAttribute: function () {
                fn_pageLayerCtrl(this.$el.find("#service-profile-attribute-area"), this.$el.find("#btn-service-profile-attribute-toggle"));
            }
        }); // end of Backbone.View.extend({


        return CAPSV007View;
    } // end of define function
); // end of define


