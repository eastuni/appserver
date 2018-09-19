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

import bankware.corebanking.accounting.enums.AcctgItmEnum;
import bankware.corebanking.accounting.generalledger.daobatch.AcGlMBat;
import bankware.corebanking.accounting.generalledger.daobatch.dto.AcGlMBatIO;
import bankware.corebanking.accounting.generalledger.daobatch.dto.AcGlMBtsdAcctgItmBalBatIO;
import bankware.corebanking.accounting.generalledger.daobatch.dto.AcGlMCrygFrwrdBatIO;
import bankware.corebanking.accounting.generalledger.daobatch.dto.AcGlMProfitLossSumBatIO;
import bankware.corebanking.accounting.generalledger.interfaces.Coa;
import bankware.corebanking.accounting.journalizing.interfaces.Acctg;
import bankware.corebanking.applicationcommon.commondata.interfaces.CmnContext;
import bankware.corebanking.applicationcommon.commondata.interfaces.DateCalculator;
import bankware.corebanking.applicationcommon.utility.interfaces.DateUtils;
import bankware.corebanking.context.CbbApplicationContext;
import bankware.corebanking.core.accounting.constant.CAC01;
import bankware.corebanking.core.accounting.enums.BsisDscdEnum;
import bankware.corebanking.core.accounting.enums.DbtcdtdscdEnum;
import bankware.corebanking.core.accounting.generalledger.interfaces.dto.CoaDtlIO;
import bankware.corebanking.frm.app.BizApplicationException;
import bxm.common.annotaion.BxmCategory;
import bxm.common.util.StringUtils;
import bxm.container.annotation.BxmBean;

@BxmBean("GlDcsnBatch")
@Scope("step")
@BxmCategory(logicalName = "Generalledger Decision Batch")
public class GlDcsnBatch implements Tasklet {
	final Logger logger = LoggerFactory.getLogger(this.getClass());

	private AcGlMBat			acGlMBat;
	private DateCalculator		dateCalculator;
	private Acctg				acctg;
	private Coa					coa;
	private CmnContext			cmnContext;

	private String 				instCd;					// 기관코드
	private String 				deptId;					// 부서식별자
	private String				bfDcsnStartDt;			// 확정시작일 전영업일
	private String				dcsnStartDt;			// 확정시작일
	private String				dcsnEndDt;				// 확정종료일
	private String				prcsDt;					// 확정일
	private String				crygFrwrdStartDt;		// 이월일
	private List<String> 		acctgItmCdList;
	private String 				calcYrFirstDt;
	private String				yrFirstBizDt;
	private String				mnthFirstBizDt;


	private final BigDecimal ZERO = BigDecimal.ZERO;

	@Override
	public RepeatStatus execute(StepContribution arg0, ChunkContext arg1) throws Exception {

		/*
		 * [총계정원장 확정 배치(from~to)]
		 * 기본 logic : 전영업일의 계리잔액, 누계액, 평잔 기반 > 확정일의 입지급 금액 감안하여 확정일의 계리잔액, 누계액, 평잔 재산출 > 익영업일의 누계액, 평잔 update
		 * 1. 확정일 전점 합계정보 삭제
		 * 2. 확정일, 실계정이 아닌 계정과목코드의 잔액 모두 clear (for 상위계정 재확정)
		 * 3. 실계정 확정처리
		 * 4. 양변계정 확정 
		 * 5. 손실금 이익금 처리
		 * 6. 상위계정확정 처리
		 * 7. 총계정원장에서 로그일련번호 0이 아닌 것 모두 삭제
		 * 8. 전점합계처리
		 * 9. 총계정원장 이월처리
		 * ※ 확정종료일이 당영업일일 경우 확정은 하지 않고, 이월만 실행
		 */

		// 입력데이터 검증
		_checkMandatoryValue(arg1);
		
		acctgItmCdList = _setAcctgItmCdList();
		prcsDt = dcsnStartDt; // 확정시작일
		bfDcsnStartDt = _getDateCalculator().calculateDateBusiness(prcsDt).getBfBizDt(); // 확정시작일 전영업일
		
		if(logger.isDebugEnabled()) {
			logger.debug("######## GlDcsnBatch START ########");
			logger.debug("## instCd {} : ", instCd);
			logger.debug("## deptId {} : ", deptId);
			logger.debug("## dcsnStartDt {} : ", dcsnStartDt);
			logger.debug("## dcsnEndDt {} : ", dcsnEndDt);
			logger.debug("## prcsDt {} : ", prcsDt);
			logger.debug("## bfDcsnStartDt {} : ", bfDcsnStartDt);
			logger.debug("## acctgItmCdList {} : ", acctgItmCdList.toString());
			logger.debug("###################################");
		}

		// 확정시작일이 확정종료일과 같아질 때 까지 반복 한다.
		while(prcsDt.compareTo(dcsnEndDt) <= 0) {
			
			_setBasicDate();

			if(logger.isDebugEnabled()){
				logger.debug("## GlDcsn > 총계정원장 확정 처리 Start");
				logger.debug("## prcsDt > {} ", prcsDt);
				logger.debug("## calcYrFirstDt > {} ", calcYrFirstDt);
				logger.debug("## yrFirstBizDt > {} ", yrFirstBizDt);
				logger.debug("## mnthFirstBizDt > {} ", mnthFirstBizDt);
			}
			
			// 1. 확정일 전점 합계정보 삭제 (전점부서식별자 : 999)
			_getAcGlMBat().deleteEntrBrnchSum(instCd, prcsDt, CAC01.ALL_ACCTG_DEPARTMENT);

			// 2. 실계정이 아닌 계정과목코드의 잔액을 모두 clear
			_clearNotRealTitlAcctgItmCd();
			
			// 3. 실계정 확정처리
			_processRealTitlYn();

			// 4. 양변계정 확정처리
			_decideBothSideAccountingBal();

			// 5. 손실금이익금 처리
			_processProfitLossAccountingBal();

			// 6. 상위계정 확정처리(실계정인것만)
			_processUpAcctgItmCd();

			// 7. 총계정원장에서 로그일련번호가 0이 아닌 것 모두 삭제
			_deleteByLogSeqNbr();

			// 8. 전점합계 처리
			_processEntireBranchSum();
			
			// 9. 총계정원장 이월 처리
			_generalledgerProcessCarryingForward();

			if(logger.isDebugEnabled()){
				logger.debug("## GlDcsn > 총계정원장 확정 처리 End");
			}

			// 확정, 이월처리 이후 익영업일로 set
			prcsDt  = _getDateCalculator().calculateDateBusiness(prcsDt).getNxtBizDt();
			bfDcsnStartDt = _getDateCalculator().calculateDateBusiness(prcsDt).getBfBizDt(); // 확정시작일 전영업일
		}
		return RepeatStatus.FINISHED;
	}

	
	/**
	 * Set Basic Date (year first business date/month first business date of processing date)
	 * 기본일자 설정 (확정일의 연초영업일, 확정일의 월초영업일)
	 * @throws BizApplicationException 
	 */
	private void _setBasicDate() throws BizApplicationException {
		
		String nxtBizDt = _getDateCalculator().calculateDateBusiness(prcsDt).getNxtBizDt(); // 확정일 익영업일
		
		// 해당연도의 첫영업일을 구하기 위함
		String firstDate = "0101";
		String calcYrFirstDt = nxtBizDt.substring(0, 4) + firstDate; 
		// 해당연도 연초 영업일
		yrFirstBizDt = _getDateCalculator().calculateDateBusiness(calcYrFirstDt).getBizDt();

		// 해당월의 첫영업일을 구하기 위함
		String firstDay = "01";
		String calMnthFirstDt = nxtBizDt.substring(0, 6) + firstDay; 
		// 월초 영업일
		mnthFirstBizDt = _getDateCalculator().calculateDateBusiness(calMnthFirstDt).getBizDt();
	}


