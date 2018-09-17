package bankware.corebanking.accounting.generalledger.batch;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.batch.core.StepContribution;
import org.springframework.batch.core.scope.context.ChunkContext;
import org.springframework.batch.core.step.tasklet.Tasklet;
import org.springframework.batch.repeat.RepeatStatus;
import org.springframework.context.annotation.Scope;

import bankware.corebanking.accounting.cash.daobatch.AcTlrTxSumnDBat;
import bankware.corebanking.accounting.cash.daobatch.dto.AcTlrTxSumnDBatInOut;
import bankware.corebanking.accounting.enums.AcctgItmEnum;
import bankware.corebanking.accounting.generalledger.daobatch.AcGlMBat;
import bankware.corebanking.accounting.generalledger.daobatch.dto.AcGlMBatIO;
import bankware.corebanking.accounting.generalledger.daobatch.dto.AcGlMBtsdAcctgItmBalBatIO;
import bankware.corebanking.accounting.generalledger.daobatch.dto.AcGlMCrygFrwrdBatIO;
import bankware.corebanking.accounting.generalledger.daobatch.dto.AcGlMProfitLossSumBatIO;
import bankware.corebanking.accounting.generalledger.interfaces.Coa;
import bankware.corebanking.accounting.journalizing.interfaces.Acctg;
import bankware.corebanking.actor.department.interfaces.DeptMngr;
import bankware.corebanking.actor.staff.interfaces.StaffMngr;
import bankware.corebanking.applicationcommon.commondata.interfaces.CmnContext;
import bankware.corebanking.applicationcommon.commondata.interfaces.DateCalculator;
import bankware.corebanking.applicationcommon.utility.interfaces.DateUtils;
import bankware.corebanking.context.CbbApplicationContext;
import bankware.corebanking.core.accounting.constant.CAC01;
import bankware.corebanking.core.accounting.enums.BsisDscdEnum;
import bankware.corebanking.core.accounting.enums.ClsgDscdEnum;
import bankware.corebanking.core.accounting.generalledger.interfaces.dto.CoaDtlIO;
import bankware.corebanking.core.actor.department.interfaces.dto.DeptSrchGetIn;
import bankware.corebanking.core.actor.department.interfaces.dto.DeptSrchGetOut;
import bankware.corebanking.core.actor.staff.interfaces.dto.StaffLoinHstIO;
import bankware.corebanking.core.applicationcommon.constant.CCM01;
import bankware.corebanking.frm.app.BizApplicationException;
import bankware.corebanking.systemcommon.batch.interfaces.BatchJobExctn;
import bankware.corebanking.systemcommon.batch.interfaces.dto.BatchJobExctnHstryIO;
import bankware.corebanking.systemcommon.enums.BatchJobExctnStsCdEnum;
import bxm.common.annotaion.BxmCategory;
import bxm.common.util.StringUtils;
import bxm.container.annotation.BxmBean;

/**
 * @file         bankware.corebanking.accounting.generalledger.batch.GlDcddCashCryng.java
 * @filetype     java source file
 * @brief
 * @author       Yoonyeong Ha
 * @version      0.1
 * @history
 * <pre>
 * 버전          				성명                  			 일자              			변경내용
 * -------       ----------------       -----------       -----------------
 * 0.1           Yoonyeong Ha       	2017. 04. 10.       	신규 작성
 * </pre>
 */

@BxmBean("GlDcddCashCryng")
@Scope("step")
@BxmCategory(logicalName = "GlDcddCashCryng", description = "Generalledger Decided Cash Carrying Batch")
public class GlDcddCashCryng implements Tasklet {
	final Logger logger = LoggerFactory.getLogger(this.getClass());
	
	private CmnContext			cmnContext;
	private AcTlrTxSumnDBat 	acTlrTxSumnDBat;	
	private DateCalculator   	dateCalculator;
	private AcGlMBat			acGlMBat;
	private Acctg			acctg;
	private Coa					coa;
    private StaffMngr 			staffMngr;				
	private BatchJobExctn		batchJobExctn;			
    private DeptMngr 			deptMngr;

	
    private String 				instCd;
    private String 				jobDt;
    private String				prcsDt;
    private String 				fwrdDt;
    private List<String> 		loginNDeptList = new ArrayList<String>();


    private final BigDecimal ZERO = BigDecimal.ZERO;
    
	@Override
	public RepeatStatus execute(StepContribution arg0, ChunkContext arg1) throws Exception {
		/*
		 * [총계정원장 확정 및 이월, 텔러거래집계명세 이월 배치]
		 * 
		 * 1. 입력데이터 검증 
		 * 	- 필수입력항목 체크 : 기관코드, 작업일자
		 * 	- 날짜유효성 검증 : jobDt 형식, jobDt <= transaction date 인지 확인(미래일자로는 불가능)
		 * 	- 이월, 확정 기준일자는 작업일자의 전일(bfDt)로 세팅
		 * 
		 * 2. 텔러거래집계명세 이월
		 * 	2.1 전일자의 텔러거래집계명세(ac_tlr_tx_sumn_d)를 조회한다.
		 *  2.2 전일자의 bizDtCrncyAmt를 이월일자의 bfBizDtCrncyAmt, bizDtCrncyAmt로 세팅하여 익일(nxtDt)로 이월한다.
		 *  
		 * 3. 총계정원장 확정 및 이월
		 * 	3.1 확정일(작업일자의 전일) 전점 합계정보 삭제한다.
		 * 	3.2 확정일 , 실계정이 아닌 계정과목코드의 잔액을 모두 0으로 셋팅한다.
		 * 	3.3 양변계정 확정처리(ex:본지점거래)
		 * 		3.3.1 처리대상 양변계정 잔액 조회(차변계정잔액/대변계정잔액/차액)
		 * 			- 전영업일 차변잔액 조회(for 양변계정확정 여부 확인)
		 * 			- 확정일 차변잔액 조회
		 * 			- 확정일 대변잔액 조회
		 * 			차액이 양수일 때(차변계정잔액>대변계정잔액)
		 * 				1) 전일자 차변계정으로 확정된 경우
		 * 					- 차변계정 계리잔액은 전일 차변계리잔액 + (확정일 출금금액 - 확정일 입금금액)
		 * 				2) 전일자 대변계정으로 확정된 경우
		 * 					- 대변계정 계리잔액 0으로 만들어주면서 출금처리
		 * 					- 차변계정 계리잔액과 출금금액에서 대변계리잔액 차감
		 * 				3) 신규지점
		 * 					- 당일자 차변계리잔액으로 확정
		 * 			차액이 음수일 때(차변계정잔액<대변계정잔액)
		 * 				1) 전일자 차변계정으로 확정된 경우
		 * 					- 확정일자 차변잔액을 0으로 만들어주면서 입금처리
		 * 					- 대변 계리잔액에는 확정일 차변 계리잔액을 차감하고,
		 * 					    입금금액에는 차변당일발생 입금금액에서 전일계리잔액을 차감하여 setting, 출금금액에는 차변당일발생 출금금액 setting
		 *				2) 전일자 대변계정으로 확정된 경우 
		 *					- 대변계리잔액에서 확정일 계리잔액 차감, 차변의 입출금 금액은 대변의 입출금 금액으로 setting
		 *					- 차변계정 관련 금액은 모두 0으로 setting
		 * 	3.4 손실이익금 처리(계정과목분류코드가 05[수익], 06[비용]인 것)
		 * 		3.4.1 손실금, 이익금 합계를 조회한다.
		 * 		3.4.2 손실금과 이익금의 차를 계산한다.
		 *			손실금이 더 큰 경우
		 *				- 계정과목코드 : 당기순손실, 계리잔액 : 손실금합계 - 이익금합계
		 *			이익금이 더 큰 경우
		 *				- 계정과목코드 : 당기순이익, 계리잔액 : 이익금합계 - 손실금합계
		 *		3.4.3 계정과목코드를 읽어서 차대변코드를 셋팅한다.
		 *		3.4.4 손실금/이익금 계정을 갱신한다.
		 *	3.5 실계정 확정처리
		 *		3.5.1 실계정의 계리잔액을 조회한다.
		 *		3.5.2 확정일자에 이월되어 있는 누계액, 평잔에서 확정일자의 입지급금액과 계리잔액을 감안하여 확정일자 실계정 관련 금액을 재산출하여 업데이트한다.
		 *																				  (※A,B,C,D,E,F 금액은 전일에 확정되어 이월되어 있는 금액)
		 *			ex)[차변] 계리잔액		입금금액		출금금액		월중입금적수	월중출금적수	기중입금적수	기중출금적수	계리월중적수	계리기중적수
		 *				-------------------------------------------------------------------------------------------------------------
		 *					 300		 700		1,000		 A+700		 B+1,000	  C+700		 D+1,000	 E+300		 F+300	
		 *	3.6 실계정의 상위계정 확정
		 *		3.6.1 총계정원장에서 실계정의 상위계정이 있는지 확인
		 *			상위계정이 존재하지 않는 경우
		 *				- 실계정의 금액을 상위계정과목의 금액으로 set하여 insert한다.
		 *			상위계정이 존재하는 경우
		 *				- 기존재하는 상위계정과목 관련금액에 add 하여 update한다.
		 *		→ 상위계정의 상위계정이 없을 때까지 반복한다.(재귀호출)
		 *	3.7 총계정원장에서 로그일련번호가 0이 아닌 데이터를 모두 삭제한다.
		 *	3.8 전점합계처리
		 *		3.8.1 위에서 확정된 총계정원장을 바탕으로 확정일의 전점합계처리를 진행한다.(deptId : 999)
		 *	3.9 총계정원장 이월처리
		 *		3.9.1 연초일 경우(1월 1일)
		 *			- 월중입금적수, 월중출금적수, 기중입금적수, 기중출금적수, 계리월중적수, 계리기중적수를 0으로 셋팅한다.
		 *		3.9.2 영업일자 이월
		 *			월초일 경우
		 *				- 월중입금적수, 월중출금적수, 계리월중적수를 0으로 셋팅한다.
		 *			월초가 아닐 경우
		 *				- 확정 금액을 그대로 이월한다.
		 *		3.9.3 총계정원장 이월
		 *			이월일의 원장 내역이 없을 경우 : insert
		 *			이월일의 원장 내역이 있을 경우 : update(마감후 거래가 있을 경우 익일처리를 하기 때문에 원장내역이 있을 수 있기 때문에 기 존재하는 금액에 add하여 update한다.)
		 */	
				
		instCd = (String)arg1.getStepContext().getJobExecutionContext().get("instCd");
//		jobDt = (String)arg1.getStepContext().getJobExecutionContext().get("jobDt"); // 작업일자값 입력받았을 경우 
		jobDt = _getCmnContext().getTxDate(); // 일배치 돌리는 시점 (일자전환 후)
//		jobDt = "20170514"; // 일배치 돌리는 시점 (일자전환 후)
		
		prcsDt = _getDateCalculator().calculateDate(jobDt).getBfDt(); // 이월 기준일자(= 확정일자, 배치실행 전일자)
		fwrdDt = jobDt; // 이월일자(= 배치실행일자)
		
		if(logger.isDebugEnabled()){
			logger.debug("## GlDcddCashCryng > Generalledger Decided Cash Carrying Batch > START!");
			logger.debug("## GlDcddCashCryng > instCd : {}", instCd);
			logger.debug("## GlDcddCashCryng > jobDt : {}", jobDt);
			logger.debug("## GlDcddCashCryng > prcsDt : {}", prcsDt);
			logger.debug("## GlDcddCashCryng > fwrdDt : {}", fwrdDt);
		}
		
//		// 배치실행일자 실행내역 확인 (COMPLETED일 경우 배치실행 skip)
		if(_checkBatchJobExctnHstry()) {
			return RepeatStatus.FINISHED;
		} 
		
		// 부서 최초로그인 확인 (텔러원장, 총계정원장 이월여부 확인)
		if (!_checkDeptFirstLogin()) {
			return RepeatStatus.FINISHED;
		}
		
		// 1. 입력데이터 검증
		_checkInputData();
		
		// 2. 텔러집계명세 이월
		_cryngTlrTxSumnD();
		
		// 3. 총계정원장 확정 및 이월
		_glDcsnCryng();
		
		
		if(logger.isDebugEnabled()){
			logger.debug("## GlDcddCashCryng > Generalledger Decided Cash Carrying Batch > END!");
		}
		return RepeatStatus.FINISHED;
	}

