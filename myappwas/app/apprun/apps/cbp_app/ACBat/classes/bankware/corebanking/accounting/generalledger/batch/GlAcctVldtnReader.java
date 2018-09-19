package bankware.corebanking.accounting.generalledger.batch;


import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.batch.core.ExitStatus;
import org.springframework.batch.core.StepExecution;
import org.springframework.batch.core.annotation.AfterStep;
import org.springframework.batch.core.annotation.BeforeStep;
import org.springframework.batch.item.ExecutionContext;
import org.springframework.batch.item.ItemReader;
import org.springframework.batch.item.ItemStream;
import org.springframework.batch.item.ItemStreamException;
import org.springframework.batch.item.NonTransientResourceException;
import org.springframework.batch.item.ParseException;
import org.springframework.batch.item.UnexpectedInputException;
import org.springframework.context.annotation.Scope;

import bankware.corebanking.accounting.cash.daobatch.AcTlrTxSumnDBat;
import bankware.corebanking.accounting.cash.daobatch.dto.AcTlrTxSumnDBatIO;
import bankware.corebanking.accounting.enums.AcctgDscdEnum;
import bankware.corebanking.accounting.enums.AcctgItmEnum;
import bankware.corebanking.accounting.generalledger.batch.dto.GlAcctVldtnOut;
import bankware.corebanking.accounting.generalledger.daobatch.AcGlMBat;
import bankware.corebanking.accounting.generalledger.daobatch.dto.AcGlAcctVldtnAmtBatIO;
import bankware.corebanking.accounting.generalledger.daobatch.dto.AcGlMBSDbtCdtSumOut;
import bankware.corebanking.accounting.generalledger.daobatch.dto.AcGlMBatIO;
import bankware.corebanking.accounting.generalledger.daobatch.dto.GlAcctVldtnInBatIO;
import bankware.corebanking.accounting.journalizing.interfaces.Acctg;
import bankware.corebanking.actor.department.interfaces.DeptMngr;
import bankware.corebanking.applicationcommon.commondata.interfaces.DateCalculator;
import bankware.corebanking.classinfo.annotation.CbbClassInfo;
import bankware.corebanking.context.CbbApplicationContext;
import bankware.corebanking.core.accounting.constant.CAC01;
import bankware.corebanking.core.accounting.enums.AcctgClsgEnum;
import bankware.corebanking.core.accounting.enums.AmtKndDscdEnum;
import bankware.corebanking.core.accounting.enums.BsisDscdEnum;
import bankware.corebanking.core.accounting.enums.DbtcdtdscdEnum;
import bankware.corebanking.core.accounting.enums.TitlAcctgClcdEnum;
import bankware.corebanking.core.actor.department.interfaces.dto.DeptSrchGetIn;
import bankware.corebanking.core.actor.department.interfaces.dto.DeptSrchGetOut;
import bankware.corebanking.core.actor.enums.SysDeptEnum;
import bankware.corebanking.core.applicationcommon.commondata.interfaces.dto.DateMngrCheckDtBizOut;
import bankware.corebanking.core.applicationcommon.constant.CCM01;
import bankware.corebanking.frm.app.BizApplicationException;
import bxm.common.annotaion.BxmCategory;
import bxm.container.annotation.BxmBean;
import bxm.context.das.DasUtils;


/**
 * Author	
 * History
 */
@BxmBean("GlAcctVldtnReader")
@Scope("step")
@BxmCategory(logicalName = "Generalledger Validation Reader", description = "GlAcctVldtnReader")
@CbbClassInfo(classType = { "ITEM_READER" })
public class GlAcctVldtnReader implements ItemStream, ItemReader<GlAcctVldtnOut> {
	final Logger logger = LoggerFactory.getLogger(this.getClass());

	private AcGlMBat				acGlMBat;
	private AcTlrTxSumnDBat			acTlrTxSumnDBat;
	private DeptMngr				deptMngr;
	private DateCalculator			dateCalculator;
	private Acctg				acctg;

	private String instCd;
	private String jobDt;
	private String bfBizDate;
	private String outpFileTrgt;

	private List<GlAcctVldtnOut> result = new ArrayList<GlAcctVldtnOut>();
	private GlAcctVldtnOut glAcctVldtnOut = new GlAcctVldtnOut();
	private Iterator<GlAcctVldtnOut> iterator;
	private static final String READ_COUNT = "read.count";
    private int crrntItmCnt = 0;
	private StringBuilder strBuilder;

	@BeforeStep
	public void beforeStep(StepExecution stepExecution) throws BizApplicationException{

		//Set the Job Parameter
		instCd = (String)stepExecution.getJobExecution().getExecutionContext().get("instCd");
		jobDt = (String)stepExecution.getJobExecution().getExecutionContext().get("jobDt");
		outpFileTrgt = (String)stepExecution.getJobExecution().getExecutionContext().get("outpFileTrgt");

		if(logger.isDebugEnabled()){
			logger.debug("## GlAcctVldtn > instCd : {}", instCd);
			logger.debug("## GlAcctVldtn > jobDt : {}", jobDt);
			logger.debug("## GlAcctVldtn > outputFile : {}", outpFileTrgt);
			logger.debug("## GlAcctVldtn > 멤버변수 셋팅 끝!!!!!");
		}
	}