	/**
	 * Check Mandatory Value
	 * @param arg1 
	 * @throws BizApplicationException 
	 */
	private void _checkMandatoryValue(ChunkContext arg1) throws BizApplicationException {
		
		instCd = (String)arg1.getStepContext().getJobExecutionContext().get("instCd");				// 기관코드
		dcsnStartDt = (String)arg1.getStepContext().getJobExecutionContext().get("dcsnStartDt");	// 확정시작일
		dcsnEndDt = (String)arg1.getStepContext().getJobExecutionContext().get("dcsnEndDt");		// 확정종료일
		deptId = (String)arg1.getStepContext().getJobExecutionContext().get("deptId");		// 부서식별자
		
		_checkInput(instCd, "@instCd");
		_checkInput(deptId, "@deptId");
		_checkBizDate(dcsnStartDt, "@dcsnStartDt");
		_checkBizDate(dcsnEndDt, "@dcsnEndDt");
		
		if (dcsnStartDt.compareTo(dcsnEndDt) > 0) {
			// 확정종료일은 확정시작일보다 커야합니다.
			throw new BizApplicationException("AAPCME0007", new Object[] {"@dcsnEndDt", "@dcsnStartDt"});
		}
		
		if(CAC01.ALL_ACCTG_DEPARTMENT.equals(deptId)) {
			deptId = null; // 부서식별자가 9999(전점)으로 들어오면 전 부점 확정, 아닐경우 입력 부점만 총계정원장 확정
		}

	}


	/**
	 * Set Accounting Item Code List
	 * 계정과목 주제별분류(ex:AcctgItmEnum) 중에서 총계(ex:자산초계,부채총계,자본총계...)를 제외한 계정의 목록
	 * @return 
	 * @throws BizApplicationException 
	 */
	private List<String> _setAcctgItmCdList() throws BizApplicationException {
		acctgItmCdList = new ArrayList<String>();
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
		return acctgItmCdList;
	}

	
	private void _processRealTitlYn() throws BizApplicationException {

		if(logger.isDebugEnabled()){
			logger.debug("## GlDcsn > _processRealTitlYn START");
		}
		List<AcGlMBatIO> prcsDtAcctgItmList = new ArrayList<AcGlMBatIO>();

		// 확정일 실계정 목록 조회 (양변계정이 아닌 것)
		prcsDtAcctgItmList = _getAcGlMBat().selectListByAcctgItmCd(instCd, deptId, prcsDt, acctgItmCdList, CAC01.YES, null, CAC01.NO); // 계정과목코드별 계리잔액

		for(AcGlMBatIO acGlMIO : prcsDtAcctgItmList){

			BigDecimal mnyRcvdAmt = acGlMIO.getBlkMnyRcvdAmt().subtract(acGlMIO.getRedWhdrwlAmt()); // 확정일 입금금액(흑서입금-주서출금)
			BigDecimal drwgOutAmt = acGlMIO.getBlkWhdrwlAmt().subtract(acGlMIO.getRedMnyRcvdAmt()); // 확정일 출금금액(흑서출금-주서입금)
			BigDecimal prcsDtAcctgBal = ZERO; 

			AcGlMBatIO glMBatIO = new AcGlMBatIO();
			_getCmnContext().setHeaderColumn(glMBatIO);

			glMBatIO.setInstCd(instCd);
			glMBatIO.setDeptId(acGlMIO.getDeptId());
			glMBatIO.setBaseDt(prcsDt);
			glMBatIO.setAcctgDscd(acGlMIO.getAcctgDscd());
			glMBatIO.setAcctgItmCd(acGlMIO.getAcctgItmCd());
			glMBatIO.setCrncyCd(acGlMIO.getCrncyCd());
			glMBatIO.setLogSeqNbr(ZERO);
			glMBatIO.setDebitCrdtDscd(acGlMIO.getDebitCrdtDscd());
			
			// 전영업일과 비교
			AcGlMBatIO bfBizDtAcGlM = _getAcGlMBat().select(instCd, acGlMIO.getDeptId(), bfDcsnStartDt, acGlMIO.getAcctgDscd(), acGlMIO.getAcctgItmCd(), acGlMIO.getCrncyCd(), CAC01.STR_ZERO);
			CoaDtlIO coaDtlIO = _getCoa().getCoa(instCd, glMBatIO.getAcctgDscd(), glMBatIO.getAcctgItmCd());
			
			// 전영업일의 원장이 존재하면, 전영업일의 계리잔액에 확정일의 입지급금액을 감안하여 확정일의 계리잔액을 재산출
			if(bfBizDtAcGlM != null){
				if(DbtcdtdscdEnum.DEBIT.getValue().equals(acGlMIO.getDebitCrdtDscd())){
					prcsDtAcctgBal = bfBizDtAcGlM.getAcctgBal().add(drwgOutAmt).subtract(mnyRcvdAmt);
					glMBatIO.setAcctgBal(prcsDtAcctgBal); // 확정일 전영업일 계리잔액 + (확정일 출금 - 확정일 입금)
				} else if (DbtcdtdscdEnum.CREDIT.getValue().equals(acGlMIO.getDebitCrdtDscd())){
					prcsDtAcctgBal = bfBizDtAcGlM.getAcctgBal().add(mnyRcvdAmt).subtract(drwgOutAmt);
					glMBatIO.setAcctgBal(prcsDtAcctgBal); // 확정일 전영업일 계리잔액 + (확정일 입금 - 확정일 출금)
				}
				
				// BS일 때만 평잔 설정
				if(BsisDscdEnum.BS.getValue().equals(coaDtlIO.getBsisDscd())){
					if(prcsDt.equals(mnthFirstBizDt) || prcsDt.equals(yrFirstBizDt)) {
						glMBatIO.setDmnthMnyRcvdAcmltdAmt(acGlMIO.getDmnthMnyRcvdAcmltdAmt().add(mnyRcvdAmt));// 월중입금적수(확정일)+{흑서입금금액(확정일)-주서출금금액(확정일)}
						glMBatIO.setDmnthWhdrwlAcmltdAmt(acGlMIO.getDmnthWhdrwlAcmltdAmt().add(drwgOutAmt));// 월중출금적수(확정일)+{흑서출금금액(확정일)-주서입금금액(확정일)}
						glMBatIO.setDtrmMnyRcvdAcmltdAmt(acGlMIO.getDtrmMnyRcvdAcmltdAmt().add(mnyRcvdAmt));// 기중입금적수(확정일)+{흑서입금금액(확정일)-주서출금금액(확정일)}
						glMBatIO.setDtrmWhdrwlAcmltdAmt(acGlMIO.getDtrmWhdrwlAcmltdAmt().add(drwgOutAmt));// 기중출금적수(확정일)+{흑서출금금액(확정일)-주서입금금액(확정일)}
						glMBatIO.setAcctgDmnthAcmltdAmt(acGlMIO.getAcctgDmnthAcmltdAmt().add(acGlMIO.getAcctgBal()));// 계리월중적수(확정일)+계리잔액(확정일)
						glMBatIO.setAcctgDtrmAcmltdAmt(acGlMIO.getAcctgDtrmAcmltdAmt().add(acGlMIO.getAcctgBal()));// 계리기중적수(확정일)+계리잔액(확정일)
					} else {
						glMBatIO.setDmnthMnyRcvdAcmltdAmt(bfBizDtAcGlM.getDmnthMnyRcvdAcmltdAmt().add(mnyRcvdAmt));// 월중입금적수(확정일)+{흑서입금금액(확정일)-주서출금금액(확정일)}
						glMBatIO.setDmnthWhdrwlAcmltdAmt(bfBizDtAcGlM.getDmnthWhdrwlAcmltdAmt().add(drwgOutAmt));// 월중출금적수(확정일)+{흑서출금금액(확정일)-주서입금금액(확정일)}
						glMBatIO.setDtrmMnyRcvdAcmltdAmt(bfBizDtAcGlM.getDtrmMnyRcvdAcmltdAmt().add(mnyRcvdAmt));// 기중입금적수(확정일)+{흑서입금금액(확정일)-주서출금금액(확정일)}
						glMBatIO.setDtrmWhdrwlAcmltdAmt(bfBizDtAcGlM.getDtrmWhdrwlAcmltdAmt().add(drwgOutAmt));// 기중출금적수(확정일)+{흑서출금금액(확정일)-주서입금금액(확정일)}
						glMBatIO.setAcctgDmnthAcmltdAmt(bfBizDtAcGlM.getAcctgDmnthAcmltdAmt().add(acGlMIO.getAcctgBal()));// 계리월중적수(확정일)+계리잔액(확정일)
						glMBatIO.setAcctgDtrmAcmltdAmt(bfBizDtAcGlM.getAcctgDtrmAcmltdAmt().add(acGlMIO.getAcctgBal()));// 계리기중적수(확정일)+계리잔액(확정일)
					}

				}else{
					if(logger.isDebugEnabled()){
						logger.debug("##GlDcsn > IS계정 누계액, 평잔 X");
					}
				}
				
			} else {
				glMBatIO.setAcctgBal(acGlMIO.getAcctgBal());
				
				// BS일 때만 평잔 설정
				if(BsisDscdEnum.BS.getValue().equals(coaDtlIO.getBsisDscd())){
					glMBatIO.setDmnthMnyRcvdAcmltdAmt(acGlMIO.getDmnthMnyRcvdAcmltdAmt().add(mnyRcvdAmt));// 월중입금적수(확정일)+{흑서입금금액(확정일)-주서출금금액(확정일)}
					glMBatIO.setDmnthWhdrwlAcmltdAmt(acGlMIO.getDmnthWhdrwlAcmltdAmt().add(drwgOutAmt));// 월중출금적수(확정일)+{흑서출금금액(확정일)-주서입금금액(확정일)}
					glMBatIO.setDtrmMnyRcvdAcmltdAmt(acGlMIO.getDtrmMnyRcvdAcmltdAmt().add(mnyRcvdAmt));// 기중입금적수(확정일)+{흑서입금금액(확정일)-주서출금금액(확정일)}
					glMBatIO.setDtrmWhdrwlAcmltdAmt(acGlMIO.getDtrmWhdrwlAcmltdAmt().add(drwgOutAmt));// 기중출금적수(확정일)+{흑서출금금액(확정일)-주서입금금액(확정일)}
					glMBatIO.setAcctgDmnthAcmltdAmt(acGlMIO.getAcctgDmnthAcmltdAmt().add(acGlMIO.getAcctgBal()));// 계리월중적수(확정일)+계리잔액(확정일)
					glMBatIO.setAcctgDtrmAcmltdAmt(acGlMIO.getAcctgDtrmAcmltdAmt().add(acGlMIO.getAcctgBal()));// 계리기중적수(확정일)+계리잔액(확정일)

				}else{
					if(logger.isDebugEnabled()){
						logger.debug("##GlDcsn > IS계정 누계액, 평잔 X");
					}
				}
			}
			
			glMBatIO.setExBal(acGlMIO.getExBal());
			glMBatIO.setBlkMnyRcvdAmt(acGlMIO.getBlkMnyRcvdAmt());
			glMBatIO.setBlkWhdrwlAmt(acGlMIO.getBlkWhdrwlAmt());
			glMBatIO.setRedMnyRcvdAmt(acGlMIO.getRedMnyRcvdAmt());
			glMBatIO.setRedWhdrwlAmt(acGlMIO.getRedWhdrwlAmt());

			int updateCnt = _getAcGlMBat().update(glMBatIO);
			if(updateCnt == 0){
				_getAcGlMBat().insert(glMBatIO);
			}
			
			// 실계정 확정 후, 로그일련번호 0이 아닌 데이터 삭제
			updateCnt = _getAcGlMBat().deleteByLogSeqNbr(instCd, acGlMIO.getDeptId(), acGlMIO.getAcctgDscd(), acGlMIO.getAcctgItmCd(), acGlMIO.getCrncyCd(), prcsDt);
		}
	}	