	private boolean _checkDeptFirstLogin() throws BizApplicationException {
		/*
		 * 1. 해당기관의 부점 목록을 조회한다.
		 * 2. 기관의 배치실행일 로그인 목록을 조회한다.
		 * 	2.1 전부점이 최초로그인 했을 경우 : 해당기관 전 부점 원장 이월 실행 완료 > false >> 원장이월 필요 없음 : 종료
		 * 	2.2 일부부점만 최초로그인 했을 경우 : 해당기관 일부 부점 원장 이월 실행 완료 > true
		 * 	2.3 전부점이 최초로그인을 하지 않았을 경우 : 해당기관 전 부점 원장 이월 실행 미완료 > true
		 */

		boolean chk = false;
		
		DeptSrchGetIn deptSrchGetIn = new DeptSrchGetIn();
		List<DeptSrchGetOut> deptList = new ArrayList<DeptSrchGetOut>();
		deptSrchGetIn.setInstCd(this.instCd);
		
		// 해당 기관의 부점 목록을 조회 한다.
		deptList = _getDeptMngr().getListDept(deptSrchGetIn);
		if(logger.isDebugEnabled()) {
			logger.debug("## _checkDeptFirstLogin > deptList : {} ", deptList);
		}
		
		if(deptList.isEmpty()) {
			return chk;
		}
		
		// 배치기동시점 기관의 로그인 히스토리 확인
		List<StaffLoinHstIO> txDtInstLoinHistoryList = _getStaffMngr().getListStaffLoginHistory(instCd, null, null, jobDt, null, CAC01.YES, null, null);
		
		if(!txDtInstLoinHistoryList.isEmpty()) {
			
			for(DeptSrchGetOut deptSrchGetOut : deptList) {
				// 배치기동시점 부점의 로그인 히스토리 확인
				List<StaffLoinHstIO> txDtStaffLoinHistoryList = _getStaffMngr().getListStaffLoginHistory(instCd, null, null, jobDt, deptSrchGetOut.getDeptId(), CAC01.YES, null, null);
				
				if(!txDtStaffLoinHistoryList.isEmpty()) {
					if(logger.isDebugEnabled()) {
						logger.debug("## _checkDeptFirstLogin > 최초 로그인 완료 > deptId : {} ", deptSrchGetOut.getDeptId());
					}
				} else {
					if(logger.isDebugEnabled()) {
						logger.debug("## _checkDeptFirstLogin > 최초 로그인 미완료 > deptId : {} ", deptSrchGetOut.getDeptId());
					}
					loginNDeptList.add(deptSrchGetOut.getDeptId());		
				}
			}	
			
			if(loginNDeptList.isEmpty()) {
				if(logger.isDebugEnabled()) {
					logger.debug("## GlDcddCashCryng > 해당기관 전 부서 최초로그인 완료");
				}
				chk = false;
//				return RepeatStatus.FINISHED;
			} else {
				if(logger.isDebugEnabled()) {
					logger.debug("## GlDcddCashCryng > 해당기관 일부 부서 최초로그인 완료");
				}
				chk = true;
			} 
		} else {
			
			if(logger.isDebugEnabled()) {
				logger.debug("## GlDcddCashCryng > 해당기관 전부서 최초로그인 미완료");
			}
			
			loginNDeptList = new ArrayList<String>();
			for (DeptSrchGetOut deptSrchGetOut : deptList) {
				loginNDeptList.add(deptSrchGetOut.getDeptId());
			}
			
			if(logger.isDebugEnabled()) {
				logger.debug("## GlDcddCashCryng > 최초로그인 미완료 부서 목록(전부서) : {} ", loginNDeptList);
			}
			
			chk = true;
		}

		return chk;
		
	}

	/**
	 * Check Institution First Login Y/N
	 * 기관의 최초로그인 여부 확인
	 * @return boolean
	 * @throws BizApplicationException
	 */
	private boolean _checkInstFirstLogin() throws BizApplicationException {
		
		// 배치기동시점 로그인 히스토리 확인
		List<StaffLoinHstIO> txDtStaffLoinHistoryList = _getStaffMngr().getListStaffLoginHistory(instCd, null, null, jobDt, null, CAC01.YES, null, null);
				
		if(!txDtStaffLoinHistoryList.isEmpty()) {
			
			if(logger.isDebugEnabled()) {
				logger.debug("## GlDcddCashCryng > _checkInstFirstLogin > TRUE");
			}
			
			return true;
		}
		
		if(logger.isDebugEnabled()) {
			logger.debug("## GlDcddCashCryng > _checkInstFirstLogin > FALSE");
		}
		
		return false;
	}

	/**
	 * Check Batch Job Execution History
	 * 배치 실행내역 확인
	 * @return boolean
	 * @throws BizApplicationException
	 */
	private boolean _checkBatchJobExctnHstry() throws BizApplicationException {
		
		boolean chk = false;

		// 배치기동 성공여부 확인
		BatchJobExctnHstryIO historyIn = new BatchJobExctnHstryIO();
		historyIn.setInstCd(instCd);
		historyIn.setBatchJobExctnStartDt(jobDt);
		historyIn.setBatchJobExctnStartHms(CCM01.MIN_TIME);
		historyIn.setBatchJobExctnEndHms(CCM01.MAX_TIME);
		historyIn.setBatchJobId("GlDcddCashCryng");
				
		// Call institution batch job execution BO
		List<BatchJobExctnHstryIO> historyList = _getBatchJobExctn().getBatchJobHistory(historyIn);
		
		if(!historyList.isEmpty()) {
			
			for(BatchJobExctnHstryIO batchJobExctnHstryIO : historyList) {
				if(logger.isDebugEnabled()) {
					logger.debug("## GlDcddCashCryng > batchJobExctnHstryIO.getBatchJobEndStsCd() {}", batchJobExctnHstryIO.getBatchJobEndStsCd());
				}
				if(batchJobExctnHstryIO.getBatchJobEndStsCd().equals(BatchJobExctnStsCdEnum.COMPLETED.getValue())) {
					chk = true;
					if(logger.isDebugEnabled()) {
						logger.debug("## GlDcddCashCryng > BatchJobExctnSts > COMPLETED"); 
					}

					
					break;
				}
			}
		} else {
			
			if(logger.isDebugEnabled()) {
				logger.debug("## GlDcddCashCryng > BatchJobExctnSts > NOT RUN || NOT COMPLETED");
			}
		}
		
		return chk;
	}

	/**
	 * General Ledger Decision Carrying
	 * 총계정원장 확정, 이월
	 * @throws BizApplicationException 
	 */
	private void _glDcsnCryng() throws BizApplicationException {
		if(logger.isDebugEnabled()){
			logger.debug("## GlDcddCashCryng > _glDcsnCryng > START");
		}
		
		for(String deptId : loginNDeptList) {
			
			if(logger.isDebugEnabled()) {
				logger.debug("## GlDcddCashCryng > _glDcsnCryng > deptId : {}", deptId);
			}
			
			// 확정하는 맨마지막 부서가 전점합계정보 삭제
			if(CAC01.HEAD_QUARTER.equals(deptId)) {
				// 1. 확정일 전점 합계정보 삭제 (전점부서식별자 : 999)
				_deleteEntrBrnchSum();
			}

			// 2. 실계정이 아닌 계정과목코드의 잔액을 모두 clear
			_clearNotRealTitlAcctgItmCd(deptId);
			
			// 3. 양변계정 확정처리
			_decideBothSideAccountingBal(deptId);
			
			// 4. 손실금이익금 처리
			_processProfitLossAccountingBal(deptId);
			
			// 5. 실계정 확정처리
			_processRealTitlYn(deptId);
			
			// 6. 상위계정 확정처리(실계정인것만)
			_processUpAcctgItmCd(deptId);
			
			// 7. 총계정원장에서 로그일련번호가 0이 아닌 것 모두 삭제
			_deleteByLogSeqNbr(deptId);
			
			// 확정하는 맨마지막 부서가 전점합계처리
			if(CAC01.HEAD_QUARTER.equals(deptId)) {
				// 8. 전점합계 처리
				_processEntireBranchSum();
			}
			
			// 9. 총계정원장 이월 처리
			_generalledgerProcessCarryingForward(deptId);
			
		}
		
		if(logger.isDebugEnabled()){
			logger.debug("## GlDcddCashCryng > _glDcsnCryng > END");
		}
	}
	
	/**
	 * Delete Entire Branch Sum
	 * 전점합계정보 삭제
	 */
	private void _deleteEntrBrnchSum() {
		if(logger.isDebugEnabled()){
			logger.debug("## GlDcddCashCryng > _deleteEntrBrnchSum > START");
		}
		
		_getAcGlMBat().deleteEntrBrnchSum(instCd, prcsDt, CAC01.TOT_ACCTG_DEPARTMENT);
		
		if(logger.isDebugEnabled()){
			logger.debug("## GlDcddCashCryng > _deleteEntrBrnchSum > END");
		}
	}

	private void _generalledgerProcessCarryingForward(String deptId) throws BizApplicationException {
		
		if(logger.isDebugEnabled()){
			logger.debug("## GlDcddCashCryng > _generalledgerProcessCarryingForward > START");
		}

		// 이월처리 대상 조회
		AcGlMCrygFrwrdBatIO acGlMCrygFrwrdBatIO = new AcGlMCrygFrwrdBatIO();
		_getCmnContext().setHeaderColumn(acGlMCrygFrwrdBatIO);
		
		acGlMCrygFrwrdBatIO.setInstCd(instCd);
		acGlMCrygFrwrdBatIO.setBaseDt(prcsDt);	
		acGlMCrygFrwrdBatIO.setNxtDt(fwrdDt);
		acGlMCrygFrwrdBatIO.setDeptId(deptId);
		
		if(logger.isDebugEnabled()){
			logger.debug("## GlDcddImpl > 이월처리 대상건 조회 Start");
		}
		
		// 이월처리 대상건 조회
		List<AcGlMBatIO> acGlMBatIOList = _getAcGlMBat().selectCrygFrwrdTgt(acGlMCrygFrwrdBatIO);
		
		for (AcGlMBatIO acGlMIO : acGlMBatIOList) {

			// 총계정원장 등록(원장내역이 없으면 insert, 있으면 update - 마감후 거래가 있을 경우 익일처리를 하기 때문에 원장내역이 있을 수 있음)
			AcGlMBatIO fwrdGlMIO = new AcGlMBatIO();
			fwrdGlMIO = _getCarryingForwardData(acGlMIO, fwrdDt);
			
			int cnt = _getAcGlMBat().updateCrygFrwrdTgt(fwrdGlMIO);
			if(cnt == 0){
				_getAcGlMBat().insert(fwrdGlMIO);
			}
		}
		
		if(logger.isDebugEnabled()){
			logger.debug("## GlDcddCashCryng > _generalledgerProcessCarryingForward > END");
		}
	}

