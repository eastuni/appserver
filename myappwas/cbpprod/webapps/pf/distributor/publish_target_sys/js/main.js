/**
 * publish target system java script
 * @author Product Factory Team
 * @version $$id: main.js, v 0.1 $$
 */
$(function() {

    setMainTapLeftPosition();
    $('body').css('overflow-y','scroll');

    renderLeftTree();
});


var $el = $('.pf-pts');
var onEvent = PFUtil.makeEventBinder($el);
PFComponent.toolTip($el);

var publishLeftTreeTpl,
    publishTargetInfoTpl;
var publishTargetGrid;
var selectedCellIndex;
var enviromentGrid, publishTargetTableGrid;
var publishSystemTree;

publishLeftTreeTpl = getTemplate('publishLeftTreeTpl');
publishTargetInfoTpl = getTemplate('publishTargetInfoTpl');

var tables = [];

//검색버튼 클릭 시
onEvent('click', '.system-search-btn', function(){
	var name = $('.system-search-name').val();
	renderLeftTreeContent(name);
});

onEvent('keyup', '.system-search-name', function(event) {
	if (event.keyCode === 13) {
		var name = $('.system-search-name').val();
		renderLeftTreeContent(name);
	}
});

onEvent('click','.publish-target-info-add-btn', function(e){
    renderPublishTargetInfo();
});

onEvent('click', '.pf-pts-info .create-btn', function(e){
    var mandatoryCheck = PFValidation.mandatoryCheck('.mandatory');
    var requestParam = makeSaveRequestParam();

    if(mandatoryCheck) {
        if(!requestParam.environmentList){
            PFComponent.showMessage(bxMsg('publishTargetCreateWarningMsg'), 'warning');
            return;
        }
        PFRequest.post('/publish/PublishCreateSystem.json', requestParam, {
            success: function (responseData) {
                PFComponent.showMessage(bxMsg('SaveSucceed'), 'success', function () {
                    $('.publish-system-code').val(responseData.code);
                    renderLeftTree();
                    $('.save-btn').show();
                    $('.create-btn').hide();
                });
            },
            bxmHeader: {
                application: 'PF_Factory',
                service: 'PublishSystemService',
                operation: 'createPublishSystem'
            }
        });
    }
});

onEvent('click', '.pf-pts-info .save-btn', function(e){
    var mandatoryCheck = PFValidation.mandatoryCheck('.mandatory');
    var requestParam = makeSaveRequestParam();


    if(mandatoryCheck){

        if(!requestParam.environmentList){
            PFComponent.showMessage(bxMsg('publishTargetCreateWarningMsg'), 'warning');
            return;
        }
    PFRequest.post('/publish/PublishSaveSystem.json',requestParam,{
        success: function(responseData){
            PFComponent.showMessage(bxMsg('SaveSucceed'), 'success');
            renderLeftTree();
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'PublishSystemService',
            operation: 'savePublishSystem'
        }
    });
    }
});

onEvent('click','.pf-pts-info .delete-btn', function(){
    var requestParam = makeSaveRequestParam();
    PFRequest.post('/publish/PublishDeleteSystem.json',requestParam,{
        success: function(responseData){
            PFComponent.showMessage(bxMsg('DeleteSucced'), 'success',function(){
                var item = publishSystemTree.getItem(requestParam.code);
                publishSystemTree.removeItem(item);

                $('.pf-pts-info-wrap').removeClass('active');
                $('.pf-pts-info').empty();
            });
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'PublishSystemService',
            operation: 'deletePublishSystem'
        }
    });
})

onEvent('focus','.user-name', function(){
    PFPopup.selectEmployee({}, function (selectItem) {
    	if (selectItem) {
	        $('.user-name').val(selectItem.staffName);
	        $('.user-number').val(selectItem.staffId);
    	}
    	else {
    		$('.user-name').val('');
    		$('.user-number').val('');
    		
    	}
    });
});

