define(
    [
        'bx-component/popup/popup'
        , 'bx-component/ext-grid/_ext-grid'
        , 'text!app/views/page/popup/CAPAT/popup-brnchCd-tpl.html'
        , 'bx/common/common-info'
        , 'bx-component/bx-tree/bx-tree'
        , 'bx/common/common-info'
    ],
    function (Popup
        , ExtGrid
        , tpl
        , commonInfo
        , bxTree
        , commonInfo) {


        var dtogRelCd;


        var BxpUserPopup = Popup.extend({
            //태그 이름 설정
            tagName: 'section'


            //클래스 이름 설정
            , className: 'popup-page'


            //템플릿설정
            , templates: {
                'tpl': tpl
            }


            , attributes: {
            	'style': 'width: 1020px; height: 800px;'
            }


            , events: {
                'click #btn-popup-search-modal': 'popPageLayerCtrl' // 조회영역 접기 
                , 'click #btn-popup-service-reset': 'reset' // 초기화         	
                , 'click #btn-popup-tree-modal': 'popTreeLayerCtrl' // 그리드영역 접기
                , 'click #btn-tree-search': 'loadTreeOrList'// 검색버튼클릭
                , 'click #btn-popup-select': 'selectTreeData'//선택버튼클릭
                , 'click #btn-popup-cancel': 'close'//취소버튼클릭
            }


            /**
             * initialize
             * @param initConfig
             */
            , initialize: function (initConfig) {
                var that = this;

                if(initConfig){
                	if(initConfig.instCd){
                		this.instCd = initConfig.instCd;
                	}
                	if(initConfig.dtogRelCd){
                		dtogRelCd = initConfig.dtogRelCd;
                	}
                }else{
                	dtogRelCd = '01';
                	this.instCd = $.sessionStorage('instCd');
                }
                
                // Set Page
                this.$el.html(this.tpl());

                // Set Page modal 설정
                that.enableDim = true;

                that.show();

                //공통코드조회
                var param = {};
                param.cdNbr = '11953';
                var linkData = {"header": fn_getHeader("CAPCM0038400"), "CaCmnCdSvc06In": param};
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    success: function (data) {
                        if (fn_commonChekResult(data)) {
                        	var codeTbl = data.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
                        	for(var i = 0 ; i < codeTbl.length ; i++){
                        		if(codeTbl[i].cd === dtogRelCd){
                                    that.$el.find('[data-form-param="dtogRel"]').val(codeTbl[i].cdNm);
                                	that.$el.find('[data-form-param="dtogRel"]').attr("disabled", true);
                                    dtogRelCd = codeTbl[i].cd;
                                    break;
                        		}
                        	}//for문 끝          	
                        }
                    }
                });//bxProxy 끝


                that.createTree();


            }


            /**
             * render
             */
            , render: function () {
                //this.initPageConfiguration();
            }


            /**
             * 초기 화면 설정
             */
            , initPageConfiguration: function () {


                that.$el.find('[data-form-param="dtogRelCd"]').val(dtogRelCd);
                if(dtogRelCd) {
                	that.$el.find('[data-form-param="dtogRelCd"]').attr("disabled", true);
                }
            }


            /**
             * 조회영역 접기
             */
            , popPageLayerCtrl: function(){
        		var that = this;


        		fn_pageLayerCtrl(that.$el.find("#popup-search-area"));
            }


            /**
             * 입력항목 초기화
             */
            , reset: function(){
        		var that = this;
        	  	that.$el.find(".popup-service-table [data-form-param='dtogRel']").val("");
        	  	that.$el.find(".popup-service-table [data-form-param='deptNm']").val("");
            }


            /**
             * 트리영역 접기
             */
            , popTreeLayerCtrl: function(){
        		var that = this;
        		fn_pageLayerCtrl(that.$el.find("#popup-service-tree"));
            }


            /**
             * afterClose
             */
            , afterClose: function () {
                this.remove();
            }


            /**
             * load Tree or List
             */
            , loadTreeOrList: function(){
                var that = this;
            	if(that.$el.find('.deptNm').val() == '' || that.$el.find('.deptNm').val() == undefined){
                	//deptNm입력이 없으면 트리생성
                    that.loadTree();
            	}else{
                	//deptNm입력이 있으면 목록조회
                    that.createGrid();
            	}
            }


            /**
             * tree 생성
             */
            , createTree: function () {
                var that = this;


                that.subViews['PAT201Tree'] = new bxTree({
                	fields: {id: 'deptId', value: 'deptInfoCntnt'}
                    , listeners: {
                        clickItem: function(itemId, itemData, currentTarget, e) {
                            that.selectTreeData(itemData);
                         }
                     }
                 });


                // DOM Element Cache
                that.$unitTreeRoot = that.$el.find('.bx-tree-root');
                that.$unitTreeRoot.html(this.subViews['PAT201Tree'].render());
                that.loadTree();
            }


            /**
             * load all of tree list
             */
            , loadTree: function () {
                var that = this;
                var sParam = {};

                sParam.instCd = this.instCd;
                sParam.dtogRelCd = dtogRelCd;


                var linkData = {"header": fn_getHeader("CAPDT2008402"), "CaDeptSrchSvcGetDeptListIn": sParam};
                that.$el.find('.deptGridArea').hide();
                that.$el.find('.deptTreeArea').show();
                that.treeList = [];


                bxProxy.post(sUrl, JSON.stringify(linkData),{
                   enableLoading: true,
                    success: function (responseData) {
                       if(fn_commonChekResult(responseData)) {
                    	   that.subViews['PAT201Tree'].renderItem(responseData.CaDeptSrchSvcGetDeptListOut.deptList);
                           that.treeList = responseData.CaDeptSrchSvcGetDeptListOut.deptList;
                       }
                    }
                });//end of bxProxy


            }
            /**
             * 그리드 생성
             */
            , createGrid: function () {
                var that = this;


                that.PAT201GridInpItm = new ExtGrid({
                    // 그리드 컬럼 정의
                    fields: ['rowIndex', 'deptId', 'deptNm']
                    , id: 'PAT201Grid-service-input-item'
                    , columns: [
                        {
                            text: 'No.',
                            dataIndex: 'rowIndex',
                            sortable: false,
                            width : 80,
                            style: 'text-align:center',
                            height: 25,
                            align: 'center',
                            // other config you need....
                            renderer: function (value, metaData, record, rowIndex) {
                                return rowIndex + 1;
                            }
                        },
                        {
                            text: bxMsg('cbb_items.SCRNITM#deptId'),
                            flex: 1,
                            dataIndex: 'deptId',
                            style: 'text-align:center',
                            align: 'left'
                        },
                        {
                            text: bxMsg('cbb_items.SCRNITM#deptNm'),
                            flex: 1,
                            dataIndex: 'deptNm',
                            style: 'text-align:center',
                            align: 'left'
                        }
                    ] // end of columns
                    , listeners: {
                        click: {
                            element: 'body'
                            , fn: function () {
                                that.clickGridOfDeptList();
                            }
                        }
                    }
                });


                that.$el.find('#popup-service-grid').html(that.PAT201GridInpItm.render({'height': CaPopGridHeight})); 
                that.loadList();
            }


            /**
             * load List
             */
            , loadList: function(){
                var that = this;
                var sParam = {};

                sParam.instCd = this.instCd;

                if(dtogRelCd){
                    sParam.dtogRelCd = dtogRelCd;               	
                }else{
                	sParam.dtogRelCd = '01';
                }


                sParam.deptNm = that.$el.find('.deptNm').val();                   
                var linkData = {"header": fn_getHeader("CAPDT2008401"), "CaDeptSrchSvcGetDeptListIn": sParam};
                that.$el.find('.deptTreeArea').hide();
                that.$el.find('.deptGridArea').show();


                bxProxy.post(sUrl, JSON.stringify(linkData),{
                   enableLoading: true,
                    success: function (responseData) {
                       if(fn_commonChekResult(responseData)) {
                           var data = responseData.CaDeptSrchSvcGetDeptListOut;
                           if (data.deptList != null || data.deptList.length > 0) {
                           	that.PAT201GridInpItm.setData(data.deptList);
                           }
                       }
                    }
                });//end of bxProxy
            }


            /**
             * 트리 데이터 선택
             */
            , selectTreeData: function (itemData) {
                var param = {};


                if (!itemData || itemData.deptId == null || itemData.deptId == undefined) {
                    return;
                } else {
                    param.brnchCd = itemData.deptId;
                    param.brnchNm = itemData.deptNm;
                    param.deptId = itemData.deptId;
                    param.deptNm = itemData.deptNm;
                }
                this.trigger('popUpSetData', param);
                this.close();
            }


            /**
             * 그리드 데이터 선택
             */
            , clickGridOfDeptList: function(){
                var that = this;
                var selectedItem = that.PAT201GridInpItm.grid.getSelectionModel().selected.items[0];
                var param = {};


                if (!selectedItem) {
                    return;
                } else {
                    param.brnchCd = selectedItem.data.deptId;
                    param.brnchNm = selectedItem.data.deptNm;
                    param.deptId = selectedItem.data.deptId;
                    param.deptNm = selectedItem.data.deptNm;
                }
                this.trigger('popUpSetData', param);
                this.close();
            }


        });


        return BxpUserPopup;
    }
);
