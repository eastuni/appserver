/**
 * Created by parkbeomsoo on 2016. 5. 31..
 */
const angular = require('angular');

const md = require('./common.module');

md.factory('$commonExtGrid', __factory);

function __factory($rootScope, $commonService){
	 var ExtGrid = function() {};
	
	 /**
	  * 그리드 초기화
	  */
	ExtGrid.prototype.initialize = function(config) {
		var that = this;
		that.grid = null;
		
		angular.extend(that, config);

        //grid listener setting
        that.listeners || (that.listeners = {});
        that.sorters || (that.sorters = {});
        that.listeners.scope = that.grid;
        
        Ext.onReady(function(){
        	that.store = Ext.create('Ext.data.Store', {fields: config.fields, listeners: config.storeListeners, proxy : config.proxy, sorters : that.sorters});
        });
	};
	
	/**
	 * 그리드 생성
	 */
	ExtGrid.prototype.render = function (renderOption) {
        var that = this;
        
        function renderGrid() {
        	that.i18n = $commonService.makeBxI18n();
        	var gridConts = {
        			store: that.store,
        			header: false,
        			style: {
        				width: that.width
        			},
                    emptyText: '<section class="empty-message-wrap"><p class="empty-message">'+that.i18n.getValue('{%=cbb_items.SCRNITM#no-data-msg%}')+'</p></section>',
                    viewConfig: {
                    	preserveScrollOnRefresh: true,
                        deferEmptyText: false
                    },
                    setSizePack: function() {
//                        this.setSize(that.width, that.height);
                    	that.grid.setSize({width: that.width, height: that.height});
                    },
                    columns: that.columns,
                    height: that.height,
//                    width : that.width,
//                    preventRender: true,
//                    flex: 1,
//                    forceFit: true,  
                    autoWidth:true,
//                    renderTo: that.el,
                    renderTo: that.id,
                    plugins: that.plugins,
                    selModel: that.selModel,
                    listeners: that.listeners
        	};
        	
            $.extend(true, gridConts, that.gridConfig);
            (that.checkbox) && (gridConts.selType = 'checkboxmodel');
            (that.cell) && (gridConts.selType = 'cellmodel');

            that.grid = Ext.create('Ext.grid.Panel', gridConts);
            
            that.grid.getView().refresh();
        };
        
        //grid size setting
        renderOption || (renderOption = {});
        renderOption.width ? (that.width = renderOption.width) : (that.width = '100%');
        renderOption.height ? (that.height = renderOption.height) : (that.height = '100%');
        
        $rootScope.$broadcast('cbp_createBwGridArea', "#"+that.target);
        
        var element = angular.element("#"+that.target).find(".bw-grid");
        
        element.width(that.width);
        element.height(that.height);
        element.attr("id", that.id);
        
        //grid render
        Ext.onReady(function(){
        	(that.grid === null) && renderGrid();
        });
        
        	
//    	$(window).on("resize", function(e) {
//        	if(that.grid !== null) {
//        		console.log("resize");
//        		if (document.getElementById(that.grid.id)) {
//        			that.grid.updateLayout(that.grid._asLayoutRoot); // true
//        		} 
//        		//else {
//        		//	console.log("grid nothing");
//        		//}
//    		}
//    	});
    };
	
    /**
     * 그리드 데이터 설정
     */
    ExtGrid.prototype.setData = function(data) {
        this.resetData();
        this.store.loadData(data);
    };
    
    /**
     * 그리드 데이터 추가
     */
    ExtGrid.prototype.addData = function(data) {
    	this.store.add(data);
    };
    
    /**
     * 그리드 데이터 초기화
     */
    ExtGrid.prototype.resetData = function() {
        this.store.removeAll();
    };
    
    /**
     * 그리드 전체 데이터 조회
     */
    ExtGrid.prototype.getAllData = function() {
        var dataList = [];

        this.store.each(function(record) {
            dataList.push(record.data);
        });

        return dataList;
    };
    
    /**
     * 그리드의 선택된 데이터 조회
     */
    ExtGrid.prototype.getSelectedItem = function() {
        var dataList = [];

        this.getSelectedItemRow().forEach(function(raw, i) {
            dataList.push(raw.data);
        });

        return dataList;
    };
    
    /**
     * 그리드의 선택된 데이터의 idex 를 반환 한다.
     */
    ExtGrid.prototype.getSelectedIndex = function () {
    	var selectedRecord = this.grid.getSelectionModel().getSelection()[0];
    	var row = this.grid.store.indexOf(selectedRecord);

    	return row;
    };

    /**
     * 그리드의 선택된 데이터를 반환 한다.
     */
    ExtGrid.prototype.getSelectedItemRow = function( ) {
    	return this.grid.getSelectionModel().getSelection();
    };

    /**
     * 그리드의 선택된 row 를 위로 이동 한다.
     */
    ExtGrid.prototype.upSelectedRow = function() {
    	this.moveSelectedRow(-1);
    };

    /**
     * 그리드의 선택된 row 를 아래로 이동 한다.
     */
    ExtGrid.prototype.downSelectedRow = function() {
    	this.moveSelectedRow(1);
    };

    /**
     * 그리드의 선택된 row 를 위, 아래로 이동 한다.
     */
    ExtGrid.prototype.moveSelectedRow = function(distance) {
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
    ExtGrid.prototype.getSelectedRow = function(idx) {
    	this.grid.getSelectionModel().select(idx);
    };

    /**
     * 그리드의 선택된 rows 를 반환 한다.
     */
    ExtGrid.prototype.getSelectedRecords = function() {
        return this.grid.getSelectionModel().getSelection();
    };

    /**
     * 그리드의 사이즈를 재정의 한다.
     */
    ExtGrid.prototype.resizeGrid = function () {
    	this.grid && this.grid.setSizePack();
    };
    
    /**
     * 그리드의 레코드를 변경 한다.
     */
    ExtGrid.prototype.getChangedRecords = function(fieldName) {
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
    ExtGrid.prototype.getCheckRecords = function() {
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
    ExtGrid.prototype.getFilteredRecords = function(fieldName, value) {
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
    ExtGrid.prototype.rowspan = function(colIdx) {
    	
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
   ExtGrid.prototype.removeRow = function(record) {
	   this.store.remove(record);
   };
   
   /**
    * 변경된 row 만 반환한다.
    */
   ExtGrid.prototype.getChangedRows = function() {
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
   ExtGrid.prototype.setColumnVisible = function(idx, chkHide) {
	   this.grid.columns[idx].setVisible(chkHide);
	   this.grid.getView().refresh();
   };
   
   /**
    * 그리드 데이터를 csv 파일로 다운로드 한다.
    * @param {String} fileName : 파일명
    */
   ExtGrid.prototype.exportCsvFile = function(fileName) {
	   var that = this
	   , noCsvSupport = ( 'download' in document.createElement('a') ) ? false : true
	   , stTr = noCsvSupport ? "<tr>"   : ""
	   , edTr = noCsvSupport ? "</tr>"  : "\r\n"
       , stTd = noCsvSupport ? "<td>"   : ""
       , edTd = noCsvSupport ? "</td>"  : ","
	   , contents = ""
	   , header = ""
	   , body  = "";

       var records = [];
       var store = that.grid.getStore();
       
       console.log(store);
       
       for(var i=0; i < store.getCount(); i++){
    	   records.push(store.getAt(i));
       }
       
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
       for(var i=0; i < records.length; i++) {
           var data = records[i].data;
           contents += stTr;
           for (var j = 0; j < gridColumns.length; j++) {
        	   if(gridColumns[j].xtype != "actioncolumn") {
        		   
        		   var dataIndex = gridColumns[j].dataIndex;
        		   var value = "";
        		   
        		   if(gridColumns[j].text.indexOf("No")==0 ){
        			   value = (i+1)+"";
        		   }
        		   
        		   else {
        			   if(typeof gridColumns[j].editor != 'undefined' && gridColumns[j].editor) {
            			   if(gridColumns[j].editor.xtype == "combobox") {
            				   $(gridColumns[j].editor.store.data.items).each(function(comboIdx, comboData) {

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
                       else if(!$commonService.fn_isNull(gridColumns[j].code)) {
                    	   if(data[dataIndex]) {
                    		   value = bxMsg('cbb_items.CDVAL#' + gridColumns[j].code + data[dataIndex]);
                    	   }
                    	   else {
                    		   value = "";
                    	   }
                       }
                       else if(!$commonService.fn_isNull(gridColumns[j].type) && gridColumns[j].type == 'date') {
                           value = XDate(data[dataIndex]).toString('yyyy-MM-dd');
                       }
            		   else {
            			   value = data[dataIndex];
            		   }
        		   }
                   
        		   if(value == null || value == "null") {
        			   value = '';
        		   }
        		   
                   body = (noCsvSupport) ? ''  : value;
                   body = String(body).replace(/,/g , "");
                   body = String(body).replace(/(\r\n|\n|\r)/gm,"");
                   
                   contents += stTd +  body + edTd;
        	   }
           }
           contents += edTr;
       }

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
    * 그리드 데이터를 csv 파일로 업로드 한다.
    */
   ExtGrid.prototype.importCsvFile = function(file) {
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
			
			return new ExtGrid();
		}
	};
} // end function