	@Override
	public void open(ExecutionContext executionContext) throws ItemStreamException {

		/*
		 * 입력 데이터 검증 : 작업기준일이 현재일(계리기준일) 인지 검증한다.
		 * 작업기준일 : jobDt, 계리기준일 : 영업일
		 * 
		 * 부점
		 * 1. 총계정원장의 부점별 통화/타점권잔액 과 해당 부점의 텔러가 보유한 통화/타점권잔액이 일치 하는지 검증 한다.
		 * 해당 기관의 부점목록을 조회 한다.
		 * 1.1 부점 별로 총계정원장의 통화/타점권 잔액을 조회 한다.
		 * 1.2 부점 별로 텔러가 보유한 통화/타점권 잔액을 조회 한다.
		 * 1.3 1.1, 1.2 에서 조회한 잔액을 비교 한다.
		 * 오류가 있을경우 오류 내용을 기록 한다.
		 * 
		 * 부점
		 * 2.대차대조표 대차 검증
		 * 2.1실계정과목에 대해서 부점 단위로 차변의 합계와 대변의 합계를 비교 한다.
		 * 2.2 잔액, 월중적수, 기중적수를 비교 한다.
		 * 오류가 있을경우 오류 내용을 기록 한다.
		 * 
		 * 3. 손익검증
		 * 3.1 B/S 의 이익금계정 잔액과 P/L 의 수익 실계정의 잔액 합계가 일치 하는지 비교 한다.
		 * 3.2 P/L 수익 실계정의 잔액합계와 P/L 당기순손실 계정의 잔액과 비교 한다.
		 * 3.3 B/S 손실금계정 잔액과 P/L 비용 실계정의 잔액 합계가 일치 하는지 비교한다.
		 * 3.4 P/L 비용 실계정 잔액합계와 P/L 당기순이익 계정의 잔액과 비교 한다.
		 * 3.5 B/S 당기순이익을 검증한다.
		 * 3.5.1 B/S 당기순이익 = B/S 이익금 - B/S 손실금
		 * 3.5.2 B/S 당기순이익 = P/L 당기순손실 - P/S 당기순이익
		 *불일치 시 오류 내용을 기록 한다.
		 * 
		 * 4. 원화외화잔액 검증 (실계정 대상)
		 * 4.1 원화.계리잔액과 외화 SUM(원화잔액) 을 비교 한다.
		 *불일치 시 있을경우 오류 내용을 기록 한다.
		 *
		 * 5. 본지점 검증
		 * 5.1 은행레벨로 본지점 실계정에 대해서 SUM(차변원화본지점) 과 SUM(대변원화본지점) 의 일치 여부를 검증 한다.
		 * 불일치 시 오류 내용을 기록 한다.
		 * 
		 * 6. 마이너스 잔액 검증
		 * 6.1 실계정이면서 마이너스잔액을 허용하지 않는 계정에 대헤서 잔액이 0 보다 적은 경우가 있는지 검증 한다.
		 * 오류가 있을경우 오류 내용을 기록 한다.
		 */

		if(logger.isDebugEnabled()){
			logger.debug("## GlAcctVldtn > validation start");
		}
		strBuilder = new StringBuilder();

		if(executionContext.containsKey(READ_COUNT)) {
			this.crrntItmCnt = executionContext.getInt(READ_COUNT);
		}

		// 입력 데이터 검증 : 작업기준일이 현재일(계리기준일) 인지 검증한다.
		try {
			if(_vaildationDate()) {
				/*
				 * 부점별 검증
				 * 1. 총계정원장의 부점별 통화/타점권잔액 과 해당 부점의 텔러가 보유한 통화/타점권잔액이 일치 하는지 검증 한다.
				 * 2. 대차대조표 대차 검증
				 * 3. 손익검증
				 * 4. 현금, 비현금 계정과목코드 입출금금액 비교
				 */
				_vaildationByBranch();

				/*
				 * 5. 본지점 검증
				 * 5.1 은행레벨로 본지점 실계정에 대해서 SUM(차변원화본지점) 과 SUM(대변원화본지점) 의 일치 여부를 검증 한다.
				 */
				_vaildationInst();

				/*
				 * 6. 마이너스 잔액 검증
				 * 6.1 실계정이면서 마이너스잔액을 허용하지 않는 계정에 대헤서 잔액이 0 보다 적은 경우가 있는지 검증 한다.
				 * 실계정이면서 마이너스잔액을 허용하지 않는 계정 리스트를 조회 한다.
				 * 조회된값으로 0보다 작은지 확인 한다.
				 */
				_validationMinusBalAllWncNo();
			}
		} catch (BizApplicationException e) {
			logger.error("## GlAcctVldtnReader error : {}", e);
			e.printStackTrace();
		}

		iterator = result.iterator();

		if(logger.isDebugEnabled()){
			logger.debug("## GlAcctVldtn > result:{}", result);
			logger.debug(strBuilder.toString());
			logger.debug("## GlAcctVldtn > validation end");
		}
	}	

	@Override
	public GlAcctVldtnOut read() throws Exception, UnexpectedInputException, ParseException, NonTransientResourceException {

		GlAcctVldtnOut outParam = null;

		if(iterator.hasNext()){
			outParam = new GlAcctVldtnOut();

			this.crrntItmCnt++;
			GlAcctVldtnOut inParam = new GlAcctVldtnOut();

			inParam = iterator.next();

			outParam.setDstnctnNbr(inParam.getDstnctnNbr());// set [구분번호]
			outParam.setInstCd(inParam.getInstCd());// set [기관코드]
			outParam.setBrnchCd(inParam.getBrnchCd());// set [부점코드]
			outParam.setBaseDt(inParam.getBaseDt());// set [기준년월일]
			outParam.setCrncyCd(inParam.getCrncyCd());// set [통화코드]
			outParam.setDbtAmt(inParam.getDbtAmt());// set [차변금액]
			outParam.setCdtAmt(inParam.getCdtAmt());// set [대변금액]
			outParam.setErrAmt(inParam.getErrAmt());// set [오류금액]
		}
		return outParam;
	}

	/**
	 * 부점별 검증
	 * @throws BizApplicationException
	 */
	private void _vaildationByBranch() throws BizApplicationException {
		// 해당 기관의 부서 목록 조회
		for(DeptSrchGetOut deptSrchGetOut : _getDepartmentList()) {

			if(!isSpecialDepartment(deptSrchGetOut.getDeptId())) {
				// 1. 출납현금 검증
				_vaildationSndRcvCashAmt(deptSrchGetOut.getDeptId());

				// 2. 대차대조표 대차 검증
				_validationDbtCdtAmt(deptSrchGetOut.getDeptId());

				// 3. 손익검증
				_validationLossAndProfit(deptSrchGetOut.getDeptId());

				// 4. 현금계정, 현금계정 아닌 계정과목코드의 입출금금액 합계 비교
				_validationCashAndNotCashAmt(deptSrchGetOut.getDeptId());
			}else{
				if(logger.isDebugEnabled()){
					logger.debug("## GlAcctVldtnReader > specialDepartment ID : {}", deptSrchGetOut.getDeptId());
				}
			}
		}
	}