	/**
	 * Validation Biz Date Check
	 * 날짜 형식 유효성 체크
	 * @throws BizApplicationException
	 */
	private void _checkBizDate(String date, String msg) throws BizApplicationException {

		if (!DateUtils.isValidDate(date)) {
			throw new BizApplicationException("AAPCME0001", new Object[] {"@".concat(msg) , date});
		}

		if(StringUtils.isEmpty(date)){
			throw new BizApplicationException("AAPACE3046", new Object[] {date});
		}

		if(date.compareTo(_getCmnContext().getBusinessDate()) > 0 ){
			// 시스템일자보다 미래일자로 회계처리가 허용되지 않습니다.
			throw new BizApplicationException("AAPACE3044", null);
		}
	}
	

	/**
	 * Validation Institution Code Check
	 * @param instCd
	 * @param msg
	 * @throws BizApplicationException
	 */
	private void _checkInput(String input, String msg) throws BizApplicationException {

		if (StringUtils.isEmpty(instCd)) {
			// {기관코드}는 필수 입력 항목입니다.
            throw new BizApplicationException("AAPCME0006", new Object[] {"@".concat(msg) , instCd});
        }
	}

	private void _deleteByLogSeqNbr() throws BizApplicationException {

		if(logger.isDebugEnabled()){
			logger.debug("## GlDcsn > delete logSeqNbr ZERO STRAT ");
		}

		// 로그일련번호가 0이 아닌것 삭제
		int cnt = _getAcGlMBat().deleteByLogSeqNbr(instCd, deptId, null, null, null, prcsDt);
		if(cnt == 0) return ;
			//throw new BizApplicationException("AAPACE3079");		

		if(logger.isDebugEnabled()){
			logger.debug("## GlDcsn > delete logSeqNbr ZERO END ");
		}
	}

	
	private void _decideBothSideAccountingBal() throws BizApplicationException{
		if(logger.isDebugEnabled()){
			logger.debug("## GlDcsn > 양변계정확정 START");
		}
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
		
		String bfPrcsDt = _getDateCalculator().calculateDateBusiness(prcsDt).getBfBizDt(); // 확정일의 전영업일
		int updateCnt = 0;
		
		// 처리대상 양변계정잔액 조회
		List<AcGlMBtsdAcctgItmBalBatIO> btsdAcctgItmBalList = _getAcGlMBat().selectListBtsdAcctgItmBal(instCd, prcsDt, deptId);
		
		
		for (AcGlMBtsdAcctgItmBalBatIO btsdAcctgItmBal : btsdAcctgItmBalList){
			// 전영업일 차변잔액 조회
			AcGlMBatIO bfDbtLogSeqNbrZero = _getAcGlMBat().select(btsdAcctgItmBal.getInstCd(), btsdAcctgItmBal.getDeptId(), bfPrcsDt, btsdAcctgItmBal.getAcctgDscd(), 
					btsdAcctgItmBal.getAcctgItmCd(), btsdAcctgItmBal.getCrncyCd(), CAC01.STR_ZERO);
			
			// 전영업일 대변잔액 조회
			AcGlMBatIO bfCdtLogSeqNbrZero = _getAcGlMBat().select(btsdAcctgItmBal.getInstCd(), btsdAcctgItmBal.getDeptId(), bfPrcsDt, btsdAcctgItmBal.getAcctgDscd(), 
					btsdAcctgItmBal.getRltdAcctgItmCd(), btsdAcctgItmBal.getCrncyCd(), CAC01.STR_ZERO);
			
			// 확정일 차변잔액 조회
			AcGlMBatIO dbtAcGlMBatIO = _getAcGlMBat().selectAmtSum(instCd, btsdAcctgItmBal.getDeptId(), prcsDt, btsdAcctgItmBal.getAcctgDscd(), btsdAcctgItmBal.getAcctgItmCd(), btsdAcctgItmBal.getCrncyCd());
			
			// 확정일 대변잔액 조회
			AcGlMBatIO cdtAcGlMBatIO = _getAcGlMBat().selectAmtSum(instCd, btsdAcctgItmBal.getDeptId(), prcsDt, btsdAcctgItmBal.getAcctgDscd(), btsdAcctgItmBal.getRltdAcctgItmCd(), btsdAcctgItmBal.getCrncyCd());

			
			if(dbtAcGlMBatIO == null) {
				dbtAcGlMBatIO = _setBtsdAcGlMBatIO(btsdAcctgItmBal, DbtcdtdscdEnum.DEBIT.getValue());
			}
			if(cdtAcGlMBatIO == null){
				cdtAcGlMBatIO = _setBtsdAcGlMBatIO(btsdAcctgItmBal, DbtcdtdscdEnum.CREDIT.getValue());
			}
			
			if(logger.isDebugEnabled()){
				logger.debug("## GlDcsn > _decideBothSideAccountingBal");
				logger.debug("## GlDcsn > 확정일 dbtAcGlMBatIO : {}", dbtAcGlMBatIO);
				logger.debug("## GlDcsn > 확정일 cdtAcGlMBatIO : {}", cdtAcGlMBatIO);
			}
 			dbtAcGlMBatIO.setLogSeqNbr(ZERO);
			dbtAcGlMBatIO.setDebitCrdtDscd(DbtcdtdscdEnum.DEBIT.getValue());
			cdtAcGlMBatIO.setDebitCrdtDscd(DbtcdtdscdEnum.CREDIT.getValue());
			cdtAcGlMBatIO.setLogSeqNbr(ZERO);
			
			BigDecimal mnyRcvdAmt = dbtAcGlMBatIO.getBlkMnyRcvdAmt().subtract(dbtAcGlMBatIO.getRedWhdrwlAmt()); // 확정일 입금금액
			BigDecimal drwgOutAmt = dbtAcGlMBatIO.getBlkWhdrwlAmt().subtract(dbtAcGlMBatIO.getRedMnyRcvdAmt()); // 확정일 출금금액

			// 차액이 양수인 경우
			if(btsdAcctgItmBal.getDfrncBal().compareTo(ZERO) >= 0){
				
				// 전일자 차변계정 확정
				if(bfDbtLogSeqNbrZero != null && bfDbtLogSeqNbrZero.getAcctgBal().compareTo(ZERO) != 0) {
					if(logger.isDebugEnabled()){
						logger.debug("## GlDcsn > _decideBothSideAccountingBal > 차액 양수 > 전일자 차변확정");
					}
					// 확정일 계리잔액 = 전영업일 계리잔액 + (확정일출금금액-확정일입금금액)
					dbtAcGlMBatIO.setAcctgBal(bfDbtLogSeqNbrZero.getAcctgBal().add(drwgOutAmt.subtract(mnyRcvdAmt)));
					
				}
				// 전일자 대변계정 확정
				else if(bfCdtLogSeqNbrZero != null && bfCdtLogSeqNbrZero.getAcctgBal().compareTo(ZERO) != 0) {
					if(logger.isDebugEnabled()){
						logger.debug("## GlDcsn > _decideBothSideAccountingBal > 차액 양수 > 전일자 대변확정");
					}
					dbtAcGlMBatIO.setAcctgBal(dbtAcGlMBatIO.getAcctgBal().subtract(bfCdtLogSeqNbrZero.getAcctgBal()));
					dbtAcGlMBatIO.setExBal(dbtAcGlMBatIO.getExBal().subtract(bfCdtLogSeqNbrZero.getExBal()));
					dbtAcGlMBatIO.setBlkWhdrwlAmt(dbtAcGlMBatIO.getBlkWhdrwlAmt().subtract(bfCdtLogSeqNbrZero.getAcctgBal()));

					cdtAcGlMBatIO.setBlkMnyRcvdAmt(ZERO);
					cdtAcGlMBatIO.setBlkWhdrwlAmt(bfCdtLogSeqNbrZero.getAcctgBal());
					cdtAcGlMBatIO.setRedMnyRcvdAmt(ZERO);
					cdtAcGlMBatIO.setRedWhdrwlAmt(ZERO);
					cdtAcGlMBatIO.setAcctgBal(ZERO);
					cdtAcGlMBatIO.setExBal(ZERO);
				}
			}
			// 차액이 음수인 경우
			else {
				
				if(logger.isDebugEnabled()){
					logger.debug("## GlDcsn > _decideBothSideAccountingBal > 차액 음수");
				}
				
				// 전일자 차변계정으로 확정된 경우
				if(bfDbtLogSeqNbrZero != null && bfDbtLogSeqNbrZero.getAcctgBal().compareTo(ZERO) != 0){
					if(logger.isDebugEnabled()){
						logger.debug("## GlDcsn > _decideBothSideAccountingBal > 차액 음수 > 전일자 차변확정");
					}
					cdtAcGlMBatIO.setAcctgBal(ZERO.subtract(bfDbtLogSeqNbrZero.getAcctgBal().add(drwgOutAmt.subtract(mnyRcvdAmt))));
					cdtAcGlMBatIO.setExBal(ZERO.subtract(bfDbtLogSeqNbrZero.getExBal()).subtract(dbtAcGlMBatIO.getExBal()));
					cdtAcGlMBatIO.setBlkMnyRcvdAmt(dbtAcGlMBatIO.getBlkMnyRcvdAmt().subtract(dbtAcGlMBatIO.getAcctgBal()));
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
				else if(bfCdtLogSeqNbrZero != null && bfCdtLogSeqNbrZero.getAcctgBal().compareTo(ZERO) != 0) {
					if(logger.isDebugEnabled()){
						logger.debug("## GlDcsn > _decideBothSideAccountingBal > 차액 음수 > 전일자 대변확정");
					}
					cdtAcGlMBatIO.setAcctgBal(bfCdtLogSeqNbrZero.getAcctgBal().subtract(dbtAcGlMBatIO.getAcctgBal()));
					cdtAcGlMBatIO.setExBal(bfCdtLogSeqNbrZero.getExBal().subtract(dbtAcGlMBatIO.getExBal()));
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
				else if(bfDbtLogSeqNbrZero == null || bfCdtLogSeqNbrZero == null) {
					if(logger.isDebugEnabled()){
						logger.debug("## GlDcsn > _decideBothSideAccountingBal > 차액 음수 > 신규지점");
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
				
			}
			
			_getCmnContext().setHeaderColumn(dbtAcGlMBatIO);
			_getCmnContext().setHeaderColumn(cdtAcGlMBatIO);
			
			// 양변계정 적수부분 셋팅			
			_setBtsdAcmltdAmt(bfDbtLogSeqNbrZero, bfCdtLogSeqNbrZero, dbtAcGlMBatIO, cdtAcGlMBatIO);
			
			updateCnt = _getAcGlMBat().update(cdtAcGlMBatIO);
			if(updateCnt == 0){
				_getAcGlMBat().insert(cdtAcGlMBatIO);
			}
			updateCnt = _getAcGlMBat().update(dbtAcGlMBatIO);
			if(updateCnt == 0){
				_getAcGlMBat().insert(dbtAcGlMBatIO);
			}			
			
			// 로그일련번호가 0이 아닌 것 삭제(차변)하여 이후 실계정확정시에 문제 없도록
			_getAcGlMBat().deleteByLogSeqNbr(instCd, btsdAcctgItmBal.getDeptId(), btsdAcctgItmBal.getAcctgDscd(), btsdAcctgItmBal.getAcctgItmCd(), btsdAcctgItmBal.getCrncyCd(), prcsDt);
			_getAcGlMBat().deleteByLogSeqNbr(instCd, btsdAcctgItmBal.getDeptId(), btsdAcctgItmBal.getAcctgDscd(), btsdAcctgItmBal.getRltdAcctgItmCd(), btsdAcctgItmBal.getCrncyCd(), prcsDt);
		}
		if(logger.isDebugEnabled()){
			logger.debug("## GlDcsn > 양변계정확정 END");
		}
		
	}

	/**
	 * Set Both Side Accounting Item Code's Accomulated Amount
	 * @param cdtAcGlMBatIO 
	 * @param dbtAcGlMBatIO 
	 * @param bfDbtLogSeqNbrZero
	 * @param bfCdtLogSeqNbrZero
	 */
	private void _setBtsdAcmltdAmt(AcGlMBatIO bfDbtLogSeqNbrZero, AcGlMBatIO bfCdtLogSeqNbrZero, AcGlMBatIO dbtAcGlMBatIO, AcGlMBatIO cdtAcGlMBatIO) {

		// 확정일의 차,대변 입출금액
		BigDecimal debitDscnMnyRcvdAmt = dbtAcGlMBatIO.getBlkMnyRcvdAmt().subtract(dbtAcGlMBatIO.getRedWhdrwlAmt());
		BigDecimal debitDscnWhdrwlAmt = dbtAcGlMBatIO.getBlkWhdrwlAmt().subtract(dbtAcGlMBatIO.getRedMnyRcvdAmt());
		BigDecimal crdtDscnMnyRcvdAmt = cdtAcGlMBatIO.getBlkMnyRcvdAmt().subtract(cdtAcGlMBatIO.getRedWhdrwlAmt());
		BigDecimal crdtDscnWhdrwlAmt = cdtAcGlMBatIO.getBlkWhdrwlAmt().subtract(cdtAcGlMBatIO.getRedMnyRcvdAmt());
		
		
		if(prcsDt.equals(mnthFirstBizDt) || prcsDt.equals(yrFirstBizDt)) {
			dbtAcGlMBatIO.setDmnthMnyRcvdAcmltdAmt(dbtAcGlMBatIO.getDmnthMnyRcvdAcmltdAmt().add(debitDscnMnyRcvdAmt));// set [월중입금적수]
			dbtAcGlMBatIO.setDmnthWhdrwlAcmltdAmt(dbtAcGlMBatIO.getDmnthWhdrwlAcmltdAmt().add(debitDscnWhdrwlAmt));// set [월중출금적수]
			dbtAcGlMBatIO.setDtrmMnyRcvdAcmltdAmt(dbtAcGlMBatIO.getDtrmMnyRcvdAcmltdAmt().add(debitDscnMnyRcvdAmt));// set [기중입금적수]
			dbtAcGlMBatIO.setDtrmWhdrwlAcmltdAmt(dbtAcGlMBatIO.getDtrmWhdrwlAcmltdAmt().add(debitDscnWhdrwlAmt));// set [기중출금적수]
			dbtAcGlMBatIO.setAcctgDmnthAcmltdAmt(dbtAcGlMBatIO.getAcctgDmnthAcmltdAmt().add(dbtAcGlMBatIO.getAcctgBal()));// set [계리월중적수]
			dbtAcGlMBatIO.setAcctgDtrmAcmltdAmt(dbtAcGlMBatIO.getAcctgDtrmAcmltdAmt().add(dbtAcGlMBatIO.getAcctgBal()));// set [계리기중적수]
			
			cdtAcGlMBatIO.setDmnthMnyRcvdAcmltdAmt(cdtAcGlMBatIO.getDmnthMnyRcvdAcmltdAmt().add(crdtDscnMnyRcvdAmt));// set [월중입금적수]
			cdtAcGlMBatIO.setDmnthWhdrwlAcmltdAmt(cdtAcGlMBatIO.getDmnthWhdrwlAcmltdAmt().add(crdtDscnWhdrwlAmt));// set [월중출금적수]
			cdtAcGlMBatIO.setDtrmMnyRcvdAcmltdAmt(cdtAcGlMBatIO.getDtrmMnyRcvdAcmltdAmt().add(crdtDscnMnyRcvdAmt));// set [기중입금적수]
			cdtAcGlMBatIO.setDtrmWhdrwlAcmltdAmt(cdtAcGlMBatIO.getDtrmWhdrwlAcmltdAmt().add(crdtDscnWhdrwlAmt));// set [기중출금적수]
			cdtAcGlMBatIO.setAcctgDmnthAcmltdAmt(cdtAcGlMBatIO.getAcctgDmnthAcmltdAmt().add(cdtAcGlMBatIO.getAcctgBal()));// set [계리월중적수]
			cdtAcGlMBatIO.setAcctgDtrmAcmltdAmt(cdtAcGlMBatIO.getAcctgDtrmAcmltdAmt().add(cdtAcGlMBatIO.getAcctgBal()));// set [계리기중적수]
		} else { 
			if(bfDbtLogSeqNbrZero != null) {
				dbtAcGlMBatIO.setDmnthMnyRcvdAcmltdAmt(bfDbtLogSeqNbrZero.getDmnthMnyRcvdAcmltdAmt().add(debitDscnMnyRcvdAmt));// set [월중입금적수]
				dbtAcGlMBatIO.setDmnthWhdrwlAcmltdAmt(bfDbtLogSeqNbrZero.getDmnthWhdrwlAcmltdAmt().add(debitDscnWhdrwlAmt));// set [월중출금적수]
				dbtAcGlMBatIO.setDtrmMnyRcvdAcmltdAmt(bfDbtLogSeqNbrZero.getDtrmMnyRcvdAcmltdAmt().add(debitDscnMnyRcvdAmt));// set [기중입금적수]
				dbtAcGlMBatIO.setDtrmWhdrwlAcmltdAmt(bfDbtLogSeqNbrZero.getDtrmWhdrwlAcmltdAmt().add(debitDscnWhdrwlAmt));// set [기중출금적수]
				dbtAcGlMBatIO.setAcctgDmnthAcmltdAmt(bfDbtLogSeqNbrZero.getAcctgDmnthAcmltdAmt().add(dbtAcGlMBatIO.getAcctgBal()));// set [계리월중적수]
				dbtAcGlMBatIO.setAcctgDtrmAcmltdAmt(bfDbtLogSeqNbrZero.getAcctgDtrmAcmltdAmt().add(dbtAcGlMBatIO.getAcctgBal()));// set [계리기중적수]
			} else {
				dbtAcGlMBatIO.setDmnthMnyRcvdAcmltdAmt(dbtAcGlMBatIO.getDmnthMnyRcvdAcmltdAmt().add(debitDscnMnyRcvdAmt));// set [월중입금적수]
				dbtAcGlMBatIO.setDmnthWhdrwlAcmltdAmt(dbtAcGlMBatIO.getDmnthWhdrwlAcmltdAmt().add(debitDscnWhdrwlAmt));// set [월중출금적수]
				dbtAcGlMBatIO.setDtrmMnyRcvdAcmltdAmt(dbtAcGlMBatIO.getDtrmMnyRcvdAcmltdAmt().add(debitDscnMnyRcvdAmt));// set [기중입금적수]
				dbtAcGlMBatIO.setDtrmWhdrwlAcmltdAmt(dbtAcGlMBatIO.getDtrmWhdrwlAcmltdAmt().add(debitDscnWhdrwlAmt));// set [기중출금적수]
				dbtAcGlMBatIO.setAcctgDmnthAcmltdAmt(dbtAcGlMBatIO.getAcctgDmnthAcmltdAmt().add(dbtAcGlMBatIO.getAcctgBal()));// set [계리월중적수]
				dbtAcGlMBatIO.setAcctgDtrmAcmltdAmt(dbtAcGlMBatIO.getAcctgDtrmAcmltdAmt().add(dbtAcGlMBatIO.getAcctgBal()));// set [계리기중적수]
			}
			
			if(bfCdtLogSeqNbrZero != null) {
				cdtAcGlMBatIO.setDmnthMnyRcvdAcmltdAmt(bfCdtLogSeqNbrZero.getDmnthMnyRcvdAcmltdAmt().add(crdtDscnMnyRcvdAmt));// set [월중입금적수]
				cdtAcGlMBatIO.setDmnthWhdrwlAcmltdAmt(bfCdtLogSeqNbrZero.getDmnthWhdrwlAcmltdAmt().add(crdtDscnWhdrwlAmt));// set [월중출금적수]
				cdtAcGlMBatIO.setDtrmMnyRcvdAcmltdAmt(bfCdtLogSeqNbrZero.getDtrmMnyRcvdAcmltdAmt().add(crdtDscnMnyRcvdAmt));// set [기중입금적수]
				cdtAcGlMBatIO.setDtrmWhdrwlAcmltdAmt(bfCdtLogSeqNbrZero.getDtrmWhdrwlAcmltdAmt().add(crdtDscnWhdrwlAmt));// set [기중출금적수]
				cdtAcGlMBatIO.setAcctgDmnthAcmltdAmt(bfCdtLogSeqNbrZero.getAcctgDmnthAcmltdAmt().add(cdtAcGlMBatIO.getAcctgBal()));// set [계리월중적수]
				cdtAcGlMBatIO.setAcctgDtrmAcmltdAmt(bfCdtLogSeqNbrZero.getAcctgDtrmAcmltdAmt().add(cdtAcGlMBatIO.getAcctgBal()));// set [계리기중적수]
			} else {
				cdtAcGlMBatIO.setDmnthMnyRcvdAcmltdAmt(cdtAcGlMBatIO.getDmnthMnyRcvdAcmltdAmt().add(crdtDscnMnyRcvdAmt));// set [월중입금적수]
				cdtAcGlMBatIO.setDmnthWhdrwlAcmltdAmt(cdtAcGlMBatIO.getDmnthWhdrwlAcmltdAmt().add(crdtDscnWhdrwlAmt));// set [월중출금적수]
				cdtAcGlMBatIO.setDtrmMnyRcvdAcmltdAmt(cdtAcGlMBatIO.getDtrmMnyRcvdAcmltdAmt().add(crdtDscnMnyRcvdAmt));// set [기중입금적수]
				cdtAcGlMBatIO.setDtrmWhdrwlAcmltdAmt(cdtAcGlMBatIO.getDtrmWhdrwlAcmltdAmt().add(crdtDscnWhdrwlAmt));// set [기중출금적수]
				cdtAcGlMBatIO.setAcctgDmnthAcmltdAmt(cdtAcGlMBatIO.getAcctgDmnthAcmltdAmt().add(cdtAcGlMBatIO.getAcctgBal()));// set [계리월중적수]
				cdtAcGlMBatIO.setAcctgDtrmAcmltdAmt(cdtAcGlMBatIO.getAcctgDtrmAcmltdAmt().add(cdtAcGlMBatIO.getAcctgBal()));// set [계리기중적수]
			}
		}
	}

	private AcGlMBatIO _setBtsdAcGlMBatIO(AcGlMBtsdAcctgItmBalBatIO btsdAcctgItmBal, String debitCrdtDscd) throws BizApplicationException {

		AcGlMBatIO acGlMBatIO = new AcGlMBatIO();
		
		_getCmnContext().setHeaderColumn(acGlMBatIO);
		acGlMBatIO.setInstCd(btsdAcctgItmBal.getInstCd());
		acGlMBatIO.setDeptId(btsdAcctgItmBal.getDeptId());
		acGlMBatIO.setAcctgDscd(btsdAcctgItmBal.getAcctgDscd());
		if(DbtcdtdscdEnum.DEBIT.equals(debitCrdtDscd)) {
			acGlMBatIO.setAcctgItmCd(btsdAcctgItmBal.getAcctgItmCd());
		} else {
			acGlMBatIO.setAcctgItmCd(btsdAcctgItmBal.getRltdAcctgItmCd());
		}
//		acGlMBatIO.setAcctgItmCd(btsdAcctgItmBal.getRltdAcctgItmCd());
		acGlMBatIO.setCrncyCd(btsdAcctgItmBal.getCrncyCd());
		acGlMBatIO.setBaseDt(btsdAcctgItmBal.getBaseDt());
		_clearAmount(acGlMBatIO);
		
		return acGlMBatIO;
	}

	/**
	 * 손실금이익금 처리
	 * @throws BizApplicationException
	 */
	private void _processProfitLossAccountingBal() throws BizApplicationException {
		if(logger.isDebugEnabled()){
			logger.debug("## GlDcsn > 손실금이익금 처리 Start");
		}

		// 4.1 손실금 이익금 합계를 조회한다
		List<AcGlMProfitLossSumBatIO> profitLossSumOutList = _getAcGlMBat().selectProfitLossSum(instCd, prcsDt, deptId);

		if (profitLossSumOutList == null){
			return;
		}

		AcGlMBatIO profitLossAcGlMIO = new AcGlMBatIO();
		_getCmnContext().setHeaderColumn(profitLossAcGlMIO);

		profitLossAcGlMIO.setInstCd(instCd);
		profitLossAcGlMIO.setLogSeqNbr(ZERO);

		for (AcGlMProfitLossSumBatIO profitLossSumOut : profitLossSumOutList) {

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

			
			// 4.4 손실금/이익금 계정 갱신
			int cnt = _getAcGlMBat().update(profitLossAcGlMIO);
			if(cnt == 0) {
				_getAcGlMBat().insert(profitLossAcGlMIO);
			}
		}
		
		if(logger.isDebugEnabled()){
			logger.debug("## GlDcsn > 손실금이익금 처리 End");
		}
	}

	/**
	 * 상위계정과목코드 계리잔액 확정
	 * 
	 * @param instCd
	 * @param deptId
	 * @param prcsDt
	 * @throws BizApplicationException
	 */
	private void _processUpAcctgItmCd() throws BizApplicationException {

		if(logger.isDebugEnabled()){
			logger.debug("## GlDcsn > 상위계정확정처리 Start");
		}
		// 계정과목코드별 계리잔액
		List<AcGlMBatIO> acctgItmList = new ArrayList<AcGlMBatIO>();

		// 실계정 목록 조회(양변계정아닌것)
		acctgItmList = _getAcGlMBat().selectListByAcctgItmCd(instCd, deptId, prcsDt, acctgItmCdList, CAC01.YES, null, CAC01.NO); // 계정과목코드별 계리잔액

		if(acctgItmList.isEmpty()){
			if(logger.isDebugEnabled()){
				logger.debug("## GlDcsn > 실계정목록 없음");
			}
		} else {
			// 상위계정과목코드 통합
			_intgrtnUpAcctgItmCd1(acctgItmList);
		}
		
		if(logger.isDebugEnabled()){
			logger.debug("## GlDcsn > 상위계정확정처리 End");
		}
	}

	private void _intgrtnUpAcctgItmCd1(List<AcGlMBatIO> acctgItmList) throws BizApplicationException {

		for(AcGlMBatIO glMBatI : acctgItmList) {
			glMBatI.setUpAcctgItmCd(_getUpAcctgItmCd(glMBatI.getAcctgItmCd())); // 상위 설정
			_setParentAcctgItm(glMBatI);
		}
	}		

    /**
     * 상위계정 처리
     * @param addedAcctgItmList
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

				_getCmnContext().setHeaderColumn(glMBat);

				glMBat.setInstCd(baseGlMBatIO.getInstCd());// set [기관코드]
				glMBat.setDeptId(baseGlMBatIO.getDeptId());// set [부서식별자]
				glMBat.setBaseDt(baseGlMBatIO.getBaseDt());// set [기준년월일]
				glMBat.setAcctgDscd(baseGlMBatIO.getAcctgDscd());// set [회계구분코드]
				// 계정과목코드에 상위계정과목코드를 set
				glMBat.setAcctgItmCd(baseGlMBatIO.getUpAcctgItmCd());// set [계정과목코드]
				glMBat.setCrncyCd(baseGlMBatIO.getCrncyCd());// set [통화코드]
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
				glMBat.setBsisDscd(baseGlMBatIO.getBsisDscd());// set [BSIS구분코드]
				glMBat.setDebitCrdtDscd(baseGlMBatIO.getDebitCrdtDscd());// set [차대변구분코드]
				glMBat.setLogSeqNbr(ZERO);// set [로그일련번호]

				_getAcGlMBat().insert(glMBat);

				glMBat.setUpAcctgItmCd(_getUpAcctgItmCd(glMBat.getAcctgItmCd()));
				
			}
			// 상위 계정과목코드가 이미 존재하면 있는 것에다가 add				
			else if(prevAcGlMBatIO.getAcctgItmCd().equals(baseGlMBatIO.getUpAcctgItmCd()) 
					 && prevAcGlMBatIO.getInstCd().equals(baseGlMBatIO.getInstCd())
					 && prevAcGlMBatIO.getDeptId().equals(baseGlMBatIO.getDeptId())
					 && prevAcGlMBatIO.getBaseDt().equals(baseGlMBatIO.getBaseDt())
					 && prevAcGlMBatIO.getAcctgDscd().equals(baseGlMBatIO.getAcctgDscd())
					 && prevAcGlMBatIO.getCrncyCd().equals(baseGlMBatIO.getCrncyCd())) {

				glMBat = new AcGlMBatIO();
				_getCmnContext().setHeaderColumn(glMBat);

				glMBat.setInstCd(prevAcGlMBatIO.getInstCd());// set [기관코드]
				glMBat.setBaseDt(prevAcGlMBatIO.getBaseDt());// set [기준년월일]
				glMBat.setDeptId(prevAcGlMBatIO.getDeptId());// set [부서식별자]
				glMBat.setAcctgDscd(prevAcGlMBatIO.getAcctgDscd());// set [회계구분코드]
				glMBat.setAcctgItmCd(prevAcGlMBatIO.getAcctgItmCd());// set [계정과목코드]
				glMBat.setLogSeqNbr(prevAcGlMBatIO.getLogSeqNbr());// set [로그일련번호]
				glMBat.setCrncyCd(prevAcGlMBatIO.getCrncyCd());// set [통화코드]

				glMBat.setDebitCrdtDscd(prevAcGlMBatIO.getDebitCrdtDscd());
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

    private void _clearNotRealTitlAcctgItmCd() throws BizApplicationException {

    	if(logger.isDebugEnabled()){
			logger.debug("## GlDcsn > 실계정아닌 계정과목코드의 잔액 clear");
		}
    	
    	// 잔액 초기화 하지 않는 계정과목코드 목록
    	String intrOffcAcctgItmCd = _getAcctg().getAccountingItemCode(AcctgItmEnum.INTER_OFFICE.getValue()); // 본지점
    	String frgncIntrOffcAcctgItmCd = _getAcctg().getAccountingItemCode(AcctgItmEnum.FX_INTER_OFFICE.getValue()); // 외화본지점
    	String cashAcctgItmCd = _getAcctg().getAccountingItemCode(AcctgItmEnum.CASH.getValue()); // 통화
    	String chkAcctgItmCd = _getAcctg().getAccountingItemCode(AcctgItmEnum.CHECK.getValue()); // 자기앞
    	String othrChkAcctgItmCd = _getAcctg().getAccountingItemCode(AcctgItmEnum.OTHER_CHECK.getValue()); // 타점권
    	String cashChkAcctgItmCd = _getAcctg().getAccountingItemCode(AcctgItmEnum.CASH_CHECK.getValue()); // 현금
    	String frgncCashAcctgItmCd = _getAcctg().getAccountingItemCode(AcctgItmEnum.FOREIGN_CASH.getValue()); // 외국통화
    	String lossAcctgItmCd = _getAcctg().getAccountingItemCode(AcctgItmEnum.LOSS.getValue()); // 손실
    	String prftAcctgItmCd = _getAcctg().getAccountingItemCode(AcctgItmEnum.PROFIT.getValue()); // 이익
    	String netPrftThisTermAcctgItmCd = _getAcctg().getAccountingItemCode(AcctgItmEnum.NET_PROFIT_THIS_TERM.getValue()); // 당기순이익
    	String bsNetPrftThisTermAcctgItmCd = _getAcctg().getAccountingItemCode(AcctgItmEnum.BS_NET_PROFIT_THIS_TERM.getValue()); // 당기순이익
    	String netLossThisTermAcctgItmCd = _getAcctg().getAccountingItemCode(AcctgItmEnum.NET_LOSS_THIS_TERM.getValue()); // 당기순손실
    	
    	// 실계정이 아닌 계정과목코드 조회
		List<AcGlMBatIO> notRealTitlAcctgList = new ArrayList<AcGlMBatIO>();
		
		notRealTitlAcctgList = _getAcGlMBat().selectListNotRealTitlAcctg(instCd, prcsDt, deptId, null, CAC01.NO); // 계정과목코드별 계리잔액

		for(AcGlMBatIO glMBatIO : notRealTitlAcctgList){

			if(!glMBatIO.getAcctgItmCd().equals(intrOffcAcctgItmCd) // 본지점
					&& !glMBatIO.getAcctgItmCd().equals(frgncIntrOffcAcctgItmCd) // 외화본지점
					 && !glMBatIO.getAcctgItmCd().equals(cashAcctgItmCd) // 통화
					 && !glMBatIO.getAcctgItmCd().equals(chkAcctgItmCd) // 자기앞
					 && !glMBatIO.getAcctgItmCd().equals(othrChkAcctgItmCd) // 기타타점권
					 && !glMBatIO.getAcctgItmCd().equals(cashChkAcctgItmCd) // 현금
					 && !glMBatIO.getAcctgItmCd().equals(frgncCashAcctgItmCd) // 외국통화
					 && !glMBatIO.getAcctgItmCd().equals(lossAcctgItmCd) // 손실
					 && !glMBatIO.getAcctgItmCd().equals(prftAcctgItmCd) // 이익
					 && !glMBatIO.getAcctgItmCd().equals(netPrftThisTermAcctgItmCd) // 당기순이익
					 && !glMBatIO.getAcctgItmCd().equals(bsNetPrftThisTermAcctgItmCd) // 당기순이익
					 && !glMBatIO.getAcctgItmCd().equals(netLossThisTermAcctgItmCd) // 당기순손실
					){
				_clearAmount(glMBatIO);
				_getCmnContext().setHeaderColumn(glMBatIO);
				_getAcGlMBat().update(glMBatIO);
			}
		}
	}

    
    /**
     * Get Up Accounting Item Code
     * @param acctgItmCd
     * @return
     * @throws BizApplicationException
     */
    private String _getUpAcctgItmCd(String acctgItmCd) throws BizApplicationException {
    	String upAcctgItmCd = null;
		upAcctgItmCd = _getAcGlMBat().selectUpAcctgItmCd(instCd, acctgItmCd);

		return StringUtils.isEmpty(upAcctgItmCd) ? null : upAcctgItmCd;
    }

    
	/**
     * 전점합계 처리
     * @param prcsDt
     * @throws BizApplicationException
     */
	private void _processEntireBranchSum() throws BizApplicationException {
		if(logger.isDebugEnabled()){
			logger.debug("## GlDcsn > 전점합계 처리 Start");
		}
		AcGlMBatIO acGlMBatIO = new AcGlMBatIO();

		acGlMBatIO.setInstCd(instCd);
		acGlMBatIO.setBaseDt(prcsDt);
		acGlMBatIO.setDeptId(CAC01.ALL_ACCTG_DEPARTMENT);

		// 전점 합계 조회
		List<AcGlMBatIO> acGlMList = _getAcGlMBat().selectEntrBrnchSum(instCd, prcsDt);

		for (AcGlMBatIO sumAcGlMBatIO : acGlMList){

			acGlMBatIO = new AcGlMBatIO();
			_getCmnContext().setHeaderColumn(acGlMBatIO);

			acGlMBatIO.setInstCd(instCd);
			acGlMBatIO.setDeptId(CAC01.ALL_ACCTG_DEPARTMENT);
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
			logger.debug("## GlDcsn > 전점합계 처리 End");
		}
	}

	
	/**
	 * 총계정원장 이월처리
	 * @throws BizApplicationException
	 */
	private void _generalledgerProcessCarryingForward() throws BizApplicationException {

		// 이월시작일은 확정시작일의 익영업일
		crygFrwrdStartDt = _getDateCalculator().calculateDateBusiness(prcsDt).getNxtBizDt(); 
		if(logger.isDebugEnabled()){
			logger.debug("## GlDcdd > 총계정원장 이월처리 Start");
			logger.debug("## GlDcdd > 이월시작일 :", crygFrwrdStartDt);
		}

		// 이월처리
		_processCarryingForward(crygFrwrdStartDt);

		if(logger.isDebugEnabled()){
			logger.debug("## GlDcdd > 총계정원장 이월처리 End");
		}
	}
	
	/**
	 * 이월처리 - 전점합산제외
	 * @throws BizApplicationException
	 */
	private void _processCarryingForward(String nxtBizDt) throws BizApplicationException{

		// 이월처리 대상 조회
		AcGlMCrygFrwrdBatIO acGlMCrygFrwrdBatIO = new AcGlMCrygFrwrdBatIO();
		_getCmnContext().setHeaderColumn(acGlMCrygFrwrdBatIO);

		acGlMCrygFrwrdBatIO.setInstCd(instCd);
		acGlMCrygFrwrdBatIO.setBaseDt(prcsDt);	
		acGlMCrygFrwrdBatIO.setNxtDt(nxtBizDt);
		acGlMCrygFrwrdBatIO.setDeptId(deptId);

		// 이월처리 대상건 조회(전점합계정보 제외)
		List<AcGlMBatIO> acGlMBatIOList = _getAcGlMBat().selectCrygFrwrdTgt(acGlMCrygFrwrdBatIO);	

		for (AcGlMBatIO acGlMBatIO : acGlMBatIOList) {
			AcGlMBatIO fwrdGlMIO = new AcGlMBatIO();
			
			_getCmnContext().setHeaderColumn(fwrdGlMIO);
			fwrdGlMIO = _getCarryingForwardData(acGlMBatIO, nxtBizDt, calcYrFirstDt, yrFirstBizDt, mnthFirstBizDt);
			
			// 익영업일의 누계액, 평잔 부분만 업데이트
			int cnt = _getAcGlMBat().updateAcmltdAmt(fwrdGlMIO);
			// 익영업일에 이월하려는 계정이 없을 경우, insert
			if(cnt == 0) {
				_getAcGlMBat().insert(fwrdGlMIO);
			}
		}
	}

	
	/**
	 * 이월 총계정 원장 데이터 작성
	 * @param inAcGlMBatIO
	 * @param mnthFirstBizDt 
	 * @param calMnthFirstDt 
	 * @param yrFirstBizDt 
	 * @param calcYrFirstDt 
	 * @param nxtDt
	 * @param isNxtDtHldy
	 * @return
	 * @throws BizApplicationException
	 */
	private AcGlMBatIO _getCarryingForwardData(AcGlMBatIO inAcGlMBatIO,String nxtBizDt, String calcYrFirstDt, String yrFirstBizDt, String mnthFirstBizDt) throws BizApplicationException{

		AcGlMBatIO acGlMBatIO = _getNewAcGlMIO(inAcGlMBatIO);
		acGlMBatIO.setBaseDt(nxtBizDt);
		acGlMBatIO.setAcctgDmnthAcmltdAmt(inAcGlMBatIO.getAcctgDmnthAcmltdAmt());
		acGlMBatIO.setAcctgDtrmAcmltdAmt(inAcGlMBatIO.getAcctgDtrmAcmltdAmt());

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

		while(nxtDt.compareTo(nxtBizDt) < 0){

			String hldyYn = _getDateCalculator().checkDateHoliday(nxtDt); // 휴일여부

			if(logger.isDebugEnabled()){
				logger.debug("#### HOLIDAY CHECK START ");
				logger.debug("#### GlDcdd > nxtDt : {}", nxtDt);
				logger.debug("#### GlDcdd > nxtBizDt : {}", nxtBizDt);
				logger.debug("#### GlDcdd > hldyYn : {}", hldyYn);
			}
 
			if(nxtDt.equals(calcYrFirstDt)){
				inAcGlMBatIO.setAcctgDmnthAcmltdAmt(inAcGlMBatIO.getAcctgBal()); // 계리월중적수
				inAcGlMBatIO.setAcctgDtrmAcmltdAmt(inAcGlMBatIO.getAcctgBal()); // 계리기중적수
			}
			// 확정일의 익일이 휴일일 경우, 휴일수 만큼 계리월중적수와 계리기중적수에 계리잔액을 더해줘서 이월
			else if(CAC01.YES.equals(hldyYn)){
				inAcGlMBatIO.setAcctgDmnthAcmltdAmt(inAcGlMBatIO.getAcctgDmnthAcmltdAmt().add(inAcGlMBatIO.getAcctgBal())); // 계리월중적수
				inAcGlMBatIO.setAcctgDtrmAcmltdAmt(inAcGlMBatIO.getAcctgDtrmAcmltdAmt().add(inAcGlMBatIO.getAcctgBal())); // 계리기중적수
			}
			// 확정일의 익일이 휴일이 아닐경우 break
			else{
				break;
			}
			// 확정일 익일의 익일
			nxtDt = _getDateCalculator().calculateDate(nxtDt).getNxtDt();
		}


		// 이월시작일이 연초영업일일 경우
		if(yrFirstBizDt.equals(nxtBizDt)){
			if(logger.isDebugEnabled()){
				logger.debug("## GlDcdd > 연초영업일");
			}
			// BSIS구분코드가 IS일때, 계정의 모든 금액을 0으로 셋팅(IS계정은 1년단위로 끊기 때문에)
			if(BsisDscdEnum.IS.getValue().equals(inAcGlMBatIO.getBsisDscd())){
				acGlMBatIO.setAcctgBal(ZERO);				
				acGlMBatIO.setExBal(ZERO);
				acGlMBatIO.setAcctgDmnthAcmltdAmt(ZERO);	// 계리월중적수
				acGlMBatIO.setAcctgDtrmAcmltdAmt(ZERO);	// 계리기중적수
			}else{ // BS는 전영업일의 금액을 가져옴
				acGlMBatIO.setAcctgBal(inAcGlMBatIO.getAcctgBal());
				acGlMBatIO.setExBal(inAcGlMBatIO.getExBal());
				acGlMBatIO.setAcctgDmnthAcmltdAmt(inAcGlMBatIO.getAcctgDmnthAcmltdAmt());	// 계리월중적수
				acGlMBatIO.setAcctgDtrmAcmltdAmt(inAcGlMBatIO.getAcctgDtrmAcmltdAmt());	// 계리기중적수			
			}
		}else{
			// 영업일자 이월			
			acGlMBatIO.setAcctgBal(inAcGlMBatIO.getAcctgBal());	
			acGlMBatIO.setExBal(inAcGlMBatIO.getExBal());
			acGlMBatIO.setDtrmMnyRcvdAcmltdAmt(inAcGlMBatIO.getDtrmMnyRcvdAcmltdAmt());     //기중입금적수
			acGlMBatIO.setDtrmWhdrwlAcmltdAmt(inAcGlMBatIO.getDtrmWhdrwlAcmltdAmt());     //기중출금적수

			// 계리기중적수 = 기존계리기중적수 + 계리잔액
			acGlMBatIO.setAcctgDtrmAcmltdAmt(inAcGlMBatIO.getAcctgDtrmAcmltdAmt());	//계리기중적수(휴일자 감안한 금액)

			//이월시작일이 월초일인 경우
			if(mnthFirstBizDt.equals(nxtBizDt)){
				if(logger.isDebugEnabled()){
					logger.debug("## GlDcdd > 월초 이월");
				}
				acGlMBatIO.setDmnthMnyRcvdAcmltdAmt(ZERO);      //월중입금적수
				acGlMBatIO.setDmnthWhdrwlAcmltdAmt(ZERO);      //월중출금적수
				acGlMBatIO.setAcctgDmnthAcmltdAmt(ZERO);  //계리월중적수
			}
			else {
				acGlMBatIO.setDmnthMnyRcvdAcmltdAmt(inAcGlMBatIO.getDmnthMnyRcvdAcmltdAmt());   //월중입금적수
				acGlMBatIO.setDmnthWhdrwlAcmltdAmt(inAcGlMBatIO.getDmnthWhdrwlAcmltdAmt());   //월중출금적수
				acGlMBatIO.setAcctgDmnthAcmltdAmt(inAcGlMBatIO.getAcctgDmnthAcmltdAmt());  //계리월중적수
			}		
		}		
		return acGlMBatIO;
	}

	
	/**
	 * AcGlMBatIO 정보 New 로 생성
	 * @param inAcGlMBatIO
	 * @return
	 * @throws BizApplicationException
	 */
	private AcGlMBatIO _getNewAcGlMIO(AcGlMBatIO inAcGlMBatIO) throws BizApplicationException {
		
		if(logger.isDebugEnabled()){
			logger.debug("## GlDcdd > AcGlMBatIO 정보 New 로 생성");
		}
		AcGlMBatIO acGlMBatIO = new AcGlMBatIO();

		_getCmnContext().setHeaderColumn(acGlMBatIO);
		acGlMBatIO.setInstCd(inAcGlMBatIO.getInstCd());
		acGlMBatIO.setDeptId(inAcGlMBatIO.getDeptId());
		acGlMBatIO.setBaseDt(inAcGlMBatIO.getBaseDt());
		acGlMBatIO.setAcctgDscd(inAcGlMBatIO.getAcctgDscd());
		acGlMBatIO.setAcctgItmCd(inAcGlMBatIO.getAcctgItmCd());
		acGlMBatIO.setCrncyCd(inAcGlMBatIO.getCrncyCd());
		_clearAmount(acGlMBatIO);

		// 계정과목코드를 읽어서 차변대변구분코드 set
		CoaDtlIO coaDtlIO = _getCoa().getCoa(instCd, inAcGlMBatIO.getAcctgDscd(), inAcGlMBatIO.getAcctgItmCd());
		acGlMBatIO.setDebitCrdtDscd(coaDtlIO.getDebitCrdtDscd());

		return acGlMBatIO;
	}

	
	/**
	 * GL DTO Balance clear
	 * 
	 * @param inAcGlMBatIO
	 * @throws BizApplicationException
	 */
	private void _clearAmount(AcGlMBatIO inAcGlMBatIO) throws BizApplicationException{

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
	 * @return the cmnContext
	 */
	private CmnContext _getCmnContext() {
		if (cmnContext == null) {
			cmnContext = (CmnContext) CbbApplicationContext.getBean(CmnContext.class, cmnContext);
		}
		return cmnContext;
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
	 * @return the acGlMBat
	 */
	private AcGlMBat _getAcGlMBat() {
		if (acGlMBat == null) {
			acGlMBat = (AcGlMBat) CbbApplicationContext.getBean(AcGlMBat.class, acGlMBat);
		}
		return acGlMBat;
	}
}
