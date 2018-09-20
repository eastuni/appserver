/**
 * Created by parkbeomsoo on 2016. 5. 31..
 */
const angular = require('angular');

const md = require('./common.module');

md.factory('$commonExtTreeGrid', __factory);

function __factory($rootScope, $commonService){
	 var ExtTreeGrid = function() {};
	
	 /**
	  * 그리드 초기화
	  */
	ExtTreeGrid.prototype.initialize = function(config) {
		var that = this;
		that.grid = null;
		
		angular.extend(that, config);

        //grid listener setting
        that.listeners || (that.listeners = {});
        that.sorters || (that.sorters = {});
        that.listeners.scope = that.grid;
        
        Ext.onReady(function(){
        	config.fields.push({name: 'leaf', convert: function (value, record) {
                return (!record.data.children) || (record.data.children.length === 0);
            }});

        	that.store = Ext.create('Ext.data.TreeStore', {fields: config.fields});
        });
	};
	
	/**
	 * 그리드 생성
	 */
	ExtTreeGrid.prototype.render = function (renderOption) {
        var that = this;
        
        function renderGrid () {
    		that.i18n = $commonService.makeBxI18n();
    		var gridConts = {
    				store: that.store,
    				header: false,
    				style: {
    					width: that.width
    				},
                    useArrows: true,
                    rootVisible: false,
                    multiSelect: true,
                    sortableColumns: false,
                    emptyText: '<section class="empty-message-wrap"><p class="empty-message">'+that.i18n.getValue('{%=cbb_items.SCRNITM#no-data-msg%}')+'</p></section>',
                    viewConfig: that.viewConfig,
                    setSizePack: function() {
                        this.setSize(that.width, that.height);
                    },
                    columns: that.columns,
                    height: that.height,
                    renderTo: that.id,
                    plugins: that.plugins,
                    listeners: that.listeners
                };

            (that.checkbox) && (gridConts.selType = 'checkboxmodel');

            that.grid = Ext.create('Ext.tree.Panel', gridConts);
            
            that.grid.getView().refresh();
        };
        
        //grid size setting
        renderOption || (renderOption = {});
        renderOption.width ? (that.width = renderOption.width) : (that.width = '100%');
        renderOption.height ? (that.height = renderOption.height) : (that.height = '100%');
        
        /*
         * header.directive 호출
         * service 에선 동적으로 element 생성 할수 없어서 header 를 호출
         */ 
        $rootScope.$broadcast('cbp_createBwGridArea', "#"+that.target);
        
        var element = angular.element("#"+that.target).find(".bw-grid");
        
        element.width(that.width);
        element.height(that.height);
        element.attr("id", that.id);
        
        //grid render
        Ext.onReady(function(){
        	(that.grid === null) && renderGrid();
        });
    };
	
    /**
     * 그리드 데이터 설정
     */
    ExtTreeGrid.prototype.setStoreRootNode = function (fieldData) {
        this.store.setRootNode({
            expanded: true,
            text: "My Root",
            children: fieldData
        });
    };
    
    /**
     * 그리드 전체 데이터 조회
     */
    ExtTreeGrid.prototype.getAllData = function() {
    	var dataList = [],
    	dataObj, rawData, dataKey;
    	
    	function makeTreeData (dataArray, childNodes) {
    		childNodes.forEach(function (childRecord) {
    			dataObj = {};
    			rawData = childRecord.raw;

    			for(dataKey in rawData){
    				if (rawData.hasOwnProperty(dataKey)) {
    					dataObj[dataKey] = childRecord['data'][dataKey];
    				}
    			}

    			dataArray.push(dataObj);
    			dataObj.children = [];
    			
    			makeTreeData(dataObj.children, childRecord.childNodes);
    		});
    	};
    	
    	makeTreeData(dataList, this.store.getRootNode().childNodes);
    	
    	return dataList;
    };
    
    /**
     * 그리드 필드 추가
     */
    ExtTreeGrid.prototype.addField = function (initval) {
        if(this.getAllData().length > 0) {
            this.store.getRootNode().appendChild(initval);
        } else {
            this.setStoreRootNode([initval]);
        }
    };
    
    /**
     * 그리드 필드 위로 이동
     */
    ExtTreeGrid.prototype.upField = function () {
    	var node = this.grid.getSelectionModel().lastSelected,
    	parent = node.parentNode,
    	currentIdx = parent.indexOf(node);

    	if (currentIdx === 0) return;
    	
    	parent.insertChild(currentIdx - 1, node);
    };
    
    /**
     * 그리드 필드 아래로 이동
     */
    ExtTreeGrid.prototype.downField = function () {
    	var node = this.grid.getSelectionModel().lastSelected,
    	parent = node.parentNode,
    	targetIdx = parent.indexOf(node) + 2;
    	
    	if ((targetIdx - 1) === parent.childNodes.length) return;
    	
    	parent.insertChild(targetIdx, node);
    };
    
    /**
     * 그리드 노드 삭제
     */
    ExtTreeGrid.prototype.reloadData = function() {
    	this.store.getRootNode().removeAll();
    };
    
    /**
     * 그리드 전체 펼치기
     */
    ExtTreeGrid.prototype.expandAll = function () {
        this.grid && this.grid.expandAll();
    };
    
    /**
     * 그리드 데이터를 csv 파일로 다운로드 한다.
     * @param {String} fileName : 파일명
     */
    ExtTreeGrid.prototype.exportCsvFile = function(fileName) {
    	var that = this
    	, noCsvSupport = ( 'download' in document.createElement('a') ) ? false : true
		, stTr = noCsvSupport ? "<tr>"   : ""
		, edTr = noCsvSupport ? "</tr>"  : "\r\n"
		, stTd = noCsvSupport ? "<td>"   : ""
        , edTd = noCsvSupport ? "</td>"  : ","
    	, contents = ""
		, header = ""
		, body  = "";

    	var dataList = [],
    	dataObj, rawData, dataKey;
    	var depth = "";
    	var rootFlag = true;
    	makeTreeBodyData(dataList, this.store.getRootNode().childNodes, depth, rootFlag);
        
    	function makeTreeBodyData (dataArray, childNodes, depth, rootFlag) {
    		if(!rootFlag) {
    			depth = depth + "  ";
			}
        	
    		childNodes.forEach(function (childRecord) {
    			rootFlag = false;
        		
    			dataObj = {};
    			rawData = childRecord.raw;

    			for(dataKey in rawData){
        			if (rawData.hasOwnProperty(dataKey)) {
        				dataObj[dataKey] = childRecord['data'][dataKey];
        			}
        		}
        		dataObj.depth = depth;
        		dataArray.push(dataObj);
        		
        		makeTreeBodyData(dataArray, childRecord.childNodes, depth, rootFlag);
    		});
    	};
    
    	// 헤더부 생성
    	header += stTr;
    	var gridColumns = that.grid.columnManager.columns;
        
    	for(var i=0; i < gridColumns.length; i++){
    		if(gridColumns[i].xtype != "actioncolumn") {
    			header += stTd +  gridColumns[i].text + edTd;
    		}
    	}
        
    	header += edTr;
        
    	contents += header;
        
    	// body 부 생성
    	$(dataList).each(function(idx, data) {
    		contents += stTr;
    		$(gridColumns).each(function(idx2, data2) {
    			var dataIndex = data2.dataIndex;
        		
    			if(data2.xtype != "actioncolumn") {
    				var value = data[dataIndex];
        			
    				if(data2.text.indexOf("No") == 0 ){
    					value = (idx+1)+"";
    				}
    				else {
    					if(data2.xtype == "treecolumn") {
    						value = data.depth+value;
    					}
    					else if(typeof data2.editor != 'undefined' && data2.editor) {
    						if(data2.editor.xtype == "combobox") {
    							$(data2.editor.store.data.items).each(function(comboIdx, comboData) {

    								if(comboData.data.cd == data[dataIndex]) {
    									value = comboData.data.cdNm;
    									return false;
    								}
    							});
    						}
    						else {
             				   value = data[dataIndex];
             			   }
    					}
    					else if(!fn_isNull(data2.code)) {
    						if(data[dataIndex]) {
    							value = bxMsg('cbb_items.CDVAL#' + data2.code + data[dataIndex]);
    						}
    						else {
    							value = "";
    						}
    					}
    					else if(!fn_isNull(data2.type) && data2.type == 'date') {
    						value = XDate(data[dataIndex]).toString('yyyy-MM-dd');
    					}
    				}
        			
    				if(value == null || value == "null") {
    					value = '';
    				}
        			
    				body = ((noCsvSupport) && (value == '' || value == null || value == "null")) ? ''  : value;
    				body = String(body).replace(/,/g , "");
            		
    				if(data2.xtype != "treecolumn") {
    					body = String(body).replace(/(\r\n|\n|\r)/gm,"");
    				}
            		
    				contents += stTd +  body + edTd;
    			}
    		});
    		contents += edTr;
    	});

    	if('download' in document.createElement('a')){
    		var result = bxEncoding.convert(contents);
    		var textFileAsBlob = new Blob([result], {type: 'text/plain'});
    		var fileNameToSaveAs = Ext.isEmpty(fileName) ? "exportCsvFile" : fileName +".csv";

    		var downloadLink = document.createElement("a");
    		downloadLink.download = fileNameToSaveAs;
    		downloadLink.innerHTML = "Download File";

    		if (window.webkitURL != null) {
    			// Chrome allows the link to be clicked
    			// without actually adding it to the DOM.
    			downloadLink.href = result;
    		} else {
    			// Firefox requires the link to be added to the DOM
    			// before it can be clicked.
    			downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
    			downloadLink.onclick = destroyClickedElement;
    			downloadLink.style.display = "none";
    			document.body.appendChild(downloadLink);
    		}

    		downloadLink.click();
    	} else {
    		var newWin = open('windowName',"_blank");
    		newWin.document.write('<table border=1>' + contents + '</table>');
    	}
    }; // end exportCsvFile
    
    
    /**
     *********************************************************************************************
     ****************************************** extGrid 함수 *****************************************
     *********************************************************************************************
     */
    /**
     * 그리드 데이터 설정
     */
    ExtTreeGrid.prototype.setData = function(data) {
        this.resetData();
        this.store.loadData(data);
    };
    
    /**
     * 그리드 데이터 추가
     */
    ExtTreeGrid.prototype.addData = function(data) {
    	this.store.add(data);
    };
    
    /**
     * 그리드 데이터 초기화
     */
    ExtTreeGrid.prototype.resetData = function() {
        this.store.removeAll();
    };
    
    /**
     * 그리드의 선택된 데이터 조회
     */
    ExtTreeGrid.prototype.getSelectedItem = function() {
        var dataList = [];

        this.getSelectedItemRow().forEach(function(raw, i) {
            dataList.push(raw.data);
        });

        return dataList;
    };
    
    /**
     * 그리드의 선택된 데이터의 idex 를 반환 한다.
     */
    ExtTreeGrid.prototype.getSelectedIndex = function () {
    	var selectedRecord = this.grid.getSelectionModel().getSelection()[0];
    	var row = this.grid.store.indexOf(selectedRecord);

    	return row;
    };

    /**
     * 그리드의 선택된 데이터를 반환 한다.
     */
    ExtTreeGrid.prototype.getSelectedItemRow = function( ) {
    	return this.grid.getSelectionModel().getSelection();
    };

    /**
     * 그리드의 선택된 row 를 위로 이동 한다.
     */
    ExtTreeGrid.prototype.upSelectedRow = function() {
    	this.moveSelectedRow(-1);
    };

    /**
     * 그리드의 선택된 row 를 아래로 이동 한다.
     */
    ExtTreeGrid.prototype.downSelectedRow = function() {
    	this.moveSelectedRow(1);
    };

    /**
     * 그리드의 선택된 row 를 위, 아래로 이동 한다.
     */
    ExtTreeGrid.prototype.moveSelectedRow = function(distance) {
    	var selectedRows = this.getSelectedItemRow(),
    	lastIndex = this.store.count() - 1,
    	newIndex = this.store.indexOf(selectedRows[0]) + distance;

    	newIndex = (newIndex < 0)? 0 : newIndex;
    	newIndex = (newIndex > lastIndex)? lastIndex : newIndex;

    	if(selectedRows.length === 0) { return;}

    	this.store.remove(selectedRows[0]);
    	this.store.insert(newIndex, selectedRows);
    	this.grid.getSelectionModel().select(newIndex);
    };

    /**
     * 그리드의 선택된 row 를 반환 한다.
     */
    ExtTreeGrid.prototype.getSelectedRow = function(idx) {
    	this.grid.getSelectionModel().select(idx);
    };

    /**
     * 그리드의 선택된 rows 를 반환 한다.
     */
    ExtTreeGrid.prototype.getSelectedRecords = function() {
        return this.grid.getSelectionModel().getSelection();
    };

    /**
     * 그리드의 사이즈를 재정의 한다.
     */
    ExtTreeGrid.prototype.resizeGrid = function () {
    	this.grid && this.grid.setSizePack();
    };
    
    /**
     * 그리드의 레코드를 변경 한다.
     */
    ExtTreeGrid.prototype.getChangedRecords = function(fieldName) {
    	var changedRecords = [];
    	
    	this.store.each(function(record) {
    		if(record.isModified(fieldName)) {
    			changedRecords.push(record);
    		}
    	});
    	
    	return changedRecords;
    };
    
    /**
     * 체크된 레코드를 반환 한다.
     */
    ExtTreeGrid.prototype.getCheckRecords = function() {
    	var checkRecords = [];
    	
    	$(this.grid.getSelectionModel().selected.items).each(function(idx, data) {
    		checkRecords.push(data.data);
    	});
    	
    	return checkRecords;
    };
    
    /**
     * 그리드의 필드명과 값이 동일한 레코드를 반환한다.
     * fieldName : 필드명
     * value : 값
     */
    ExtTreeGrid.prototype.getFilteredRecords = function(fieldName, value) {
    	var filteredRecords = [];
    	
    	this.store.each(function(record) {
    		if(record.get(fieldName) === value ) {
    			filteredRecords.push(record.data);
    		}
    	});
    	
    	return filteredRecords;
    };
    
    /**
     * 그리드의 row 를 합친다.
     */
    ExtTreeGrid.prototype.rowspan = function(colIdx) {
    	
    	return this.each(function(){
    			
    		var that;
    		$('tr', this).each(function(row) {
    			$('td:eq('+colIdx+':visible)', this).each(function(col) {
    				if ($(this).html() == $(that).html()) {
    					rowspan = $(that).attr("rowSpan");
    					if (rowspan == undefined) {
    						
    						$(that).attr("rowSpan",1);
    						rowspan = $(that).attr("rowSpan");
    					}
    					rowspan = Number(rowspan)+1;
    					$(that).attr("rowSpan",rowspan); // do your action for the colspan cell here
    					$(this).hide(); // .remove(); // do your action for the old cell here
    				} 
    				else {
    					that = this;
    				}
    					
    				that = (that == null) ? this : that; // set the that if not already set
    			});
    		});
    		
    	});
   };
   
   /**
    * 해당 로우를 삭제 한다. 
    */
   ExtTreeGrid.prototype.removeRow = function(record) {
	   this.store.remove(record);
   };
   
   /**
    * 변경된 row 만 반환한다.
    */
   ExtTreeGrid.prototype.getChangedRows = function() {
	   var data = [];
	   var modifiedRecords = [];
	   
	   modifiedRecords = this.store.getModifiedRecords();
	   
	   $(modifiedRecords).each(function(idx, rowData) {
		   
		   if(modifiedRecords[idx].dirty) {
			   
			   var colData = new Object();
			   $(rowData.self.getFields()).each(function(idx2, columnData) {
				   var filedNm = rowData.self.getFields()[idx2].name;
   				
				   colData[filedNm] = rowData.data[filedNm];
			   });
			   
			   data.push(colData);
		   }
	   });
	   
	   return data;
   };

   /**
    * 해당컬럼을 숨기거나 보여준다.
    * chkHide true or false
    */
   ExtTreeGrid.prototype.setColumnVisible = function(idx, chkHide) {
	   this.grid.columns[idx].setVisible(chkHide);
	   this.grid.getView().refresh();
   };
   
   /**
    * 그리드 데이터를 csv 파일로 업로드 한다.
    */
   ExtTreeGrid.prototype.importCsvFile = function(file) {
	   // ******** 파일이 utf-8 이어야 한글이 안깨진다. *********
	   var that = this;
	   
	   if ($commonService.fn_isNull(file)) {
           alert('You must choose a file before importing');
           return;
       }

       var reader = new FileReader();
       reader.readAsText(file, "utf-8");
       
       var header = [];
    	   
       reader.onload = function () {
           var rawText = reader.result;
           var text = rawText.replace(/\r\n/g, '\n');
           var line = text.split('\n');
           
           // 그리드 클리어
           that.store.removeAll();
           
           // header 부 추출
           for(var i = 0; i < line.length; i++) {
        	   if(line[i] == null || $commonService.fn_isNull(line[i])) {
        		   continue;
        	   }
        	   
        	   var col = line[i].split(',');
        	   var gridData = {};
        	   
    		   for(var j = 0; j < col.length; j++) {
    			   if(i == 0) {
    				   // 해더부 추출
    				   header[j] = col[j];
    			   }
    			   else {
    				   gridData[header[j]] = col[j];
    			   }
    		   }
    		   
    		   if(i != 0 && !$commonService.fn_isNull(gridData)) {
    			   that.store.add(gridData);
    		   }
           }
       }
   }; // end importCsvFile
    
	return {
		getInstance : function() {
			
			return new ExtTreeGrid();
		}
	};
} // end function