	/**
	 * 기관의 부서목록 조회
	 * @return
	 * @throws BizApplicationException
	 */
	private List<DeptSrchGetOut> _getDepartmentList() throws BizApplicationException {
		deptMngr = (DeptMngr) CbbApplicationContext.getBean(DeptMngr.class, deptMngr);

		DeptSrchGetIn deptSrchGetIn = new DeptSrchGetIn();
		List<DeptSrchGetOut> deptList = new ArrayList<DeptSrchGetOut>();
		deptSrchGetIn.setInstCd(this.instCd);

		// 해당 기관의 부점 목록을 조회 한다.
		deptList = deptMngr.getListDept(deptSrchGetIn);
		if(logger.isDebugEnabled()){
			logger.debug("## GlAcctVldtnReader > deptList : {}", deptList);
		}

		if(deptList == null) {
			return new ArrayList<DeptSrchGetOut>();
		}
		return deptList;
	}

	/**
	 * 총계정원장의 통화금액 조회
	 * @param deptId
	 * @return
	 * @throws BizApplicationException
	 */
	private List<AcGlMBatIO> _getDailyBalance(String deptId) throws BizApplicationException {
		acctg = (Acctg) CbbApplicationContext.getBean(Acctg.class, acctg);
		acGlMBat = (AcGlMBat) CbbApplicationContext.getBean(AcGlMBat.class, acGlMBat);

		GlAcctVldtnInBatIO inParam = new GlAcctVldtnInBatIO();

		inParam.setInstCd(this.instCd);
	    inParam.setDeptId(deptId);
		inParam.setBaseDt(this.bfBizDate);
		inParam.setAcctgDscd(AcctgDscdEnum.BANK.getValue());
		inParam.setAcctgItmCd(acctg.getAccountingItemCode(AcctgItmEnum.CASH.getValue()));// 통화

		List<AcGlMBatIO> dailyBsList = new ArrayList<AcGlMBatIO>();
		// 부점별 총계정원장의 통화/타점권잔액 을 조회 한다.
		dailyBsList = acGlMBat.selectListDailyBsByBrnch(inParam);

		if(dailyBsList == null) {
			return new ArrayList<AcGlMBatIO>();
		}
		return dailyBsList;
	}

	/**
	 * 텔러의 마감전 합계보유금액 조회
	 * @param deptId
	 * @return
	 * @throws BizApplicationException
	 */
	private List<AcTlrTxSumnDBatIO> _getTxSumnDList(String deptId) throws BizApplicationException {
		acTlrTxSumnDBat = (AcTlrTxSumnDBat) CbbApplicationContext.getBean(AcTlrTxSumnDBat.class, acTlrTxSumnDBat);

		// 부점별 텔러가 보유한 통화/타점권잔액 을 조회 한다.
		AcTlrTxSumnDBatIO acTlrTxSumnDBatIO = new AcTlrTxSumnDBatIO();
		acTlrTxSumnDBatIO.setInstCd(this.instCd);
		acTlrTxSumnDBatIO.setDeptId(deptId);
		acTlrTxSumnDBatIO.setBaseDt(this.bfBizDate);
		acTlrTxSumnDBatIO.setClsgBfafDscd(AcctgClsgEnum.BF_CLSG.getValue());
		acTlrTxSumnDBatIO.setAmtKndDscd(AmtKndDscdEnum.CASH.getValue());

		List<AcTlrTxSumnDBatIO> acTlrTxSumnDList = new ArrayList<AcTlrTxSumnDBatIO>();
		acTlrTxSumnDList = acTlrTxSumnDBat.selectBrnchTxSummaryAmt(acTlrTxSumnDBatIO);
		if(logger.isDebugEnabled()){
			logger.debug("#@# acTlrTxSumnDList : {} " ,acTlrTxSumnDList);
		}
		if(acTlrTxSumnDList == null) {
			return new ArrayList<AcTlrTxSumnDBatIO>();
		}
		return acTlrTxSumnDList;
	}

	/**
	 * 총계정원장의 합계금액 조회
	 * @param deptId 부서식별자
	 * @param realTitlAcctgYn 실계정과목여부
	 * @param bsisDscd BSIS구분코드
	 * @param dbtCdtDscd 차대변구분코드
	 * @param titlAcctgClCd 계정과목분류코드
	 * @param acctgItmCd 계정과목코드
	 * @return AcGlMBatIO
	 * @throws BizApplicationException
	 */
	private AcGlMBatIO _getBalanceDbtCdtSum(String deptId, String realTitlAcctgYn, String bsisDscd, String dbtCdtDscd, String titlAcctgClCd, String acctgItmCd) throws BizApplicationException {
		acGlMBat = (AcGlMBat) CbbApplicationContext.getBean(AcGlMBat.class, acGlMBat);

		GlAcctVldtnInBatIO inParam = new GlAcctVldtnInBatIO();

		inParam.setBsisDscd(bsisDscd);
		inParam.setInstCd(this.instCd);
	    inParam.setDeptId(deptId);
	    inParam.setRealTitlAcctgYn(realTitlAcctgYn);
		inParam.setBaseDt(this.bfBizDate);
		inParam.setAcctgDscd(AcctgDscdEnum.BANK.getValue());
		inParam.setDebitCrdtDscd(dbtCdtDscd);
		inParam.setTitlAcctgClCd(titlAcctgClCd);
		inParam.setAcctgItmCd(acctgItmCd);

		AcGlMBatIO acGlMBatIO = acGlMBat.selectBSDbtCdtSum(inParam);

		if(acGlMBatIO == null) {
			acGlMBatIO = new AcGlMBatIO();
		}
		return acGlMBatIO;
	}

	/**
	 * 기관별 총계정원장 조회
	 * 
	 * @param realTitlAcctgYn 실계정과목여부
	 * @param bsisDscd BSIS구분코드
	 * @param dbtCdtDscd 차대변구분코드
	 * @param titlAcctgClCd 계정과목분류코드
	 * @param acctgItmCd 계정과목코드
	 * @return AcGlMBatIO
	 * @throws BizApplicationException
	 */
	private AcGlMBatIO _getBalanceInstitutionDbtCdtSum(String realTitlAcctgYn, String bsisDscd, String dbtCdtDscd, String titlAcctgClCd, String acctgItmCd) throws BizApplicationException {
		acGlMBat = (AcGlMBat) CbbApplicationContext.getBean(AcGlMBat.class, acGlMBat);

		GlAcctVldtnInBatIO inParam = new GlAcctVldtnInBatIO();

		inParam.setBsisDscd(bsisDscd);
		inParam.setInstCd(this.instCd);
		inParam.setRealTitlAcctgYn(realTitlAcctgYn);
		inParam.setBaseDt(this.bfBizDate);
		inParam.setAcctgDscd(AcctgDscdEnum.BANK.getValue());
		inParam.setDebitCrdtDscd(dbtCdtDscd);
		inParam.setTitlAcctgClCd(titlAcctgClCd);
		inParam.setAcctgItmCd(acctgItmCd);

		AcGlMBatIO acGlMBatIO = acGlMBat.selectDailyBsByInst(inParam);

		if(acGlMBatIO == null) {
			acGlMBatIO = new AcGlMBatIO();
		}

		return acGlMBatIO;
	}