	private AcGlMBatIO _getCarryingForwardData(AcGlMBatIO inAcGlMBatIO, String fwrdDt) throws BizApplicationException {
		
		// 해당연도의 첫영업일을 구하기 위함
		String firstDate = "0101";
		String calcYrFirstBizDt = fwrdDt.substring(0, 4) + firstDate; 
		// 해당연도 연초 영업일
	//				String yrFirstBizDt = _getDateCalculator().calculateDateBusiness(calcYrFirstBizDt).getBizDt();
		String yrFirstBizDt = calcYrFirstBizDt;
		
		// 해당월의 첫영업일을 구하기 위함
		String firstDay = "01";
		String calMnthFirstBizDt = fwrdDt.substring(0, 6) + firstDay; 
		// 월초 영업일
	//				String mnthFirstBizDt = _getDateCalculator().calculateDateBusiness(calMnthFirstBizDt).getBizDt();
		String mnthFirstBizDt = calMnthFirstBizDt;
		
		// 확정일 년도(20161231 > 2016)
		String thisYr = prcsDt.substring(0, 4);
		// 이월일 년도(20170101 > 2017)
		String nxtYr = fwrdDt.substring(0, 4);
	
		if(logger.isDebugEnabled()){
			logger.debug("## GlDcdd > calcYrFirstBizDt : {} ", calcYrFirstBizDt);
			logger.debug("## GlDcdd > calMnthFirstBizDt : {} ", calMnthFirstBizDt);
			logger.debug("## GlDcdd > Year First Business Date : {} ", yrFirstBizDt);
			logger.debug("## GlDcdd > Month First Business Date : {} ", mnthFirstBizDt);
			logger.debug("## GlDcdd > thisYr : {} ", thisYr);
			logger.debug("## GlDcdd > nxtYr : {} ", nxtYr);
		}
		
		AcGlMBatIO acGlMBatIO = _getNewAcGlMBatIO(inAcGlMBatIO);
		acGlMBatIO.setBaseDt(fwrdDt);
		
		/*
		 * 휴일 감안해서 계리월중적수, 계리기중적수 set 
		 * 확정일의 익일이 휴일일 경우, 이월일(확정일의 익영업일)이 될 때까지 계리잔액을 계리월중적수와 계리기중적수에 더한다
		 * 예) 
		 * 		계리잔액	계리월중적수	계리기중적수
		 * 금	1000	1000		1000
		 * ----------------------------------
		 * 토			2000		2000
		 * 일			3000		3000
		 * ----------------------------------
		 * 월	1000	3000		3000
		 * 
		 */
		String nxtDt = _getDateCalculator().calculateDate(prcsDt).getNxtDt();
		
		if(!thisYr.equals(nxtYr)){ // 확정일 년도와 이월일의 년도가 다르면 계리월중/계리기중적수의 잔액을 0으로 clear 해준다.
			if(logger.isDebugEnabled()){
				logger.debug("## GlDcddImpl > _getCarryingForwardData > 연초영업일 > 계리월중/기중적수 0");
			}
			inAcGlMBatIO.setDmnthMnyRcvdAcmltdAmt(ZERO);
			inAcGlMBatIO.setDmnthWhdrwlAcmltdAmt(ZERO);
			inAcGlMBatIO.setDtrmMnyRcvdAcmltdAmt(ZERO);
			inAcGlMBatIO.setDtrmWhdrwlAcmltdAmt(ZERO);
			inAcGlMBatIO.setAcctgDmnthAcmltdAmt(ZERO); // 계리월중적수
			inAcGlMBatIO.setAcctgDtrmAcmltdAmt(ZERO); // 계리기중적수
		}else if(nxtDt.equals(calMnthFirstBizDt)){ // 확정일의 익일이 월초(X월 1일)일 경우, 계리월중적수의 잔액을 0으로 clear 
			if(logger.isDebugEnabled()){
				logger.debug("## GlDcddImpl > _getCarryingForwardData > 월초영업일 > 계리월중적수 0");
			}
			inAcGlMBatIO.setDmnthMnyRcvdAcmltdAmt(ZERO);      //월중입금적수
			inAcGlMBatIO.setDmnthWhdrwlAcmltdAmt(ZERO);      //월중출금적수
			inAcGlMBatIO.setAcctgDmnthAcmltdAmt(ZERO); // 계리월중적수
		}
		
		acGlMBatIO.setAcctgBal(inAcGlMBatIO.getAcctgBal());	
		acGlMBatIO.setExBal(inAcGlMBatIO.getExBal());
		acGlMBatIO.setDtrmMnyRcvdAcmltdAmt(inAcGlMBatIO.getDtrmMnyRcvdAcmltdAmt());     //기중입금적수
		acGlMBatIO.setDtrmWhdrwlAcmltdAmt(inAcGlMBatIO.getDtrmWhdrwlAcmltdAmt());     //기중출금적수
		acGlMBatIO.setDmnthMnyRcvdAcmltdAmt(inAcGlMBatIO.getDmnthMnyRcvdAcmltdAmt());   //월중입금적수
		acGlMBatIO.setDmnthWhdrwlAcmltdAmt(inAcGlMBatIO.getDmnthWhdrwlAcmltdAmt());   //월중출금적수
		acGlMBatIO.setAcctgDmnthAcmltdAmt(inAcGlMBatIO.getAcctgDmnthAcmltdAmt());  //계리월중적수
		acGlMBatIO.setAcctgDtrmAcmltdAmt(inAcGlMBatIO.getAcctgDtrmAcmltdAmt());	//계리기중적수
		
/*		
		if(yrFirstBizDt.equals(nxtDt)){
			if(logger.isDebugEnabled()){
				logger.debug("## GlDcddImpl > 연초영업일");
			}
			// BSIS구분코드가 IS일때, 계정의 모든 금액을 0으로 셋팅(IS계정은 1년단위로 끊기 때문에)
			
			acGlMBatIO.setAcctgBal(inAcGlMBatIO.getAcctgBal()); // 계리잔액
			acGlMBatIO.setExBal(inAcGlMBatIO.getExBal()); // 환산잔액
			
//			String cashchkAcctgItmCd = _getAcctg().getAccountingItemCode(AcctgItmEnum.CASH_CHECK); // 대체계정
//			AcGlMBatIO cashchkAcGlMIO = new AcGlMBatIO();
//			
//			_getCmnContext().setHeaderColumn(cashchkAcGlMIO);
//			
//			cashchkAcGlMIO.setInstCd(inAcGlMBatIO.getInstCd());
//			cashchkAcGlMIO.setDeptId(inAcGlMBatIO.getDeptId());
//			cashchkAcGlMIO.setBaseDt(inAcGlMBatIO.getBaseDt());
//			cashchkAcGlMIO.setAcctgDscd(inAcGlMBatIO.getAcctgDscd());
//			cashchkAcGlMIO.setAcctgItmCd(cashchkAcctgItmCd);
//			cashchkAcGlMIO.setCrncyCd(inAcGlMBatIO.getCrncyCd());
//			_clearAmount(cashchkAcGlMIO);
//			
////						// 계정과목코드를 읽어서 차변대변구분코드 set
//			CoaDtlIO coaDtlIO = _getCoa().getCoa(instCd, inAcGlMBatIO.getAcctgDscd(), cashchkAcctgItmCd);
//			cashchkAcGlMIO.setDebitCrdtDscd(coaDtlIO.getDebitCrdtDscd());
//			
//			cashchkAcGlMIO.setBaseDt(nxtDt);
//			
//			// 차변일 경우 월중출금적수, 기중출금적수에 계리잔액 SET
//			if(DbtcdtdscdEnum.DEBIT.getValue().equals(inAcGlMBatIO.getDebitCrdtDscd())){
//				acGlMBatIO.setBlkWhdrwlAmt(inAcGlMBatIO.getAcctgBal());
//				acGlMBatIO.setDmnthWhdrwlAcmltdAmt(inAcGlMBatIO.getAcctgBal()); // 월중출금적수
//				acGlMBatIO.setDtrmWhdrwlAcmltdAmt(inAcGlMBatIO.getAcctgBal()); // 기중출금적수
//				
//				cashchkAcGlMIO.setBlkMnyRcvdAmt(inAcGlMBatIO.getAcctgBal());
//				cashchkAcGlMIO.setDmnthMnyRcvdAcmltdAmt(inAcGlMBatIO.getAcctgBal()); // 월중입금적수
//				cashchkAcGlMIO.setDtrmMnyRcvdAcmltdAmt(inAcGlMBatIO.getAcctgBal()); // 기중입금적수
//				
//			}
//			// 대변일 경우 월중입금적수, 기중입금적수에 계리잔액 SET
//			else{
//				acGlMBatIO.setBlkMnyRcvdAmt(inAcGlMBatIO.getAcctgBal());
//				acGlMBatIO.setDmnthMnyRcvdAcmltdAmt(inAcGlMBatIO.getAcctgBal()); // 월중입금적수
//				acGlMBatIO.setDtrmMnyRcvdAcmltdAmt(inAcGlMBatIO.getAcctgBal()); // 기중입금적수
//				
//				cashchkAcGlMIO.setBlkWhdrwlAmt(inAcGlMBatIO.getAcctgBal());
//				cashchkAcGlMIO.setDmnthWhdrwlAcmltdAmt(inAcGlMBatIO.getAcctgBal()); // 월중출금적수
//				cashchkAcGlMIO.setDtrmWhdrwlAcmltdAmt(inAcGlMBatIO.getAcctgBal()); // 기중출금적수
//			}
			
			// TODO 이월하려는 날짜가 1월 1일인 경우, 계리월중적수의 잔액은 계리잔액?
//			acGlMBatIO.setAcctgDmnthAcmltdAmt(inAcGlMBatIO.getAcctgDmnthAcmltdAmt().add(inAcGlMBatIO.getAcctgBal()));	// 계리월중적수
//			acGlMBatIO.setAcctgDtrmAcmltdAmt(inAcGlMBatIO.getAcctgDtrmAcmltdAmt().add(inAcGlMBatIO.getAcctgBal()));	// 계리기중적수			
			acGlMBatIO.setAcctgDmnthAcmltdAmt(inAcGlMBatIO.getAcctgDmnthAcmltdAmt());	// 계리월중적수
			acGlMBatIO.setAcctgDtrmAcmltdAmt(inAcGlMBatIO.getAcctgDtrmAcmltdAmt());	// 계리기중적수			

//			// 대체계정은 따로 update
//			int updateCnt = 0;
//			updateCnt = _getAcGlMBat().updateCrygFrwrdTgt(cashchkAcGlMIO);
//			if(updateCnt == 0){
//				_getAcGlMBat().insert(cashchkAcGlMIO);
//			}
		}else{
			// 영업일자 이월			
			acGlMBatIO.setAcctgBal(inAcGlMBatIO.getAcctgBal());	
			acGlMBatIO.setExBal(inAcGlMBatIO.getExBal());
			acGlMBatIO.setDtrmMnyRcvdAcmltdAmt(inAcGlMBatIO.getDtrmMnyRcvdAcmltdAmt());     //기중입금적수
			acGlMBatIO.setDtrmWhdrwlAcmltdAmt(inAcGlMBatIO.getDtrmWhdrwlAcmltdAmt());     //기중출금적수
			acGlMBatIO.setAcctgDtrmAcmltdAmt(inAcGlMBatIO.getAcctgDtrmAcmltdAmt());	//계리기중적수
			
//			//이월시작일이 월초일인 경우
//			if(mnthFirstBizDt.equals(nxtDt)){
//				if(logger.isDebugEnabled()){
//					logger.debug("## GlDcddImpl > 월초 이월");
//				}
//				acGlMBatIO.setDmnthMnyRcvdAcmltdAmt(ZERO);      //월중입금적수
//				acGlMBatIO.setDmnthWhdrwlAcmltdAmt(ZERO);      //월중출금적수
//				acGlMBatIO.setAcctgDmnthAcmltdAmt(ZERO);  //계리월중적수
//			}
//			else {
				acGlMBatIO.setDmnthMnyRcvdAcmltdAmt(inAcGlMBatIO.getDmnthMnyRcvdAcmltdAmt());   //월중입금적수
				acGlMBatIO.setDmnthWhdrwlAcmltdAmt(inAcGlMBatIO.getDmnthWhdrwlAcmltdAmt());   //월중출금적수
				acGlMBatIO.setAcctgDmnthAcmltdAmt(inAcGlMBatIO.getAcctgDmnthAcmltdAmt());  //계리월중적수
//			}		
		}*/		
		
		return acGlMBatIO;
	}

