define(
    ['bx-component/ext-grid/_ext-grid'],
    function (ExtGrid) {
        var ExtTreeGrid = ExtGrid.extend({
            tagName: 'section',
//            className: 'bx-ext-tree-grid',

            grid: null,
            store: null,

            /**
             * inheritanced Method
             * @param config { url*, fields*, columns*, miniColumn, listeners, pageAble, viewConfig }
             *
             * initialize: function (config) { },
             */

            /**
             * inheritanced Method
             * @param renderOption {width, height}
             *
             * render: function (renderOption) { }
             */


            initStore: function(fields) {
                fields.push({name: 'leaf', convert: function (value, record) {
                    return (!record.data.children) || (record.data.children.length === 0);
                }});

                this.store = Ext.create('Ext.data.TreeStore', {fields: fields});
            },

            /**
             * @param param
             * @param option {isReset, loadBefore, loadSuccess, loadComplete}
             */
            loadData: function (param, option) {
                var that = this,
                
                    httpMethod = that.httpMethod || 'get';

                that.settedParam = param;

                option = option? option : param;

                bxProxy[httpMethod](that.url, param, {
                    beforeSend: function() {
                        option && typeof option.loadBefore === 'function' && option.loadBefore();
                    },
                    success: function(responseData) {
                        that.setStoreRootNode(responseData);
                        option && typeof option.loadSuccess === 'function' && option.loadSuccess(responseData);
                    },
                    complete: function() {
                        option && typeof option.loadComplete === 'function' && option.loadComplete();
                    }
                });
            },

            setStoreRootNode: function (fieldData) {
                this.store.setRootNode({
                    expanded: true,
                    text: "My Root",
                    children: fieldData
                });
            },

            renderGrid: function () {
                var that = this,
                    gridConts = {
                        store: that.store,
                        header: false,
                        style: {
                            width: that.width
                        },

                        useArrows: true,
                        rootVisible: false,
                        multiSelect: true,
                        sortableColumns: false,

                        emptyText: '<section class="empty-message-wrap"><p class="empty-message">'+bxMsg('cbb_items.SCRNITM#no-data-msg')+'</p></section>',
                        viewConfig: that.viewConfig,

                        setSizePack: function() {
                            this.setSize(that.width, that.height);
                        },

                        columns: that.columns,

                        height: that.height,
                        renderTo: that.$el[0],

                        plugins: that.plugins,

                        listeners: that.listeners
                    };

                (that.checkbox) && (gridConts.selType = 'checkboxmodel');

                that.grid = Ext.create('Ext.tree.Panel', gridConts);
            },

            resizeGrid: function () {
                this.grid && this.grid.setSizePack();
            },
            
            getAllData: function() {
                var dataList = [],
                    dataObj, rawData, dataKey;

                makeTreeData(dataList, this.store.getRootNode().childNodes);

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
                }

                return dataList;
            },

            addField: function (initval) {
                if(this.getAllData().length > 0) {
                    this.store.getRootNode().appendChild(initval);
                } else {
                    this.setStoreRootNode([initval]);
                }
            },
            
            upField: function () {
                var node = this.grid.getSelectionModel().lastSelected,
                    parent = node.parentNode,
                    currentIdx = parent.indexOf(node);

                if (currentIdx === 0) return;

                parent.insertChild(currentIdx - 1, node);
            },

            downField: function () {
                var node = this.grid.getSelectionModel().lastSelected,
                    parent = node.parentNode,
                    targetIdx = parent.indexOf(node) + 2;

                if ((targetIdx - 1) === parent.childNodes.length) return;

                parent.insertChild(targetIdx, node);
            },

            reloadData: function() {
                this.store.getRootNode().removeAll();
            },

            expandAll: function () {
                this.grid && this.grid.expandAll();
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
                			
            				if(value == null) {
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
            } // end exportCsvFile
            
        });

        
        return ExtTreeGrid;
    }
);