	/**
	 * 일자 검증
	 * 
	 * @return boolean
	 * @throws BizApplicationException
	 */
	private boolean _vaildationDate() throws BizApplicationException {
		dateCalculator = (DateCalculator) CbbApplicationContext.getBean(DateCalculator.class, dateCalculator);

		boolean result = true;
		// 입력 데이터 검증 : 작업기준일이 현재일(계리기준일) 인지 검증한다.

		// 영업일 조회
		DateMngrCheckDtBizOut dateMngrCheckDtBizOut = dateCalculator.calculateDateBusiness(this.jobDt);
		dateMngrCheckDtBizOut.getBizDt();

		if(logger.isDebugEnabled()){
			logger.debug("## GlAcctVldtn > 작업기준일 [" + this.jobDt+"]");
			logger.debug("## GlAcctVldtn > 영업일 [" + dateMngrCheckDtBizOut.getBizDt()+"]");
		}

		if(!this.jobDt.equals(dateMngrCheckDtBizOut.getBizDt())) {
			if(logger.isDebugEnabled()){
				logger.debug(" 작업기준일 [" + this.jobDt+"] 이 현재일[" + dateMngrCheckDtBizOut.getBizDt()+"] 과 맞지 않다.!!");
				strBuilder.append("\n 작업기준일 [" + this.jobDt+"] 이 현재일[" + dateMngrCheckDtBizOut.getBizDt()+"] 과 맞지 않다.!!");
			}
			result = false;
		}
		else {
			// 이전 영업일 셋팅
			this.bfBizDate = dateMngrCheckDtBizOut.getBfBizDt();
		}

		return result;
	}

	/**
	 * 1.출납현금 검증
	 * 
	 * @param deptId
	 * @throws BizApplicationException
	 */
	private void _vaildationSndRcvCashAmt(String deptId) throws BizApplicationException {
		// 1.1 부점별 총계정원장의 통화/타점권잔액 을 조회 한다.
		List<AcGlMBatIO> dailyBalList = _getDailyBalance(deptId);

		// 1.2 부점별 텔러가 보유한 통화/타점권잔액 을 조회 한다.
		List<AcTlrTxSumnDBatIO> txSumnDList = _getTxSumnDList(deptId);
		if(logger.isDebugEnabled()){
			logger.debug("## GlAcctVldtn > dailyBalList : {}", dailyBalList);
			logger.debug("## GlAcctVldtn > txSumnDList : {}", txSumnDList);
		}	
		for(AcGlMBatIO acGlMBatIO : dailyBalList) {
			// dfrncInAmt1 입금금액 - 출금금액 = 현재 보유금액
			for(AcTlrTxSumnDBatIO acTlrTxSumnDBatIO : txSumnDList) {
				// 통화코드가 같을시 검증 한다.
				if(acTlrTxSumnDBatIO.getCrncyCd().equals(acGlMBatIO.getCrncyCd())) {
					// 1.3 1.1, 1.2 에서 조회한 잔액을 비교 한다.
					if(!_vaildationBalance(acTlrTxSumnDBatIO.getDfrncAmt1(), acGlMBatIO.getAcctgBal())) {

						// 총계정원장 통화 계리잔액 / 텔러보유 통화 잔액(현금입금-현금출금) / 차액
						glAcctVldtnOut = new GlAcctVldtnOut();
						glAcctVldtnOut.setDstnctnNbr("1");
						glAcctVldtnOut.setInstCd(instCd);
						glAcctVldtnOut.setBaseDt(jobDt);
						glAcctVldtnOut.setBrnchCd(acGlMBatIO.getDeptId());
						glAcctVldtnOut.setCrncyCd(acTlrTxSumnDBatIO.getCrncyCd());
						glAcctVldtnOut.setDbtAmt(acGlMBatIO.getAcctgBal()); // 총계정원장 통화잔액
						glAcctVldtnOut.setCdtAmt(acTlrTxSumnDBatIO.getDfrncAmt1()); // 텔러보유 통화잔액
						glAcctVldtnOut.setErrAmt(acGlMBatIO.getAcctgBal().subtract(acTlrTxSumnDBatIO.getDfrncAmt1())); // 차액

						result.add(glAcctVldtnOut);

						strBuilder.append("\n 1. 출납현금 검증 오류 : 부점["+acGlMBatIO.getDeptId()+"] 통화 잔액 ["+acGlMBatIO.getAcctgBal()+"], 텔러 보유 통화 잔액["+acTlrTxSumnDBatIO.getDfrncAmt1()+"]");
					}
				}else{
					if(logger.isDebugEnabled()){
						logger.debug("통화코드 같은 것 없음");
					}
				}
			}

			if(logger.isDebugEnabled()){
				logger.debug("#@@# GlAcctVldtn > 1.출납현금 검증 완료");
			}
		}
	}

