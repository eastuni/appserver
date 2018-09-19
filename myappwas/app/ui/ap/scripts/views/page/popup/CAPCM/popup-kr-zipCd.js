define([
        'text!app/views/page/popup/CAPCM/popup-kr-zipCd.html'
        , 'bx-component/ext-grid/_ext-grid'
        , 'bx/common/common-index-paging'
        , 'bx-component/popup/popup'
    ]
    , function (
        tpl
        , ExtGrid
        , IndexPaging
        , Popup
    ) {
        var popupKrAddr = Popup.extend({

            templates: {
                'tpl': tpl
            }

            , attributes: {
                'style': 'width: 1200px; height: 960px;'
            }

            , events: {
                'click #btn-search-condition-reset': 'reset' // 초기화
                , 'click #btn-search-condition-search': 'selectList' // 목록조회

                , 'click #btn-search-result-toggle': 'toggleSearchResult' // 그리드영역 접기
                , 'click #btn-search-condition-toggle': 'toggleSearchCondition' // 조회영역 접기
                , 'click #btn-select-addr-toggle': 'toggleSearchCondition' // 선택주소영역 접기

                , 'click #btn-popup-select': 'selectAddr' // 선택버튼클릭
                , 'change #addrSrchTpCd': 'changeSearchType' // 검색유형콤보박스 선택 변경 시 
                , 'change #cityPrvncAddr': 'changeCityProvinceAddress' // 시도주소콤보박스 선택 변경시
            }
            /**
             * 검색 조건 영역 토글
             */
            , toggleSearchCondition : function() {
                var that = this;
                fn_pageLayerCtrl(that.$el.find("#search-condition-area"));
            }
            /**
             * 초기화 클릭
             */
            , reset : function() {
                var that = this;
                that.$el.find("#search-condition-area input").val("");
                that.$el.find("#search-condition-area select").each(function() { 
	        		this.selectedIndex = 0;	
	        	});
                
                that.resetDetail(); // 선택 주소 영역 초기화 
            }
            /**
             * 조회버튼 클릭 
             */
            , selectList : function() {
                var that = this;
                that.loadList();
            }
            /**
             * 그리드 영역 접기
             */
            , toggleSearchResult : function() {
                var that = this;
                fn_pageLayerCtrl(that.$el.find("#popup-kr-zipCd-grid"));
            }
            /**
             * 초기화 
             */
            , initialize: function (initConfig) {
                var that = this;

                this.$el.html(this.tpl());

                $.extend(that, initConfig);

                that.enableDim = true;

                that.comboStore1 = {}; // 검색유형
            	that.comboStore2 = {}; // 시도주소
            	that.comboStore3 = {}; // 시군구주소
            	
                var sParam = {};
                sParam.cdNbr = "A0378"; // 검색유형
                var linkData1 = {"header": fn_getHeader("CAPCM0038400"), "CaCmnCdSvcGetCdListByCdNbrIn": sParam};
                
                sParam = {};
                sParam.cdNbr = "A0383"; // 시도주소
                var linkData2 = {"header": fn_getHeader("CAPCM0038400"), "CaCmnCdSvcGetCdListByCdNbrIn": sParam};
                
                bxProxy.all([
                             // 검색유형 컴포넌트콤보로딩
                             {url: sUrl, param: JSON.stringify(linkData1), success: function (responseData) {
                                 if (fn_commonChekResult(responseData)) {
                                     comboStore1 = new Ext.data.Store({
                                         fields: ['cd', 'cdNm'],
                                         data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
                                     });
                                     
                                     // add option to 기본속성 combobox 
                                     var comboParam = {};
                                     comboParam.className = "addrSrchTpCd-wrap";
                                     comboParam.tblNm = responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm;
                                     comboParam.valueNm = "cd";
                                     comboParam.textNm = "cdNm";
                                     
                                     fn_makeComboBox(comboParam, that);
                                 }
                             }} 
                             // 시도주소 컴포넌트콤보로딩
                            ,{url: sUrl, param: JSON.stringify(linkData2), success: function (responseData) {
                                 if (fn_commonChekResult(responseData)) {
                                     comboStore2 = new Ext.data.Store({
                                         fields: ['cd', 'cdNm'],
                                         data: responseData.CaCmnCdSvcGetCdListByCdNbrOut.tbl
                                     });
                                     
                                     // add option to 기본속성 combobox 
                                     comboParam = {};
                                     comboParam.className = "cityPrvncAddr-wrap";
                                     comboParam.tblNm = responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm;
                                     comboParam.valueNm = "cd";
                                     comboParam.textNm = "cdNm";
                                     comboParam.nullYn = "Y";
                                     comboParam.allNm = bxMsg('cbb_items.SCRNITM#B_select');  
                                     
                                     fn_makeComboBox(comboParam, that);                                         
                                 }
                             }} 
                          ]
                          , {
                              success: function () {                   
                
				                that.popupKrAddrGrid = new ExtGrid({
				                    // 그리드 컬럼 정의
				                    fields: ['rowIndex', 'zipCd', 'areaNbrAddr', 'roadAddr', 'addrId', 'addrHrarcyCd']
				                    , id: 'popupKrAddrGrid'
				                    , columns: [
				                        {
				                            text: 'No.'
				                            , dataIndex: 'rowIndex'
				                            , sortable: false
				                            , width : 80
				                            , height : 25
				                            , style: 'text-align:center'
				                            , align: 'center'
				                            // other config you need....
				                            , renderer: function (value, metaData, record, rowIndex) {
				                                return rowIndex + 1;
				                            }
				                        }
				                        , {text: bxMsg('cbb_items.AT#zipCd'), flex: 1, dataIndex: 'zipCd', style: 'text-align:center', align: 'center'}
				                        , {text: bxMsg('cbb_items.AT#areaNbrAddr'), flex: 2, dataIndex: 'areaNbrAddr', style: 'text-align:center', align: 'left'}
				                        , {text: bxMsg('cbb_items.AT#roadAddr'), flex: 4, dataIndex: 'roadAddr', style: 'text-align:center', align: 'left'}
				                        , {hidden: true, dataIndex: 'addrId'}
				                        , {hidden: true, dataIndex: 'addrHrarcyCd'}				                        
				                     ] // end of columns
		                            , listeners: {
		                                click: {
		                                    element: 'body'
		                                  , fn: function () {
		                                        //클릭시 이벤트 발생
		                                        that.clickGrid();
		                                    }
		                                }				                
		                             }
	                            });
				             
				                // 단일탭 그리드 렌더
				                that.$el.find(".popup-kr-zipCd-grid").html(that.popupKrAddrGrid.render({'height': CaPopGridHeight}));
		            
                              } // end of success:.function
                }); // end of bxProxy.all	
            }
            /**
             * render
             */
            , render: function () {
                var that = this;

                that.show();
            }
            /**
             * 목록조회 
             */
            , selectList: function () {
                var that = this;
                var sParam = {};

                sParam.addrHrarcyCd = "KR";
                sParam.addrSrchTpCd = that.$el.find('.addr-base-table [data-form-param="addrSrchTpCd"]').val();
                sParam.cityPrvncAddr = that.$el.find('.addr-base-table [data-form-param="cityPrvncAddr"] :selected').text();
                sParam.cityGunGuAddr = that.$el.find('.addr-base-table [data-form-param="cityGunGuAddr"] :selected').text();
                
                sParam.roadNm = that.$el.find('.addr-base-table [data-form-param="roadNm"]').val();
                sParam.bldgMainNbr = that.$el.find('.addr-base-table [data-form-param="bldgMainNbr"]').val();
                sParam.bldgSubNbr = that.$el.find('.addr-base-table [data-form-param="bldgSubNbr"]').val();
                
                sParam.bldgNm = that.$el.find('.addr-base-table [data-form-param="bldgNm"]').val();
                
                sParam.emdongAddr = that.$el.find('.addr-base-table [data-form-param="emdongAddr"]').val();
                sParam.nbrAddrNbr = that.$el.find('.addr-base-table [data-form-param="nbrAddrNbr"]').val();
                sParam.househldNbr = that.$el.find('.addr-base-table [data-form-param="househldNbr"]').val();
                
                that.resetDetail(); // 선택 주소 영역 초기화 
                
                var linkData = {"header": fn_getHeader("CASCM0038400"), "CaKrAddrSvcGetKoreaAddressListIn": sParam};
                
                //ajax 호출
                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    enableLoading: true,
                    success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            that.popupKrAddrGrid.setData(responseData.CaKrAddrSvcGetKoreaAddressListOut.tblNm);
                        }
                        else {
                        	that.popupKrAddrGrid.resetData();
                        }
                    }
                });                
            }
            /**
             * 선택 주소 영역 초기화 
             */
            , resetDetail : function() {
            	var that = this;
            	that.$el.find('.addr-detail-table input').val("");
            }            
            /**
             * 그리드 데이터 선택  
             */
            , clickGrid: function () {
                var that = this;
                var selectedData = that.popupKrAddrGrid.grid.getSelectionModel().selected.items[0];
                var param = {};

                if (!selectedData) {
                    return;
                } else {
                    that.$el.find('.addr-detail-table [data-form-param="zipCd"]').val(selectedData.data.zipCd);
                    that.$el.find('.addr-detail-table [data-form-param="addrId"]').val(selectedData.data.addrId);
                    that.$el.find('.addr-detail-table [data-form-param="addrHrarcyCd"]').val(selectedData.data.addrHrarcyCd);
                    that.$el.find('.addr-detail-table [data-form-param="areaNbrAddr"]').val(selectedData.data.areaNbrAddr);
                    that.$el.find('.addr-detail-table [data-form-param="roadAddr"]').val(selectedData.data.roadAddr);
                }
            }
            /**
             * 선택버튼 클릭 
             */
            , selectAddr : function() {
            	var that = this;
            	var param = {};
                
                param.zipCd = that.$el.find('.addr-detail-table [data-form-param="zipCd"]').val();
                param.addrId = that.$el.find('.addr-detail-table [data-form-param="addrId"]').val();
                param.addrHrarcyCd = that.$el.find('.addr-detail-table [data-form-param="addrHrarcyCd"]').val();
                param.areaNbrAddr = that.$el.find('.addr-detail-table [data-form-param="areaNbrAddr"]').val();
                param.roadAddr = that.$el.find('.addr-detail-table [data-form-param="roadAddr"]').val();
                param.dtlAddr = that.$el.find('.addr-detail-table [data-form-param="dtlAddr"]').val();
                
                if (param.zipCd == '' || param.addrId == '' || param.addrHrarcyCd == '' || param.dtlAddr == '') {
                	fn_alertMessage(bxMsg('cbb_items.SCRNITM#information'), bxMsg('cbb_err_msg.AUICME0014'));  
                    return;
                }
                
                that.trigger('popUpSetData', param);
                that.close();
            }
            /**
             * 검색조건변경 시 실행
             */
            , changeSearchType : function(e) {
            	var that = this;
            	var currTargetObj = $(e.currentTarget);
            	
            	// 지번 주소 검색
            	if(currTargetObj.val() == "2") {
            		that.$el.find('.searchRoadNmRow').hide();
            		that.$el.find('.searchBldgNmRow').show();
            		that.$el.find('.searchAreaNoRow').hide();
            	}
            	// 건물명 주소 검색
            	else if(currTargetObj.val() == "3") {
            		that.$el.find('.searchRoadNmRow').hide();
            		that.$el.find('.searchBldgNmRow').hide();
            		that.$el.find('.searchAreaNoRow').show();
            	}
            	// 도로명 주소 검색
            	else {
            		that.$el.find('.searchRoadNmRow').show();
            		that.$el.find('.searchBldgNmRow').hide();
            		that.$el.find('.searchAreaNoRow').hide();
            	}
            	
            	that.$el.find('.searchRoadNmRow').find("input").val("");
            	that.$el.find('.searchBldgNmRow').find("input").val("");
            	that.$el.find('.searchAreaNoRow').find("input").val("");
            }
            /**
             * 시도주소 콤보박스 선택 변경 시 실행
             */
            , changeCityProvinceAddress : function(e) {
            	var that = this;
            	var currTargetObj = $(e.currentTarget);
            	
            	// 시군구주소 콤보박스 option 셋팅 
            	if(currTargetObj.find("option")[0].value == "") {
            		$(currTargetObj.find("option")[0]).remove();
            	}
        		
            	that.$el.find(".cityGunGuAddr-wrap").removeAttr("disabled");
            	that.$el.find(".cityGunGuAddr-wrap option").remove();
            	that.$el.find(".cityGunGuAddr-wrap").val("");
            	
                var param = {};
                param.cityPrvncCd = currTargetObj.val();

                var linkData = {"header": fn_getHeader("CASCM0038401"), "CaKrAddrSvcGetGuGunListIn": param};

                bxProxy.post(sUrl, JSON.stringify(linkData), {
                    success: function (responseData) {
                        if (fn_commonChekResult(responseData)) {
                            
                            // add option to 검색조건 combobox 
                            var comboParam = {};
                            comboParam.className = "cityGunGuAddr-wrap";
                            comboParam.tblNm = responseData.CaKrAddrSvcGetGuGunListOut.tblNm;
                            comboParam.valueNm = "cityGunGuCd";
                            comboParam.textNm = "cityGunGuAddr";
                            
                            fn_makeComboBox(comboParam, that);                                
                        }
                    }
                });
            }
            /**
             * 취소버튼 클릭 후 이벤트 처리 
             */
            , afterClose : function() {
                var that = this;
                that.remove();
            }
        });

        return popupKrAddr;
    }
);
