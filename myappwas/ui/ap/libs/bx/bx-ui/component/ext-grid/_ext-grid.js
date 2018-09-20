define(
    function () {
        var ExtGrid = Backbone.View.extend({
            tagName: 'section',
//            className: 'bx-ext-grid',
//            className: 'bw-grid add-bd add-scroll',
            className: 'bw-grid add-bd',

            grid: null,
            store: null,

            currentPageNumber: 1,

            /**
             * @param config { url*, httpMethod, fields*, columns*, miniColumn, listeners, pageAble }
             */
            initialize: function (config) {
                var that = this;

                $.extend(that, config);

                //grid listener setting
                that.listeners || (that.listeners = {});
                that.listeners.scope = that.grid;

                that.initStore(config.fields, config.storeListeners);

                if(that.pageAble) {
                    that.listeners['viewready'] = function(grid, eOpts){
                        grid.view.getEl().on( 'scroll', function(event, target) {
                            var viewEndPosition = target.scrollHeight - target.offsetHeight;

                            if ((viewEndPosition > 0) && (viewEndPosition <= target.scrollTop)){

                                that.settedParam.pageNumber = ++that.currentPageNumber;
                                that.loadData(that.settedParam, false);
                            }
                        });
                    }
                }


            },

            /**
             * @param renderOption {width, height}
             */
            render: function (renderOption) {
                var that = this;

                //grid size setting
                renderOption || (renderOption = {});
                renderOption.width ? (that.width = renderOption.width) : (that.width = '100%');
                renderOption.height ? (that.height = renderOption.height) : (that.height = '100%');

                that.$el.width(that.width);
                that.$el.height(that.height);

                //grid render
                $.elementReady(that.el, function () {
                    (that.grid === null) && that.renderGrid();
                });
                
                console.log(that.$el);
                
                return that.$el;
            },

            initStore: function(fields, listeners) {
                this.store = Ext.create('Ext.data.Store', {fields: fields, listeners: listeners});
            },

            /**
             * @param param
             * @param option {isReset, loadBefore, loadSuccess, loadComplete}
             */
            loadData: function (param, option) {
                var that = this,
                    httpMethod = that.httpMethod || 'get',
                    option = option || {},
                    storeFn;

                that.settedParam = param;

                if(option.isReset) {
                    storeFn = 'loadData';
                    that.currentPageNumber = 1;
                }else {
                    storeFn = 'add';
                }

                bxProxy[httpMethod](that.url, param, {
                    beforeSend: function() {
                        typeof option.loadBefore === 'function' && option.loadBefore();
                    },
                    success: function(responseData) {
                        that.store[storeFn](responseData);
                        typeof option.loadSuccess === 'function' && option.loadSuccess(responseData);
                    },
                    complete: function() {
                        typeof option.loadComplete === 'function' && option.loadComplete();
                    }
                });
            },

            addData: function(data) {
                this.store.add(data);
            }
            
            , resetData: function() {
                this.store.removeAll();
            }

            , getAllData: function() {
                var dataList = [];

                this.store.each(function(record) {
                    dataList.push(record.data);
                });

                return dataList;
            },

            setData: function(data) {
                this.resetData();
                this.store.loadData(data);
            },

            renderGrid: function () {
                var that = this,
                    gridConts = {
                        store: that.store,
                        header: false,
                        style: {
                            width: that.width
                        },

                        emptyText: '<section class="empty-message-wrap"><p class="empty-message">'+bxMsg('cbb_items.SCRNITM#no-data-msg')+'</p></section>',
                        viewConfig: {
                            deferEmptyText: false
                        },

                        setSizePack: function() {
                            this.setSize(that.width, that.height);
                        },

                        columns: that.columns,

                        height: that.height,
                        renderTo: that.$el[0],

                        plugins: that.plugins,

                        selModel: that.selModel,

                        listeners: that.listeners
                    };

                $.extend(true, gridConts, that.gridConfig);

                (that.checkbox) && (gridConts.selType = 'checkboxmodel');
                (that.cell) && (gridConts.selType = 'cellmodel');
                
                that.grid = Ext.create('Ext.grid.Panel', gridConts);
            },

            changeColumns: function(columns) {
                this.grid.reconfigure(null, columns);
            },

            getSelectedItem: function() {
                var dataList = [];

                this.getSelectedItemRow().forEach(function(raw, i) {
                    dataList.push(raw.data);
                });

                return dataList;
            },

            getSelectedIndex: function () {
                var selectedRecord = this.grid.getSelectionModel().getSelection()[0];
                var row = this.grid.store.indexOf(selectedRecord);

                return row;
            },

            getSelectedItemRow: function( ) {
                return this.grid.getSelectionModel().getSelection();
            },

            upSelectedRow: function() {
                this.moveSelectedRow(-1);
            },

            downSelectedRow: function() {
                this.moveSelectedRow(1);
            },

            moveSelectedRow: function(distance) {
                var selectedRows = this.getSelectedItemRow(),
                    lastIndex = this.store.count() - 1,
                    newIndex = this.store.indexOf(selectedRows[0]) + distance;

                newIndex = (newIndex < 0)? 0 : newIndex;
                newIndex = (newIndex > lastIndex)? lastIndex : newIndex;

                if(selectedRows.length === 0) { return; }

                this.store.remove(selectedRows[0]);
                this.store.insert(newIndex, selectedRows);
                this.grid.getSelectionModel().select(newIndex);
            },

            getSelectedRow: function(idx) {
            	this.grid.getSelectionModel().select(idx);
            	
            },

            getSelectedRecords: function() {
                return this.grid.getSelectionModel().getSelection();
            },
 
            resizeGrid: function () {
                this.grid && this.grid.setSizePack();
            },
            
            getChangedRecords: function(fieldName) {
            	var changedRecords = [];
            	
            	this.store.each(function(record) {
            		if(record.isModified(fieldName)) {
            			changedRecords.push(record);
            		}
            	});
            	
            	return changedRecords;
            },
            
            getCheckRecords : function() {
            	var checkRecords = [];
            	
            	$(this.grid.getSelectionModel().selected.items).each(function(idx, data) {
            		checkRecords.push(data.data);
            	});
            	
            	return checkRecords;
            },
            
            getFilteredRecords: function(fieldName, value) {
            	var checkedRecords = [];
            	
            	this.store.each(function(record) {
            		if(record.get(fieldName) === value ) {
            			checkedRecords.push(record.data);
            		}
            	});
            	
            	return checkedRecords;
            },
            
            rowspan : function(colIdx) {
                
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
            	          } else {
            	            that = this;
            	          }
            	          that = (that == null) ? this : that; // set the that if not already set
            	      });
            	     });
            	 
            	   });
           },
           
         
           
           /**
            * 해당 로우를 삭제 한다. 
            */
           removeRow : function(record) {
           	this.store.remove(record);
           }
           
           /**
            * 변경된 row 만 반환한다.
            */
           , getChangedRows: function() {
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
           }

           /**
            * 해당컬럼을 숨기거나 보여준다.
            * chkHide true or false
            */
           , setColumnVisible : function(idx, chkHide) {
        	   this.grid.columns[idx].setVisible(chkHide);
        	   this.grid.getView().refresh();
           }
           
           /**
            * @param {String} fileName : 파일명
            */
           , exportCsvFile: function(fileName) {
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
                		   
//                		   if(dataIndex == "rowIndex") {
//                			   value = (i+1)+"";
//                		   }
                		   //자바스크립트에서는 startswith를 사용할 수 없음. 대신에 indexOf로 해당 구분 변경함 by Oh
                		   //if(gridColumns[j].text.startsWith("No")) {
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
                    		   }
                               else if(!fn_isNull(gridColumns[j].code)) {
                            	   if(data[dataIndex]) {
                            		   value = bxMsg('cbb_items.CDVAL#' + gridColumns[j].code + data[dataIndex]);
                            	   }
                            	   else {
                            		   value = "";
                            	   }
                               }
                               else if(!fn_isNull(gridColumns[j].type) && gridColumns[j].type == 'date') {
                                   value = XDate(data[dataIndex]).toString('yyyy-MM-dd');
                               }
                    		   else {
                    			   value = data[dataIndex];
                    		   }
                		   }
                           
                           body = ((noCsvSupport) && value == '') ? ''  : value;
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
           }
           
           , importCsvFile : function(file) {
        	   // ******** 파일이 utf-8 이어야 한글이 안깨진다. *********
        	   var that = this;
        	   
        	   if (fn_isNull(file)) {
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
                	   if(line[i] == null || fn_isNull(line[i])) {
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
            		   
            		   if(i != 0 && !fn_isNull(gridData)) {
            			   that.store.add(gridData);
            		   }
                   }
               }
           }
           
        });
        
        return ExtGrid;
    }
);