	/**
	 * 2.대차대조표 대차 검증
	 * 
	 * @param deptId
	 * @throws BizApplicationException
	 */
	private void _validationDbtCdtAmt(String deptId) throws BizApplicationException {
		// 2.대차대조표 대차 검증

		List<AcGlMBSDbtCdtSumOut> dbtCdtList = new ArrayList<AcGlMBSDbtCdtSumOut>();
		// 총계정원장 차대변 잔액 조회(통화코드, 부점별)
		dbtCdtList = acGlMBat.selectListBSDbtCdtSum(instCd, jobDt, deptId, AcctgDscdEnum.BANK.getValue(), CAC01.YES);

		for(AcGlMBSDbtCdtSumOut out : dbtCdtList){
			// 차대변 잔액 비교
			if(!_vaildationBalance(out.getAcctgBal1(), out.getAcctgBal2())){
				glAcctVldtnOut = new GlAcctVldtnOut();
				glAcctVldtnOut.setDstnctnNbr("2-1");
				glAcctVldtnOut.setInstCd(instCd);
				glAcctVldtnOut.setBaseDt(out.getBaseDt());
				glAcctVldtnOut.setBrnchCd(out.getDeptId());
				glAcctVldtnOut.setCrncyCd(out.getCrncyCd());
				glAcctVldtnOut.setDbtAmt(out.getAcctgBal1()); // 계리잔액 차변잔액
				glAcctVldtnOut.setCdtAmt(out.getAcctgBal2()); // 계리잔액 대변잔액
				glAcctVldtnOut.setErrAmt(out.getAcctgBal1().subtract(out.getAcctgBal2())); // 차액
				result.add(glAcctVldtnOut);	
				strBuilder.append("\n 2-1.대차대조표 대차 검증 계리잔액 검증 오류 : 차변["+out.getAcctgBal1()+"], 대변["+out.getAcctgBal2()+"]");
			}

			// 차대변 월중적수 비교(평잔)
			if(!_vaildationBalance(out.getAcctgDmnthAcmltdAmt1(), out.getAcctgDmnthAcmltdAmt2())){
				glAcctVldtnOut = new GlAcctVldtnOut();
				glAcctVldtnOut.setDstnctnNbr("2-2");
				glAcctVldtnOut.setInstCd(instCd);
				glAcctVldtnOut.setBaseDt(jobDt);
				glAcctVldtnOut.setBrnchCd(out.getDeptId());
				glAcctVldtnOut.setCrncyCd(out.getCrncyCd());
				glAcctVldtnOut.setDbtAmt(out.getAcctgDmnthAcmltdAmt1()); // 계리잔액 차변잔액
				glAcctVldtnOut.setCdtAmt(out.getAcctgDmnthAcmltdAmt2()); // 계리잔액 대변잔액
				glAcctVldtnOut.setErrAmt(out.getAcctgDmnthAcmltdAmt1().subtract(out.getAcctgDmnthAcmltdAmt2())); // 차액
				result.add(glAcctVldtnOut);
				strBuilder.append("\n 2-2.대차대조표 대차 검증 계리잔액 검증 오류 : 차변["+out.getAcctgDmnthAcmltdAmt1()+"], 대변["+out.getAcctgDmnthAcmltdAmt2()+"]");
			}

			// 차대변 기중적수 비교(평잔)
			if(!_vaildationBalance(out.getAcctgDtrmAcmltdAmt1(), out.getAcctgDtrmAcmltdAmt2())){
				glAcctVldtnOut = new GlAcctVldtnOut();
				glAcctVldtnOut.setDstnctnNbr("2-3");
				glAcctVldtnOut.setInstCd(instCd);
				glAcctVldtnOut.setBaseDt(jobDt);
				glAcctVldtnOut.setBrnchCd(out.getDeptId());
				glAcctVldtnOut.setCrncyCd(out.getCrncyCd());
				glAcctVldtnOut.setDbtAmt(out.getAcctgDtrmAcmltdAmt1()); // 계리잔액 차변잔액
				glAcctVldtnOut.setCdtAmt(out.getAcctgDtrmAcmltdAmt2()); // 계리잔액 대변잔액
				glAcctVldtnOut.setErrAmt(out.getAcctgDtrmAcmltdAmt1().subtract(out.getAcctgDtrmAcmltdAmt2())); // 차액
				result.add(glAcctVldtnOut);
				strBuilder.append("\n 2-3.대차대조표 대차 검증 계리잔액 검증 오류 : 차변["+out.getAcctgDtrmAcmltdAmt1()+"], 대변["+out.getAcctgDtrmAcmltdAmt2()+"]");
			}
		}

		if(logger.isDebugEnabled()){
			logger.debug("#@@# GlAcctVldtn > 2.대차대조표 대차 검증 완료");
		}
	}


	/**
	 * 3.손익검증
	 * 
	 * @param deptId
	 * @throws BizApplicationException
	 */
	private void _validationLossAndProfit(String deptId) throws BizApplicationException {
		/*
		 * 4. 손익검증
		 * 4.1 B/S 의 이익금계정 잔액과 P/L 의 수익 실계정의 잔액 합계가 일치 하는지 비교 한다.
		 * 4.2 P/L 수익 실계정의 잔액합계와 P/L 당기순손실 계정의 잔액과 비교 한다.  우선 제외
		 * 4.3 B/S 손실금계정 잔액과 P/L 비용 실계정의 잔액 합계가 일치 하는지 비교한다.
		 * 4.4 P/L 비용 실계정 잔액합계와 P/L 당기순이익 계정의 잔액과 비교 한다. 우선 제외
		 * 4.5 B/S 당기순이익을 검증한다.
		 * 4.5.1 B/S 당기순이익 = B/S 이익금 - B/S 손실금
		 * 4.5.2 B/S 당기순이익 = P/L 당기순손실 - P/S 당기순이익 우선 제외
		 *불일치 시 오류 내용을 기록 한다.
		 */

		// 3.1 B/S 의 이익금계정 잔액과 P/L 의 수익 실계정의 잔액 합계가 일치 하는지 비교 한다.
		_validationBalanceSheetAndLossProfitByProfit(deptId);

		// 3.2 B/S 손실금계정 잔액과 P/L 비용 실계정의 잔액 합계가 일치 하는지 비교한다.
		_validationBalanceSheetAndLossProfitByLoss(deptId);

		// 3.3 B/S 당기순이익 = B/S 이익금 - B/S 손실금
		_validationCurrentTermNetProfit(deptId);

		if(logger.isDebugEnabled()){
			logger.debug("#@@# GlAcctVldtn > 3.손익검증 완료");
		}
	}

