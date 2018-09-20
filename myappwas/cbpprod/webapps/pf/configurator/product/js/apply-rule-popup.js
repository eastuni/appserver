// 그래픽으로 보기
function renderChargeConditionGraphicPopup(data){
    var contentWidth = (parseInt(data.lastNodeLevel)+1)*150;
    var contentHeight = (parseInt(data.totalNodeNumber)+1)*60;
    var $popupBox = $('<div>').addClass('charge-condition-graphic-box');
    var sn = 1;

    if(contentWidth>590 || contentHeight>360){
        $popupBox.parent().css('overflow','scroll');
    }

    $popupBox.width(contentWidth).height(contentHeight);

    PFComponent.makePopup({
        title: bxMsg('ApplyRule'),
        contents: $popupBox,
        width: 600,
        height: 436,
        listeners: {
            afterRenderUI: function(){
                makeDeptLayout(contentWidth);
                makeNodeBox(data.voList);
                setNodeBoxPosition(data.voList);
                makeNodeLine(data.voList);
            }
        }
    })
    function makeDeptLayout(maxNodeLevel){
        for(var i = 0; i<=maxNodeLevel; i++){
            var $deptLayout = $('<div>').addClass('nodeLayout nodeLevel-'+i);
            $('.charge-condition-graphic-box').append($deptLayout);
        }
    }

    function makeNodeBox(nodeData){
        $.each(nodeData, function(idx, obj){
            obj.nodeId = sn++;
            var $nodeBox = $('<div>').addClass('nodeBox nodeId-' + obj.nodeId).text(obj.nodeName);
            $('.nodeLevel-'+obj.nodeLevel).append($nodeBox);
            obj.children && makeNodeBox(obj.children);
        })
    }

    function setNodeBoxPosition(nodeData){

        var deptObj = makeDeptObj(nodeData);
        function makeDeptObj(nodeData){
            deptObj = deptObj || {};
            $.each(nodeData, function(idx, obj){
                if(!deptObj[obj.nodeLevel]) {
                    deptObj[obj.nodeLevel] = [];
                    deptObj[obj.nodeLevel].push(obj);
                }else{
                    deptObj[obj.nodeLevel].push(obj);
                }

                obj.children && makeDeptObj(obj.children);
            })

            return deptObj;
        }

        $.each(deptObj, function(nodeLevel, nodes){
            $.each(nodes, function(idx, node){
                var $nodeBox = $('.nodeId-'+node.nodeId);

                if(nodeLevel == '0'){
                    var height = $('.charge-condition-graphic-box').height();
                    var block = height/deptObj['0'].length;
                    var position = block * ($nodeBox.index()+1);
                    var top = position - (block/2) - ($nodeBox.height()/2);
                    $nodeBox.css('top', top);
                }else{
                    if(node.children){
                        var children = node.children;
                        var startPoint = parseInt($('.nodeId-'+children[0].nodeId).css('top').split('px')[0]);
                        var endPoint = parseFloat($('.nodeId-'+children[children.length-1].nodeId).css('top').split('px')[0]);
                        var thisPoint = (startPoint+((endPoint-startPoint)/2)) - 5;
                        $nodeBox.css('top', thisPoint);
                    }
                }

            })
        })
    }

    function makeNodeLine(nodeData){
        $.each(nodeData, function(idx, obj){
            if(obj.children){
                var $nodeLine = $('<div>').addClass('nodeLine');
                var startChild = obj.children[0];
                var endChild = obj.children[obj.children.length-1];

                var width = (parseInt(startChild.nodeLevel)+1) * 150 - 70;
                var height = parseInt($('.nodeId-'+endChild.nodeId).css('top').split('px')[0]) -
                    parseInt($('.nodeId-'+startChild.nodeId).css('top').split('px')[0]);
                var top = parseInt($('.nodeId-'+startChild.nodeId).css('top').split('px')[0]) + 20;
                $('.charge-condition-graphic-box').append($nodeLine);

                $nodeLine.css({
                    width: width,
                    height: height,
                    top: top
                })

                makeNodeLine(obj.children);
            }
        })
    }
}
