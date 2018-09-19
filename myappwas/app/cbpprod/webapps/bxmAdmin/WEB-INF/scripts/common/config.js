define(
    [
        '../../brand/brandConfig'
    ],
    function(
        brandConfig
    ) {
        return $.extend({}, {
            /**
             * Required for BXM
             */
            isBxm: true,

            brand: 'BXM WEB ADMIN',

            bizDate: null,
            
            scheduleDate: null,
            
            /**
             * 시스템 설정
             */
            sysConfig: {
                maxActiveTabCount: 10,      // 탭 활성화 최대 개수
                popupDuration: 1000         // 팝업 지속시간 (단위 ms)
            },

            /**
             * 메뉴
             *
             * {{menuId}} : {desc: {{menuDesc}}, src: {{menuSrcPath}}}
             */
            pageInfo: {
                'MENU00101': {desc: '온라인 로그 조회', src: 'views/online/online-log-search/_online-log-search'},
                'MENU00102': {desc: '거래 파라미터 관리', src: 'views/online/trx-parameter/_trx-parameter'},
                'MENU00103': {desc: '연동 플로우 관리', src: 'views/online/link-flow-management/_link-flow-management'},
                'MENU00104': {desc: '온라인 그룹 관리', src: 'views/online/online-group/_online-group'},
                'MENU00105': {desc: '에러 이벤트 조건 관리', src: 'views/error-setting/error-event-setting/_error-event-setting'},
                'MENU00106': {desc: '에러 통계', src: 'views/error-setting/error-statistics/_error-statistics'},
                'MENU00107': {desc: '온라인 모니터링', src: 'views/online/online-monitoring/_online-monitoring'},

                'MENU00201': {desc: '배치 작업 모니터링', src: 'views/batch/job-monitoring/_job-monitoring'},
                'MENU00202': {desc: '배치 데몬 모니터링', src: 'views/batch/daemon-monitoring/_daemon-monitoring'},
                'MENU00203': {desc: '배치 작업 관리', src: 'views/batch/job-info/_job-info'},
                'MENU00204': {desc: '배치 작업 그룹 관리', src: 'views/batch/job-group/_job-group'},
                'MENU00205': {desc: '배치 데몬 관리', src: 'views/batch/daemon-info/_daemon-info'},
                'MENU00206': {desc: 'Before Image 조회', src: 'views/batch/before-image-search/_before-image-search'},
                
                'MENU00301': {desc: '후행 작업 관리', src: 'views/deferred/deferred-job-management/_deferred-job-management'},
                'MENU00302': {desc: '후행 작업 진행 상황', src: 'views/deferred/deferred-job-progress/_deferred-job-progress'},
                'MENU00303': {desc: '후행 실행 이력 조회', src: 'views/deferred/deferred-execution-history/_deferred-execution-history'},
                'MENU00304': {desc: '후행 에러 로그 조회', src: 'views/deferred/deferred-error-log/_deferred-error-log'},
                'MENU00305': {desc: '후행 실행 현황', src: 'views/deferred/deferred-execution-status/_deferred-execution-status'},
                'MENU00306': {desc: '후행 넘버링 현황', src: 'views/deferred/deferred-numbering-status/_deferred-numbering-status'},
                'MENU00307': {desc: '후행 작업 상태 관리', src: 'views/deferred/deferred-job-status-management/_deferred-job-status-management'},
                'MENU00308': {desc: '후행 입력 테이블 조회', src: 'views/deferred/deferred-input-tables/_deferred-input-tables'},
                'MENU00309': {desc: '후행 작업 상황', src: 'views/deferred/deferred-job-status-integrated-version/_deferred-job-status'},

                'MENU00401': {desc: '대쉬보드', src: 'views/center-cut/dashboard/_dashboard'},
                'MENU00402': {desc: '센터컷 작업 관리', src: 'views/center-cut/center-cut-job-management/_center-cut-job-management'},
                'MENU00403': {desc: '센터컷 작업 상황', src: 'views/center-cut/center-cut-job-status/_center-cut-job-status'},
                'MENU00404': {desc: '센터컷 서버 관리', src: 'views/center-cut/center-cut-server-management/_center-cut-server-management'},

                'MENU00501': {desc: '테스트 파라미터 관리', src: 'views/trx-setting/test-parameter/_test-parameter'},
                'MENU00502': {desc: '전체 거래 제어 관리', src: 'views/trx-setting/all-trx-control/_all-trx-control'},
                'MENU00503': {desc: '공통 메시지 관리', src: 'views/trx-setting/common-message/_common-message'},
                'MENU00504': {desc: 'OMM 검증 Rule 관리', src: 'views/trx-setting/omm-validate-rule/_omm-validate-rule'},
                'MENU00505': {desc: '캐시 관리', src: 'views/trx-setting/cache-management/_cache-management'},
                'MENU00506': {desc: '캐시 모니터링', src: 'views/trx-setting/cache-monitoring/_cache-monitoring'},

                'MENU00601': {
                    desc: '어플리케이션 배포 관리', src: 'views/app-deploy/application-deploy/_application-deploy',
                    subPages: {
                        'SUB01': {
                            desc: 'Monitoring', src: 'views/app-deploy/application-deploy/sub-pages/monitoring/_monitoring'
                        },
                        'SUB02': {
                            desc: 'Pre - Deploy', src: 'views/app-deploy/application-deploy/sub-pages/pre-deploy/_pre-deploy'
                        },
                        'SUB03': {
                            desc: 'Manage Pre - Deployed', src: 'views/app-deploy/application-deploy/sub-pages/manage-pre-deployed/_manage-pre-deployed'
                        },
                        'SUB04': {
                            desc: 'Deploy', src: 'views/app-deploy/application-deploy/sub-pages/deploy/_deploy'
                        },
                        'SUB05': {
                            desc: 'Validate IP', src: 'views/app-deploy/application-deploy/sub-pages/validate-ip/_validate-ip'
                        }
                    }
                },
                'MENU00602': {desc: '배포 이력', src: 'views/app-deploy/deploy-history/_deploy-history'},

                'MENU00701': {desc: 'Admin 설정', src: 'views/setting/admin-setting/_admin-setting'},
                'MENU00702': {desc: 'Studio 설정 관리', src: 'views/setting/studio-setting/_studio-setting'},
                'MENU00703': {desc: 'URL 관리', src: 'views/setting/ondemandurl-setting/_ondemandurl-setting'},
                'MENU00704': {desc: '공통 코드 관리', src: 'views/setting/commoncode-setting/_commoncode-setting'},
                'MENU00705': {desc: '메뉴 관리', src: 'views/setting/menu-setting/_menu-setting'},
                'MENU00706': {desc: '권한 관리', src: 'views/setting/permission-setting/_permission-setting'},
                'MENU00707': {desc: '사용자 관리', src: 'views/setting/user-setting/_user-setting'},
                'MENU00708': {desc: '역할 관리', src: 'views/setting/role-setting/_role-setting'},
                'MENU00709': {desc: '캘린더', src: 'views/setting/schedule-calendar/_schedule-calendar'},
                'MENU00710': {desc: 'Studio Datasource 설정 관리', src: 'views/setting/studio-datasource-config/_studio-datasource-config'},
                'MENU00711': {desc: 'Studio Datasource 권한 관리', src: 'views/setting/studio-datasource-permission/_studio-datasource-permission'},

                'MENU00801': {desc: '리소스 분석', src: 'views/dni/resource-analysis/_resource-analysis'},
                'MENU00802': {desc: 'DB 영향도(리소스→DB)', src: 'views/dni/db-effect-resource-to-db/_db-effect-resource-to-db'},
                'MENU00803': {desc: 'DB 영향도(DB→리소스)', src: 'views/dni/db-effect-db-to-resource/_db-effect-db-to-resource'},
                'MENU00804': {desc: '분석 보고서', src: 'views/dni/analysis-report/_analysis-report'},

                'MENU00901': {desc: '대쉬보드', src: 'views/scheduler/dashboard/_dashboard'},
                'MENU00902': {desc: '스케줄 실행 현황', src: 'views/scheduler/schedule-execution-status/_schedule-execution-status'},
                'MENU00903': {desc: '스케줄 실행 이력 조회', src: 'views/scheduler/schedule-execution-history-search/_schedule-execution-history-search'},
                'MENU00904': {desc: '스케줄 작업 관리', src: 'views/scheduler/schedule-job-management/_schedule-job-management'},
                'MENU00905': {desc: '에이전트 관리', src: 'views/scheduler/agent-management/_agent-management'},
                'MENU00906': {desc: '스케줄 예정 일시', src: 'views/scheduler/schedule-estimate-date/_schedule-estimate-date'},
                'MENU00907': {desc: '스케줄 원격 실행', src: 'views/scheduler/schedule-prompt-execution/_schedule-prompt-execution'},
                'MENU00908': {desc: '시스템/그룹 관리', src: 'views/scheduler/system-group-management/_system-group-management'},
                'MENU00909': {desc: '파라미터 코드 괸리', src: 'views/scheduler/parameter-code-management/_parameter-code-management'},

                'MENU01001': {desc: 'Realtime', src: 'views/online/online-monitoring/_online-monitoring'},
                'MENU01002': {desc: 'Request', src: 'views/online/online-monitoring/_online-monitoring'},
                'MENU01003': {desc: 'Statistics', src: 'views/online/online-monitoring/_online-monitoring'},
                'MENU01004': {desc: 'Top-N', src: 'views/online/online-monitoring/_online-monitoring'},
                'MENU01005': {desc: 'Issue', src: 'views/online/online-monitoring/_online-monitoring'},
                'MENU01006': {desc: 'Event', src: 'views/online/online-monitoring/_online-monitoring'},
                'MENU01007': {desc: 'Compare', src: 'views/online/online-monitoring/_online-monitoring'},
                'MENU01008': {desc: 'Active', src: 'views/online/online-monitoring/_online-monitoring'},
                'MENU01009': {desc: 'Viewer', src: 'views/online/online-monitoring/_online-monitoring'},
                'MENU01010': {desc: 'Tier', src: 'views/online/online-monitoring/_online-monitoring'},
                'MENU01011': {desc: 'Top-N-JAVA', src: 'views/online/online-monitoring/_online-monitoring'}
            },

            /**
             * 시작 메뉴
             * {{menuId}}
             */
            defaultPageInfo: 'MENU00101',
            authorizedMenuList: {},

            /**공통 코드*/
            comCdList: null,

            extraOption: null,

            useTrxCd: false,
            useBizDt: null,

            webSocketId: null,

            enPharosRendered: false
        }, brandConfig);
    }
);
