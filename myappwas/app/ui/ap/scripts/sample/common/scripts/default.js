//LNB 미디어쿼리적용시 슬라이드 숨김
	$(document).ready(function(){
 
 	$('#menu_open').click(function(){
 	$('#side_menu').animate({left:'50px'}, 500);
 	});
 	$('#menu_close').click(function(){
  	$('#side_menu').animate({left:'-100%'}, 500);
 	});
	});

// TOOLTIP
  $(function() {
    $( document ).tooltip({
      position: {
        my: "center bottom-20",
        at: "center top",
        using: function( position, feedback ) {
          $( this ).css( position );
          $( "<div>" )
            .addClass( "arrow" )
            .addClass( feedback.vertical )
            .addClass( feedback.horizontal )
            .appendTo( this );
        }
      }
    });
  });


//MODAL OPEN CLOSE*/
function doLayerPopup() {
var layerPopup = document.getElementById("bw-modal");

if (layerPopup.style.display == "block") {
layerPopup.style.display = "none";
}else{
layerPopup.style.display = "block";
}
}
//MODAL OPEN CLOSE*/
function doLayerPopup1() {
var layerPopup = document.getElementById("bw-modal1");

if (layerPopup.style.display == "block") {
	layerPopup.style.display = "none";
	}else{
	layerPopup.style.display = "block";
	}
}
//MODAL OPEN CLOSE(그리드 접기용)*/
function doLayerPopup2() {
var layerPopup = document.getElementById("bw-modal2");

if (layerPopup.style.display == "none") {
layerPopup.style.display = "block";
}else{
layerPopup.style.display = "none";
}
}
//MODAL OPEN CLOSE*/
function doLayerPopup3() {
var layerPopup = document.getElementById("bw-modal3");

if (layerPopup.style.display == "block") {
	layerPopup.style.display = "none";
	}else{
	layerPopup.style.display = "block";
	}
}
//MODAL OPEN CLOSE*/
function doLayerPopup4() {
var layerPopup = document.getElementById("bw-modal4");

if (layerPopup.style.display == "block") {
	layerPopup.style.display = "none";
	}else{
	layerPopup.style.display = "block";
	}
}
//MODAL OPEN CLOSE*/
function doLayerPopup5() {
var layerPopup = document.getElementById("bw-modal5");

if (layerPopup.style.display == "block") {
	layerPopup.style.display = "none";
	}else{
	layerPopup.style.display = "block";
	}
}
//MODAL OPEN CLOSE*/
function doLayerPopup6() {
var layerPopup = document.getElementById("bw-modal6");

if (layerPopup.style.display == "block") {
	layerPopup.style.display = "none";
	}else{
	layerPopup.style.display = "block";
	}
}
//아코디언 메뉴(LNB용)
$(function() {
	$( "#accordion" ).accordion({
		collapsible: true,
    active: false,
    heightStyle: "content"
	});
});

//아코디언 메뉴(CONTENTS용1)
$(function() {
  $( "#accordion2" ).accordion({
    collapsible: false,
    active: false,
    heightStyle: "content"
  });
});

//아코디언 메뉴(CONTENTS용2)
$(function() {
  $( "#accordion3" ).accordion({
    collapsible: false,
    active: false,
      heightStyle: "content"
  });
});

//아코디언 메뉴(CONTENTS용2)
$(function() {
  $( "#accordion4" ).accordion({
    collapsible: false,
    active: false,
      heightStyle: "content"
  });
});

//DATEPICKER
$(function() {
  $( "#datepicker" ).datepicker({
    showOtherMonths: true,
    selectOtherMonths: true
  });
});

//DATEPICKER 2
$(function() {
  $( "#datepicker2" ).datepicker({
    showOtherMonths: true,
    selectOtherMonths: true
  });
});