	/**
	 * 4. 현금계정, 비현금계정 입출금금액 합계 비교
	 * @param deptId
	 * @throws BizApplicationException
	 */
	private void _validationCashAndNotCashAmt(String deptId) throws BizApplicationException {

		// 현금계정과목코드
		String cashAcctgItmCd = acctg.getAccountingItemCode(AcctgItmEnum.CASH_CHECK.getValue());

		// 현금계정과목코드와 비현금계정과목코드들의 입출금금액 합계가 일치하는지를 비교한다.
		List<AcGlAcctVldtnAmtBatIO> cashNotCashAmtList = acGlMBat.selectCashNotCashAmtSum(instCd, deptId, this.bfBizDate, cashAcctgItmCd, CAC01.YES);

		for(AcGlAcctVldtnAmtBatIO acGlAcctVldtnAmtBatIO : cashNotCashAmtList){

			if(!_validationRcvdWhdrwlAmt(acGlAcctVldtnAmtBatIO.getRcvdAmt1(), acGlAcctVldtnAmtBatIO.getWhdrwlAmt2(), acGlAcctVldtnAmtBatIO.getWhdrwlAmt1(), 
				acGlAcctVldtnAmtBatIO.getRcvdAmt2()) && logger.isDebugEnabled()){
				// 입출내역 검증 에러 : 현금계정입금 / 비현금계정출금 / 차액
				glAcctVldtnOut = new GlAcctVldtnOut();
				glAcctVldtnOut.setDstnctnNbr("4-1");
				glAcctVldtnOut.setInstCd(instCd);
				glAcctVldtnOut.setBaseDt(jobDt);
				glAcctVldtnOut.setBrnchCd(deptId);
				glAcctVldtnOut.setCrncyCd(acGlAcctVldtnAmtBatIO.getCrncyCd1());
				glAcctVldtnOut.setDbtAmt(acGlAcctVldtnAmtBatIO.getRcvdAmt1()); // 현금계정 입금금액
				glAcctVldtnOut.setCdtAmt(acGlAcctVldtnAmtBatIO.getWhdrwlAmt2()); // 현금계정 출금금액
				glAcctVldtnOut.setErrAmt(acGlAcctVldtnAmtBatIO.getRcvdAmt1().subtract(acGlAcctVldtnAmtBatIO.getWhdrwlAmt2())); //차액
				result.add(glAcctVldtnOut);
				strBuilder.append("\n 4. 입출내역 검증 4-1 검증 오류 : 현금계정 입금 ["+acGlAcctVldtnAmtBatIO.getRcvdAmt1()+"], 비현금계정 출금 ["+acGlAcctVldtnAmtBatIO.getWhdrwlAmt2()+"]");
				// 입출내역 검증 에러 : 현금계정출금 / 비현금계정입금 / 차액
				glAcctVldtnOut = new GlAcctVldtnOut();
				glAcctVldtnOut.setDstnctnNbr("4-2");
				glAcctVldtnOut.setInstCd(instCd);
				glAcctVldtnOut.setBaseDt(jobDt);
				glAcctVldtnOut.setBrnchCd(deptId);
				glAcctVldtnOut.setCrncyCd(acGlAcctVldtnAmtBatIO.getCrncyCd1());
				glAcctVldtnOut.setDbtAmt(acGlAcctVldtnAmtBatIO.getWhdrwlAmt1()); // 현금계정 출금금액
				glAcctVldtnOut.setCdtAmt(acGlAcctVldtnAmtBatIO.getRcvdAmt2()); // 비현금계정 입금금액
				glAcctVldtnOut.setErrAmt(acGlAcctVldtnAmtBatIO.getWhdrwlAmt1().subtract(acGlAcctVldtnAmtBatIO.getRcvdAmt2())); //차액
				result.add(glAcctVldtnOut);
				strBuilder.append("\n 4. 입출내역 검증 4-2 검증 오류 : 현금계정 출금 ["+acGlAcctVldtnAmtBatIO.getWhdrwlAmt1()+"], 비현금계정 입금 ["+acGlAcctVldtnAmtBatIO.getRcvdAmt2()+"]");
			}
		}
		if(logger.isDebugEnabled()){
			logger.debug("#@@# GlAcctVldtn > 4. 현금계정, 비현금계정 입출금금액 합계 비교 완료");
		}
	}

	/**
	 * 현금입금금액과 비현금출금금액, 현금출금금액과 비현금입금금액을 비교하여 Boolean값을 리턴한다.
	 * @param cashRcvdAmt
	 * @param notCashWhdrwlAmt
	 * @param cashWhdrwlAmt
	 * @param notCashRcvdAmt
	 * @return
	 */
	private Boolean _validationRcvdWhdrwlAmt(BigDecimal cashRcvdAmt, BigDecimal notCashWhdrwlAmt, BigDecimal cashWhdrwlAmt, BigDecimal notCashRcvdAmt) {

		if(cashRcvdAmt.compareTo(notCashWhdrwlAmt)==0 || cashWhdrwlAmt.compareTo(notCashRcvdAmt)==0){
			return false;
		}else{
			return true;
		}
	}

	/**
	 *  4.1 B/S 의 이익금계정 잔액과 P/L 의 수익 실계정의 잔액 합계가 일치 하는지 비교 한다.
	 *  
	 * @param deptId
	 * @throws BizApplicationException
	 */
	private void _validationBalanceSheetAndLossProfitByProfit(String deptId) throws BizApplicationException {
		acctg = (Acctg) CbbApplicationContext.getBean(Acctg.class, acctg);

		 // B/S 의 이익금계정 잔액과 P/L 의 수익 실계정의 잔액 합계가 일치 하는지 비교 한다.
		AcGlMBatIO balance = _getBalanceDbtCdtSum(deptId, null, BsisDscdEnum.BS.getValue(), null, null, acctg.getAccountingItemCode(AcctgItmEnum.PROFIT.getValue()));
		AcGlMBatIO lossAndprofit = _getBalanceDbtCdtSum(deptId, CCM01.YES, BsisDscdEnum.IS.getValue(), null, TitlAcctgClcdEnum.BENEFIT.getValue(), null);

		if(!_vaildationBalance(balance.getAcctgBal(), lossAndprofit.getAcctgBal()) && logger.isDebugEnabled()) {
			// 3.1 이익금 잔액 / 수익 잔액 / 차액
			glAcctVldtnOut = new GlAcctVldtnOut();
			glAcctVldtnOut.setDstnctnNbr("3-1");
			glAcctVldtnOut.setInstCd(instCd);
			glAcctVldtnOut.setBaseDt(jobDt);
			glAcctVldtnOut.setBrnchCd(balance.getDeptId());
			glAcctVldtnOut.setCrncyCd(balance.getCrncyCd());
			glAcctVldtnOut.setDbtAmt(balance.getAcctgBal()); // B/S 이익금계정 잔액
			glAcctVldtnOut.setCdtAmt(lossAndprofit.getAcctgBal()); // I/S 수익 실계정 잔액 합계
			glAcctVldtnOut.setErrAmt(balance.getAcctgBal().subtract(lossAndprofit.getAcctgBal())); // 차액
			result.add(glAcctVldtnOut);
			strBuilder.append("\n 3. 손익검증 3.1 검증 오류 : BS ["+balance.getAcctgBal()+"], IS["+lossAndprofit.getAcctgBal()+"]");
		}
	}

