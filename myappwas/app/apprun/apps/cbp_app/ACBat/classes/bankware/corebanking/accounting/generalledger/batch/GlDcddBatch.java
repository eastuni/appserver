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
import bxm.context.das.DasDuplicateKeyException;


@BxmBean("GlDcddBatch")
@Scope("step")
@BxmCategory(logicalName = "Generalledger batch")
public class GlDcddBatch implements Tasklet {
	final Logger logger = LoggerFactory.getLogger(this.getClass());

	private AcGlMBat			acGlMBat;
	private DateCalculator		dateCalculator;
	private Acctg			acctg;
	private Coa					coa;
	private CmnContext			cmnContext;

	private String 				instCd;
	private String				jobDt;
	private String				dcddStartDt;
	private String				dcddEndDt;	
	private String				crygFrwrdStartDt;
	private String				prcsDt;

	private final BigDecimal ZERO = BigDecimal.ZERO;

	@Override
	public RepeatStatus execute(StepContribution arg0, ChunkContext arg1) throws Exception {
		/*
		 * 입력데이터 검증 : 날짜유효성을 체크한다.(오늘이전날짜만 거래가능하도록)
		 * 	확정시작일 : dcddStartDt, 확정종료일 : dcddEndDt
		 * 
		 * 1. 확정일 전점 합계정보 삭제
		 * 
		 * 2. 확정일, 실계정이 아닌 계정과목코드의 잔액을 모두 clear
		 * 
		 * 3. 양변계정 확정처리(ex:본지점거래)
		 * 	3.1 계정잔액과 상대계정잔액의 차를 계산한다.
		 *		차변계정잔액이 더 큰 경우
		 *			- 통합계정잔액(계정과목코드:차변계정과목코드, 계리잔액:차변계정잔액과 상대계정잔액의 차)
		 *			- 피통합계정잔액(계정과목코드:상대계정과목코드, 계리잔액:0)
		 *		상대계정잔액이 더 큰 경우
		 *			- 통합계정잔액(계정과목코드:상대계정과목코드, 계리잔액:차변계정잔액과 상대계정잔액의 차)
		 *			- 피통합계정잔액(계정과목코드:차변계정과목코드, 계리잔액:0)
		 *  
		 * 4. 손실이익금 처리(계정과목분류코드가 05[수익], 06[비용]인 것)
		 * 	4.1 손실금, 이익금 합계를 조회한다.
		 * 	4.2 손실금과 이익금의 차를 계산한다.
		 * 		손실금이 더 큰 경우
		 * 			- 계정과목코드:당기순손실, 계리잔액:손실금과 이익금의 차
		 * 		이익금이 더 큰 경우
		 * 			- 계정과목코드:당기순이익, 계리잔액:이익금과 손실금의 차
		 * 	4.3 계정과목코드를 읽어서 차변대변구분코드를 set한다.
		 * 	4.4 손실금/이익금 계정을 갱신한다.
		 * 
		 * 5. 실계정 확정처리 
		 * 
		 * 6. 실계정의 상위계정 확정
		 * 	6.1 같은 상위계정과목코드가 있는 계정과목코드의 계리잔액을 SUM해서 상위계정과목코드의 계리잔액을 set한다.
		 * 		이미 잔액이 존재할 경우, update시킨다.
		 * 
		 * 7. 총계정원장에서 로그일련번호가 0이 아닌 것 모두 삭제
		 * 
		 * 8. 전점합계처리 - 이월처리시에는 전점합계정보 제외
		 * 	8.1 위에서 확정된 총계정원장을 바탕으로 전점합계처리를 진행한다.(deptId가 네자리인 경우 9999로)
		 * 
		 * 9. 총계정원장 이월처리
		 * 	9.1 연초 첫거래일 경우(1.1일의 익영업일을 구해야함, 1월 1일은 휴일이기 때문에)
		 * 		9.1.1 IS의 잔액은 0으로 셋팅(IS는 년단위(1/1~12/31) 기준으로 설정하고 BS는 계속 이어지기 때문)
		 *		9.1.2 BS는 확정일자의 잔액으로 셋팅한다.(계리잔액/계리월중적수/계리기중적수 -> 확정일의 계리잔액)
		 *	9.2 영업일자 이월
		 *		9.2.1 확정일자 기준 기중입금적수, 기중출금적수, 월중입금적수, 월중출금적수
		 *			계리월중적수(기존계리월중적수+계리잔액), 계리기중적수(기존계리기중적수+계리잔액)
		 *		9.2.2 월초인 경우
		 *			월중입금적수(0), 월중출금적수(0), 계리월중적수(계리잔액)
		 *	9.3 총계정원장 등록
		 *		9.3.1 원장내역이 없으면 insert
		 *			   원장내역이 있으면 update(마감후거래가 있을 경우 익일처리를 하기 때문에 원장내역이 있을 수 있음)
		 */
		instCd = (String)arg1.getStepContext().getJobExecutionContext().get("instCd");				// 기관코드
		jobDt = (String)arg1.getStepContext().getJobExecutionContext().get("jobDt");  				// 작업일자
		dcddStartDt = (String)arg1.getStepContext().getJobExecutionContext().get("dcddStartDt");	// 확정시작일
		dcddEndDt = (String)arg1.getStepContext().getJobExecutionContext().get("dcddEndDt");		// 확정종료일

		// 1. 입력데이터 검증
		_checkBizDate(dcddStartDt, "@dcddStartDt");
		_checkBizDate(dcddEndDt, "@dcddEndDt");

		prcsDt = dcddStartDt; // 확정시작일

		// 확정시작일이 확정종료일과 같아질 때 까지 반복 한다.
		while(prcsDt.compareTo(dcddEndDt) <= 0) {

			if(logger.isDebugEnabled()){
				logger.debug("## GlDcdd > 총계정원장 확정 처리 Start");
			}

			// 1. 확정일 전점 합계정보 삭제 (전점부서식별자 : 9999)
			_getAcGlMBat().deleteEntrBrnchSum(instCd, prcsDt, CAC01.ALL_ACCTG_DEPARTMENT);

			// 2. 실계정이 아닌 계정과목코드의 잔액을 모두 clear
			_clearNotRealTitlAcctgItmCd(instCd, prcsDt);

			// 3. 양변계정 확정처리
			_decideBothSideAccountingBal();

			// 4. 손실금이익금 처리
			_processProfitLossAccountingBal();

			// 5. 실계정 확정처리
			_processRealTitlYn();

			// 6. 상위계정 확정처리(실계정인것만)
			_processUpAcctgItmCd();

			// 7. 총계정원장에서 로그일련번호가 0이 아닌 것 모두 삭제
			_deleteByLogSeqNbr();

			// 8. 전점합계 처리
			_processEntireBranchSum();

			if(logger.isDebugEnabled()){
				logger.debug("## GlDcdd > 총계정원장 확정 처리 End");
			}

			// 9. 총계정원장 이월 처리
			_generalledgerProcessCarryingForward();

			// 확정, 이월처리 이후 익영업일로 set
			prcsDt  = _getDateCalculator().calculateDateBusiness(prcsDt).getNxtBizDt();
		}
		return RepeatStatus.FINISHED;
	}