	private AcGlMBatIO _getNewAcGlMBatIO(AcGlMBatIO inAcGlMBatIO) throws BizApplicationException {
		AcGlMBatIO acGlMBatIO = new AcGlMBatIO();
		
		_getCmnContext().setHeaderColumn(acGlMBatIO);
		
		acGlMBatIO.setInstCd(inAcGlMBatIO.getInstCd());
		acGlMBatIO.setDeptId(inAcGlMBatIO.getDeptId());
		acGlMBatIO.setBaseDt(inAcGlMBatIO.getBaseDt());
		acGlMBatIO.setAcctgDscd(inAcGlMBatIO.getAcctgDscd());
		acGlMBatIO.setAcctgItmCd(inAcGlMBatIO.getAcctgItmCd());
		acGlMBatIO.setCrncyCd(inAcGlMBatIO.getCrncyCd());
		_clearAmount(acGlMBatIO);
		
//		// 계정과목코드를 읽어서 차변대변구분코드 set
		CoaDtlIO coaDtlIO = _getCoa().getCoa(instCd,inAcGlMBatIO.getAcctgDscd(),inAcGlMBatIO.getAcctgItmCd());
		acGlMBatIO.setDebitCrdtDscd(coaDtlIO.getDebitCrdtDscd());
		
		return acGlMBatIO;
	
	}

	private void _processEntireBranchSum() throws BizApplicationException {
		if(logger.isDebugEnabled()){
			logger.debug("## GlDcddCashCryng > _processEntireBranchSum > START");
		}

		AcGlMBatIO acGlMBatIO = new AcGlMBatIO();

		acGlMBatIO.setInstCd(instCd);
		acGlMBatIO.setBaseDt(prcsDt);
		acGlMBatIO.setDeptId(CAC01.TOT_ACCTG_DEPARTMENT);

		// 전점 합계 조회
		List<AcGlMBatIO> acGlMList = _getAcGlMBat().selectEntrBrnchSum(instCd, prcsDt);

		for (AcGlMBatIO sumAcGlMBatIO : acGlMList){

			acGlMBatIO = new AcGlMBatIO();
			_getCmnContext().setHeaderColumn(acGlMBatIO);

			acGlMBatIO.setInstCd(instCd);
			acGlMBatIO.setDeptId(CAC01.TOT_ACCTG_DEPARTMENT);
			acGlMBatIO.setBaseDt(prcsDt);
			acGlMBatIO.setAcctgDscd(sumAcGlMBatIO.getAcctgDscd());// set [회계구분코드]
			acGlMBatIO.setAcctgItmCd(sumAcGlMBatIO.getAcctgItmCd());// set [계정과목코드]
			acGlMBatIO.setDebitCrdtDscd(sumAcGlMBatIO.getDebitCrdtDscd());// set [차대변구분코드]
			acGlMBatIO.setCrncyCd(sumAcGlMBatIO.getCrncyCd());// set [통화코드]
			acGlMBatIO.setAcctgBal(sumAcGlMBatIO.getAcctgBal());// set [계리잔액]
			acGlMBatIO.setExBal(sumAcGlMBatIO.getExBal());// set [환산잔액]
			acGlMBatIO.setBlkMnyRcvdAmt(sumAcGlMBatIO.getBlkMnyRcvdAmt());// set [흑서입금금액]
			acGlMBatIO.setBlkWhdrwlAmt(sumAcGlMBatIO.getBlkWhdrwlAmt());// set [흑서출금금액]
			acGlMBatIO.setRedMnyRcvdAmt(sumAcGlMBatIO.getRedMnyRcvdAmt());// set [적서입금금액]
			acGlMBatIO.setRedWhdrwlAmt(sumAcGlMBatIO.getRedWhdrwlAmt());// set [적서출금금액]
			acGlMBatIO.setDmnthMnyRcvdAcmltdAmt(sumAcGlMBatIO.getDmnthMnyRcvdAcmltdAmt());// set [월중입금적수]
			acGlMBatIO.setDmnthWhdrwlAcmltdAmt(sumAcGlMBatIO.getDmnthWhdrwlAcmltdAmt());// set [월중출금적수]
			acGlMBatIO.setDtrmMnyRcvdAcmltdAmt(sumAcGlMBatIO.getDtrmMnyRcvdAcmltdAmt());// set [기중입금적수]
			acGlMBatIO.setDtrmWhdrwlAcmltdAmt(sumAcGlMBatIO.getDtrmWhdrwlAcmltdAmt());// set [기중출금적수]
			acGlMBatIO.setAcctgDmnthAcmltdAmt(sumAcGlMBatIO.getAcctgDmnthAcmltdAmt());// set [계리월중적수]
			acGlMBatIO.setAcctgDtrmAcmltdAmt(sumAcGlMBatIO.getAcctgDtrmAcmltdAmt());// set [계리기중적수]
			acGlMBatIO.setLogSeqNbr(ZERO);

			_getAcGlMBat().insert(acGlMBatIO);
		}
		
		if(logger.isDebugEnabled()){
			logger.debug("## GlDcddCashCryng > _processEntireBranchSum > END");
		}
	}

	/**
	 * Delete by Log Sequence Number
	 * 로그일련번호가 0이 아닌 데이터 삭제
	 * @param deptId 
	 */
	private void _deleteByLogSeqNbr(String deptId) {
		
		if(logger.isDebugEnabled()){
			logger.debug("## GlDcddCashCryng > _deleteByLogSeqNbr > START");
		}

		int updateCnt = _getAcGlMBat().deleteByLogSeqNbr(instCd, deptId, null, null, null, prcsDt);
		if(updateCnt == 0) return ;
		
		if(logger.isDebugEnabled()){
			logger.debug("## GlDcddCashCryng > _deleteByLogSeqNbr > END");
		}
	}

	/**
	 * Process Up Accounting Item Code
	 * 상위계정 확정 처리
	 * @param deptId 
	 * @throws BizApplicationException 
	 */
	private void _processUpAcctgItmCd(String deptId) throws BizApplicationException {
		
		if(logger.isDebugEnabled()){
			logger.debug("## GlDcddCashCryng > _processUpAcctgItmCd > START");
		}
		
		List<String> acctgItmCdList = new ArrayList<String>();
		for(AcctgItmEnum value : AcctgItmEnum.values()) {
			if(!AcctgItmEnum.ASSET_TOTAL.equals(value)
					&& !AcctgItmEnum.LIABILITY_TOTAL.equals(value)
					&& !AcctgItmEnum.CAPITAL_TOTAL.equals(value)
					&& !AcctgItmEnum.LOSS_TOTAL.equals(value)
					&& !AcctgItmEnum.PROFIT_TOTAL.equals(value)
					) {
				
				String acctgItmCd = _getAcctg().getAccountingItemCode(value.getValue());
				
				if(!StringUtils.isEmpty(acctgItmCd)) {
					acctgItmCdList.add(acctgItmCd);
				}
			}
		}

		// 계정과목코드별 계리잔액
		List<AcGlMBatIO> acctgItmList = new ArrayList<AcGlMBatIO>();

		if(logger.isDebugEnabled()){
			logger.debug("## GlDcsn > 실계정 목록 조회 Start");
		}
		// 실계정 목록 조회
		acctgItmList = _getAcGlMBat().selectListByAcctgItmCd(instCd, deptId, prcsDt, acctgItmCdList, CAC01.YES, null, null); // 계정과목코드별 계리잔액

		if(acctgItmList.isEmpty()){ 
			if(logger.isDebugEnabled()){
				logger.debug("## GlDcsn > 실계정목록 없음");
			}
		} else {
			for(AcGlMBatIO glMBatI : acctgItmList) {
				glMBatI.setUpAcctgItmCd(_getUpAcctgItmCd(glMBatI.getAcctgItmCd())); // 상위 설정
				_setParentAcctgItm(glMBatI);
			}
		}
		
		if(logger.isDebugEnabled()){
			logger.debug("## GlDcddCashCryng > _processUpAcctgItmCd > END");
		}
	}