	/**
	 *  4.3 B/S 손실금계정 잔액과 P/L 비용 실계정의 잔액 합계가 일치 하는지 비교한다.
	 *  
	 * @param deptId
	 * @throws BizApplicationException
	 */
	private void _validationBalanceSheetAndLossProfitByLoss(String deptId) throws BizApplicationException {
		acctg = (Acctg) CbbApplicationContext.getBean(Acctg.class, acctg);

		// B/S 손실금계정 잔액과 P/L 비용 실계정의 잔액 합계가 일치 하는지 비교한다.
		AcGlMBatIO balance = _getBalanceDbtCdtSum(deptId, null, BsisDscdEnum.BS.getValue(), null, null, acctg.getAccountingItemCode(AcctgItmEnum.LOSS.getValue()));
		AcGlMBatIO lossAndprofit = _getBalanceDbtCdtSum(deptId, CCM01.YES, BsisDscdEnum.IS.getValue(), null, TitlAcctgClcdEnum.COST.getValue(), null);

		if(!_vaildationBalance(balance.getAcctgBal(), lossAndprofit.getAcctgBal()) && logger.isDebugEnabled()) {
			// 3.2 손실금계정 잔액 / 비용 잔액 / 차액
			glAcctVldtnOut = new GlAcctVldtnOut();
			glAcctVldtnOut.setDstnctnNbr("3-2");
			glAcctVldtnOut.setInstCd(instCd);
			glAcctVldtnOut.setBaseDt(jobDt);
			glAcctVldtnOut.setBrnchCd(balance.getDeptId());
			glAcctVldtnOut.setCrncyCd(balance.getCrncyCd());
			glAcctVldtnOut.setDbtAmt(balance.getAcctgBal()); // B/S 손실금계정 잔액
			glAcctVldtnOut.setCdtAmt(lossAndprofit.getAcctgBal()); // P/L 비용 실계정 잔액
			glAcctVldtnOut.setErrAmt(balance.getAcctgBal().subtract(lossAndprofit.getAcctgBal())); // 차액
			result.add(glAcctVldtnOut);
			strBuilder.append("\n 3. 손익검증 3.2 검증 오류 : BS ["+balance.getAcctgBal()+"], IS["+lossAndprofit.getAcctgBal()+"]");
		}
	}

	/**
	 * 3.3 대차대죠표의 당기순이익 검증
	 * B/S 당기순이익 = B/S 이익금 - B/S 손실금
	 * 
	 * @param deptId
	 * @throws BizApplicationException
	 */
	private void _validationCurrentTermNetProfit(String deptId) throws BizApplicationException {
		acctg = (Acctg) CbbApplicationContext.getBean(Acctg.class, acctg);

		BigDecimal decimalBsNetProfit = new BigDecimal("0"); // 당기순이익잔액
		BigDecimal decimalProfit = new BigDecimal("0"); // 이익금잔액
		BigDecimal decimalLoss = new BigDecimal("0"); // 손실금잔액

		// 당기순이익
		AcGlMBatIO bsMbatIo = _getBalanceDbtCdtSum(deptId, null, BsisDscdEnum.BS.getValue(), null, null, acctg.getAccountingItemCode(AcctgItmEnum.BS_NET_PROFIT_THIS_TERM.getValue()));
		decimalBsNetProfit = bsMbatIo.getAcctgBal();
		if(logger.isDebugEnabled()){
			logger.debug("## GlAcctVldtn > decimalBsNetProfit : "+decimalBsNetProfit);
		}
		// 이익금
		bsMbatIo = new AcGlMBatIO();
		bsMbatIo = _getBalanceDbtCdtSum(deptId, null, BsisDscdEnum.BS.getValue(), null, null, acctg.getAccountingItemCode(AcctgItmEnum.PROFIT.getValue()));
		decimalProfit = bsMbatIo.getAcctgBal();
		if(logger.isDebugEnabled()){
			logger.debug("## GlAcctVldtn > decimalProfit : "+decimalProfit);
		}

		// 손실금
		bsMbatIo = new AcGlMBatIO();
		bsMbatIo = _getBalanceDbtCdtSum(deptId, null, BsisDscdEnum.BS.getValue(), null, null, acctg.getAccountingItemCode(AcctgItmEnum.LOSS.getValue()));
		decimalLoss = bsMbatIo.getAcctgBal();
		if(logger.isDebugEnabled()){
			logger.debug("## GlAcctVldtn > decimalLoss : "+decimalLoss);
		}

		// 당기순이익 이 이익금-손실금이 아니면
		if(!_vaildationBalance(decimalBsNetProfit, decimalProfit.subtract(decimalLoss)) && logger.isDebugEnabled()) {
			// 3.3 손실금계정 잔액 / 비용 잔액 / 차액
			glAcctVldtnOut = new GlAcctVldtnOut();
			glAcctVldtnOut.setDstnctnNbr("3-3");
			glAcctVldtnOut.setInstCd(instCd);
			glAcctVldtnOut.setBaseDt(jobDt);
			glAcctVldtnOut.setBrnchCd(deptId);
			glAcctVldtnOut.setCrncyCd(bsMbatIo.getCrncyCd());
			glAcctVldtnOut.setDbtAmt(decimalBsNetProfit);	// 당기순이익
			glAcctVldtnOut.setCdtAmt(decimalProfit);	// 이익금
			glAcctVldtnOut.setErrAmt(decimalLoss);	// 손실금
			result.add(glAcctVldtnOut);
			strBuilder.append("\n 3-3. 대차대죠표의 당기순이익 검증 에러 ["+deptId+"]당기순이익 ["+decimalBsNetProfit+"], 이익금["+decimalProfit+"], 손실금["+decimalLoss+"]");
		}
	}