	private void _processRealTitlYn() throws BizApplicationException {

		if(logger.isDebugEnabled()){
			logger.debug("## GlDcdd > _processRealTitlYn START");
		}
//		String bfBizDt = _getDateCalculator().calculateDateBusiness(glMaxBaseDt).getBfBizDt();

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
		prcsDtAcctgItmList = _getAcGlMBat().selectListByAcctgItmCd(instCd, null, prcsDt, acctgItmCdList, CAC01.YES, null, null); // 계정과목코드별 계리잔액

		for(AcGlMBatIO acGlMIO : prcsDtAcctgItmList){

//			BigDecimal blkMnyRcvdAmt = acGlMIO.getBlkMnyRcvdAmt(); 
//			BigDecimal blkDrwgOutAmt = acGlMIO.getBlkDrwgOutAmt(); 
//			BigDecimal redMnyRcvdAmt = acGlMIO.getRedMnyRcvdAmt(); 
//			BigDecimal redDrwgOutAmt = acGlMIO.getRedDrwgOutAmt(); 
			BigDecimal dmnthMnyRcvdAcmltdAmt = acGlMIO.getDmnthMnyRcvdAcmltdAmt();
			BigDecimal dmnthDrwgOutAcmltdAmt = acGlMIO.getDmnthWhdrwlAcmltdAmt();
			BigDecimal dtrmMnyRcvdAcmltdAmt = acGlMIO.getDtrmMnyRcvdAcmltdAmt();
			BigDecimal dtrmDrwgOutAcmltdAmt = acGlMIO.getDtrmWhdrwlAcmltdAmt();
			BigDecimal acctgDmnthAcmltdAmt = acGlMIO.getAcctgDmnthAcmltdAmt();
			BigDecimal acctgDtrmAcmltdAmt = acGlMIO.getAcctgDtrmAcmltdAmt();

			_clearAcmltdAmt(acGlMIO);

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
			glMBatIO.setAcctgBal(acGlMIO.getAcctgBal());
			glMBatIO.setExBal(acGlMIO.getExBal());
			glMBatIO.setBlkMnyRcvdAmt(acGlMIO.getBlkMnyRcvdAmt());
			glMBatIO.setBlkWhdrwlAmt(acGlMIO.getBlkWhdrwlAmt());
			glMBatIO.setRedMnyRcvdAmt(acGlMIO.getRedMnyRcvdAmt());
			glMBatIO.setRedWhdrwlAmt(acGlMIO.getRedWhdrwlAmt());

			AcGlMBatIO glMAmtSum = new AcGlMBatIO();
			glMAmtSum = _getAcGlMBat().selectAmtSum(instCd, acGlMIO.getDeptId(), acGlMIO.getBaseDt(), acGlMIO.getAcctgDscd(), acGlMIO.getAcctgItmCd(), acGlMIO.getCrncyCd());

			CoaDtlIO coaDtlIO = _getCoa().getCoa(instCd, glMBatIO.getAcctgDscd(), glMBatIO.getAcctgItmCd());
			// BS일 때만 평잔 설정
			if(BsisDscdEnum.BS.getValue().equals(coaDtlIO.getBsisDscd())){
				glMBatIO.setDmnthMnyRcvdAcmltdAmt(dmnthMnyRcvdAcmltdAmt.add(glMAmtSum.getBlkMnyRcvdAmt().subtract(glMAmtSum.getRedWhdrwlAmt())));// 월중입금적수(확정일)+{흑서입금금액(확)-주서출금금액(확)}
				glMBatIO.setDmnthWhdrwlAcmltdAmt(dmnthDrwgOutAcmltdAmt.add(glMAmtSum.getBlkWhdrwlAmt().subtract(glMAmtSum.getRedMnyRcvdAmt())));// 월중출금적수(확정일)+{흑서출금금액(확)-주서입금금액(확)}
				glMBatIO.setDtrmMnyRcvdAcmltdAmt(dtrmMnyRcvdAcmltdAmt.add(glMAmtSum.getBlkMnyRcvdAmt().subtract(glMAmtSum.getRedWhdrwlAmt())));// 기중입금적수(확정일)+{흑서입금금액(확)-주서출금금액(확)}
				glMBatIO.setDtrmWhdrwlAcmltdAmt(dtrmDrwgOutAcmltdAmt.add(glMAmtSum.getBlkWhdrwlAmt().subtract(glMAmtSum.getRedMnyRcvdAmt())));// 기중출금적수(확정일)+{흑서출금금액(확)-주서입금금액(확)}
				glMBatIO.setAcctgDmnthAcmltdAmt(acctgDmnthAcmltdAmt.add(acGlMIO.getAcctgBal()));// 계리월중적수(확정일)+계리잔액(확정일)
				glMBatIO.setAcctgDtrmAcmltdAmt(acctgDtrmAcmltdAmt.add(acGlMIO.getAcctgBal()));// 계리기중적수(확정일)+계리잔액(확정일)
			}else{
				if(logger.isDebugEnabled()){
					logger.debug("##GlDcddImpl > IS계정 누계액, 평잔 X");
				}
			}

			int updateCnt = _getAcGlMBat().update(glMBatIO);
			if(updateCnt == 0){
				_getAcGlMBat().insert(glMBatIO);
			}
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

		if (StringUtils.isEmpty(instCd)) {
			// {기관코드}는 필수 입력 항목입니다.
            throw new BizApplicationException("AAPCME0006",new Object[] { "Institution Code" });
        }
		if(logger.isDebugEnabled()){
			logger.debug("## GlDcdd > BusinessDate : {}", _getCmnContext().getBusinessDate());
		}
	}


	private void _deleteByLogSeqNbr() throws BizApplicationException {

		if(logger.isDebugEnabled()){
			logger.debug("## GlDcdd > delete logSeqNbr ZERO STRAT ");
		}

		// 로그일련번호가 0이 아닌것 삭제
		int cnt = _getAcGlMBat().deleteByLogSeqNbr(instCd, null, null, null, null, prcsDt);
		if(cnt == 0) return ;
			//throw new BizApplicationException("AAPACE3079");		

		if(logger.isDebugEnabled()){
			logger.debug("## GlDcdd > delete logSeqNbr ZERO END ");
		}
	}

	
	private void _decideBothSideAccountingBal() throws BizApplicationException{
		/*
		 * 1. 처리대상 양변계정 잔액 조회(차변계정잔액/대변계정잔액/차액)
		 * 2. 차액이 양수일 때(차변계정잔액>대변계정잔액)
		 * 		- 차변의 logSeqNbr 0 의 잔액이 0인지 아닌지 확인
		 * 			>> 계리잔액이 0이거나 없으면(전일자 대변계정으로 통합된 것)
		 * 				: 대변계정의 logSeqNbr 0 의 계리잔액을 0으로 만들어주면서 입출금 처리
		 * 				    차변계정에도 같이 적용
		 * 					
		 * 			>> 계리잔액이 0이 아니면(전일자 차변계정으로 통합된 것)
		 * 				>> 대변계정 잔액 있으면 : 대변계정에 있는 계리잔액, 입지급금액을 그대로 가져온다
		 * 				>> 대변계정 잔액 없으면 : 그대로 냅둔다
		 * 
		 * 3. 차액이 음수일 때(차변계정잔액<대변계정잔액)
		 * 		- 차변의 logSeqNbr 0 의 잔액이 0인지 아닌지 확인
		 * 			>> 계리잔액이 0이면(전일자 대변계정으로 통합된 것)
		 * 				: 차변에 있는 계리잔액, 입지금액을 대변계정에 그대로 옮겨준다
		 * 			>> 계리잔액이 0이 아니면(전일자 차변계정으로 통합된 것)
		 * 				>> 대변계정 잔액 없으면
		 * 					: 차변의 입지금액을 대변에 옮겨주고, logSeqNbr0의 계리잔액을 대변계정에 입지급처리하여 대변의 계리잔액 구함
		 * 					(차변예시)
		 * 					=================================================
		 * 					logSeqNbr	acctgBal	rcvdAmt		drwgOutAmt
		 * 					-------------------------------------------------
		 * 					0			150(0)		150						>> logSeqNbr 0의 잔액을 0으로 만드는 입지급처리
		 * 					-------------------------------------------------			
		 * 					1			-1000		1000
		 * 					2			500						500
		 * 					=================================================
		 * 					Total		-350		1000		500
		 * 	
		 * 					(대변예시)
		 * 					=================================================
		 * 					logSeqNbr	acctgBal	rcvdAmt		drwgOutAmt
		 * 					-------------------------------------------------
		 * 											1000-150	500
		 * 					=================================================
		 * 					Total		350			850			500			  				
		 * 				
		 * 				>> 대변계정 잔액 있으면
		 * 					: 차변의 입지급 금액을 대변에 옮겨주고, 대변계정의 logSeqNbr0을 0로 만드는 입지급처리까지 함께 해준 후 계리잔액 산출
		 * 					(차변예시)
		 * 					=================================================
		 * 					logSeqNbr	acctgBal	rcvdAmt		drwgOutAmt
		 * 					-------------------------------------------------
		 * 					1			-1000		1000
		 * 					2			500						500
		 * 					=================================================
		 * 					Total		-500		1000		500
		 * 	
		 * 					(대변예시)
		 * 					=================================================
		 * 					logSeqNbr	acctgBal	rcvdAmt		drwgOutAmt
		 * 					-------------------------------------------------
		 * 					0			100
		 * 					-------------------------------------------------
		 * 											1000		500
		 * 					=================================================
		 * 					Total		600			1000		500	 					 				
		 */
		if(logger.isDebugEnabled()){
			logger.debug("## GlDcdd > 양변계정 확정 START");
		}
		
		/*
		 * 1. 처리대상 양변계정 잔액 조회
		 */
		List<AcGlMBtsdAcctgItmBalBatIO> btsdAcctgItmBalList = _getAcGlMBat().selectListBtsdAcctgItmBal(instCd, prcsDt, null);
		if(logger.isDebugEnabled()){
			logger.debug("## GlDcdd > btsdAcctgItmBalList:{}",btsdAcctgItmBalList );
		}		
		int updateCnt = 0;

		for (AcGlMBtsdAcctgItmBalBatIO btsdAcctgItmBal : btsdAcctgItmBalList) {
			/*
			 * 차변데이터(dbtLogSeqNbrZero : 확정일 차변계정과목코드 로그일련번호 0 데이터 / dbtAcGlMBatIO : 확정일 차변계정과목코드의 합계)
			 */
			AcGlMBatIO dbtLogSeqNbrZero = _getAcGlMBat().select(btsdAcctgItmBal.getInstCd(), btsdAcctgItmBal.getDeptId(), prcsDt, btsdAcctgItmBal.getAcctgDscd(), 
					btsdAcctgItmBal.getAcctgItmCd(), btsdAcctgItmBal.getCrncyCd(), CAC01.STR_ZERO);
			AcGlMBatIO dbtAcGlMBatIO = _getAcGlMBat().selectAmtSum(instCd, btsdAcctgItmBal.getDeptId(), prcsDt, btsdAcctgItmBal.getAcctgDscd(), btsdAcctgItmBal.getAcctgItmCd(), btsdAcctgItmBal.getCrncyCd());

			/*
			 * 대변데이터(cdtLogSeqNbrZero : 확정일 대변계정과목코드 로그일련번호 0 데이터 / cdtAcGlMBatIO : 확정일 대변계정과목코드의 합계)
			 */
			AcGlMBatIO cdtLogSeqNbrZero = _getAcGlMBat().select(btsdAcctgItmBal.getInstCd(), btsdAcctgItmBal.getDeptId(), prcsDt, btsdAcctgItmBal.getAcctgDscd(), 
					btsdAcctgItmBal.getRltdAcctgItmCd(), btsdAcctgItmBal.getCrncyCd(), CAC01.STR_ZERO);


			dbtAcGlMBatIO.setLastChngTmstmp(_getCmnContext().getTxTimestampToString());
			dbtAcGlMBatIO.setLastChngGuid(_getCmnContext().getGuid());
			/*
			 * 2. 차액이 양수인 경우(차변계정 계리잔액 > 대변계정 계리잔액)
			 */
			if (btsdAcctgItmBal.getDfrncBal().compareTo(ZERO) >= 0) {   
				if(logger.isDebugEnabled()){
					logger.debug("## GlDcdd > 차액양수");
				}
				// 대변계정과목이 있고, 계리잔액이 0이 아닐 때(전일자 대변으로 확정된 것, 입지급처리 필요)
				if(cdtLogSeqNbrZero != null && cdtLogSeqNbrZero.getAcctgBal().compareTo(ZERO) != 0){
					dbtAcGlMBatIO.setAcctgBal(dbtAcGlMBatIO.getAcctgBal().subtract(cdtLogSeqNbrZero.getAcctgBal()));
					dbtAcGlMBatIO.setExBal(dbtAcGlMBatIO.getExBal().subtract(cdtLogSeqNbrZero.getExBal()));
					dbtAcGlMBatIO.setBlkWhdrwlAmt(dbtAcGlMBatIO.getBlkWhdrwlAmt().subtract(cdtLogSeqNbrZero.getAcctgBal()));


					cdtLogSeqNbrZero.setBlkMnyRcvdAmt(ZERO);
					cdtLogSeqNbrZero.setBlkWhdrwlAmt(cdtLogSeqNbrZero.getBlkWhdrwlAmt().add(cdtLogSeqNbrZero.getAcctgBal()));
					cdtLogSeqNbrZero.setRedMnyRcvdAmt(ZERO);
					cdtLogSeqNbrZero.setRedWhdrwlAmt(ZERO);
					cdtLogSeqNbrZero.setAcctgBal(ZERO);
					cdtLogSeqNbrZero.setExBal(ZERO);
					_getAcGlMBat().update(cdtLogSeqNbrZero);


				}
				dbtAcGlMBatIO.setLogSeqNbr(ZERO);
				updateCnt = _getAcGlMBat().update(dbtAcGlMBatIO);
				if(updateCnt == 0){
					_getAcGlMBat().insert(dbtAcGlMBatIO);
				}
			}
			/*
			 * 3. 차액이 음수인 경우(차변계정 계리잔액 < 대변계정 계리잔액)
			 */
			else{
				if(cdtLogSeqNbrZero == null){
					cdtLogSeqNbrZero = new AcGlMBatIO();
					_getCmnContext().setHeaderColumn(cdtLogSeqNbrZero);
					cdtLogSeqNbrZero.setInstCd(instCd);
					cdtLogSeqNbrZero.setDeptId(btsdAcctgItmBal.getDeptId());
					cdtLogSeqNbrZero.setBaseDt(prcsDt);
					cdtLogSeqNbrZero.setAcctgDscd(btsdAcctgItmBal.getAcctgDscd());
					cdtLogSeqNbrZero.setAcctgItmCd(btsdAcctgItmBal.getRltdAcctgItmCd());
					cdtLogSeqNbrZero.setCrncyCd(btsdAcctgItmBal.getCrncyCd());
					cdtLogSeqNbrZero.setLogSeqNbr(ZERO);
					cdtLogSeqNbrZero.setDebitCrdtDscd(DbtcdtdscdEnum.CREDIT.getValue());
				}


				// 전일자 차변으로 확정되었을 경우
				if(dbtLogSeqNbrZero != null && dbtLogSeqNbrZero.getAcctgBal().compareTo(ZERO) != 0){
					cdtLogSeqNbrZero.setAcctgBal(ZERO.subtract(dbtAcGlMBatIO.getAcctgBal()));
					cdtLogSeqNbrZero.setExBal(ZERO.subtract(dbtAcGlMBatIO.getExBal()));
					cdtLogSeqNbrZero.setBlkMnyRcvdAmt(dbtAcGlMBatIO.getBlkMnyRcvdAmt().subtract(dbtLogSeqNbrZero.getAcctgBal()));
					cdtLogSeqNbrZero.setBlkWhdrwlAmt(dbtAcGlMBatIO.getBlkWhdrwlAmt());
					cdtLogSeqNbrZero.setRedMnyRcvdAmt(dbtAcGlMBatIO.getRedMnyRcvdAmt());
					cdtLogSeqNbrZero.setRedWhdrwlAmt(dbtAcGlMBatIO.getRedWhdrwlAmt());
					if(logger.isDebugEnabled()){
						logger.debug("## GlDcdd > dbtAcGlMBatIO.getBlkMnyRcvdAmt() :{}", dbtAcGlMBatIO.getBlkMnyRcvdAmt());
						logger.debug("## GlDcdd > dbtLogSeqNbrZero.getAcctgBal() :{}", dbtLogSeqNbrZero.getAcctgBal());
						logger.debug("## GlDcdd > cdtLogSeqNbrZero.getBlkMnyRcvdAmt() :{}", dbtLogSeqNbrZero.getAcctgBal());
					}
					dbtAcGlMBatIO.setLogSeqNbr(ZERO);
					dbtAcGlMBatIO.setBlkMnyRcvdAmt(dbtLogSeqNbrZero.getAcctgBal());
					dbtAcGlMBatIO.setAcctgBal(ZERO);
					dbtAcGlMBatIO.setExBal(ZERO);
					dbtAcGlMBatIO.setBlkWhdrwlAmt(ZERO);
					dbtAcGlMBatIO.setRedMnyRcvdAmt(ZERO);
					dbtAcGlMBatIO.setRedWhdrwlAmt(ZERO);


				}
				// 전일자 대변으로 확정되었을 경우
				else{
					cdtLogSeqNbrZero.setAcctgBal(cdtLogSeqNbrZero.getAcctgBal().subtract(dbtAcGlMBatIO.getAcctgBal()));
					cdtLogSeqNbrZero.setExBal(cdtLogSeqNbrZero.getExBal().subtract(dbtAcGlMBatIO.getExBal()));
					cdtLogSeqNbrZero.setBlkMnyRcvdAmt(dbtAcGlMBatIO.getBlkMnyRcvdAmt());
					cdtLogSeqNbrZero.setBlkWhdrwlAmt(dbtAcGlMBatIO.getBlkWhdrwlAmt());
					cdtLogSeqNbrZero.setRedMnyRcvdAmt(dbtAcGlMBatIO.getRedMnyRcvdAmt());
					cdtLogSeqNbrZero.setRedWhdrwlAmt(dbtAcGlMBatIO.getRedWhdrwlAmt());


					dbtAcGlMBatIO.setAcctgBal(ZERO);
					dbtAcGlMBatIO.setExBal(ZERO);
					dbtAcGlMBatIO.setBlkMnyRcvdAmt(ZERO);
					dbtAcGlMBatIO.setBlkWhdrwlAmt(ZERO);
					dbtAcGlMBatIO.setRedMnyRcvdAmt(ZERO);
					dbtAcGlMBatIO.setRedWhdrwlAmt(ZERO);
				}


				updateCnt = _getAcGlMBat().update(cdtLogSeqNbrZero);
				if(updateCnt == 0){
					_getAcGlMBat().insert(cdtLogSeqNbrZero);
				}
				updateCnt = _getAcGlMBat().update(dbtAcGlMBatIO);
				if(updateCnt == 0){
					_getAcGlMBat().insert(dbtAcGlMBatIO);
				}


			}
			// 로그일련번호가 0이 아닌 것 삭제(차변)하여 이후 실계정확정시에 문제 없도록
			_getAcGlMBat().deleteByLogSeqNbr(instCd, btsdAcctgItmBal.getDeptId(), btsdAcctgItmBal.getAcctgDscd(), btsdAcctgItmBal.getAcctgItmCd(), btsdAcctgItmBal.getCrncyCd(), prcsDt);
			_getAcGlMBat().deleteByLogSeqNbr(instCd, btsdAcctgItmBal.getDeptId(), btsdAcctgItmBal.getAcctgDscd(), btsdAcctgItmBal.getRltdAcctgItmCd(), btsdAcctgItmBal.getCrncyCd(), prcsDt);
		}


		if(logger.isDebugEnabled()){
			logger.debug("## GlDcdd > 양변계정잔액 확정 처리 종료");
		}
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


		acGlMBatIO.setLastChngTmstmp(_getCmnContext().getTxTimestampToString());
		acGlMBatIO.setLastChngGuid(_getCmnContext().getGuid());


		return acGlMBatIO;
	}


	/**
	 * 손실금이익금 처리
	 * 
	 * @throws BizApplicationException
	 */
	private void _processProfitLossAccountingBal() throws BizApplicationException {
		if(logger.isDebugEnabled()){
			logger.debug("## GlDcdd > 손실금이익금 처리 Start");
		}


		// 4.1 손실금 이익금 합계를 조회한다
		List<AcGlMProfitLossSumBatIO> profitLossSumOutList = _getAcGlMBat().selectProfitLossSum(instCd, prcsDt, null);


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


			if(logger.isDebugEnabled()){
				logger.debug("## GlDcdd > profitLossSumOut.getLossAmt() :{}",profitLossSumOut.getLossAmt());
				logger.debug("## GlDcdd > profitLossSumOut.getPrftAmt() :{}",profitLossSumOut.getPrftAmt());
				logger.debug("## GlDcdd > profitLossAcGlMIO.getAcctgBal() :{}",profitLossAcGlMIO.getAcctgBal());
			}


			// 4.4 손실금/이익금 계정 갱신
			try {
				_getAcGlMBat().insert(profitLossAcGlMIO);
			} catch (DasDuplicateKeyException e) {
				if(logger.isDebugEnabled()){
					logger.debug("## GlDcdd > 손실금이익금 계정 이미있음 : {}", e);
				}
				_getAcGlMBat().update(profitLossAcGlMIO);
			}
		}
		if(logger.isDebugEnabled()){
			logger.debug("## GlDcdd > 손실금이익금 처리 End");
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
			logger.debug("## GlDcdd > 상위계정확정처리 Start");
		}


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


		// 계정과목코드별 계리잔액
		List<AcGlMBatIO> acctgItmList = new ArrayList<AcGlMBatIO>();


		// 실계정 목록 조회
		acctgItmList = _getAcGlMBat().selectListByAcctgItmCd(instCd, null, prcsDt, acctgItmCdList, CAC01.YES, null, null); // 계정과목코드별 계리잔액


		// 상위계정과목코드 통합
		_intgrtnUpAcctgItmCd1(acctgItmList);


	}