	/**
	 * Set Parent Accounting Item Code
	 * 상위계정과목코드 통합
	 * @param baseGlMBatIO
	 * @throws BizApplicationException
	 */
	private void _setParentAcctgItm(AcGlMBatIO baseGlMBatIO) throws BizApplicationException {
		
		// 해당 계정과목에 상위 계정이 없지 않으면 실행
		if(!StringUtils.isEmpty(baseGlMBatIO.getUpAcctgItmCd())) {
			AcGlMBatIO glMBat = new AcGlMBatIO();

			AcGlMBatIO prevAcGlMBatIO = new AcGlMBatIO();

			// 총계정원장에 상위계정과목코드가 있는지 확인한다.
			prevAcGlMBatIO = _getAcGlMBat().select(instCd, baseGlMBatIO.getDeptId(), prcsDt, baseGlMBatIO.getAcctgDscd(), 
					baseGlMBatIO.getUpAcctgItmCd(),baseGlMBatIO.getCrncyCd(), CAC01.STR_ZERO);

			// 상위계정과목코드가 없으면
			if(prevAcGlMBatIO == null) {

				glMBat = new AcGlMBatIO();
				_setUpAcctgItmCdBaseInfo(glMBat, baseGlMBatIO);

				glMBat.setAcctgBal(baseGlMBatIO.getAcctgBal());// set [계리잔액]
				glMBat.setExBal(baseGlMBatIO.getExBal());// set [환산잔액]
				glMBat.setBlkMnyRcvdAmt(baseGlMBatIO.getBlkMnyRcvdAmt());// set [흑서입금금액]
				glMBat.setBlkWhdrwlAmt(baseGlMBatIO.getBlkWhdrwlAmt());// set [흑서출금금액]
				glMBat.setRedMnyRcvdAmt(baseGlMBatIO.getRedMnyRcvdAmt());// set [적서입금금액]
				glMBat.setRedWhdrwlAmt(baseGlMBatIO.getRedWhdrwlAmt());// set [적서출금금액]
				glMBat.setDmnthMnyRcvdAcmltdAmt(baseGlMBatIO.getDmnthMnyRcvdAcmltdAmt());// set [월중입금적수]
				glMBat.setDmnthWhdrwlAcmltdAmt(baseGlMBatIO.getDmnthWhdrwlAcmltdAmt());// set [월중출금적수]
				glMBat.setDtrmMnyRcvdAcmltdAmt(baseGlMBatIO.getDtrmMnyRcvdAcmltdAmt());// set [기중입금적수]
				glMBat.setDtrmWhdrwlAcmltdAmt(baseGlMBatIO.getDtrmWhdrwlAcmltdAmt());// set [기중출금적수]
				glMBat.setAcctgDmnthAcmltdAmt(baseGlMBatIO.getAcctgDmnthAcmltdAmt());// set [계리월중적수]
				glMBat.setAcctgDtrmAcmltdAmt(baseGlMBatIO.getAcctgDtrmAcmltdAmt());// set [계리기중적수]

				_getAcGlMBat().insert(glMBat);

				glMBat.setUpAcctgItmCd(_getUpAcctgItmCd(glMBat.getAcctgItmCd())); // 상위계정과목코드의 상위계정과목코드를 set
			}
			// 상위 계정과목코드가 이미 존재하면 있는 것에다가 add				
			else if(prevAcGlMBatIO.getAcctgItmCd().equals(baseGlMBatIO.getUpAcctgItmCd()) 
					 && prevAcGlMBatIO.getInstCd().equals(baseGlMBatIO.getInstCd())
					 && prevAcGlMBatIO.getDeptId().equals(baseGlMBatIO.getDeptId())
					 && prevAcGlMBatIO.getBaseDt().equals(baseGlMBatIO.getBaseDt())
					 && prevAcGlMBatIO.getAcctgDscd().equals(baseGlMBatIO.getAcctgDscd())
					 && prevAcGlMBatIO.getCrncyCd().equals(baseGlMBatIO.getCrncyCd())) {

				glMBat = new AcGlMBatIO();
				_setUpAcctgItmCdBaseInfo(glMBat, baseGlMBatIO);
				
				glMBat.setAcctgBal(prevAcGlMBatIO.getAcctgBal().add(baseGlMBatIO.getAcctgBal()));// set [계리잔액]
				glMBat.setExBal(prevAcGlMBatIO.getExBal().add(baseGlMBatIO.getExBal()));// set [환산잔액]
				glMBat.setBlkMnyRcvdAmt(prevAcGlMBatIO.getBlkMnyRcvdAmt().add(baseGlMBatIO.getBlkMnyRcvdAmt()));// set [흑서입금금액]
				glMBat.setBlkWhdrwlAmt(prevAcGlMBatIO.getBlkWhdrwlAmt().add(baseGlMBatIO.getBlkWhdrwlAmt()));// set [흑서출금금액]
				glMBat.setRedMnyRcvdAmt(prevAcGlMBatIO.getRedMnyRcvdAmt().add(baseGlMBatIO.getRedMnyRcvdAmt()));// set [적서입금금액]
				glMBat.setRedWhdrwlAmt(prevAcGlMBatIO.getRedWhdrwlAmt().add(baseGlMBatIO.getRedWhdrwlAmt()));// set [적서출금금액]
				glMBat.setDmnthMnyRcvdAcmltdAmt(prevAcGlMBatIO.getDmnthMnyRcvdAcmltdAmt().add(baseGlMBatIO.getDmnthMnyRcvdAcmltdAmt()));// set [월중입금적수]
				glMBat.setDmnthWhdrwlAcmltdAmt(prevAcGlMBatIO.getDmnthWhdrwlAcmltdAmt().add(baseGlMBatIO.getDmnthWhdrwlAcmltdAmt()));// set [월중출금적수]
				glMBat.setDtrmMnyRcvdAcmltdAmt(prevAcGlMBatIO.getDtrmMnyRcvdAcmltdAmt().add(baseGlMBatIO.getDtrmMnyRcvdAcmltdAmt()));// set [기중입금적수]
				glMBat.setDtrmWhdrwlAcmltdAmt(prevAcGlMBatIO.getDtrmWhdrwlAcmltdAmt().add(baseGlMBatIO.getDtrmWhdrwlAcmltdAmt()));// set [기중출금적수]
				glMBat.setAcctgDmnthAcmltdAmt(prevAcGlMBatIO.getAcctgDmnthAcmltdAmt().add(baseGlMBatIO.getAcctgDmnthAcmltdAmt()));// set [계리월중적수]
				glMBat.setAcctgDtrmAcmltdAmt(prevAcGlMBatIO.getAcctgDtrmAcmltdAmt().add(baseGlMBatIO.getAcctgDtrmAcmltdAmt()));// set [계리기중적수]

				int cnt = _getAcGlMBat().update(glMBat);
				if(cnt == 0){
					// 등록에 실패했습니다.
					throw new BizApplicationException("AAPACE1002");
				}
				
				// 원금액을 상위로 계속 + 해야 하기때문에 원금액으로 다시 변경
				glMBat.setUpAcctgItmCd(_getUpAcctgItmCd(glMBat.getAcctgItmCd())); // 상위 추가
				glMBat.setAcctgBal(baseGlMBatIO.getAcctgBal());// set [계리잔액]
				glMBat.setExBal(baseGlMBatIO.getExBal());// set [환산잔액]
				glMBat.setBlkMnyRcvdAmt(baseGlMBatIO.getBlkMnyRcvdAmt());// set [흑서입금금액]
				glMBat.setBlkWhdrwlAmt(baseGlMBatIO.getBlkWhdrwlAmt());// set [흑서출금금액]
				glMBat.setRedMnyRcvdAmt(baseGlMBatIO.getRedMnyRcvdAmt());// set [적서입금금액]
				glMBat.setRedWhdrwlAmt(baseGlMBatIO.getRedWhdrwlAmt());// set [적서출금금액]
				glMBat.setDmnthMnyRcvdAcmltdAmt(baseGlMBatIO.getDmnthMnyRcvdAcmltdAmt());// set [월중입금적수]
				glMBat.setDmnthWhdrwlAcmltdAmt(baseGlMBatIO.getDmnthWhdrwlAcmltdAmt());// set [월중출금적수]
				glMBat.setDtrmMnyRcvdAcmltdAmt(baseGlMBatIO.getDtrmMnyRcvdAcmltdAmt());// set [기중입금적수]
				glMBat.setDtrmWhdrwlAcmltdAmt(baseGlMBatIO.getDtrmWhdrwlAcmltdAmt());// set [기중출금적수]
				glMBat.setAcctgDmnthAcmltdAmt(baseGlMBatIO.getAcctgDmnthAcmltdAmt());// set [계리월중적수]
				glMBat.setAcctgDtrmAcmltdAmt(baseGlMBatIO.getAcctgDtrmAcmltdAmt());// set [계리기중적수]
			}
			// 있으면 재귀호출하여 상위를 계속 조회 및 합산한다.
			_setParentAcctgItm(glMBat);
		}
	}

	/**
	 * Set Up Accounting Item Code Base Information
	 * 상위계정과목코드 기본정보 셋팅
	 * @param glMBat
	 * @param baseGlMBatIO
	 * @throws BizApplicationException
	 */
	private void _setUpAcctgItmCdBaseInfo(AcGlMBatIO glMBat, AcGlMBatIO baseGlMBatIO) throws BizApplicationException {
		
		_getCmnContext().setHeaderColumn(glMBat);

		glMBat.setInstCd(baseGlMBatIO.getInstCd());// set [기관코드]
		glMBat.setDeptId(baseGlMBatIO.getDeptId());// set [부서식별자]
		glMBat.setBaseDt(baseGlMBatIO.getBaseDt());// set [기준년월일]
		glMBat.setAcctgDscd(baseGlMBatIO.getAcctgDscd());// set [회계구분코드]
		glMBat.setAcctgItmCd(baseGlMBatIO.getUpAcctgItmCd());// set [계정과목코드]
		glMBat.setCrncyCd(baseGlMBatIO.getCrncyCd());// set [통화코드]
		glMBat.setBsisDscd(baseGlMBatIO.getBsisDscd());// set [BSIS구분코드]
		glMBat.setDebitCrdtDscd(baseGlMBatIO.getDebitCrdtDscd());// set [차대변구분코드]
		glMBat.setLogSeqNbr(ZERO);// set [로그일련번호]
	}

	private String _getUpAcctgItmCd(String acctgItmCd) {
		String upAcctgItmCd = null;
		upAcctgItmCd = _getAcGlMBat().selectUpAcctgItmCd(instCd, acctgItmCd);

		return StringUtils.isEmpty(upAcctgItmCd) ? null : upAcctgItmCd;
	}

	/**
	 * Process Real Title Accounting Item Code
	 * 실계정과목코드 확정
	 * @param deptId 
	 * @throws BizApplicationException
	 */
	private void _processRealTitlYn(String deptId) throws BizApplicationException {
		if(logger.isDebugEnabled()){
			logger.debug("## GlDcddCashCryng > _processRealTitlYn > START");
		}
		
		List<AcGlMBatIO> prcsDtAcctgItmList = new ArrayList<AcGlMBatIO>();

		List<String> acctgItmCdList = new ArrayList<String>();
		for(AcctgItmEnum value : AcctgItmEnum.values()) {
			if(!AcctgItmEnum.ASSET_TOTAL.equals(value)
					&& !AcctgItmEnum.LIABILITY_TOTAL.equals(value)
					&& !AcctgItmEnum.CAPITAL_TOTAL.equals(value)
					&& !AcctgItmEnum.LOSS_TOTAL.equals(value)
					&& !AcctgItmEnum.PROFIT_TOTAL.equals(value)
					) {
				acctgItmCdList.add(_getAcctg().getAccountingItemCode(value.getValue()));
			}
		}
		// 확정일 실계정 목록 조회
		prcsDtAcctgItmList = _getAcGlMBat().selectListByAcctgItmCd(instCd, deptId, prcsDt, acctgItmCdList, CAC01.YES, null, null); // 계정과목코드별 계리잔액

		for(AcGlMBatIO acGlMIO : prcsDtAcctgItmList){
			
//			BigDecimal mnyRcvdAmt = acGlMIO.getBlkMnyRcvdAmt().subtract(acGlMIO.getRedWhdrwlAmt()); // 확정일 입금금액 = 확정일 흑서입금금액 - 확정일 주서출금금액
//			BigDecimal drwgOutAmt = acGlMIO.getBlkWhdrwlAmt().subtract(acGlMIO.getRedMnyRcvdAmt()); // 확정일 출금금액 = 확정일 흑서출금금액 - 확정일 주서입금금액

			AcGlMBatIO glMBatIO = new AcGlMBatIO(); 
			_getCmnContext().setHeaderColumn(glMBatIO);
			_clearAmount(glMBatIO);
			
			glMBatIO.setInstCd(instCd);
			glMBatIO.setDeptId(acGlMIO.getDeptId());
			glMBatIO.setBaseDt(prcsDt);
			glMBatIO.setAcctgDscd(acGlMIO.getAcctgDscd());
			glMBatIO.setAcctgItmCd(acGlMIO.getAcctgItmCd());
			glMBatIO.setCrncyCd(acGlMIO.getCrncyCd());
			glMBatIO.setLogSeqNbr(ZERO);
			glMBatIO.setDebitCrdtDscd(acGlMIO.getDebitCrdtDscd());
			
			glMBatIO.setAcctgBal(acGlMIO.getAcctgBal());
			glMBatIO.setExBal(acGlMIO.getExBal());
			glMBatIO.setBlkMnyRcvdAmt(acGlMIO.getBlkMnyRcvdAmt());
			glMBatIO.setBlkWhdrwlAmt(acGlMIO.getBlkWhdrwlAmt());
			glMBatIO.setRedMnyRcvdAmt(acGlMIO.getRedMnyRcvdAmt());
			glMBatIO.setRedWhdrwlAmt(acGlMIO.getRedWhdrwlAmt());
			
			CoaDtlIO coaDtlIO = _getCoa().getCoa(instCd, glMBatIO.getAcctgDscd(), glMBatIO.getAcctgItmCd());
			
			// BS일 때만 평잔 설정
			if(BsisDscdEnum.BS.getValue().equals(coaDtlIO.getBsisDscd())){
				glMBatIO.setDmnthMnyRcvdAcmltdAmt(acGlMIO.getDmnthMnyRcvdAcmltdAmt().add(acGlMIO.getBlkMnyRcvdAmt().subtract(acGlMIO.getRedWhdrwlAmt())));// 월중입금적수(확정일)+{흑서입금금액(확)-주서출금금액(확)}
				glMBatIO.setDmnthWhdrwlAcmltdAmt(acGlMIO.getDmnthWhdrwlAcmltdAmt().add(acGlMIO.getBlkWhdrwlAmt().subtract(acGlMIO.getRedMnyRcvdAmt())));// 월중출금적수(확정일)+{흑서출금금액(확)-주서입금금액(확)}
				glMBatIO.setDtrmMnyRcvdAcmltdAmt(acGlMIO.getDtrmMnyRcvdAcmltdAmt().add(acGlMIO.getBlkMnyRcvdAmt().subtract(acGlMIO.getRedWhdrwlAmt())));// 기중입금적수(확정일)+{흑서입금금액(확)-주서출금금액(확)}
				glMBatIO.setDtrmWhdrwlAcmltdAmt(acGlMIO.getDtrmWhdrwlAcmltdAmt().add(acGlMIO.getBlkWhdrwlAmt().subtract(acGlMIO.getRedMnyRcvdAmt())));// 기중출금적수(확정일)+{흑서출금금액(확)-주서입금금액(확)}
				glMBatIO.setAcctgDmnthAcmltdAmt(acGlMIO.getAcctgDmnthAcmltdAmt().add(acGlMIO.getAcctgBal()));// 계리월중적수(확정일)+계리잔액(확정일)
				glMBatIO.setAcctgDtrmAcmltdAmt(acGlMIO.getAcctgDtrmAcmltdAmt().add(acGlMIO.getAcctgBal()));// 계리기중적수(확정일)+계리잔액(확정일)
			}else{
				if(logger.isDebugEnabled()){
					logger.debug("##GlDcsn > IS계정 누계액, 평잔 X");
				}
			}
			
			int updateCnt = _getAcGlMBat().update(glMBatIO);
			if(updateCnt == 0){
				_getAcGlMBat().insert(glMBatIO);
			}
			updateCnt = _getAcGlMBat().deleteByLogSeqNbr(instCd, acGlMIO.getDeptId(), acGlMIO.getAcctgDscd(), acGlMIO.getAcctgItmCd(), acGlMIO.getCrncyCd(), prcsDt);
		}
		
		if(logger.isDebugEnabled()){
			logger.debug("## GlDcddCashCryng > _processRealTitlYn > END");
		}
	}

