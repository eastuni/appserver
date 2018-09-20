define(
    [
        'bx/common/config',
        'text!app/views/page/CAPAR/150/_CAPAR150.html',
        'bx-component/ext-grid/_ext-grid',
        'bx-component/bx-tree/bx-tree',
        'bx/common/common-info',        
        'app/views/page/popup/CAPCM/popup-class-search',
        'app/views/page/popup/CAPCM/popup-numbering-rule-search'
        
    ]
    , function (
        config,
        tpl,
        ExtGrid,
        bxTree,
        commonInfo,
        PopupClassSearch,
        PopupNumberingRuleSearch
    ) {


        /**
         * Backbone
         */
        var CAPAR150View = Backbone.View.extend({
            // set tag name
            tagName: 'section',
            // set class name
            className: 'bx-container CAPAR150-page',
            // set Template
            templates: {
                'tpl': tpl
            },
            // set Events
            events: {
                'keydown #searchKey': 'fn_enter',

                'click #btn-tree-search': 'searchTreeList',

                'click #btn-arr-srvc-tp-info-reset':'resetArrSrvcTpInfo',
                'click #btn-arr-srvc-tp-info-save':'saveArrSrvcTpInfo',
                'click #btn-arr-srvc-tp-info-delete':'removeArrSrvcTpInfo',
                

                'click #btn-tree-hide': 'hideTree',
                'click #btn-tree-show': 'showTree',

                'click #btn-arr-srvc-tp-info-toggle': 'toggleArrSrvcTpInfo',
            },


            /**
             * initialize
             */
            initialize: function (initData) {
                var that = this;

                var selectedTreeData;

                // 기관코드
                if (commonInfo.getInstInfo().instCd) {
                	that.instCd = commonInfo.getInstInfo().instCd;
                }
                else {
                	that.instCd = $.sessionStorage('headerInstCd');
                }

                $.extend(that, initData);

                that.createTree();
            },


            /**
             * render
             */
            render: function () {
                // set page template
                this.$el.html(this.tpl());
                this.$el.find('.bx-tree-root').html(this.CAPAR150Tree.render());


                var sParam;


                sParam = {};


                sParam.className = "CAPAR150-arrSrvcCmpntCd-wrap";
                sParam.targetId = "arrSrvcCmpntCd";
                sParam.viewType = "ValNm";
                sParam.cdNbr = "A1365";
              	sParam.nullYn = "Y";
                sParam.allNm = bxMsg('cbb_items.SCRNITM#B_select'); // 선택

                // 콤보데이터 load
                fn_getCodeList(sParam, this);



                this.loadTreeList();

              //배포처리반영[버튼비활성화]
                fn_btnCheckForDistribution([
                                    		this.$el.find('.CAPAR150-wrap #btn-arr-srvc-tp-info-save')
                                    			   ]);
                
                return this.$el;
            },


            createTree: function () {
                var that = this;


                that.CAPAR150Tree = new bxTree({
                    fields: {id: 'arrSrvcTpCd', value: 'arrSrvcTpNm'},


                    // Tree Item - Checkbox Use Yn
                    checkAble: false,


                    listeners: {
                        clickItem: function(itemId, itemData, currentTarget, e) {
                        	if(itemData.arrSrvcCmpntCd == null){
                        		//arrSrvcCmpntCd가 null이면 컴포넌트코드라 판단
                        		that.selectedTreeData=[];
                        		that.setArrSrvcCmpntInfo(itemData.arrSrvcTpCd);
                        		
                        	}else{
                            	that.inquireServiceData(itemData);
                            	that.selectedTreeData=itemData;
                            	console.log(that.selectedTreeData);
                        	}
                        }
                    }
                });
            },

            inquireServiceData: function (param) {
                //header 정보 set
                var that = this;
                var sParam = {};

                sParam.arrSrvcTpCd = param.arrSrvcTpCd;

                if(sParam.arrSrvcTpCd == null){
               	 return;
                }

                

                var linkData = {"header": fn_getHeader("CAPAR1508401"), "CaArrSrvcTpMgmtSvcInqryIn": sParam};


                console.log("#######단건조회######");
                console.log("sParam"+sParam);
                // ajax호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: true
                    , success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                        	
                            var data = responseData.CaArrSrvcTpMgmtSvcInqryOut;
                            
                            // 목록이 1건만 나옴.
                            that.setArrSrvcTpInfo(data);


                        }
                    }   // end of suucess: fucntion
                }); // end of bxProxy
           },



           setArrSrvcTpInfo: function (data) {
        		   this.$el.find('#arr-srvc-tp-info-area [data-form-param="arrSrvcCmpntCd"]').val(data.arrSrvcCmpntCd);
                   this.$el.find('#arr-srvc-tp-info-area [data-form-param="arrSrvcTpCd"]').val(data.arrSrvcTpCd);
                   this.$el.find('#arr-srvc-tp-info-area [data-form-param="arrSrvcTpCd"]').prop("disabled",true);
                   this.$el.find('#arr-srvc-tp-info-area [data-form-param="upArrSrvcTpCd"]').val(data.upArrSrvcTpCd);
                   this.$el.find('#arr-srvc-tp-info-area [data-form-param="arrSrvcTpNm"]').val(data.arrSrvcTpNm);
           },
           setArrSrvcCmpntInfo: function (data) {
        	   	   this.$el.find('#arr-srvc-tp-info-area [data-form-param="arrSrvcCmpntCd"]').val(data);
                   this.$el.find('#arr-srvc-tp-info-area [data-form-param="arrSrvcTpCd"]').prop("disabled",false);
                   this.$el.find('#arr-srvc-tp-info-area [data-form-param="arrSrvcTpCd"]').val("");
                   this.$el.find('#arr-srvc-tp-info-area [data-form-param="upArrSrvcTpCd"]').val("");
                   this.$el.find('#arr-srvc-tp-info-area [data-form-param="arrSrvcTpNm"]').val("");
           },
           
           
           
            saveArrSrvcTpInfo: function (event) {
                var that = this;

              //배포처리[과제식별자 체크]
                if (!fn_headerTaskIdCheck()){
                    return;
                }
                function saveData() {
                    var sParam = {};


                    sParam.arrSrvcCmpntCd 	= that.$el.find('#arr-srvc-tp-info-area [data-form-param="arrSrvcCmpntCd"]').val();
                    sParam.arrSrvcTpCd 	    = that.$el.find('#arr-srvc-tp-info-area [data-form-param="arrSrvcTpCd"]').val();
                    sParam.upArrSrvcTpCd 	= that.$el.find('#arr-srvc-tp-info-area [data-form-param="upArrSrvcTpCd"]').val();
                    sParam.arrSrvcTpNm 		= that.$el.find('#arr-srvc-tp-info-area [data-form-param="arrSrvcTpNm"]').val();

                    if(sParam.arrSrvcTpCd == "") {
                		sParam = null;
                		return;
                	}
                    var linkData = {"header": fn_getHeader("CAPAR1508501"), "CaArrSrvcTpMgmtSvcSaveIn": sParam};

                    console.log("########저장버튼#########");
                    console.log("sParam"+sParam);

                    // ajax호출
                    bxProxy.post(sUrl, JSON.stringify(linkData), {
                        enableLoading: true
                        , success: function (responseData) {
                            if (fn_commonChekResult(responseData)) {
                                fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));


                                that.resetArrSrvcTpInfo();
		    	                //트리다시 그리기
				                that.loadTreeList();
                            }
                        }   // end of suucess: fucntion
                    }); // end of bxProxy
                }


                fn_confirmMessage(event, bxMsg('cbb_items.ABRVTN#save'), bxMsg('cbb_items.SCRNITM#screenSave'), saveData, this);


            },
            removeArrSrvcTpInfo: function (event) {
            	var that = this;
            	
            	
            	//배포처리[과제식별자 체크]
            	if (!fn_headerTaskIdCheck()){
            		return;
            	}

            	//하위 서비스유형이 있으면 삭제불가
        		if(that.selectedTreeData.children.length!=0){
        			fn_alertMessage("", bxMsg('cbb_err_msg.AUIARE0005'));
        			return;
        		}
            	
            	function deleteData() {

            		
            		var sParam = {};
            		
            		
            		sParam.arrSrvcTpCd 	    = that.$el.find('#arr-srvc-tp-info-area [data-form-param="arrSrvcTpCd"]').val();
            		
            		if(sParam.arrSrvcTpCd == "") {
            			sParam = null;
            			return;
            		}
            		var linkData = {"header": fn_getHeader("CAPAR1508301"), "CaArrSrvcTpMgmtSvcInqryIn": sParam};
            		
            		console.log("########삭제버튼#########");
            		console.log("sParam"+sParam);
            		
            		// ajax호출
            		bxProxy.post(sUrl, JSON.stringify(linkData), {
            			enableLoading: true
            			, success: function (responseData) {
            				if (fn_commonChekResult(responseData)) {
            					fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
            					
            					that.resetArrSrvcTpInfo();
            					//트리다시 그리기
            					that.loadTreeList();
            					that.selectedTreeData=[];
            				}
            			}   // end of suucess: fucntion
            		}); // end of bxProxy
            	}
            	
            	
            	fn_confirmMessage(event, bxMsg('cbb_items.SCRNITM#B_delete'), bxMsg('cbb_items.SCRNITM#screenSave'), deleteData, this);
            	
            	
            },
            /**
             * load all of tree list
             */
            loadTreeList: function () {
                 var that = this;
                 var sParam = {};

                 var linkData = {"header" : fn_getHeader("CAPAR1508402") , "CaArrSrvcTpMgmtSvcInqryIn" : sParam};


                 that.treeList = [];


                 bxProxy.post(sUrl, JSON.stringify(linkData),{
                     enableLoading: true,
                     success: function (responseData) {
                         if(fn_commonChekResult(responseData)) {
                             that.CAPAR150Tree.renderItem(responseData.CaArrSrvcTpMgmtSvcInqryListOut.srvcTpList);
                             that.treeList = responseData.CaArrSrvcTpMgmtSvcInqryListOut.srvcTpList;

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
                    this.CAPAR150Tree.renderItem(this.treeList);
                    return;
                }


                if(this.treeList.length < 1) {
                    return;
                }


                matchingItems = this.findMatchingTreeItems(searchKey);
                this.CAPAR150Tree.renderItem(matchingItems);
            },


            /**
             * find and return matching tree items
             */
            findMatchingTreeItems : function(key) {
                var searchTreeList = [];


                $(this.treeList).each(function(idx, data) {
                    
                	
                	//depth 1
                	var arrSrvcTpList = data.children;
                    $(arrSrvcTpList).each(function(idx,data){
                    	
                    	var temp001 = data;
                      
                    	if ((temp001.arrSrvcTpCd.indexOf(key) > -1 || temp001.arrSrvcTpNm.indexOf(key) > -1)) {
	                           searchTreeList.push(temp001);
	                           return;
	                     }

                    	//depth2
                    	if(temp001.children.length!=0){
                    		arrSrvcTpList = temp001.children;
                    		
                    		$(arrSrvcTpList).each(function(idx,data){
                            	
                            	var temp002 = data;
                              
                            	if ((temp002.arrSrvcTpCd.indexOf(key) > -1 || temp002.arrSrvcTpNm.indexOf(key) > -1)) {
        	                           searchTreeList.push(temp002);
        	                           return;
        	                     }
                            	
                            	//depth3
                            	
                             	if(temp002.children.length!=0){
                            		arrSrvcTpList = temp002.children;
                            		
                            		$(arrSrvcTpList).each(function(idx,data){
                                    	
                                    	var temp003 = data;
                                      
                                    	if ((temp003.arrSrvcTpCd.indexOf(key) > -1 || temp003.arrSrvcTpNm.indexOf(key) > -1)) {
                	                           searchTreeList.push(temp003);
                	                     }
                                    });
                            	}
                            });
                    	}
                    	
                    
                    });
                    
                });


                return searchTreeList;
            },



            resetArrSrvcTpInfo: function (data) {

                this.$el.find('#arr-srvc-tp-info-area [data-form-param="arrSrvcCmpntCd"] option:eq(0)').attr("selected", "selected");
                this.$el.find('#arr-srvc-tp-info-area [data-form-param="arrSrvcTpCd"]').val("");
                this.$el.find('#arr-srvc-tp-info-area [data-form-param="arrSrvcTpCd"]').prop("disabled",false);
                this.$el.find('#arr-srvc-tp-info-area [data-form-param="upArrSrvcTpCd"]').val("");
                this.$el.find('#arr-srvc-tp-info-area [data-form-param="arrSrvcTpNm"]').val("");
                this.selectedTreeData=[];

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


            /**
             * show or hide service type info section
             */
            toggleArrSrvcTpInfo: function () {
                fn_pageLayerCtrl(this.$el.find("#arr-srvc-tp-info-area"),this.$el.find('#btn-arr-srvc-tp-info-toggle'));
            },


        }); // end of Backbone.View.extend({


        return CAPAR150View;
    } // end of define function
); // end of define


