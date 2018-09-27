define([ 'bx/common/common-info', 'text!app/views/page/CAPMT/091/_CAPMT091.html', 'bx-component/ext-grid/_ext-grid',
		'app/views/page/popup/CAPSV/popup-screen-search', 'app/views/page/popup/CAPSV/popup-service', 'app/views/page/popup/CAPMT/popup-rule'

], function(commonInfo, tpl, ExtGrid, PopupScrnSearch, PopupSrvcSearch, PopupRuleSearch) {

	var comboStore1 = {}; // 업무구분코드
	var comboStore2 = {}; // 상태코드
	var comboStore3 = {}; // 업무구분코드
	var comboStore4 = {}; // 여부
	var recordParam = null;
	var deleteList = [];
	var initFlag = true;
	var initialData = {};
	var self;
	var stepNum = 1;

	/**
	 * Backbone
	 */
	var CAPMT091View = Backbone.View.extend({
		// set tag name
		tagName : 'section',
		// set class name
		className : 'bx-container CAPMT091-page',
		// set Template
		templates : {
			'tpl' : tpl
		},
		// set Events
		events : {

			/*
			 * baseAtrbt-area
			 */
			'click #CAPMT091-btn-baseAtrbt-toggle' : 'toggleBaseAttribute',

			/*
			 * search-result-area
			 */
			'click #btn-CAPMT091-grid-up' : 'upNode',
			'click #btn-CAPMT091-grid-down' : 'downNode',
			'click #btn-search-result-reset' : 'resetSearchResult',
			'click #btn-search-result-save' : 'saveSearchResult',
			'click #btn-search-result-toggle' : 'toggleSearchResult',

			/*
			 * step-baseAtrbt-area
			 */
			'click #btn-scrnId-search' : 'serachScrnId',
			'click #btn-srvcCd-search' : 'searchSrvcCd',
			'click #CAPMT091-btn-rule-search' : 'searchRule',
			'click #CAPMT091-manage-step-btn' : 'manageStep',
			'click #CAPMT091-manage-prev-step-btn' : 'managePrevStep',
			'click #CAPMT091-manage-service-btn' : 'manageService',
			'click #CAPMT091-manage-variable-btn' : 'manageVariable',
			'click #CAPMT091-manage-role-btn' : 'manageRole',
			'click #CAPMT091-btn-step-baseAtrbt-reset' : 'resetStepBaseAttribute',
			'click #CAPMT091-btn-step-baseAtrbt-save' : 'saveStepBaseAttribute',
			'click #CAPMT091-btn-step-baseAtrbt-toggle' : 'toggleStepBaseAttribute'
		},

		/**
		 * initialize
		 */
		initialize : function(initData) {
			$.extend(this, initData);
			this.setComboStore();
			this.initData = initData;
			this.deleteList = [];
			this.initFlag = true;
			this.createGrid();
			self = this;
			that = this;
			stepNum = 1;

			initialData.workflowId = that.initData.param.workflowId;
			initialData.workflowNm = that.initData.param.workflowNm;
			initialData.workflowTpCd = that.initData.param.workflowTpCd;
			initialData.workflowDescCntnt = that.initData.param.workflowDescCntnt;
			initialData.lastChngGuid = that.initData.param.lastChngGuid;
			initialData.wflowBizDscd = that.initData.param.wflowBizDscd;
			initialData.workflowStsCd = that.initData.param.workflowStsCd;

			comboStore2 = Ext.create('Ext.data.Store', {
				fields : [ 'cd', 'cdNm' ],
				data : [ {
					cd : 'N',
					cdNm : '표준'
				}, {
					cd : 'A',
					cdNm : '승인'
				}, {
					cd : 'E',
					cdNm : '편집'
				}, {
					cd : 'F',
					cdNm : '완료'
				}, {
					cd : 'D',
					cdNm : '삭제'
				} ]
			});
		},

		/**
		 * Render
		 */
		render : function() {
			// set page template
			this.$el.html(this.tpl());
			this.$el.find("#CAPMT091Grid").html(this.CAPMT091Grid.render({
				'height' : "330px"
			}));

			this.$el.find('#baseAtrbt-area  [data-form-param="workflowId"]').val(that.initData.param.workflowId);
			this.$el.find('#baseAtrbt-area  [data-form-param="workflowNm"]').val(that.initData.param.workflowNm);
			this.$el.find('#baseAtrbt-area  [data-form-param="workflowTpCd"]').val(that.initData.param.workflowTpCd);
			this.$el.find('#baseAtrbt-area  [data-form-param="workflowDescCntnt"]').val(that.initData.param.workflowDescCntnt);
			this.$el.find('#baseAtrbt-area  [data-form-param="lastChngGuid"]').val(that.initData.param.lastChngGuid);
			this.$el.find('#baseAtrbt-area  [data-form-param="workflowStsCd"]').val(that.initData.param.workflowStsCd);
			this.$el.find('#baseAtrbt-area  [data-form-param="wflowBizDscd"]').val(that.initData.param.wflowBizDscd);

			this.inquireSearchCondition();

			// this.drawBoard();
			//this.drawToolbar();

			return this.$el;
		},


		setComboStore : function() {
			header = fn_getHeader("CAPCM0038400");

			sParam = {};
			sParam.cdNbr = "80015";
			var linkData1 = {
				"header" : header,
				"CaCmnCdSvcGetCdListByCdNbrIn" : sParam
			};

			sParam = {};
			sParam.cdNbr = "10000";
			var linkData7 = {
				"header" : header,
				"CaCmnCdSvcGetCdListByCdNbrIn" : sParam
			};

			bxProxy.all([
			{
				url : sUrl,
				param : JSON.stringify(linkData7),
				success : function(responseData) {
					if (fn_commonChekResult(responseData)) {
						comboStore4 = new Ext.data.Store({
							fields : [ 'cd', 'cdNm' ],
							data : responseData.CaCmnCdSvcGetCdListByCdNbrOut.tblNm
						});
					}
				}
			}

			], {
				success : function() {

				}
			});

		},

		/**
		 * Create search results grid
		 */
		createGrid : function() {
			var that = this;

			this.CAPMT091Grid = new ExtGrid({
				// 그리드 컬럼 정의
				fields : [ 'rowIndex', 'stepId', 'stepSeq', 'stepTpCd', 'stepNm', 'stepWflowId', 'stepWflowStepId', 'stepDescCntnt', 'nxtStepId', 'nxtStepNm',
						'ruleId', 'ruleNm', 'nxtStepRuleNm', 'lastChngGuid', 'scrnId', 'scrnNm', 'srvcCd', 'srvcNm', 'srvcId', 'startStepYn',  'aprvlRgstrnStepId', 'aprvlRgstrnStepNm' ],
				id : 'CAPMT091Grid',
				columns : [

				/*
				 * Row index
				 */
				{
					text : bxMsg('cbb_items.SCRNITM#No'),
					dataIndex : 'rowIndex',
					sortable : false,
					width : 50,
					height : 25,
					style : 'text-align:center',
					align : 'center',
					// other config you need....
					renderer : function(value, metaData, record, rowIndex) {
						return rowIndex + 1;
					}
				},

				/*
				 * stepId
				 */
				{
					text : bxMsg('cbb_items.AT#stepId'),
					dataIndex : 'stepId',
					width : 200,
					style : 'text-align:center',
					align : 'center',
					hidden : true
				},

				/*
				 * stepSeq
				 */
				{
					text : bxMsg('cbb_items.AT#stepSeq'),
					dataIndex : 'stepSeq',
					width : 200,
					style : 'text-align:center',
					align : 'center',
					hidden : true
				},

				/*
				 * stepTpCd
				 */
				{
					text : bxMsg('cbb_items.AT#stepTpCd'),
					dataIndex : 'stepTpCd',
					width : 200,
					style : 'text-align:center',
					align : 'center',
					hidden : true
				},

				/*
				 * stepNm
				 */
				{
					text : bxMsg('cbb_items.AT#stepNm'),
					dataIndex : 'stepNm',
					width : 200,
					flex : 1,
					style : 'text-align:center',
					align : 'center',
					hidden : false
				},

				/*
				 * stepWflowId
				 */
				{
					text : bxMsg('cbb_items.AT#stepWflowId'),
					dataIndex : 'stepWflowId',
					width : 200,
					style : 'text-align:center',
					align : 'center',
					hidden : true
				},

				/*
				 * stepWflowStepId
				 */
				{
					text : bxMsg('cbb_items.AT#stepWflowStepId'),
					dataIndex : 'stepWflowStepId',
					width : 200,
					style : 'text-align:center',
					align : 'center',
					hidden : true
				},

				/*
				 * stepDescCntnt
				 */
				{
					text : bxMsg('cbb_items.AT#stepDescCntn'),
					dataIndex : 'stepDescCntn',
					width : 200,
					style : 'text-align:center',
					align : 'center',
					hidden : true
				},
				/*
				 * scrnId
				 */
				{
					text : bxMsg('cbb_items.AT#scrnId'),
					dataIndex : 'scrnId',
					width : 200,
					style : 'text-align:center',
					align : 'center',
					hidden : true
				},
				/*
				 * scrnNm
				 */
				{
					text : bxMsg('cbb_items.AT#scrnNm'),
					dataIndex : 'scrnNm',
					width : 200,
					flex : 1,
					style : 'text-align:center',
					align : 'center',
					hidden : false
				},
				/*
				 * srvcCd
				 */
				{
					text : bxMsg('cbb_items.AT#srvcCd'),
					dataIndex : 'srvcCd',
					width : 200,
					style : 'text-align:center',
					align : 'center',
					hidden : true
				},
				/*
				 * srvcNm
				 */
				{
					text : bxMsg('cbb_items.AT#srvcNm'),
					dataIndex : 'srvcNm',
					width : 200,
					flex : 1,
					style : 'text-align:center',
					align : 'center',
					hidden : false
				},
				/*
				 * nxtStepId
				 */
				{
					text : bxMsg('cbb_items.AT#nxtStepId'),
					dataIndex : 'nxtStepId',
					width : 200,
					style : 'text-align:center',
					align : 'center',
					hidden : true
				},

				/*
				 * nxtStepNm
				 */
				{
					text : bxMsg('cbb_items.AT#nxtStepNm'),
					dataIndex : 'nxtStepNm',
					width : 200,
					flex : 1,
					style : 'text-align:center',
					align : 'center',
					hidden : false
				},

				/*
				 * ruleId
				 */
				{
					text : bxMsg('cbb_items.AT#ruleId'),
					dataIndex : 'ruleId',
					width : 200,
					style : 'text-align:center',
					align : 'center',
					hidden : true
				},

				/*
				 * ruleNm
				 */
				{
					text : bxMsg('cbb_items.SCRNITM#proceedingTargetRule'),
					dataIndex : 'ruleNm',
					width : 200,
					flex : 1,
					style : 'text-align:center',
					align : 'center',
					hidden : false
				},

				/*
				 * nxtStepRuleNm
				 */
				{
					text : bxMsg('cbb_items.AT#nxtStepRuleNm'),
					dataIndex : 'nxtStepRuleNm',
					width : 200,
					flex : 1,
					style : 'text-align:center',
					align : 'center',
					hidden : false
				},
				
				/*
				 * aprvlRgstrnStepNm
				 */
				{
					text : bxMsg('cbb_items.AT#aprvlRgstrnStepNm'),
					dataIndex : 'aprvlRgstrnStepNm',
					width : 200,
					style : 'text-align:center',
					align : 'center',
					hidden : false
				},

				/*
				 * startStepYn
				 */
				{
					text : bxMsg('cbb_items.AT#startStepYn'),
					width : 150,
					dataIndex : 'startStepYn',
					style : 'text-align:center',
					align : 'center',
					flex : 1,
					editor : {
						xtype : 'combobox',
						store : comboStore4,
						displayField : 'cdNm',
						valueField : 'cd'
					},
					renderer : function(val) {
						index = comboStore4.findExact('cd', val);
						if (index != -1) {
							rs = comboStore4.getAt(index).data;
							var classNm = "s-no";
							var val = rs.cd;

							if (val == "Y") {
								classNm = "s-yes";
							}
							return "<span class=\"bw-sign " + classNm + "\">" + val + "</span>";
						}
					} // end of render
				},
				
				/*
				 * lastChngGuid
				 */
				{
					text : bxMsg('cbb_items.AT#lastChngGuid'),
					dataIndex : 'lastChngGuid',
					width : 200,
					flex : 1,
					style : 'text-align:center',
					align : 'center',
					hidden : true
				},
				

				/*
				 * srvcId
				 */
				{
					text : bxMsg('cbb_items.AT#srvcId'),
					dataIndex : 'srvcId',
					width : 200,
					flex : 1,
					style : 'text-align:center',
					align : 'center',
					hidden : true
				},




				/*
				 * 관리번호
				 */
				{
					text : '',
					width : 0,
					dataIndex : 'prjArrNo',
					hidden : true
				},

				/*
				 * Delete
				 */
				{
					xtype : 'actioncolumn',
					width : 80,
					align : 'center',
					text : bxMsg('cbb_items.SCRNITM#del'),
					style : 'text-align:center',
					items : [ {
						// icon: 'images/icon/x-delete-16.png'
						iconCls : "bw-icon i-25 i-func-trash",
						tooltip : bxMsg('tm-layout.delete-field'),
						handler : function(grid, rowIndex, colIndex, item, e, record) {
							if (record.data.stepSeq === 2147483647 || record.data.stepSeq === 0) {
								fn_alertMessage("", bxMsg('cbb_items.SCRNITM#delete-err-msg'));
								return;
							}
							that.deleteList.push(record.data);
							grid.store.remove(record);
						}
					} ]
				}

				], // end of columns

				// 컴포넌트 그리드('libs/bx/bx-ui/component/ext-grid/_ext-grid.js' 참조) 에서 정의한 것 외에 추가할 경우 gridConfig에 추가
				gridConfig : {
					// 셀 에디팅 플러그인
					plugins : [ Ext.create('Ext.grid.plugin.CellEditing', {
						// 2번 클릭시, 에디팅할 수 있도록 처리
						clicksToEdit : 2,
						listeners : {
							'beforeedit' : function(editor, e) {

								return false;
							} // end of edit
						}
					// end of listners
					}) // end of Ext.create
					]
				// end of plugins
				}, // end of gridConfig
				listeners : {
					click : {
						element : 'body',
						fn : function() {
							that.selectGridRecord();
						}
					}
				}
			});
		},

		/*
		 * Select a grid record
		 */
		selectGridRecord : function() {
			var that = this;

			if (!this.CAPMT091Grid.grid.getSelectionModel().selected.items[0]) return;
			var selectedRecord = this.CAPMT091Grid.grid.getSelectionModel().selected.items[0].data;

			if (!selectedRecord) {
				return;
			}

			that.initFlag = false;
			this.$el.find('#step-baseAtrbt-area  [data-form-param="stepNm"]').val(selectedRecord.stepNm);
			this.$el.find('#step-baseAtrbt-area  [data-form-param="stepTpCd"]').val(selectedRecord.stepTpCd);
			this.$el.find('#step-baseAtrbt-area  [data-form-param="scrnNm"]').val(selectedRecord.scrnNm);
			this.$el.find('#step-baseAtrbt-area  [data-form-param="srvcNm"]').val(selectedRecord.srvcNm);
			this.$el.find('#step-baseAtrbt-area  [data-form-param="stepDescCntnt"]').val(selectedRecord.stepDescCntnt);
			this.$el.find('#step-baseAtrbt-area  [data-form-param="stepId"]').val(selectedRecord.stepId);
			this.$el.find('#step-baseAtrbt-area  [data-form-param="scrnId"]').val(selectedRecord.scrnId);
			this.$el.find('#step-baseAtrbt-area  [data-form-param="srvcId"]').val(selectedRecord.srvcId);
			this.$el.find('#step-baseAtrbt-area  [data-form-param="srvcCd"]').val(selectedRecord.srvcCd);
			this.$el.find('#step-baseAtrbt-area  [data-form-param="ruleId"]').val(selectedRecord.ruleId);
			this.$el.find('#step-baseAtrbt-area  [data-form-param="ruleNm"]').val(selectedRecord.ruleNm);
			this.$el.find('#step-baseAtrbt-area  [data-form-param="lastChngGuid"]').val(selectedRecord.lastChngGuid);
			this.$el.find('#step-baseAtrbt-area  [data-form-param="stepSeq"]').val(selectedRecord.stepSeq);
			this.$el.find('#step-baseAtrbt-area  [data-form-param="aprvlRgstrnStepNm"]').val(selectedRecord.aprvlRgstrnStepId);
			if (selectedRecord.stepSeq === 2147483647) {
				this.$el.find('#step-baseAtrbt-area  [data-form-param="manageStepDetail"]').hide();
				this.$el.find('#step-baseAtrbt-area  [data-form-param="managePrevStep"]').hide();
				this.$el.find('#step-baseAtrbt-area  [data-form-param="manageService"]').hide();
				this.$el.find('#step-baseAtrbt-area  [data-form-param="manageVariable"]').hide();
				this.$el.find('#step-baseAtrbt-area  [data-form-param="manageRole"]').hide();
				this.$el.find('#td-startStepYn').hide();

			}

			else if (selectedRecord.stepSeq === 0) {
				this.$el.find('#step-baseAtrbt-area  [data-form-param="manageStepDetail"]').show();
				this.$el.find('#step-baseAtrbt-area  [data-form-param="managePrevStep"]').hide();
				this.$el.find('#step-baseAtrbt-area  [data-form-param="manageService"]').hide();
				this.$el.find('#step-baseAtrbt-area  [data-form-param="manageVariable"]').hide();
				this.$el.find('#step-baseAtrbt-area  [data-form-param="manageRole"]').hide();
				this.$el.find('#td-startStepYn').hide();
			} else {
				this.$el.find('#step-baseAtrbt-area  [data-form-param="manageStepDetail"]').show();
				this.$el.find('#step-baseAtrbt-area  [data-form-param="managePrevStep"]').show();
				this.$el.find('#step-baseAtrbt-area  [data-form-param="manageService"]').show();
				this.$el.find('#step-baseAtrbt-area  [data-form-param="manageVariable"]').show();
				this.$el.find('#step-baseAtrbt-area  [data-form-param="manageRole"]').show();
				this.$el.find('#td-startStepYn').show();
			}
			if (selectedRecord.startStepYn == "Y") this.$el.find('#step-baseAtrbt-area [data-form-param="startStepYn"]').prop("checked", true);
			else this.$el.find('#step-baseAtrbt-area [data-form-param="startStepYn"]').prop("checked", false);

		},

		upNode : function() {

			var grid = this.CAPMT091Grid.grid;
			var direction = -1;

			var record = this.CAPMT091Grid.grid.getSelectionModel().selected.items[0];
			if (!record) {
				return;
			}
			var index = this.CAPMT091Grid.grid.store.indexOf(record);
			if (direction < 0) {
				index--;
				if (index < 0) {
					return;
				}
			} else {
				index++;
				if (index >= grid.store.getCount()) {
					return;
				}
			}
			grid.getStore().remove(record);
			grid.getStore().insert(index, record);
			grid.getSelectionModel().select(index, true);

		},

		downNode : function() {
			var grid = this.CAPMT091Grid.grid;
			var direction = 1;

			var record = this.CAPMT091Grid.grid.getSelectionModel().selected.items[0];
			if (!record) {
				return;
			}
			var index = this.CAPMT091Grid.grid.store.indexOf(record);
			if (direction < 0) {
				index--;
				if (index < 0) {
					return;
				}
			} else {
				index++;
				if (index >= grid.store.getCount()) {
					return;
				}
			}
			grid.getStore().remove(record);
			grid.getStore().insert(index, record);
			grid.getSelectionModel().select(index, true);
		},

		/*
		 * inquire workflow
		 */
		inquireSearchCondition : function() {
			var that = this;
			var sParam = {};

			sParam.instCd = commonInfo.getInstInfo().instCd;
			sParam.wflowId = that.initData.param.workflowId;

			if (sParam == null) {
				this.CAPMT091Grid.resetData();
				return;
			}

			var linkData = {
				"header" : fn_getHeader("PMT0918401"),
				"WorkflowStepMgmtSvcIO" : sParam

			};

			// ajax 호출
			bxProxy.post(sUrl, JSON.stringify(linkData), {
				// loading 설정
				enableLoading : true,
				success : function(responseData) {

					if (fn_commonChekResult(responseData)) {
						if (responseData.WorkflowStepMgmtSvcIOList) {
							var tbList = responseData.WorkflowStepMgmtSvcIOList.tblNm;
							var totCnt = tbList.length;

							if (tbList != null || tbList.length > 0) {
								that.CAPMT091Grid.setData(tbList);
								self.$el.find('#step-baseAtrbt-area   [data-form-param="aprvlRgstrnStepNm"]').text('');
								self.$el.find('#step-baseAtrbt-area   [data-form-param="aprvlRgstrnStepNm"]').append($(document.createElement('option')).val('').text(''));
								$(tbList).each(function (idx, item) {
                                	
                                    var optionText = item.stepNm;
                                    var optionValue = item.stepId;
                                    var option = $(document.createElement('option')).val(optionValue).text(optionText);
                                    self.$el.find('#step-baseAtrbt-area   [data-form-param="aprvlRgstrnStepNm"]').append(option);
                                });
							}
						}
					}
				}
			});

		},

		/*
		 * Rest search area
		 */
		resetSearchResult : function() {
			this.deleteList = [];
			this.resetStepBaseAttribute();
			this.CAPMT091Grid.resetData();
			this.inquireSearchCondition();
		},

		/*
		 * Reset basic attribute
		 */
		resetStepBaseAttribute : function() {
			this.initFlag = true;

			this.$el.find('#step-baseAtrbt-area  [data-form-param="stepNm"]').val('');
			this.$el.find('#step-baseAtrbt-area  [data-form-param="stepTpCd"]').val('');
			this.$el.find('#step-baseAtrbt-area  [data-form-param="stepId"]').val('');
			this.$el.find('#step-baseAtrbt-area  [data-form-param="scrnNm"]').val('');
			this.$el.find('#step-baseAtrbt-area  [data-form-param="srvcNm"]').val('');
			this.$el.find('#step-baseAtrbt-area  [data-form-param="stepDescCntnt"]').val('');
			this.$el.find('#step-baseAtrbt-area  [data-form-param="scrnId"]').val('');
			this.$el.find('#step-baseAtrbt-area  [data-form-param="srvcId"]').val('');
			this.$el.find('#step-baseAtrbt-area  [data-form-param="srvcCd"]').val('');
			this.$el.find('#step-baseAtrbt-area  [data-form-param="ruleId"]').val('');
			this.$el.find('#step-baseAtrbt-area  [data-form-param="ruleNm"]').val('');
			this.$el.find('#step-baseAtrbt-area  [data-form-param="lastChngGuid"]').val('');
			this.$el.find('#step-baseAtrbt-area  [data-form-param="aprvlRgstrnStepNm"]  option:eq(0)').val('');

			this.$el.find('#step-baseAtrbt-area  [data-form-param="manageStepDetail"]').hide();
			this.$el.find('#step-baseAtrbt-area  [data-form-param="managePrevStep"]').hide();
			this.$el.find('#step-baseAtrbt-area  [data-form-param="manageService"]').hide();
			this.$el.find('#step-baseAtrbt-area  [data-form-param="manageVariable"]').hide();
			this.$el.find('#step-baseAtrbt-area  [data-form-param="manageRole"]').hide();
			this.$el.find('#step-baseAtrbt-area [data-form-param="startStepYn"]').prop("checked", false);
			this.$el.find('#td-startStepYn').show();
		},

		/*
		 * Confirm delete item
		 */
		saveSearchResult : function() {
			var that = this;

			/*
			 * if delete list is empty
			 */
			if (that.deleteList.length == 0) {
				fn_alertMessage("", bxMsg('cbb_items.SCRNITM#noChange'));
				return;
			}

			function saveData() {
				var table = [];
				var sParam = {};

				$(that.deleteList).each(function(idx, data) {
					var sub = {};
					sub.instCd = commonInfo.getInstInfo().instCd;
					sub.wflowId = self.initData.param.workflowId;
					sub.stepId = data.stepId;
					sub.lastChngGuid = data.lastChngGuid;
					sub.srvcList = [];
					var tmpSrvc = {};
					tmpSrvc.instCd = commonInfo.getInstInfo().instCd;
					tmpSrvc.srvcId = data.srvcId
					tmpSrvc.lastChngGuid = data.lastChngGuid;
					sub.srvcList.push(tmpSrvc);

					table.push(sub);
				});

				sParam.tblNm = table;

				var linkData = {
					"header" : fn_getHeader("PMT0918300"),
					"WorkflowStepMgmtSvcIOList" : sParam
				};

				// ajax호출
				bxProxy.post(sUrl, JSON.stringify(linkData), {
					enableLoading : true,
					success : function(responseData) {
						if (fn_commonChekResult(responseData)) {
							fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));

							that.deleteList = [];
							that.inquireSearchCondition();
						}
					} // end of suucess: fucntion
				}); // end of bxProxy
			}

			fn_confirmMessage(event, bxMsg('cbb_items.SCRNITM#B_delete'), bxMsg('cbb_items.SCRNITM#data-delete-msg'), saveData, this);
		},

		/*
		 * save step
		 */
		saveStepBaseAttribute : function() {
			var that = this;
			var sParam = {};
			var srvcCd = "";
			if (this.initFlag) srvcCd = "PMT0918100";
			else srvcCd = "PMT0918200";

			sParam.instCd = commonInfo.getInstInfo().instCd;
			sParam.wflowId = that.initData.param.workflowId;
			sParam.stepId = this.$el.find('#step-baseAtrbt-area  [data-form-param="stepId"]').val();
			sParam.startStepYn = this.getYn(this.$el.find('#step-baseAtrbt-area [data-form-param="startStepYn"]'));
			sParam.stepTpCd = this.$el.find('#step-baseAtrbt-area  [data-form-param="stepTpCd"]').val();
			sParam.stepNm = this.$el.find('#step-baseAtrbt-area  [data-form-param="stepNm"]').val();
			sParam.ruleId = this.$el.find('#step-baseAtrbt-area  [data-form-param="ruleId"]').val();
			sParam.stepDescCntnt = this.$el.find('#step-baseAtrbt-area  [data-form-param="stepDescCntnt"]').val();
			sParam.lastChngGuid = this.$el.find('#step-baseAtrbt-area  [data-form-param="lastChngGuid"]').val();
			sParam.aprvlRgstrnStepId = this.$el.find('#step-baseAtrbt-area  [data-form-param="aprvlRgstrnStepNm"]').val();
			sParam.srvcList = [];
			var tmpSrvc = {};
			tmpSrvc.instCd = commonInfo.getInstInfo().instCd;
			tmpSrvc.srvcId = this.$el.find('#step-baseAtrbt-area  [data-form-param="srvcId"]').val();
			tmpSrvc.srvcNm = this.$el.find('#step-baseAtrbt-area  [data-form-param="srvcNm"]').val();
			tmpSrvc.srvcCd = this.$el.find('#step-baseAtrbt-area  [data-form-param="srvcCd"]').val();
			tmpSrvc.scrnNm = this.$el.find('#step-baseAtrbt-area  [data-form-param="scrnNm"]').val();
			tmpSrvc.scrnId = this.$el.find('#step-baseAtrbt-area  [data-form-param="scrnId"]').val();
			tmpSrvc.scrnDsplyCd = 'A';
			sParam.srvcList.push(tmpSrvc);

			var linkData = {
				"header" : fn_getHeader(srvcCd),
				"WorkflowStepMgmtSvcIO" : sParam
			};

			// ajax 호출
			bxProxy.post(sUrl, JSON.stringify(linkData), {
				enableLoading : true,
				success : function(responseData) {
					if (fn_commonChekResult(responseData)) {
						fn_alertMessage("", bxMsg('cbb_items.SCRNITM#success'));
						that.resetStepBaseAttribute();
						that.inquireSearchCondition();
					}
				} // end of suucess: fucntion
			}); // end of bxProxy
		},

		/*
		 * Toggle
		 */
		toggleBaseAttribute : function() {
			fn_pageLayerCtrl(this.$el.find('#baseAtrbt-area'), this.$el.find("#CAPMT091-btn-baseAtrbt-toggle"));
		},
		toggleSearchResult : function() {
			fn_pageLayerCtrl(this.$el.find('#search-result-area'), this.$el.find("#btn-search-result-toggle"));
		},

		toggleStepBaseAttribute : function() {
			fn_pageLayerCtrl(this.$el.find('#step-baseAtrbt-area'), this.$el.find("#CAPMT091-btn-step-baseAtrbt-toggle"));
		},

		/**
		 * 화면조회 팝업
		 */
		serachScrnId : function() {
			var that = this;
			var sParam = {};

			sParam.scrnId = that.$el.find('#step-baseAtrbt-area [data-form-param="scrnId"]').val();
			sParam.menuTargetYn = "N";

			var popupScrnSearch = new PopupScrnSearch(sParam);

			popupScrnSearch.render();
			popupScrnSearch.on('popUpSetData', function(data) {
				that.$el.find('[data-form-param="scrnId"]').val(data.scrnId);
				that.$el.find('[data-form-param="scrnNm"]').val(data.scrnNm);
			});
		},

		/**
		 * 서비스조회 팝업
		 */
		searchSrvcCd : function() {
			var that = this;
			var sParam = {};

			sParam.srvcCd = that.$el.find('#step-baseAtrbt-area [data-form-param="srvcCd"]').val();

			var popupSrvcSearch = new PopupSrvcSearch(sParam);

			popupSrvcSearch.render();
			popupSrvcSearch.on('popUpSetData', function(data) {
				that.$el.find('[data-form-param="srvcCd"]').val(data.srvcCd);
				that.$el.find('[data-form-param="srvcNm"]').val(data.srvcNm);
			});
		},

		manageStep : function() {

			this.$el.trigger({
				type : 'open-conts-page',
				pageHandler : 'CAPMT092',
				pageDPName : bxMsg('cbb_items.SCRN#CAPMT092'),
				pageInitialize : true,
				pageRenderInfo : {

					workflowId : self.initData.param.workflowId,
					stepNm : this.$el.find('#step-baseAtrbt-area  [data-form-param="stepNm"]').val(),
					stepTpCd : this.$el.find('#step-baseAtrbt-area  [data-form-param="stepTpCd"]').val(),
					scrnNm : this.$el.find('#step-baseAtrbt-area  [data-form-param="scrnNm"]').val(),
					srvcNm : this.$el.find('#step-baseAtrbt-area  [data-form-param="srvcNm"]').val(),
					stepDescCntnt : this.$el.find('#step-baseAtrbt-area  [data-form-param="stepDescCntnt"]').val(),
					stepId : this.$el.find('#step-baseAtrbt-area  [data-form-param="stepId"]').val(),
					scrnId : this.$el.find('#step-baseAtrbt-area  [data-form-param="scrnId"]').val(),
					stepSeq : this.$el.find('#step-baseAtrbt-area  [data-form-param="stepSeq"]').val(),
					srvcCd : this.$el.find('#step-baseAtrbt-area  [data-form-param="srvcCd"]').val()

				}
			});
		},

		managePrevStep : function() {

			this.$el.trigger({
				type : 'open-conts-page',
				pageHandler : 'CAPMT093',
				pageDPName : bxMsg('cbb_items.SCRN#CAPMT093'),
				pageInitialize : true,
				pageRenderInfo : {

					workflowId : self.initData.param.workflowId,
					stepNm : this.$el.find('#step-baseAtrbt-area  [data-form-param="stepNm"]').val(),
					stepTpCd : this.$el.find('#step-baseAtrbt-area  [data-form-param="stepTpCd"]').val(),
					scrnNm : this.$el.find('#step-baseAtrbt-area  [data-form-param="scrnNm"]').val(),
					srvcNm : this.$el.find('#step-baseAtrbt-area  [data-form-param="srvcNm"]').val(),
					stepDescCntnt : this.$el.find('#step-baseAtrbt-area  [data-form-param="stepDescCntnt"]').val(),
					stepId : this.$el.find('#step-baseAtrbt-area  [data-form-param="stepId"]').val(),
					scrnId : this.$el.find('#step-baseAtrbt-area  [data-form-param="scrnId"]').val(),
					srvcCd : this.$el.find('#step-baseAtrbt-area  [data-form-param="srvcCd"]').val()

				}
			});
		},

		manageService : function() {

			this.$el.trigger({
				type : 'open-conts-page',
				pageHandler : 'CAPMT096',
				pageDPName : bxMsg('cbb_items.SCRN#CAPMT096'),
				pageInitialize : true,
				pageRenderInfo : {

					workflowId : self.initData.param.workflowId,
					workflowNm : self.initData.param.workflowNm,
					workflowDescCntnt : self.initData.param.workflowDescCntnt,
					stepId : this.$el.find('#step-baseAtrbt-area  [data-form-param="stepId"]').val(),
					stepNm : this.$el.find('#step-baseAtrbt-area  [data-form-param="stepNm"]').val(),
					stepDescCntnt : this.$el.find('#step-baseAtrbt-area  [data-form-param="stepDescCntnt"]').val(),
				}
			});
		},

		manageVariable : function() {

			this.$el.trigger({
				type : 'open-conts-page',
				pageHandler : 'CAPMT097',
				pageDPName : bxMsg('cbb_items.SCRN#CAPMT097'),
				pageInitialize : true,
				pageRenderInfo : {
					workflowId : self.initData.param.workflowId,
					workflowNm : self.initData.param.workflowNm,
					stepNm : this.$el.find('#step-baseAtrbt-area  [data-form-param="stepNm"]').val(),
					stepId : this.$el.find('#step-baseAtrbt-area  [data-form-param="stepId"]').val(),

				}
			});
		},

		manageRole : function() {

			this.$el.trigger({
				type : 'open-conts-page',
				pageHandler : 'CAPMT098',
				pageDPName : bxMsg('cbb_items.SCRN#CAPMT098'),
				pageInitialize : true,
				pageRenderInfo : {
					workflowId : self.initData.param.workflowId,
					workflowNm : self.initData.param.workflowNm,
					stepNm : this.$el.find('#step-baseAtrbt-area  [data-form-param="stepNm"]').val(),
					stepId : this.$el.find('#step-baseAtrbt-area  [data-form-param="stepId"]').val(),

				}
			});
		},

		/**
		 * 규칙조회 팝업
		 */
		searchRule : function() {
			var that = this;
			var sParam = {};

			var popupRuleSearch = new PopupRuleSearch(sParam);

			popupRuleSearch.render();
			popupRuleSearch.on('popUpSetData', function(data) {
				that.$el.find('[data-form-param="ruleId"]').val(data.ruleId);
				that.$el.find('[data-form-param="ruleNm"]').val(data.ruleNm);
			});
		},

		getYn : function(obj) {
			if ($(obj).attr('checked')) return "Y";
			else return "N";
		},

		fillBlank : function(obj) {
			if (obj != "") return obj;
			else return '@';
		},

		unFillBlank : function(obj) {
			if (obj == "@") return "";
			else return obj;
		},


		drawToolbar : function() {
			var mxContainer = this.$el.find('#graphContainer')[0];
			
			// Defines an icon for creating new connections in the connection handler.
			// This will automatically disable the highlighting of the source vertex.
			mxConnectionHandler.prototype.connectImage = new mxImage('scripts/views/page/CAPMT/091/images/connector.gif', 16, 16);

			// Checks if browser is supported
			if (!mxClient.isBrowserSupported()) {
				// Displays an error message if the browser is
				// not supported.
				mxUtils.error('Browser is not supported!', 200, false);
			} else {
				// Creates the div for the toolbar
				var tbContainer = document.createElement('div');
				tbContainer.style.position = 'absolute';
				tbContainer.style.overflow = 'auto';
				tbContainer.style.padding = '2px';
				tbContainer.style.left = '0px';
				tbContainer.style.top = '0px';
				tbContainer.style.width = '24px';
				tbContainer.style.bottom = '0px';

				mxContainer.appendChild(tbContainer);

				// Creates new toolbar without event processing
				var toolbar = new mxToolbar(tbContainer);
				toolbar.enabled = false

				// Creates the div for the graph
				container = document.createElement('div');
				container.style.position = 'absolute';
				container.style.overflow = 'auto';
				container.style.left = '24px';
				container.style.top = '0px';
				container.style.right = '0px';
				container.style.bottom = '0px';
				container.style.background = 'url("scripts/views/page/CAPMT/091/editors/images/grid.gif")';

				mxContainer.appendChild(container);

				// Workaround for Internet Explorer ignoring certain styles
				if (mxClient.IS_QUIRKS) {
					document.body.style.overflow = 'hidden';
					new mxDivResizer(tbContainer);
					new mxDivResizer(container);
				}

				// Creates the model and the graph inside the container
				// using the fastest rendering available on the browser
				var model = new mxGraphModel();
				var graph = new mxGraph(container, model);
				graph.dropEnabled = true;

				// Matches DnD inside the graph
				mxDragSource.prototype.getDropTarget = function(graph, x, y) {
					var cell = graph.getCellAt(x, y);

					if (!graph.isValidDropTarget(cell)) {
						cell = null;
					}
					
					return cell;
				};

				// Enables new connections in the graph
				graph.setConnectable(true);
				graph.setMultigraph(false);

				// Stops editing on enter or escape keypress
				var keyHandler = new mxKeyHandler(graph);
				var rubberband = new mxRubberband(graph);

				var addVertex = function(graph, icon, w, h, style) {
					var vertex = new mxCell(null, new mxGeometry(0, 0, w, h), style);
					vertex.setVertex(true);
					self.addToolbarItem(graph, toolbar, vertex, icon);
				};

				addVertex(graph, 'scripts/views/page/CAPMT/091/editors/images/swimlane.gif', 120, 160, 'shape=swimlane;startSize=20;');
				addVertex(graph, 'scripts/views/page/CAPMT/091/editors/images/rectangle.gif', 100, 40, '');
				addVertex(graph, 'scripts/views/page/CAPMT/091/editors/images/rounded.gif', 100, 40, 'shape=rounded');
				addVertex(graph, 'scripts/views/page/CAPMT/091/editors/images/ellipse.gif', 40, 40, 'shape=ellipse');
				addVertex(graph, 'scripts/views/page/CAPMT/091/editors/images/rhombus.gif', 40, 40, 'shape=rhombus');
				addVertex(graph, 'scripts/views/page/CAPMT/091/editors/images/triangle.gif', 40, 40, 'shape=triangle');
				addVertex(graph, 'scripts/views/page/CAPMT/091/editors/images/cylinder.gif', 40, 40, 'shape=cylinder');
				addVertex(graph, 'scripts/views/page/CAPMT/091/editors/images/actor.gif', 30, 40, 'shape=actor');
				toolbar.addLine();
				
				
				self.overlayEvent(graph);
				//self.removeEvent(graph);
				
				
				
				
				
				
				
				

			}
		},

		addToolbarItem : function(graph, toolbar, prototype, image) {
			// Function that is executed when the image is dropped on
			// the graph. The cell argument points to the cell under
			// the mousepointer if there is one.
			var funct = function(graph, evt, cell) {
				graph.stopEditing(false);

				
				var pt = graph.getPointForEvent(evt);
				var vertex = graph.getModel().cloneCell(prototype);
				vertex.geometry.x = pt.x;
				vertex.geometry.y = pt.y;

				graph.setSelectionCells(graph.importCells([ vertex ], 0, 0, cell));
			}

			// Creates the image which is used as the drag icon (preview)
			var img = toolbar.addMode(null, image, funct);
			mxUtils.makeDraggable(img, graph, funct);
		},

		
		overlayEvent : function(graph){
			var mxCellRendererInstallCellOverlayListeners = mxCellRenderer.prototype.installCellOverlayListeners;
			mxCellRenderer.prototype.installCellOverlayListeners = function(state, overlay, shape)
			{
				mxCellRendererInstallCellOverlayListeners.apply(this, arguments);

				mxEvent.addListener(shape.node, (mxClient.IS_POINTER) ? 'pointerdown' : 'mousedown', function (evt)
				{
					overlay.fireEvent(new mxEventObject('pointerdown', 'event', evt, 'state', state));
				});
				
				if (!mxClient.IS_POINTER && mxClient.IS_TOUCH)
				{
					mxEvent.addListener(shape.node, 'touchstart', function (evt)
					{
						overlay.fireEvent(new mxEventObject('pointerdown', 'event', evt, 'state', state));
					});
				}
			};
			
			// Helper function to compute the bounds of the control
			var getDeleteControlBounds = function(state)
			{
				if (state.deleteControl != null)
				{
					var oldScale = state.deleteControl.scale;
					var w = state.deleteControl.bounds.width / oldScale;
					var h = state.deleteControl.bounds.height / oldScale;
					var s = state.view.scale;			

					return (state.view.graph.getModel().isEdge(state.cell)) ? 
						new mxRectangle(state.x + state.width / 2 - w / 2 * s,
							state.y + state.height / 2 - h / 2 * s, w * s, h * s)
						: new mxRectangle(state.x + state.width - w * s,
							state.y, w * s, h * s);
				}
				
				return null;
			};
			
			// Overridden to remove the control if the state is destroyed
			mxCellRendererDestroy = mxCellRenderer.prototype.destroy;
			mxCellRenderer.prototype.destroy = function(state)
			{
				mxCellRendererDestroy.apply(this, arguments);

				if (state.deleteControl != null)
				{
					state.deleteControl.destroy();
					state.deleteControl = null;
				}
			};
			
			
			// Creates the graph inside the given container
//			var graph = new mxGraph(container);
//			graph.setPanning(true);
//			graph.panningHandler.useLeftButtonForPanning = true;
//			graph.setAllowDanglingEdges(false);
//			graph.connectionHandler.select = false;
//			graph.view.setTranslate(20, 20);

			// Enables rubberband selection
			new mxRubberband(graph);
			
			// Gets the default parent for inserting new cells. This
			// is normally the first child of the root (ie. layer 0).
			var parent = graph.getDefaultParent();
			
			var addOverlay = function(cell)
			{
				// Creates a new overlay with an image and a tooltip
				var overlay = new mxCellOverlay(new mxImage('scripts/views/page/CAPMT/091/images/add.png', 16, 16), 'Add outgoing');
				overlay.cursor = 'hand';

				// Installs a handler for clicks on the overlay							
				overlay.addListener(mxEvent.CLICK, function(sender, evt2)
				{
					graph.clearSelection();
					var geo = graph.getCellGeometry(cell);
					
					var v2;
					
					executeLayout(function()
					{
						v2 = graph.insertVertex(parent, null, 'Step'+(stepNum++), geo.x, geo.y, 80, 30);
						
						addOverlay(v2);
						deleteOverlay(v2);
						graph.view.refresh(v2);
						var e1 = graph.insertEdge(parent, null, '', cell, v2);
					}, function()
					{
						graph.scrollCellToVisible(v2);
					});
				});
				
				// Special CMS event
				overlay.addListener('pointerdown', function(sender, eo)
				{
					var evt2 = eo.getProperty('event');
					var state = eo.getProperty('state');
					
					graph.popupMenuHandler.hideMenu();
					graph.stopEditing(false);
					
					var pt = mxUtils.convertPoint(graph.container,
							mxEvent.getClientX(evt2), mxEvent.getClientY(evt2));
					graph.connectionHandler.start(state, pt.x, pt.y);
					graph.isMouseDown = true;
					graph.isMouseTrigger = mxEvent.isMouseEvent(evt2);
					mxEvent.consume(evt2);
				});
				
				// Sets the overlay for the cell in the graph
				graph.addCellOverlay(cell, overlay);
			}
			
			var deleteOverlay = function(cell)
			{
				// Creates a new overlay with an image and a tooltip
				var overlay = new mxCellOverlay(new mxImage('scripts/views/page/CAPMT/091/images/delete2.png', 16, 16), 'Delete',null, null,new mxPoint(-16, 0) );
				overlay.cursor = 'hand';
				
				// Installs a handler for clicks on the overlay							
				overlay.addListener(mxEvent.CLICK, function(sender, evt2){
					graph.removeCells([cell]);
					mxEvent.consume(evt2);
				});
				
				
				// Sets the overlay for the cell in the graph
				graph.addCellOverlay(cell, overlay);
			}
						
			
			
			// Adds cells to the model in a single step
			graph.getModel().beginUpdate();
			var v1;
			try
			{
				v1 = graph.insertVertex(parent, null, 'Start', 0, 0, 80, 30);
				graph.insertVertex(parent, null, 'End', 1000, 0, 80, 30);
				addOverlay(v1);
			}
			finally
			{
				// Updates the display
				graph.getModel().endUpdate();
			}

			var layout = new mxHierarchicalLayout(graph, mxConstants.DIRECTION_WEST);
			
			var executeLayout = function(change, post)
			{
				graph.getModel().beginUpdate();
				try
				{
					if (change != null)
					{
						change();
					}
					
	    			layout.execute(graph.getDefaultParent(), v1);
				}
				catch (e)
				{
					throw e;
				}
				finally
				{
					// New API for animating graph layout results asynchronously
					var morph = new mxMorphing(graph);
					morph.addListener(mxEvent.DONE, mxUtils.bind(this, function()
					{
						graph.getModel().endUpdate();
						
						if (post != null)
						{
							post();
						}
					}));
					
					morph.startAnimation();
				}
			};
			
			var edgeHandleConnect = mxEdgeHandler.prototype.connect;
			mxEdgeHandler.prototype.connect = function(edge, terminal, isSource, isClone, me)
			{
				edgeHandleConnect.apply(this, arguments);
				executeLayout();
			};
			
			graph.resizeCell = function()
			{
				mxGraph.prototype.resizeCell.apply(this, arguments);

				executeLayout();
			};

			graph.connectionHandler.addListener(mxEvent.CONNECT, function()
			{
				executeLayout();
			});
		}
		
		

	}); // end of Backbone.View.extend({

	return CAPMT091View;
} // end of define function
); // end of define