	private void _processProfitLossAccountingBal(String deptId) throws BizApplicationException {
		if(logger.isDebugEnabled()){
			logger.debug("## GlDcddCashCryng > _processProfitLossAccountingBal > START");
		}

		List<AcGlMProfitLossSumBatIO> profitLossSumOutList = _getAcGlMBat().selectProfitLossSum(instCd, prcsDt, deptId);
		int updateCnt = 0;
		
		if (profitLossSumOutList.isEmpty()){
			return;
		}

		AcGlMBatIO profitLossAcGlMIO = new AcGlMBatIO();
		_getCmnContext().setHeaderColumn(profitLossAcGlMIO);

		profitLossAcGlMIO.setInstCd(instCd);
		profitLossAcGlMIO.setLogSeqNbr(ZERO);

		for (AcGlMProfitLossSumBatIO profitLossSumOut : profitLossSumOutList) {
			updateCnt = 0;
			
			profitLossAcGlMIO.setInstCd(instCd);
			profitLossAcGlMIO.setDeptId(profitLossSumOut.getDeptId());
			profitLossAcGlMIO.setBaseDt(profitLossSumOut.getBaseDt());
			profitLossAcGlMIO.setAcctgDscd(profitLossSumOut.getAcctgDscd());
			profitLossAcGlMIO.setCrncyCd(profitLossSumOut.getCrncyCd());

			_clearAmount(profitLossAcGlMIO);

			// 4.2 손실금 이익금의 차를 계산한다.
			// 손실금이 더 큰 경우 (계정과목구분코드:당기순손실/계리잔액:손실금-이익금)
			if (profitLossSumOut.getLossAmt().compareTo(profitLossSumOut.getPrftAmt()) > 0){
				profitLossAcGlMIO.setAcctgItmCd(_getAcctg().getAccountingItemCode(AcctgItmEnum.NET_LOSS_THIS_TERM.getValue()));   //당기순손실
				profitLossAcGlMIO.setAcctgBal(profitLossSumOut.getLossAmt().subtract(profitLossSumOut.getPrftAmt()));
			}else{
				// 이익금이 더 큰 경우(계정과목구분코드:당기순이익/계리잔액:이익금-손실금)
				profitLossAcGlMIO.setAcctgItmCd(_getAcctg().getAccountingItemCode(AcctgItmEnum.NET_PROFIT_THIS_TERM.getValue()));   //당기순이익
				profitLossAcGlMIO.setAcctgBal(profitLossSumOut.getPrftAmt().subtract(profitLossSumOut.getLossAmt()));
			}

			// 4.3 계정과목코드를 읽어서 차변대변구분코드 set
			CoaDtlIO coaDtlIO = _getCoa().getCoa(profitLossAcGlMIO.getInstCd(),profitLossAcGlMIO.getAcctgDscd(),profitLossAcGlMIO.getAcctgItmCd());
			profitLossAcGlMIO.setDebitCrdtDscd(coaDtlIO.getDebitCrdtDscd());			

			if(logger.isDebugEnabled()){
				logger.debug("## GlDcddCashCryng > _processProfitLossAccountingBal > profitLossSumOut.getLossAmt() :{}",profitLossSumOut.getLossAmt());
				logger.debug("## GlDcddCashCryng > _processProfitLossAccountingBal > profitLossSumOut.getPrftAmt() :{}",profitLossSumOut.getPrftAmt());
				logger.debug("## GlDcddCashCryng > _processProfitLossAccountingBal > profitLossAcGlMIO.getAcctgBal() :{}",profitLossAcGlMIO.getAcctgBal());
			}

			// 손실금/이익금 계정 갱신
			updateCnt = _getAcGlMBat().update(profitLossAcGlMIO);
			if(updateCnt == 0){
				_getAcGlMBat().insert(profitLossAcGlMIO);
			}
			
			if(logger.isDebugEnabled()){
				logger.debug("## GlDcddCashCryng > _processProfitLossAccountingBal > END");
			}
		}
	}