	/**
	 * 5. 본지점 검증
	 * 5.1 은행레벨로 본지점 실계정에 대해서 SUM(차변원화본지점) 과 SUM(대변원화본지점) 의 일치 여부를 검증 한다.
	 * @throws BizApplicationException 
	 */
	private void _vaildationInst() throws BizApplicationException {
		acctg = (Acctg) CbbApplicationContext.getBean(Acctg.class, acctg);

		// 기관의 본지점 실계정 차변 조회
		AcGlMBatIO debit = _getBalanceInstitutionDbtCdtSum(CCM01.YES, null, DbtcdtdscdEnum.DEBIT.getValue(), null, acctg.getAccountingItemCode(AcctgItmEnum.INTER_OFFICE.getValue()));

		// 기관의 본지점 실계정 대변 조회
		AcGlMBatIO credit = _getBalanceInstitutionDbtCdtSum(CCM01.YES, null, DbtcdtdscdEnum.CREDIT.getValue(), null, acctg.getAccountingItemCode(AcctgItmEnum.INTER_OFFICE.getValue()));

		if(!_vaildationBalance(debit.getAcctgBal(), credit.getAcctgBal()) && logger.isDebugEnabled()) {
			// 5  손실금계정 잔액 / 비용 잔액 / 차액
			glAcctVldtnOut = new GlAcctVldtnOut();
			glAcctVldtnOut.setDstnctnNbr("5");
			glAcctVldtnOut.setInstCd(instCd);
			glAcctVldtnOut.setBaseDt(jobDt);
//			glAcctVldtnOut.setBrnchCd(deptId);
//			glAcctVldtnOut.setCrncyCd(bsMbatIo.getCrncyCd());
			glAcctVldtnOut.setDbtAmt(debit.getAcctgBal());	// 본지점 실계정 차변잔액
			glAcctVldtnOut.setCdtAmt(credit.getAcctgBal());	// 본지점 실계정 대변잔액
			glAcctVldtnOut.setErrAmt(debit.getAcctgBal().subtract(credit.getAcctgBal()));	// 차액
			result.add(glAcctVldtnOut);
			strBuilder.append("\n 5. 본지점 검증 에러 차변원화본지점 ["+debit.getAcctgBal()+"], 대변원화본지점["+credit.getAcctgBal()+"]");
		}
		if(logger.isDebugEnabled()){
			logger.debug("#@@# GlAcctVldtn > 5. 본지점 검증 완료");
		}
	}

	/**
	 * 6. 마이너스 잔액 검증
	 * 6.1 실계정이면서 마이너스잔액을 허용하지 않는 계정에 대헤서 잔액이 0 보다 적은 경우가 있는지 검증 한다.
	 * @throws BizApplicationException
	 */
	private void _validationMinusBalAllWncNo() throws BizApplicationException {
		acGlMBat = (AcGlMBat) CbbApplicationContext.getBean(AcGlMBat.class, acGlMBat);

		BigDecimal decimalTarget = new BigDecimal("0");

		GlAcctVldtnInBatIO inParam = new GlAcctVldtnInBatIO();

		inParam.setInstCd(this.instCd);
		inParam.setBaseDt(this.bfBizDate);
		inParam.setAcctgDscd(AcctgDscdEnum.BANK.getValue());

		List<AcGlMBatIO> dailyBalList = new ArrayList<AcGlMBatIO>();

		dailyBalList = acGlMBat.selectListDailyBs(inParam);

		if(dailyBalList == null || dailyBalList.isEmpty() && logger.isDebugEnabled()) {
			logger.debug("#@@# GlAcctVldtn > 6. 마이너스 잔액 검증 완료");
			return;
		}

		for(AcGlMBatIO acGlMBatIO : dailyBalList) {
			if(acGlMBatIO.getAcctgBal().compareTo(decimalTarget) < 0 && logger.isDebugEnabled()) {
				glAcctVldtnOut = new GlAcctVldtnOut();
				glAcctVldtnOut.setDstnctnNbr("6");
				glAcctVldtnOut.setInstCd(instCd);
				glAcctVldtnOut.setBaseDt(jobDt);
				glAcctVldtnOut.setBrnchCd(acGlMBatIO.getDeptId());
				glAcctVldtnOut.setCrncyCd(acGlMBatIO.getCrncyCd());
				glAcctVldtnOut.setDbtAmt(acGlMBatIO.getAcctgBal());	// 본지점 실계정 차변잔액
//				glAcctVldtnOut.setCdtAmt(credit.getAcctgBal());	
//				glAcctVldtnOut.setErrAmt(debit.getAcctgBal().subtract(credit.getAcctgBal()));	
				result.add(glAcctVldtnOut);
				strBuilder.append("\n 6. 마이너스 잔액 검증 에러 ["+acGlMBatIO.getAcctgBal()+"]");
			}
		}
		if(logger.isDebugEnabled()){
			logger.debug("#@@# GlAcctVldtn > 6. 마이너스 잔액 검증 완료");
		}
	}

	/**
	 * 금액을 비교 하여 boolean 값을 리턴 한다.
	 * 
	 * @param bal1
	 * @param bal2
	 * @return Boolean
	 */
	private Boolean _vaildationBalance(BigDecimal bal1, BigDecimal bal2) throws BizApplicationException {
		if(bal1.compareTo(bal2) == 0) {
			return true;
		}
		else {
			return false;
		}
	}

	/**
	 * Inquiry whether the department is special department or not
     *
     * @param deptId 	(required)	department identification
     * @return boolean 
     * @throws BizApplicationException 
     */
	public boolean isSpecialDepartment(String deptId) throws BizApplicationException{
		return (
				SysDeptEnum.SYSDEPT.getValue().equals(deptId)
//				SysDeptEnum.SYSSSDEPT.getValue().equals(deptId) ||
//				SysDeptEnum.SYSBTDEPT.getValue().equals(deptId) ||
//				SysDeptEnum.SYSCCDEPT.getValue().equals(deptId) ||
//				SysDeptEnum.SYSEXDEPT.getValue().equals(deptId) 
				);		
	}

	@Override
	public void close() throws ItemStreamException {
		DasUtils.disconnectDasExecutor(iterator);		
	}

	@Override
	public void update(ExecutionContext executionContext) throws ItemStreamException {
		executionContext.putInt(READ_COUNT, this.crrntItmCnt);		
	}

	@AfterStep
	public ExitStatus afterStep(StepExecution stepExecution){

		if(ExitStatus.COMPLETED.equals(stepExecution.getExitStatus())){
			if(logger.isDebugEnabled()){
				logger.debug("@AfterStep step COMPLETED");
			}
		}
		if(ExitStatus.FAILED.equals(stepExecution.getExitStatus())){
			if(logger.isDebugEnabled()){
				logger.debug("@AfterStep step FAILED");
			}
		}
		return stepExecution.getExitStatus();
	}
}