function makeSaveRequestParam(){
    var requestParam = PFComponent.makeYGForm($('.publish-target-info-table')).getData();



    if(enviromentGrid.getAllData().length != 0){
        requestParam.environmentList = enviromentGrid.getAllData();
    }
    requestParam.targetTableList = publishTargetTableGrid.getAllData();
    for(var i = 0 ; i < requestParam.targetTableList.length ; i++){
        var tmpApplyStart = requestParam.targetTableList[i].applyStart.substring(0, 10);
        var tmpApplyEnd = requestParam.targetTableList[i].applyEnd.substring(0, 10);
        requestParam.targetTableList[i].applyStart = tmpApplyStart + ' 00:00:00';
        requestParam.targetTableList[i].applyEnd = tmpApplyEnd + ' 23:59:59';

    }

    return requestParam;
}

// 운영환경별배포정보
onEvent('click', '.environment-add-btn', function(){
//    var newData = [{ environmentCode:'',interfaceId:'',checkInterfaceId:''}];
//    enviromentGrid.addData(newData);
	renderSystemEnvironmentInfoPopup();
});

onEvent('click', '.publish-target-table-add-btn', function(){
	renderPublishTargetTablePopup();
})

function renderLeftTree(){
    $('.pf-pts-left-tree-box').html(publishLeftTreeTpl());
    if(writeYn != 'Y'){
        $('.write-btn').hide();
    }

    renderLeftTreeContent();
}

function renderLeftTreeContent(name){

	var requestData = {};
	if(name && name.length >0){
		requestData.name = name;
	}

    PFRequest.get('/publish/PublishQuerySystemList.json', requestData,{
        success: function(responseData){

            var treeData = [];

            $.each(responseData, function(index, tree){
                var node = {};
                node.text = tree.name;
                node.id = tree.code;
                treeData.push(node);
            });

            $('.pf-pts-tree-nav').empty();

            PFUI.use('pfui/tree',function (Tree) {
                publishSystemTree = new Tree.TreeList({
                    render: '.pf-pts-tree-nav',
                    nodes: treeData
                });
                publishSystemTree.render();

                publishSystemTree.on('itemdblclick', function (ev) {
                    var requestParam = {code : ev.item.id};
                    getPublishSystemDetailInfo(requestParam);
                });

            });

        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'PublishSystemService',
            operation: 'queryListPublishSystem'
        }
    });

}

function getPublishSystemDetailInfo(requestParam){
    PFRequest.get('/publish/PublishGetSystem.json',requestParam,{
        success: function(responseData){

            renderPublishTargetInfo(responseData);
        },
        bxmHeader: {
            application: 'PF_Factory',
            service: 'PublishSystemService',
            operation: 'queryPublishSystem'
        }
    })
}

function renderPublishTargetInfo(item){

    $('.pf-pts-info-wrap').addClass('active');
    $('.pf-pts-info').html(publishTargetInfoTpl(item));

    if(item){
        $('.save-btn').show();
        $('.create-btn').hide();
    }else{
        $('.save-btn').hide();
        $('.create-btn').show();
    }

    if(writeYn != 'Y'){
        $('.write-btn').hide();
    }

    enviromentGrid = renderMgmtEnvInfoGrid(item);
    publishTargetTableGrid = renderPublishTargetTableGrid(item);
}