	/**
	 * Decide Both Side Accounting Item Code Balance
	 * 양변계정 잔액 확정
	 * @param deptId 
	 * @throws BizApplicationException
	 */
	private void _decideBothSideAccountingBal(String deptId) throws BizApplicationException {
		/*
		 * 1. 처리대상 양변계정 잔액 조회(차변계정잔액/대변계정잔액/차액)
		 * 		1) 전영업일 차변잔액 조회
		 * 		2) 확정일 차변잔액 조회
		 * 		3) 확정일 대변잔액 조회
		 * 2. 차액이 양수일 때(차변계정잔액>대변계정잔액)
		 * 		1) 전일자 차변계정으로 확정된 경우
		 * 			- 차변계정 계리잔액은 전일 차변계리잔액 + (확정일 출금금액 - 확정일 입금금액)
		 * 		1) 전일자 대변계정으로 확정된 경우
		 * 			- 대변계정 계리잔액 0으로 만들어주면서 출금처리
		 * 			- 차변계정 계리잔액과 출금금액에서 대변계리잔액 차감
		 * 		2) 신규지점
		 * 			- 당일자 차변계리잔액으로 확정
		 * 3. 차액이 음수일 때(차변계정잔액<대변계정잔액)
		 * 		1) 전일자 차변계정으로 확정된 경우
		 * 			- 확정일자 차변잔액을 0으로 만들어주면서 입금처리
		 * 			- 대변 계리잔액에는 확정일 차변 계리잔액을 차감하고,
		 * 			    입금금액에는 차변당일발생 입금금액에서 전일계리잔액을 차감하여 setting, 출금금액에는 차변당일발생 출금금액 setting
		 *		2) 전일자 대변계정으로 확정된 경우 
		 *			- 대변계리잔액에서 확정일 계리잔액 차감, 차변의 입출금 금액은 대변의 입출금 금액으로 setting
		 *			- 차변계정 관련 금액은 모두 0으로 setting
		 */
		
		if(logger.isDebugEnabled()){
			logger.debug("## GlDcddCashCryng > _decideBothSideAccountingBal > START");
		}
		
		String bfPrcsDt = _getDateCalculator().calculateDate(prcsDt).getBfDt(); // 확정일의 전일
		int updateCnt = 0;
		
		// 처리대상 양변계정잔액 조회
		List<AcGlMBtsdAcctgItmBalBatIO> btsdAcctgItmBalList = _getAcGlMBat().selectListBtsdAcctgItmBal(instCd, prcsDt, deptId);
		
		
		for (AcGlMBtsdAcctgItmBalBatIO btsdAcctgItmBal : btsdAcctgItmBalList){
			// 전영업일 차변잔액 조회
			AcGlMBatIO bfDbtLogSeqNbrZero = _getAcGlMBat().select(btsdAcctgItmBal.getInstCd(), btsdAcctgItmBal.getDeptId(), bfPrcsDt, btsdAcctgItmBal.getAcctgDscd(), 
					btsdAcctgItmBal.getAcctgItmCd(), btsdAcctgItmBal.getCrncyCd(), CAC01.STR_ZERO);
			
			// 확정일 차변잔액 조회
			AcGlMBatIO dbtAcGlMBatIO = _getAcGlMBat().selectAmtSum(instCd, btsdAcctgItmBal.getDeptId(), prcsDt, btsdAcctgItmBal.getAcctgDscd(), btsdAcctgItmBal.getAcctgItmCd(), btsdAcctgItmBal.getCrncyCd());
			
			// 확정일 대변잔액 조회
			AcGlMBatIO cdtAcGlMBatIO = _getAcGlMBat().selectAmtSum(instCd, btsdAcctgItmBal.getDeptId(), prcsDt, btsdAcctgItmBal.getAcctgDscd(), btsdAcctgItmBal.getRltdAcctgItmCd(), btsdAcctgItmBal.getCrncyCd());
			
			if(cdtAcGlMBatIO == null){
				cdtAcGlMBatIO = _setCdtAcGlMBatIO(btsdAcctgItmBal);
			}
			
			_getCmnContext().setHeaderColumn(dbtAcGlMBatIO);
			_getCmnContext().setHeaderColumn(cdtAcGlMBatIO);
			
			dbtAcGlMBatIO.setLogSeqNbr(ZERO);
			cdtAcGlMBatIO.setLogSeqNbr(ZERO);
			
			BigDecimal mnyRcvdAmt = dbtAcGlMBatIO.getBlkMnyRcvdAmt().subtract(dbtAcGlMBatIO.getRedWhdrwlAmt()); // 차변입금금액
			BigDecimal drwgOutAmt = dbtAcGlMBatIO.getBlkWhdrwlAmt().subtract(dbtAcGlMBatIO.getRedMnyRcvdAmt()); // 차변출금금액
			
			// 차액이 양수인 경우
			if(btsdAcctgItmBal.getDfrncBal().compareTo(ZERO) >= 0){
				
				// 전일자 차변계정 확정
				if(bfDbtLogSeqNbrZero != null && bfDbtLogSeqNbrZero.getAcctgBal().compareTo(ZERO) != 0) {
					if(logger.isDebugEnabled()){
						logger.debug("## GlDcddCashCryng > _decideBothSideAccountingBal > 차액 양수 > 전잔 차변");
					}
					dbtAcGlMBatIO.setAcctgBal(bfDbtLogSeqNbrZero.getAcctgBal().add(drwgOutAmt.subtract(mnyRcvdAmt)));
				}
				// 전일자 대변계정 확정
				else if(cdtAcGlMBatIO != null && cdtAcGlMBatIO.getAcctgBal().compareTo(ZERO) != 0) {
					if(logger.isDebugEnabled()){
						logger.debug("## GlDcddCashCryng > _decideBothSideAccountingBal > 차액 양수 > 전잔 대변");
					}
					dbtAcGlMBatIO.setAcctgBal(dbtAcGlMBatIO.getAcctgBal().subtract(cdtAcGlMBatIO.getAcctgBal()));
					dbtAcGlMBatIO.setExBal(dbtAcGlMBatIO.getExBal().subtract(cdtAcGlMBatIO.getExBal()));
					dbtAcGlMBatIO.setBlkWhdrwlAmt(dbtAcGlMBatIO.getBlkWhdrwlAmt().subtract(cdtAcGlMBatIO.getAcctgBal()));

					cdtAcGlMBatIO.setBlkMnyRcvdAmt(ZERO);
					cdtAcGlMBatIO.setBlkWhdrwlAmt(cdtAcGlMBatIO.getAcctgBal());
					cdtAcGlMBatIO.setRedMnyRcvdAmt(ZERO);
					cdtAcGlMBatIO.setRedWhdrwlAmt(ZERO);
					cdtAcGlMBatIO.setAcctgBal(ZERO);
					cdtAcGlMBatIO.setExBal(ZERO);
				}
				
				// 전일자 대변확정이 아닌경우 차변계정은 당일 금액 sum한 것을 업데이트 해주면 됨
				updateCnt = _getAcGlMBat().updateBtsdAcctgItmCd(dbtAcGlMBatIO);
				if(updateCnt == 0){
					_getAcGlMBat().insert(dbtAcGlMBatIO);
				}
				_getAcGlMBat().updateBtsdAcctgItmCd(cdtAcGlMBatIO);
				if(updateCnt == 0){
					_getAcGlMBat().insert(cdtAcGlMBatIO);
				}
			}
			// 차액이 음수인 경우
			else {
				
				if(logger.isDebugEnabled()){
					logger.debug("#@@@@# > 차액 음수 ");
				}
				
				// 전일자 차변계정으로 확정된 경우
				if(bfDbtLogSeqNbrZero != null && bfDbtLogSeqNbrZero.getAcctgBal().compareTo(ZERO) != 0){
					if(logger.isDebugEnabled()){
						logger.debug("## GlDcddCashCryng > _decideBothSideAccountingBal > 차액 음수 > 전잔 차변");
					}
					cdtAcGlMBatIO.setAcctgBal(ZERO.subtract(bfDbtLogSeqNbrZero.getAcctgBal().add(drwgOutAmt.subtract(mnyRcvdAmt))));
					cdtAcGlMBatIO.setExBal(ZERO.subtract(dbtAcGlMBatIO.getExBal()));
					cdtAcGlMBatIO.setBlkMnyRcvdAmt(dbtAcGlMBatIO.getBlkMnyRcvdAmt().subtract(bfDbtLogSeqNbrZero.getAcctgBal()));
					cdtAcGlMBatIO.setBlkWhdrwlAmt(dbtAcGlMBatIO.getBlkWhdrwlAmt());
					cdtAcGlMBatIO.setRedMnyRcvdAmt(dbtAcGlMBatIO.getRedMnyRcvdAmt());
					cdtAcGlMBatIO.setRedWhdrwlAmt(dbtAcGlMBatIO.getRedWhdrwlAmt());

					dbtAcGlMBatIO.setBlkMnyRcvdAmt(bfDbtLogSeqNbrZero.getAcctgBal());
					dbtAcGlMBatIO.setAcctgBal(ZERO);
					dbtAcGlMBatIO.setExBal(ZERO);
					dbtAcGlMBatIO.setBlkWhdrwlAmt(ZERO);
					dbtAcGlMBatIO.setRedMnyRcvdAmt(ZERO);
					dbtAcGlMBatIO.setRedWhdrwlAmt(ZERO);
				}
				// 전일자 대변으로 확정된 경우
				else if(cdtAcGlMBatIO != null && cdtAcGlMBatIO.getAcctgBal().compareTo(ZERO) != 0) {
					if(logger.isDebugEnabled()){
						logger.debug("## GlDcddCashCryng > _decideBothSideAccountingBal > 차액 음수 > 전잔 대변");
					}
					cdtAcGlMBatIO.setAcctgBal(cdtAcGlMBatIO.getAcctgBal().subtract(dbtAcGlMBatIO.getAcctgBal()));
					cdtAcGlMBatIO.setExBal(cdtAcGlMBatIO.getExBal().subtract(dbtAcGlMBatIO.getExBal()));
					cdtAcGlMBatIO.setBlkMnyRcvdAmt(dbtAcGlMBatIO.getBlkMnyRcvdAmt());
					cdtAcGlMBatIO.setBlkWhdrwlAmt(dbtAcGlMBatIO.getBlkWhdrwlAmt());
					cdtAcGlMBatIO.setRedMnyRcvdAmt(dbtAcGlMBatIO.getRedMnyRcvdAmt());
					cdtAcGlMBatIO.setRedWhdrwlAmt(dbtAcGlMBatIO.getRedWhdrwlAmt());

					dbtAcGlMBatIO.setAcctgBal(ZERO);
					dbtAcGlMBatIO.setExBal(ZERO);
					dbtAcGlMBatIO.setBlkMnyRcvdAmt(ZERO);
					dbtAcGlMBatIO.setBlkWhdrwlAmt(ZERO);
					dbtAcGlMBatIO.setRedMnyRcvdAmt(ZERO);
					dbtAcGlMBatIO.setRedWhdrwlAmt(ZERO);
				}
				else if(bfDbtLogSeqNbrZero == null || cdtAcGlMBatIO == null) {
					if(logger.isDebugEnabled()){
						logger.debug("## GlDcddCashCryng > _decideBothSideAccountingBal > 차액 음수 > 전잔 없음");
					}
					cdtAcGlMBatIO.setAcctgBal(ZERO.subtract(dbtAcGlMBatIO.getAcctgBal()));
					cdtAcGlMBatIO.setExBal(ZERO.subtract(dbtAcGlMBatIO.getExBal()));
					cdtAcGlMBatIO.setBlkMnyRcvdAmt(dbtAcGlMBatIO.getBlkMnyRcvdAmt());
					cdtAcGlMBatIO.setBlkWhdrwlAmt(dbtAcGlMBatIO.getBlkWhdrwlAmt());
					cdtAcGlMBatIO.setRedMnyRcvdAmt(dbtAcGlMBatIO.getRedMnyRcvdAmt());
					cdtAcGlMBatIO.setRedWhdrwlAmt(dbtAcGlMBatIO.getRedWhdrwlAmt());

					dbtAcGlMBatIO.setAcctgBal(ZERO);
					dbtAcGlMBatIO.setExBal(ZERO);
					dbtAcGlMBatIO.setBlkMnyRcvdAmt(ZERO);
					dbtAcGlMBatIO.setBlkWhdrwlAmt(ZERO);
					dbtAcGlMBatIO.setRedMnyRcvdAmt(ZERO);
					dbtAcGlMBatIO.setRedWhdrwlAmt(ZERO);
				}
				
				updateCnt = _getAcGlMBat().updateBtsdAcctgItmCd(cdtAcGlMBatIO);
				if(updateCnt == 0){
					_getAcGlMBat().insert(cdtAcGlMBatIO);
				}
				updateCnt = _getAcGlMBat().updateBtsdAcctgItmCd(dbtAcGlMBatIO);
				if(updateCnt == 0){
					_getAcGlMBat().insert(dbtAcGlMBatIO);
				}
			}
			// 로그일련번호가 0이 아닌 것 삭제(차변)하여 이후 실계정확정시에 문제 없도록
			_getAcGlMBat().deleteByLogSeqNbr(instCd, btsdAcctgItmBal.getDeptId(), btsdAcctgItmBal.getAcctgDscd(), btsdAcctgItmBal.getAcctgItmCd(), btsdAcctgItmBal.getCrncyCd(), prcsDt);
			_getAcGlMBat().deleteByLogSeqNbr(instCd, btsdAcctgItmBal.getDeptId(), btsdAcctgItmBal.getAcctgDscd(), btsdAcctgItmBal.getRltdAcctgItmCd(), btsdAcctgItmBal.getCrncyCd(), prcsDt);
		}
		
		if(logger.isDebugEnabled()){
			logger.debug("## GlDcddCashCryng > _decideBothSideAccountingBal > END");
		}
	}

	private AcGlMBatIO _setCdtAcGlMBatIO(AcGlMBtsdAcctgItmBalBatIO btsdAcctgItmBal) {
		AcGlMBatIO cdtAcGlMBatIO = new AcGlMBatIO();
		cdtAcGlMBatIO.setInstCd(btsdAcctgItmBal.getInstCd());
		cdtAcGlMBatIO.setDeptId(btsdAcctgItmBal.getDeptId());
		cdtAcGlMBatIO.setAcctgDscd(btsdAcctgItmBal.getAcctgDscd());
		cdtAcGlMBatIO.setAcctgItmCd(btsdAcctgItmBal.getRltdAcctgItmCd());
		cdtAcGlMBatIO.setCrncyCd(btsdAcctgItmBal.getCrncyCd());
		cdtAcGlMBatIO.setBaseDt(btsdAcctgItmBal.getBaseDt());
		_clearAmount(cdtAcGlMBatIO);
		
		return cdtAcGlMBatIO;
	}

	/**
	 * Clear Not Real Title Accounting Item Code
	 * 실계정 아닌 계정과목코드의 관련 잔액을 모두 0으로 설정
	 * @param deptId 
	 * @throws BizApplicationException
	 */
	private void _clearNotRealTitlAcctgItmCd(String deptId) throws BizApplicationException {
		if(logger.isDebugEnabled()){
			logger.debug("## GlDcddCashCryng > _clearNotRealTitlAcctgItmCd > START");
		}
		
		// 실계정이 아닌 계정과목코드 조회
		List<AcGlMBatIO> notRealTitlAcctgList = new ArrayList<AcGlMBatIO>();
		notRealTitlAcctgList = _getAcGlMBat().selectListNotRealTitlAcctg(instCd, prcsDt, deptId, null, CAC01.NO); // 계정과목코드별 계리잔액
		
		if(!notRealTitlAcctgList.isEmpty()){
			for(AcGlMBatIO glMBatIO : notRealTitlAcctgList){
				
				if(!glMBatIO.getAcctgItmCd().equals(_getAcctg().getAccountingItemCode(AcctgItmEnum.INTER_OFFICE.getValue())) // 본지점
						&& !glMBatIO.getAcctgItmCd().equals(_getAcctg().getAccountingItemCode(AcctgItmEnum.CASH.getValue())) // 통화
						&& !glMBatIO.getAcctgItmCd().equals(_getAcctg().getAccountingItemCode(AcctgItmEnum.CHECK.getValue())) // 자기앞
						&& !glMBatIO.getAcctgItmCd().equals(_getAcctg().getAccountingItemCode(AcctgItmEnum.OTHER_CHECK.getValue())) // 기타타점권
						&& !glMBatIO.getAcctgItmCd().equals(_getAcctg().getAccountingItemCode(AcctgItmEnum.CASH_CHECK.getValue())) // 현금
						&& !glMBatIO.getAcctgItmCd().equals(_getAcctg().getAccountingItemCode(AcctgItmEnum.FOREIGN_CASH.getValue())) // 외국통화
						&& !glMBatIO.getAcctgItmCd().equals(_getAcctg().getAccountingItemCode(AcctgItmEnum.LOSS.getValue())) // 손실
						&& !glMBatIO.getAcctgItmCd().equals(_getAcctg().getAccountingItemCode(AcctgItmEnum.PROFIT.getValue())) // 이익
						&& !glMBatIO.getAcctgItmCd().equals(_getAcctg().getAccountingItemCode(AcctgItmEnum.NET_PROFIT_THIS_TERM.getValue())) // 당기순이익
						&& !glMBatIO.getAcctgItmCd().equals(_getAcctg().getAccountingItemCode(AcctgItmEnum.BS_NET_PROFIT_THIS_TERM.getValue())) // 당기순이익
						&& !glMBatIO.getAcctgItmCd().equals(_getAcctg().getAccountingItemCode(AcctgItmEnum.NET_LOSS_THIS_TERM.getValue())) // 당기순손실
						){
					_clearAmount(glMBatIO);
					_getCmnContext().setHeaderColumn(glMBatIO);
					_getAcGlMBat().update(glMBatIO);
				}
			}		
		} else {
			if(logger.isDebugEnabled()){
				logger.debug("## GlDcddCashCryng > _clearNotRealTitlAcctgItmCd > 실계정 아닌 계정과목코드 없음");
			}
		}

		if(logger.isDebugEnabled()){
			logger.debug("## GlDcddCashCryng > _clearNotRealTitlAcctgItmCd > END");
		}
	}

