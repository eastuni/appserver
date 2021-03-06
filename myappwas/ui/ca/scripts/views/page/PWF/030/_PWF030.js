// Generated by  on 2015-01-27 오후 5:15:30
define(
  [
      'app/views/page/PWF/030/PWF030-base',
      'app/views/page/PWF/030/PWF030-list',
      'text!app/views/page/PWF/030/_PWF030-tpl.html'
  ],
  function (
      PWF030Base,
      PWF030List,
      tpl
  ) {


      var PWF030View = Backbone.View.extend({


          // 태그이름 설정
          tagName: 'section'


          // 클래스이름 설정
          ,className: 'bx-container bxp-PWF030001-page'


          // 템플릿 설정
          ,templates: {
              'tpl': tpl
          }


          ,initialize: function (initData) {
              var that = this;


              $.extend(that, initData);
              // 페이지 템플릿 설정
              that.$el.html(that.tpl());


              that.param = initData.param;
              // 페이지 핸들바 설정 : 메뉴의 메인 페이지에 설정해야 함 (_PWF030.js파일)
              that.$el.attr('data-page', that.pageHandler);


              // 기본정보영역 객체 생성
              that.subViews['PWF030Base'] = new PWF030Base();


              // 탭(그리드)영역 객체 생성
              that.subViews['PWF030List'] = new PWF030List();


              // tab의 현재 활성화된 그리드 조회
//              that.listenTo(that.subViews['PWF030Base'], 'loadData', function(param) {
//                  that.subViews['PWF030List'].renderSubPage(param);
//              });
          } // end of initialize


          ,render: function() {
        	  var that = this;
              // 기본정보영역 render
        	  that.$el.find('.PWF030-base-wrap').html(that.subViews['PWF030Base'].render());


        	  //base 페이지로 파라미터 전달
        	  that.subViews['PWF030Base'].fn_setTaskData(that.param);
              // 탭(그리드)정보영역 render
              this.$el.find('.PWF030-list-wrap').html(this.subViews['PWF030List'].render());


              return this.$el;
          } // end of render
      });// Backbone.View.extend


      return PWF030View;


  } // end of function
);