function renderMgmtEnvInfoGrid(item){

    var grid = PFComponent.makeExtJSGrid({
        httpMethod: 'get',
        fields: [
            'envrnmntDscd','interfcId','constrntChkInterfcId', "dbmsDscd"
           ],
        dataRoot: 'list',
        gridConfig: {
            renderTo: '.manage-environment-info-grid',
            columns: [
                {text: bxMsg('envrnmntDscd'), flex: 1, dataIndex: 'envrnmntDscd',
                    renderer: function(value, p, record) {
                        return codeMapObj['SystemEnvironmentDistinctionCode'][value];
                    }
                },
                {text: bxMsg('distInterfcId'), flex: 1, dataIndex: 'interfcId'},
                {text: bxMsg('constrntChkInterfcId'), flex: 1, dataIndex: 'constrntChkInterfcId'},
                {text: bxMsg('dbmsDscd'), flex: 1, dataIndex: 'dbmsDscd',
                    renderer: function(value, p, record) {
                        return codeMapObj['SystemDbmsDscd'][value];
                    }
                },
                {
                    xtype: 'actioncolumn', width: 35, align: 'center',
                    items: [{
                        icon: '/images/x-delete-16.png',
                        handler: function (grid, rowIndex, colIndex, item, e, record) {
                            record.destroy();
                        }
                    }]
                }
            ],
            listeners: {
                scope: this,
                itemdblclick : function(_this, record, item, index){
                	renderSystemEnvironmentInfoPopup(record.data, index);
                }
            },
            plugins: [
                Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 1
                })
            ]
        }
    });

    if(item){
        grid.setData(item.environmentList);
    }

    return grid;
}

function renderPublishTargetTableGrid(gridData){

    var loginTntInstId = $('.product-factory-header', parent.document).find('.login-tntInst-id').text();

    var grid = PFComponent.makeExtJSGrid({
        url: '/project/queryProjectBaseForList.json?tntInstId='+loginTntInstId+'&commonHeaderMessage={"loginTntInstId":"'+loginTntInstId+'"}',
        httpMethod: 'get',
        fields: [
            'code','logicalTableName','tableName','applyStart','applyEnd'
        ],
        dataRoot: 'list',
        gridConfig: {
            renderTo: '.publish-target-table-info-grid',
            columns: [
                {text: bxMsg('logicalName'), width: 180, dataIndex: 'logicalTableName', editor: {allowBlank: false}},
                {text: bxMsg('physicalName'), width: 180, dataIndex: 'tableName', editor: {allowBlank: false}},
                {text: bxMsg('DPP0127String6'), width: 90,dataIndex:'applyStart', align: 'center',
                	editor: {
                        allowBlank: false,
                        listeners: {
                            focus: function(_this) {
                                PFUtil.getGridDateTimePicker(_this, 'applyStart', grid, selectedCellIndex, false);
                            }
                        }
                    },
                    listeners: {
                        click: function() {
                            selectedCellIndex = $(arguments[1]).parent().index();
                        }
                    }
                },
                {text: bxMsg('DPP0127String7'), width: 90, dataIndex:'applyEnd', align: 'center',
                	editor: {
                        allowBlank: false,
                        listeners: {
                            focus: function(_this) {
                                PFUtil.getGridDateTimePicker(_this, 'applyEnd', grid, selectedCellIndex, false);
                            }
                        }
                    },
                    listeners: {
                        click: function() {
                            selectedCellIndex = $(arguments[1]).parent().index();
                        }
                    }
                },
                {
                    xtype: 'actioncolumn', width: 35, align: 'center',
                    items: [{
                        icon: '/images/x-delete-16.png',
                        handler: function (grid, rowIndex, colIndex, item, e, record) {
                            record.destroy();
                        }
                    }]
                }
            ],
            listeners: {
                scope: this,
                itemdblclick : function(tree, record){

                }
            },
            plugins: [
                Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 1,
                    listeners:{
                        beforeedit:function(e, editor){
                            if( editor.field == 'tableName' ||
                                editor.field == 'logicalTableName'
                            ) {
                                return false;
                            }
                        }
                    }
                })
            ]
        }
    });

    if(gridData){

        var targetTableData = gridData.targetTableList;

        //var data = [];
        for(var i = 0 ; i < targetTableData.length ; i++){
            targetTableData[i].logicalTableName = bxMsg(targetTableData[i].tableName);
        }

        grid.setData(targetTableData);
    }

    return grid;
}

onEvent('click', '.sidebar-toggler', function (e) {
    var $target = $(e.currentTarget);

    $el.toggleClass('contents-expand');

    if($el.hasClass('contents-expand')) {
        $target.text('>');
    }else {
        $target.text('<');
    }

    setTimeout(function () {
        $('.manual-resize-component:visible').resize();
    }, 600);
});