	private void _intgrtnUpAcctgItmCd1(List<AcGlMBatIO> acctgItmList) throws BizApplicationException {
		if(logger.isDebugEnabled()){
			logger.debug("## GlDcdd > 상위계정과목코드 통합 START");
		}


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
			// 계정과목코드가 이미 존재하면 있는 것에다가 add				
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


    private void _clearNotRealTitlAcctgItmCd(String instCd, String prcsDt) throws BizApplicationException {
		if(logger.isDebugEnabled()){
			logger.debug("## GlDcdd > 실계정아닌 계정과목코드의 잔액 clear");
		}


		// 실계정이 아닌 계정과목코드 조회
		List<AcGlMBatIO> notRealTitlAcctgList = new ArrayList<AcGlMBatIO>();
		notRealTitlAcctgList = _getAcGlMBat().selectListNotRealTitlAcctg(instCd, prcsDt, CAC01.NO, null, null); // 계정과목코드별 계리잔액


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
	}


    private String _getUpAcctgItmCd(String acctgItmCd) throws BizApplicationException {
    	String upAcctgItmCd = null;
		upAcctgItmCd = _getAcGlMBat().selectUpAcctgItmCd(instCd, acctgItmCd);


		return StringUtils.isEmpty(upAcctgItmCd) ? null : upAcctgItmCd;
    }


	/**
     * 전점합계 처리
     * 
     * @param prcsDt
     * @throws BizApplicationException
     */
	private void _processEntireBranchSum() throws BizApplicationException {
		if(logger.isDebugEnabled()){
			logger.debug("## GlDcdd > 전점합계 처리 Start");
		}
		AcGlMBatIO acGlMBatIO = new AcGlMBatIO();


		acGlMBatIO.setInstCd(instCd);
		acGlMBatIO.setBaseDt(prcsDt);
		acGlMBatIO.setDeptId(CAC01.ALL_ACCTG_DEPARTMENT);


		// 전점 합계 조회
		List<AcGlMBatIO> acGlMList = _getAcGlMBat().selectEntrBrnchSum(instCd, prcsDt);


		for (AcGlMBatIO sumAcGlMBatIO : acGlMList){
			if(logger.isDebugEnabled()){
				logger.debug("## GlDcdd > 전점합계 sumAcGlMBatIO.getAcctgBal() : {}",sumAcGlMBatIO.getAcctgBal());
			}
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
			logger.debug("## GlDcdd > 전점합계 처리 End");
		}
	}


	/**
	 * 총계정원장 이월처리
	 * @throws BizApplicationException
	 */
	private void _generalledgerProcessCarryingForward() throws BizApplicationException {
		if(logger.isDebugEnabled()){
			logger.debug("## GlDcdd > 총계정원장 이월처리 Start");
		}


		// 이월시작일은 확정시작일의 익영업일
		crygFrwrdStartDt = _getDateCalculator().calculateDateBusiness(prcsDt).getNxtBizDt(); 


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


		if(logger.isDebugEnabled()){
			logger.debug("## GlDcdd > 총계정원장 이월 Start");
			logger.debug("## GlDcdd > 이월대상일자, 확정일의 익영업일 nxtBizDt : {}", nxtBizDt);
		}


		// 이월처리 대상 조회
		AcGlMCrygFrwrdBatIO acGlMCrygFrwrdBatIO = new AcGlMCrygFrwrdBatIO();
		_getCmnContext().setHeaderColumn(acGlMCrygFrwrdBatIO);


		acGlMCrygFrwrdBatIO.setInstCd(instCd);
		acGlMCrygFrwrdBatIO.setBaseDt(prcsDt);	
		acGlMCrygFrwrdBatIO.setNxtDt(nxtBizDt);
		acGlMCrygFrwrdBatIO.setDeptId(CAC01.ALL_ACCTG_DEPARTMENT);


		// 이월처리 대상건 조회(전점합계정보 제외)
		List<AcGlMBatIO> acGlMBatIOList = _getAcGlMBat().selectCrygFrwrdTgt(acGlMCrygFrwrdBatIO);	


		for (AcGlMBatIO acGlMBatIO : acGlMBatIOList) {
			AcGlMBatIO fwrdGlMIO = new AcGlMBatIO();
			fwrdGlMIO = _getCarryingForwardData(acGlMBatIO, nxtBizDt);


			// 총계정원장 등록(원장내역이 없으면 insert, 있으면 update - 마감후 거래가 있을 경우 익일처리를 하기 때문에 원장내역이 있을 수 있음)				
			try {
				_getAcGlMBat().insert(fwrdGlMIO);
			} catch (DasDuplicateKeyException e) {
				// 이미 존재하는 익영업일의 총계정원장에 이월하려는 데이터를 add한다.
				if(logger.isDebugEnabled()){
					logger.debug("## GlDcdd > 익영업일자 총계정원장 내역이 이미 존재하여 update처리", e);
				}
				_getAcGlMBat().updateCrygFrwrdTgt(fwrdGlMIO);
//				_getAcGlMBat().update(fwrdGlMIO);
//				_getAcGlMBat().update(_addAcGlMBat(_getCarryingForwardData(acGlMBatIO, nxtBizDt)));
			}
		}
	}


	/**
	 * 이월 총계정 원장 데이터 작성
	 * @param inAcGlMBatIO
	 * @param nxtDt
	 * @param isNxtDtHldy
	 * @return
	 * @throws BizApplicationException
	 */
	private AcGlMBatIO _getCarryingForwardData(AcGlMBatIO inAcGlMBatIO,String nxtBizDt) throws BizApplicationException{


		if(logger.isDebugEnabled()){
			logger.debug("_getCrygFrwrdData input : {} ",inAcGlMBatIO.toString());
		}


		// 해당연도의 첫영업일을 구하기 위함
		String firstDate = "0101";
		String calcYrFirstBizDt = nxtBizDt.substring(0, 4) + firstDate; 
		// 해당연도 연초 영업일
		String yrFirstBizDt = _getDateCalculator().calculateDateBusiness(calcYrFirstBizDt).getBizDt();


		// 해당월의 첫영업일을 구하기 위함
		String firstDay = "01";
		String calMnthFirstBizDt = nxtBizDt.substring(0, 6) + firstDay; 
		// 월초 영업일
		String mnthFirstBizDt = _getDateCalculator().calculateDateBusiness(calMnthFirstBizDt).getBizDt();


		if(logger.isDebugEnabled()){
			logger.debug("## GlDcdd > calcYrFirstBizDt : {} ", calcYrFirstBizDt);
			logger.debug("## GlDcdd > calMnthFirstBizDt : {} ", calMnthFirstBizDt);
			logger.debug("## GlDcdd > Year First Business Date : {} ", yrFirstBizDt);
			logger.debug("## GlDcdd > Month First Business Date : {} ", mnthFirstBizDt);
		}


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
			}


			if(nxtDt.equals(calcYrFirstBizDt)){
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
	 * GL DTO Balance clear
	 * 
	 * @param inAcGlMBatIO
	 * @throws BizApplicationException
	 */
	private void _clearAcmltdAmt(AcGlMBatIO acGlMBatIO) throws BizApplicationException{
		if(logger.isDebugEnabled()){
			logger.debug("## GlDcdd > _clearAcmltdAmt Start");
		}
		acGlMBatIO.setDmnthMnyRcvdAcmltdAmt(ZERO); 
		acGlMBatIO.setDmnthWhdrwlAcmltdAmt(ZERO);
		acGlMBatIO.setDtrmMnyRcvdAcmltdAmt(ZERO);
		acGlMBatIO.setDtrmWhdrwlAcmltdAmt(ZERO);
		acGlMBatIO.setAcctgDmnthAcmltdAmt(ZERO);
		acGlMBatIO.setAcctgDtrmAcmltdAmt(ZERO);	
	}


	/**
	 * @return the instParmMgmt
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
	 * @return the coa
	 */
	private AcGlMBat _getAcGlMBat() {
		if (acGlMBat == null) {
			acGlMBat = (AcGlMBat) CbbApplicationContext.getBean(AcGlMBat.class, acGlMBat);
		}
		return acGlMBat;
	}
}
