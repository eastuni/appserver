// Generated by Bankware Global CBB Solution Center on 2015-02-03 오후 3:26:10


define(
  [
      'app/views/page/PWF/402/PWF402-base',
      'app/views/page/PWF/402/PWF402-list',
      'app/views/page/PWF/402/PWF402-detl',
      'text!app/views/page/PWF/402/_PWF402-tpl.html'
  ],
  function (
      PWF402Base,
      PWF402List,
      PWF402Detl,
      tpl
  ) {
	  var param = {};


      var PWF402View = Backbone.View.extend({


          // 태그이름 설정
          tagName: 'section'


          // 클래스이름 설정
          ,className: 'bx-container bxp-PWF402-page'


          // 템플릿 설정
          ,templates: {
              'tpl': tpl
          }


          ,initialize: function (initData) {
              var that = this;


              $.extend(that, initData);


              // 페이지 템플릿 설정
              that.$el.html(that.tpl());


              // 페이지 핸들바 설정 : 메뉴의 메인 페이지에 설정해야 함 (_.js파일)
              that.$el.attr('data-page', that.pageHandler);


              //목록페이지에서 넘어온 데이터
              param = initData.param;
              //alert("initParam"+initParam)


              // 기본정보영역 객체 생성
              that.subViews['PWF402Base'] = new PWF402Base(this.param);
              //that.subViews['PWF402Base'].initialize(initParam);


              // 그리드정보영역 객체 생성
              that.subViews['PWF402List'] = new PWF402List();


              // 상세정보영역 객체 생성
              that.subViews['PWF402Detl'] = new PWF402Detl();


              // 그리드 조회
              that.listenTo(that.subViews['PWF402Base'], 'loadData', function(param) {
                  that.subViews['PWF402List'].renderSubPage(param);
              });


              //  List초기화
              that.listenTo(that.subViews['PWF402Base'], 'initList', function(param) {
                  that.subViews['PWF402List'].initList(param);
              });


              // Dtl초기화
              that.listenTo(that.subViews['PWF402List'], 'initDetl', function(param) {
                  that.subViews['PWF402Detl'].resetPWF402Detl(param);
              });


              // List의 현재 선택된 값을 상세로 bind
              that.listenTo(that.subViews['PWF402List'], 'loadDtlData', function(param) {
                  that.subViews['PWF402Detl'].selDtlData(param);
              });


              // detl로 aprvlCndNbr
              that.listenTo(that.subViews['PWF402Base'], 'loadAprvlCndNbr', function(param) {
                  that.subViews['PWF402Detl'].loadAprvlCndNbr(param);
              });


              // detl의 등록,수정,삭제후 상세로 bind
              that.listenTo(that.subViews['PWF402Detl'], 'loadData', function(param) {
                  that.subViews['PWF402List'].renderSubPage(param);
              });


          } // end of initialize


          ,render: function() {
              // 기본정보영역 render
              this.$el.find('.PWF402-base-wrap').html(this.subViews['PWF402Base'].render());


              // 그리드정보영역 render
              this.$el.find('.PWF402-list-wrap').html(this.subViews['PWF402List'].render());


              // 상세정보영역 render
              this.$el.find('.PWF402-detl-wrap').html(this.subViews['PWF402Detl'].render());


              return this.$el;
          } // end of render
      });// Backbone.View.extend


      return PWF402View;


  } // end of function
);