	/**
	 * GL DTO Balance Clear
	 * @param inAcGlMBatIO
	 */
	private void _clearAmount(AcGlMBatIO inAcGlMBatIO) {
		
		inAcGlMBatIO.setAcctgBal(ZERO);
		inAcGlMBatIO.setExBal(ZERO);
		inAcGlMBatIO.setBlkMnyRcvdAmt(ZERO);
		inAcGlMBatIO.setBlkWhdrwlAmt(ZERO);
		inAcGlMBatIO.setRedMnyRcvdAmt(ZERO);
		inAcGlMBatIO.setRedWhdrwlAmt(ZERO);
		inAcGlMBatIO.setDmnthMnyRcvdAcmltdAmt(ZERO); 
		inAcGlMBatIO.setDmnthWhdrwlAcmltdAmt(ZERO);
		inAcGlMBatIO.setDtrmMnyRcvdAcmltdAmt(ZERO);
		inAcGlMBatIO.setDtrmWhdrwlAcmltdAmt(ZERO);
		inAcGlMBatIO.setAcctgDmnthAcmltdAmt(ZERO);
		inAcGlMBatIO.setAcctgDtrmAcmltdAmt(ZERO);		
		
	}

	/**
	 * Carrying Teller Transaction Summation
	 * 텔러집계명세 이월
	 * @throws BizApplicationException
	 */
	private void _cryngTlrTxSumnD() throws BizApplicationException {
		
		if(logger.isDebugEnabled()){
			logger.debug("## GlDcddCashCryng > _cryngTlrTxSumnD > START");
		}
		
		List<AcTlrTxSumnDBatInOut> tlrTxSumnDList = new ArrayList<AcTlrTxSumnDBatInOut>();
		
		// 텔러거래집계명세 목록 조회
		tlrTxSumnDList = _inqryTlrTxSumnDList();
		
		if(!tlrTxSumnDList.isEmpty()){
			// 텔러거래집계명세 목록 이월
			_cryngTlrTxSumnDList(tlrTxSumnDList);
		} else {
			if(logger.isDebugEnabled()){
				logger.debug("## GlDcddCashCryng > _cryngTlrTxSumnD > 이월할 텔러거래집계명세 목록 없음");
			}
		}
		
		if(logger.isDebugEnabled()){
			logger.debug("## GlDcddCashCryng > _cryngTlrTxSumnD > END");
		}
	}

	/**
	 * Carrying Teller Transaction Summation List(bfJobDt → jobDt)
	 * 텔러거래집계명세 이월(배치실행 전일 → 배치실행일)
	 * @param tlrTxSumnDList
	 * @throws BizApplicationException
	 */
	private void _cryngTlrTxSumnDList(List<AcTlrTxSumnDBatInOut> tlrTxSumnDList) throws BizApplicationException {
		int updateCnt = 0;
		
		for (AcTlrTxSumnDBatInOut inTemp : tlrTxSumnDList) {
			AcTlrTxSumnDBatInOut inDao = new AcTlrTxSumnDBatInOut();
			
			updateCnt = 0;
			
			_getCmnContext().setHeaderColumn(inDao);
			
			inDao.setInstCd(inTemp.getInstCd());// set [기관코드]
			inDao.setBaseDt(fwrdDt);// set [기준년월일]
			inDao.setDeptId(inTemp.getDeptId());// set [부서식별자]
			inDao.setStaffId(inTemp.getStaffId());// set [스태프식별자]
			inDao.setCrncyCd(inTemp.getCrncyCd());// set [통화코드]
			inDao.setLogSeqNbr(ZERO);// set [로그일련번호]
			inDao.setClsgBfafDscd(ClsgDscdEnum.CLSG_BF.getValue());// set [마감전후구분코드]
			inDao.setBfBizDtCrncyAmt(inTemp.getBizDtCrncyAmt());// set [전영업일통화금액]
			inDao.setBfBizDtChkAmt(ZERO);// set [전영업일타점금액]
			inDao.setBizDtCrncyAmt(inTemp.getBizDtCrncyAmt());// set [금영업일통화금액]
			inDao.setBizDtChkAmt(ZERO);// set [금영업일타점금액]
			inDao.setCashRcvdSlipCnt(ZERO);// set [현금입금전표매수]
			inDao.setCashRcvdAmt(ZERO);// set [현금입금금액]
			inDao.setCashWhdrwlSlipCnt(ZERO);// set [현금출금전표매수]
			inDao.setCashWhdrwlAmt(ZERO);// set [현금출금금액]
			inDao.setChkRcvdAmt(ZERO);// set [자기앞수표입금금액]
			inDao.setChkWhdrwlAmt(ZERO);// set [자기앞수표출금금액]
			inDao.setOthrChkRcvdAmt(ZERO);// set [기타타점권입금금액]
			inDao.setOthrChkWhdrwlAmt(ZERO);// set [기타타점권출금금액]
			inDao.setTrnsfrRcvdSlipCnt(ZERO);// set [대체입금전표매수]
			inDao.setTrnsfrRcvdAmt(ZERO);// set [대체입금금액]
			inDao.setTrnsfrWhdrwlSlipCnt(ZERO);// set [대체출금전표매수]
			inDao.setTrnsfrWhdrwlAmt(ZERO);// set [대체출금금액]
			inDao.setTrnsfrRcvdDmstcAmt(ZERO);// set [대체입금국내금액]
			inDao.setTrnsfrWhdrwlDmstcAmt(ZERO);// set [대체출금국내금액]
			inDao.setDfrncAdjstmntAmt(ZERO);// set [차액조정금액]
			inDao.setSndCashAmt(ZERO);// set [인도현금금액]
			inDao.setSndTrnsfrAmt(ZERO);// set [인도대체금액]
			inDao.setSndChkCnt(ZERO);// set [인도타점매수]
			inDao.setSndChkAmt(ZERO);// set [인도타점권금액]
			inDao.setRcvCashAmt(ZERO);// set [인수현금금액]
			inDao.setRcvTrnsfrAmt(ZERO);// set [인수대체금액]
			inDao.setRcvChkCnt(ZERO);// set [인수타점권매수]
			inDao.setRcvChkAmt(ZERO);// set [인수타점권금액]

			// 익일의 텔러집계명세내역이 존재할 경우, 익일의 금액에 이월할 금액을 합산한다.
			updateCnt = _getAcTlrTxSumnDBat().updateAmt(inDao);
			if (updateCnt == 0) {
				_getAcTlrTxSumnDBat().insert(inDao);
			}
		}
	}

	/**
	 * Inquire Teller Transaction Summation List(for Carrying)
	 * 텔러거래집계명세목록 조회
	 * @return
	 */
	private List<AcTlrTxSumnDBatInOut> _inqryTlrTxSumnDList() {
		
		List<AcTlrTxSumnDBatInOut> outList = new ArrayList<AcTlrTxSumnDBatInOut>();
		
		for(String deptId : loginNDeptList) {
			outList.addAll(_getAcTlrTxSumnDBat().selectList(instCd, prcsDt, deptId));
		}
		return outList;
	}


	/**
	 * Check Input Data
	 * 입력값 검증
	 * @throws BizApplicationException
	 */
	private void _checkInputData() throws BizApplicationException {
		if(logger.isDebugEnabled()){
			logger.debug("## GlDcddCashCryng > _checkInputData > START");
		}
		
		// 작업일자 검증
		_checkJobDt(jobDt, "jobDt");

		// 기관코드검증
		_checkMndtryVal(instCd, "instCd");
		
		if(logger.isDebugEnabled()){
			logger.debug("## GlDcddCashCryng > _checkInputData > END");
		}
	}

	/**
	 * Check Job Date
	 * 작업일자 검증
	 * @param date
	 * @param msg
	 * @throws BizApplicationException
	 */
	private void _checkJobDt(String date, String msg) throws BizApplicationException {
		// 날짜형식 유효성 검증
		if (!DateUtils.isValidDate(date)) {
			throw new BizApplicationException("AAPCME0001", new Object[] {"@".concat(msg) , date});
		}
		
		// 필수값 입력 검증
		_checkMndtryVal(date, "jobDt");		
		
		/*if(date.compareTo(_getCmnContext().getTxDate()) > 0 ){
			// 시스템일자보다 미래일자로 회계처리가 허용되지 않습니다.
			throw new BizApplicationException("AAPACE3044", null);
		}*/
	}

	/**
	 * Check Mandatory Value
	 * 필수값 검증
	 * @param strData
	 * @param msg
	 * @throws BizApplicationException
	 */
	private void _checkMndtryVal(String strData, String msg) throws BizApplicationException {
		if (StringUtils.isEmpty(strData)) {
			throw new BizApplicationException("AAPCME0006", new Object[] { "@"+msg });
		}
		
	}
	
	/**
	 * @return the cmnContext
	 */
	private CmnContext _getCmnContext() {
		if (cmnContext == null) {
			cmnContext = (CmnContext) CbbApplicationContext.getBean(CmnContext.class, cmnContext);
		}
		return cmnContext;
	} 
	
	/**
	 * @return the acTlrClsgDBat
	 */
	private AcTlrTxSumnDBat _getAcTlrTxSumnDBat() {
		if (acTlrTxSumnDBat == null) {
			acTlrTxSumnDBat = (AcTlrTxSumnDBat) CbbApplicationContext.getBean(AcTlrTxSumnDBat.class, acTlrTxSumnDBat);
		}
		return acTlrTxSumnDBat;
	}
	
	/**
	 * @return the dateCalculator
	 */
	private DateCalculator _getDateCalculator() {
		if (dateCalculator == null) {
			dateCalculator = (DateCalculator) CbbApplicationContext.getBean(
					DateCalculator.class, dateCalculator);
		}
		return dateCalculator;
	}
	
	/**
	 * @return the coa
	 */
	private AcGlMBat _getAcGlMBat() {
		if (acGlMBat == null) {
			acGlMBat = (AcGlMBat) CbbApplicationContext.getBean(AcGlMBat.class, acGlMBat);
		}
		return acGlMBat;
	}
	
	/**
	 * @return the acctg
	 */
	private Acctg _getAcctg() {
		if (acctg == null) {
			acctg = (Acctg) CbbApplicationContext.getBean(Acctg.class, acctg);
		}
		return acctg;
	}
	
	/**
	 * @return the coa
	 */
	private Coa _getCoa() {
		if (coa == null) {
			coa = (Coa) CbbApplicationContext.getBean(Coa.class, coa);
		}
		return coa;
	}
	
	/**
	 * @return the batchJobExctn
	 */
	private BatchJobExctn _getBatchJobExctn() {
		if (batchJobExctn == null) {
			batchJobExctn = (BatchJobExctn) CbbApplicationContext.getBean(
					BatchJobExctn.class, batchJobExctn);
		}
		return batchJobExctn;
	}
	
    /**
     * @return the staffMngr
     */
    private StaffMngr _getStaffMngr() {
        if (staffMngr == null) {
            staffMngr = (StaffMngr) CbbApplicationContext.getBean(StaffMngr.class, staffMngr);
        }
        return staffMngr;
    }
    
	/**
	 * @return the deptMngr
	 */
	private DeptMngr _getDeptMngr() {
		if (deptMngr == null) {
			deptMngr = (DeptMngr) CbbApplicationContext.getBean(DeptMngr.class, deptMngr);
		}
		return deptMngr;
	}
}