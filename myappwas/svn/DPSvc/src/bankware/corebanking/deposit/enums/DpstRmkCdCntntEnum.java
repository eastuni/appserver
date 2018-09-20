package bankware.corebanking.deposit.enums;


import bankware.corebanking.classinfo.annotation.CbbClassInfo;
import bankware.corebanking.enums.IEnum;
import bxm.common.annotaion.BxmCategory;


/**
 * This Enum class is used to classify remark code of deposit
 *
 * Author	
 * History
 *  2017.08.24	initial version for 2.2
 */
@BxmCategory(logicalName = "Deposit remark code enum" )
@CbbClassInfo(classType={"ENUM"})
public enum DpstRmkCdCntntEnum implements IEnum {


	CASH                            		("001"),  // 현금
	TRANSFER                        		("002"),  // 대체
	TELLER                          		("003"),  // 창구
	INTERCHANGE                     		("004"),  // 교환
	CHECK_EXTRA                     		("005"),  // 수표외
	DEFAULT                         		("006"),  // 부도
	ATM                             		("007"),  // ATM
	CD                              		("008"),  // CD
	DEBITCARD                       		("009"),  // 직불
	CD_WIRE                         		("010"),  // CD이체
	ARS_WIRE                        		("011"),  // ARS이체
	RESERVED_WIRE                   		("012"),  // 예약이체
	BC                              		("013"),  // BC
	GIRO                            		("014"),  // 지로
	DUEDATED                        		("015"),  // 기일
	LOAN_INTEREST                   		("016"),  // 대출이자
	INTEREST_TAX                    		("017"),  // 이자세금
	OUTWARD                         		("018"),  // 타행
	GUARANTEE_INTEREST              		("019"),  // 보증이자
	DEBITCARD_WIRE                  		("020"),  // 직불이체
	ALLIANCE                        		("021"),  // 제휴
	T24HOUR                         		("022"),  // 24시
	CMS                             		("023"),  // CMS
	NATIONAL_PENSION                		("024"),  // 국민연금
	GUARANTEE_FEE                   		("025"),  // 보증료
	PHONE_FEE                       		("026"),  // 전화료
	ELECTRIC_FEE                    		("027"),  // 전기료
	CHAIN                           		("028"),  // 연계
	VISA                            		("029"),  // VISA
	TELECOMMUNICATION_FEE           		("030"),  // 통신요금
	CENTERCUT_TRANSFER              		("031"),  // CC대체
	TERMINATION_INCOME_TAX          		("032"),  // 해약소득세
	TERMINATION_RESIDENCE_TAX       		("033"),  // 해약주민세
	TERMINATION_PRINCIPAL           		("034"),  // 해약원금
	SETTLEMENT_INTEREST             		("035"),  // 이자
	AUTO_WIRE                       		("036"),  // 자동이체
	REPAYMENT_PRINCIPAL             		("037"),  // 대출원금(대출실행)
	SALARY                          		("038"),  // 급여
	VISA_WIRE                       		("039"),  // VISA이체
	TERMINATION_INTEREST            		("040"),  // 해약이자
	DIFFERENCE_AMOUNT               		("041"),  // 차액
	INQUIRY_NEEDED                  		("042"),  // 조회필
	OTHER_CHECK                     		("043"),  // 타점권
	PURCHASE                        		("044"),  // 구매
	OUTWARD_NOPASSBOOK              		("045"),  // 타행무통
	MANAGEMENT_COST                 		("046"),  // 관리비
	SHOPPING_SETTLEMENT             		("047"),  // 쇼핑결제
	UTILITY_BILL                    		("048"),  // 공과금
	VAN                             		("049"),  // VAN
	JOINT_CMS                       		("050"),  // 공동CMS
	INTERNET                        		("051"),  // 인터넷
	SETOFF                          		("052"),  // 상계
	WIRE_CLEAR                      		("053"),  // 이체정리
	OUTWARD_REFUND                  		("054"),  // 타행반환
	CD_JOINT_WIRE                   		("055"),  // CD공동이체
	OUTWARD_COUPLED                 		("056"),  // 타행환연동
	CD_JOINT                        		("057"),  // CD현금
	PAYMENT_SETTLEMENT              		("058"),  // 지급결제
	CHECKCARD                       		("059"),  // 체크카드
	HYBRID_INCOME                   		("060"),  // 잡수입
	STOCK                           		("061"),  // 증권
	CASH_SETTLEMENT                 		("062"),  // 현금결제
	ELECTRIC_TAX                    		("063"),  // 전자세금
	ELECTRIC_SHOPPING               		("064"),  // 전자쇼핑
	BC_AUTOTELLER_SETTLEMENT        		("065"),  // BC자동화결제
	BC_INTERNET_SETTLEMENT          		("066"),  // BC인터넷결제
	BC_ALLIANCE                     		("067"),  // BC가맹
	MOBILE                          		("068"),  // 모바일
	ALLIANCE_CD                     		("069"),  // 제휴CD
	ALLIANCE_CD_WIRE                		("070"),  // 제휴CD이체
	BC_PROXY                        		("071"),  // BC대행
	OUTWARD_TRANSFER                		("072"),  // 타행환대체
	CHECKCARD_ISSUE_FEE             		("073"),  // 체크카드발급비
	CHECKCARD_GUARANTEE_FEE         		("074"),  // 체크카드보증금
	CARD_APPROVAL                   		("075"),  // 카드승인
	MEMBERSHIP                      		("076"),  // 회원
	VAN_SALARY                      		("077"),  // VAN급여
	ELECTRIC_FINANCE                		("078"),  // 전자금융
	BC_WIRE                         		("079"),  // BC이체
	NATIONAL_ALLIANCE               		("080"),  // 국민가맹
	BC_INTERNET_WIRE                		("081"),  // BC인터넷이체
	ALLIANCE_CD_CARD                		("082"),  // 제휴CD카드
	ALLIANCE_CD_PASSBOOK            		("083"),  // 제휴CD통장
	JOINT_NETWORK_CDCALCULATE       		("084"),  // 공동망CD정산
	CENTERCUT                       		("085"),  // 센터컷
	CD_JOINT_OUTWARD                		("086"),  // CD공동타행
	EXPIRY_EXTENSION                		("087"),  // 기한연장
	COUPLED                         		("088"),  // 연동
	LOAN_AMOUNT                     		("089"),  // 대출금액
	DIVIDEND                        		("090"),  // 배당
	INTEREST                        		("091"),  // 이자
	OUTWARD_WIRE                    		("092"),  // 타행이체
	APT                             		("093"),  // APT
	TAX_RETURN                      		("094"),  // 세금환출
	MEMBERSHIP_FEE                  		("095"),  // 회비
	FUND_WIRE                       		("096"),  // 자금이체
	PREPAYMENT                      		("097"),  // 선불
	DEFAULT_CANCEL                  		("098"),  // 부도취소
	INTEREST_RETURN                 		("099"),  // 이자환입
	OUTWARD_CANCEL                  		("100"),  // 타행취소
	CHAIN_CANCEL                    		("101"),  // 연계취소
	CALCULATE_CANCEL                		("102"),  // 정산취소
	RECKONING_OPEN                  		("103"),  // 기산신규
	CENTER_CANCEL                   		("104"),  // 센터취소
	WITHDRAWAL_CORRECTION           		("105"),  // 출금정정
	RECKONING                       		("106"),  // 기산
	SALARY_WIRE                     		("107"),  // 급여이체
	AUTOMATIC_TRANSFER              		("108"),  // 자동대체
	OUTWARD_CD                      		("109"),  // 타행CD
	INSURANCE_FEE                   		("110"),  // 보험료
	LEASE_FEE                       		("111"),  // 리스료
	CAR_FEE                         		("112"),  // 자동차세
	TRANSACTION_SUSPENSION          		("113"),  // 거래정지
	CASHCARD                        		("114"),  // 현금카드
	INTEREST_CASH                   		("115"),  // 이자
	INTEREST_TRANSFER               		("116"),  // 이자대체
	RETURN_CANCEL                   		("117"),  // 환입취소
	AUTOMATIC_EXTENSION             		("118"),  // 자동연장
	MATURITY_TERMINATION            		("119"),  // 만기해지
	CARD_PAYMENT                    		("120"),  // 카드대금
	CHAIN_WIRE                      		("121"),  // 연계송금
	TAX_INCOME                      		("122"),  // 세금환입
	TERMINATION_TREATMENT           		("123"),  // 해지의제
	INTEREST_CALCULATE              		("124"),  // 이자정산
	CHAIN_CD                        		("125"),  // 연계CD
	ADDITION_PAYMENT                		("126"),  // 추가지급
	OFFER_CANCEL                    		("127"),  // 청약취소
	CMS_LOAN                        		("128"),  // CMS(여신)
	GIRO_LOAN                       		("129"),  // 지로(여신)
	VIRTUAL_ACCOUNT_LOAN            		("130"),  // 가상계좌(여신)
	TRANSFER_LOAN                   		("131"),  // 대체(여신)
	NORMAL_CORRECTION               		("132"),  // 정정
	NORMAL_TAX                      		("133"),  // 세금
	NATIONAL_TAX                    		("134"),  // 국세
	PENALTY_TAX                     		("135"),  // 범칙금
	LOCAL_TAX                       		("136"),  // 지방세
	NON_TAX_INCOME                  		("137"),  // 세외수입
	NATIONAL_HEALTH_INSURANCE       		("138"),  // 건강보험
	EMPLOYMENT_INSURANCE            		("139"),  // 고용보험
	INDUSTRIAL_DISASTER_INSURANCE   		("140"),  // 산재보험
	ALLIANCE_CD_JOINT_WIRE          		("141"),  // 제휴CD공동이체
	ALLIANCE_CD_JOINT               		("142"),  // 제휴CD현금
	ALLIANCE_CD_JOINT_OUTWARD       		("143"),  // 제휴CD공동타행
	TERMINATION                     		("144"),  // 해지
	PAYMENT_GATEWAY                 		("145"),  // PG망
	WIRE_IMMEDIACY                  		("146"),  // 즉시이체
	WIRE_CMS                        		("147"),  // CMS이체
	CALCULATE_EXPENSE               		("148"),  // 경비정산
	PAYMENT_BONUS                   		("149"),  // 상여금
	WITHDRAWAL_ADJUSTMENT_FEE       		("150"),  // 수수료
	PRINCIPAL_INTEREST_LOAN         		("151"),  // 대출원리금
	FEE_AGREEMENT_AMOUNT            		("152"),  // 약정수수료
	TAX_STAMP                       		("153"),  // 인지세
	REPAYMENT_LOAN     			 			("154"),  // 대출상환
	INTEREST_DIGITAL                		("155"),  // 이자
	FEE_USAGE_SMS                   		("156"),  // SMS이용료
	SETTLEMENT_CHECKCARD            		("157"),  // 체크결제
	REFUND_CHECKCARD                		("158"),  // 체크환불
	PAYMENT_CASHBACK                		("159"),  // 캐시백
	OPEN                            		("160"),  // 신규
	PARTIAL_WITHDRAWAL              		("161"),  // 부분인출
	DELAYED_WIRE                    		("162"),  // 지연이체
	AMOUNT_DONATE                   		("163"),  // 기부금
	FEE_MONTHLY_RENT                		("164"),  // 월세
	CD_REFUND                       		("165"),  // CD자금청구반환
	ELECTRIC_FINANCE_REFUND         		("166"),  // 전자금융자금청구반환
	OUTWARD_TRANSFER_REFUND         		("167"),  // 타행환자금청구반환
	CUSTNAME_CHNG_FEE               		("168"),  // 고객명변경수수료
	INTEREST_PAYMENT        				("169"),  // 이자지급         
	TERMINATION_WITHDRAWAL    				("170"),  // 해지출금
	CANCEL_PAYMENT_CASHBACK         		("171"),  // 캐시백취소
	CALCULATE_BC_ALLIANCE           		("172"),  // 대금정산
	INHERITANCE_TERMINATION         		("173"),  // 상속해지
	TX_CANCEL                 				("174"),  // 취소
	INHERITANCE_WITHDRAWAL          		("175"),  // 상속출금
	CD_JOINT_PAYMENT    					("176"),  // CD현금대지급
	LARGE_WIRE                      		("177"),  // 대량이체
	REQUESTED_TERMINATION        			("178"),  // 당행요청해지
	BIGMONEY_WIRE    						("179"),  // 거액거래
	BIGMONEY_REVERSE_WIRE        			("180"),  // 거액반대거래
	AGREEMENT_TERMINATION        			("181"),  // 대출약정해지
	CD_MANLESS_RECEIVE        				("182"),  // CD무인
	CD_JIRO        				 			("183"),  // CD지로
	ARS_JIRO        						("184"),  // 결제원지로
	DISTRAINT_REMITTING             		("185"),  // 압류추심
	DPWDL_PRHB             		 			("186"),  // 대포통장입금지급금지
	WITHDRAWN_LOAN            				("187"),  // 여신철회
	EREGIST_STAMP_FEE            			("188"),  // 전자등기수수료
	FIRM_BANKING                    		("189"),  // 펌뱅킹
	BANC_INSURANCE_FEE              		("190"),  // 방카초회보험료
	PROPERTY_RIGHT_SURVEY_FEE       		("191"),  // 권리보험료
	SGI_MCI_INSURANCE_PREMIUM       		("192"),  // 서울보증보험MCI보험료
	OVRS_ATM_NQUIRY_FEE             		("193"),  // 해외ATM조회수수료
	OVRS_ATM                        		("194"),  // 해외ATM
	OVRS_ATM_WITHDRAWAL_CANCEL      		("195"),  // 해외ATM출금취소
	OVRS_SETTLEMENT_CHECKCARD       		("196"),  // 해외체크결제
	OVRS_REFUND_CHECKCARD           		("197"),  // 해외체크환불
	BALANCE_SWEEP                   		("198"),  // 잔액스윕
	RECHARGE                    			("199"),  // 충전
	SMART_DEPOSIT                   		("200"),  // 스마트예금
	MMF                    		 			("201"),  // MMF
	WMP                    		 			("202"),  // WMP
	VC_PHSH                         		("203"),  // 보이스피싱
	MSNG_PHSH                       		("204"),  // 파밍
	POLICY_FUND_LOAN                		("205"),  // 정책자금대출
	MINUS_PASSBOOK_LOAN             		("206")   // 마이너스통장대출
	;



	private String value;


	DpstRmkCdCntntEnum(String value) {
	    this.value = value;
	}


    public String getValue() {
		return value;
	}


    public static DpstRmkCdCntntEnum getEnum (String value){
        for (DpstRmkCdCntntEnum enumObject: values()){
          if(enumObject.getValue().equals(value)) {
            return enumObject;
          }
        }
        return null;
    }


    public static boolean isValid(String value){
        for (DpstRmkCdCntntEnum enumObject: values()){
          if(enumObject.getValue().equals(value)) {
            return true;
          }
        }
        return false;
    }
}


