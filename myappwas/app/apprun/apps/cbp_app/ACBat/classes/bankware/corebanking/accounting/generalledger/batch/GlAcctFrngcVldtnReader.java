package bankware.corebanking.accounting.generalledger.batch;


import java.util.Iterator;

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

import bankware.corebanking.accounting.enums.AcctgDscdEnum;
import bankware.corebanking.accounting.generalledger.daobatch.AcGlMBat;
import bankware.corebanking.accounting.generalledger.daobatch.dto.AcGlMCoaBatIO;
import bankware.corebanking.applicationcommon.commondata.interfaces.DateCalculator;
import bankware.corebanking.applicationcommon.institutionprofile.interfaces.InstParm;
import bankware.corebanking.applicationcommon.institutionprofile.interfaces.InstParmMngr;
import bankware.corebanking.classinfo.annotation.CbbClassInfo;
import bankware.corebanking.context.CbbApplicationContext;
import bankware.corebanking.core.accounting.enums.BsisDscdEnum;
import bankware.corebanking.core.applicationcommon.commondata.interfaces.dto.DateMngrCalDtMnthOut;
import bankware.corebanking.core.applicationcommon.enums.InstParamEnum;
import bankware.corebanking.frm.app.BizApplicationException;
import bxm.common.annotaion.BxmCategory;
import bxm.container.LApplicationContext;
import bxm.container.annotation.BxmBean;
import bxm.context.das.DasUtils;


/**
 * @file         bankware.corebanking.accounting.generalledger.batch.GlAcctFrngcVldtnReader.java
 * @filetype     java source file
 * @brief
 * @author       yoonyeong.ha
 * @version      0.1
 * @history
 * <pre>
 * 버전          성명                   일자              변경내용
 * -------       ----------------       -----------       -----------------
 * 0.1           yoonyeong.ha       2016. 05. 18.       신규 작성
 * </pre>
 */

@BxmBean("GlAcctFrngcVldtnReader")
@Scope("step")
@BxmCategory(logicalName = "Generalledger Foreign Validation Reader", description = "Generalledger Foreign Validation Reader")
@CbbClassInfo(classType = { "ITEM_READER" })
public class GlAcctFrngcVldtnReader implements ItemStream, ItemReader<AcGlMCoaBatIO>{

	final Logger logger = LoggerFactory.getLogger(this.getClass());

	private AcGlMBat acGlMBat;
	private DateCalculator dateCalculator;
	private Iterator<AcGlMCoaBatIO> iterator;
	private String instCd;
	private String baseDt;
	private String deptId;
	private String crncyCd;
	private Integer mnthNbr;
	private InstParmMngr instParmMngr;
    private int crrntItmCnt = 0;
	private static final String READ_COUNT = "read.count";

	@BeforeStep
	public void beforeStep(StepExecution stepExecution) throws BizApplicationException{
		//기관파라미터에서 주통화정보 조회
		InstParm instParm = _getInstParmMngr().getInstParm(InstParamEnum.INSTITUTION_BASE_CURRENCY_CODE.getValue());

		//Set the Job Parameter
		this.instCd = (String)stepExecution.getJobExecution().getExecutionContext().get("instCd");
		this.baseDt = (String)stepExecution.getJobExecution().getExecutionContext().get("baseDt");
		this.crncyCd = instParm.getParmValue();

        //입력일이 해당월의 마지막 영업일이 아닐경우 에러처리
        mnthNbr = Integer.parseInt(baseDt.substring(4, 6));
        DateMngrCalDtMnthOut dateMngrCalDtMnthOut = _getDateCalculator().calculateDateMonth(baseDt);

        if(!dateMngrCalDtMnthOut.getMnthEndDt().equals(baseDt)){
        	//해당월의 마지막 영업일이어야만 거래가 가능합니다.
        	throw new BizApplicationException("AAPACE3066", null );
        }
	}

	@Override
	public void open(ExecutionContext executionContext) throws ItemStreamException {

		if(logger.isDebugEnabled()){
			logger.debug("===============STEP 2 START===============");
		}

		if(executionContext.containsKey(READ_COUNT)) {
			this.crrntItmCnt = executionContext.getInt(READ_COUNT);
		}

		if(acGlMBat == null){
			acGlMBat = LApplicationContext.getBean(AcGlMBat.class);
		}

		AcGlMCoaBatIO inParam = new AcGlMCoaBatIO();

		inParam.setInstCd(instCd);
		inParam.setBaseDt(baseDt);
		inParam.setAcctgDscd(AcctgDscdEnum.BANK.getValue());
		inParam.setCrncyCd(crncyCd);
		inParam.setBsisDscd(BsisDscdEnum.BS.getValue());

		iterator = acGlMBat.selectFrgncBalList(inParam).iterator();

		if(iterator == null) throw new ItemStreamException("connected result is not prepared");
	}

	@Override
	public AcGlMCoaBatIO read() throws Exception, UnexpectedInputException,
			ParseException, NonTransientResourceException {
        if(logger.isDebugEnabled()){
        	logger.debug("STEP 3");
        }

        AcGlMCoaBatIO outParam=null;

		if(iterator.hasNext()){
			outParam = new AcGlMCoaBatIO();

			this.crrntItmCnt++;
			AcGlMCoaBatIO inParam = new AcGlMCoaBatIO();

			inParam = iterator.next();
			
			outParam.setInstCd(inParam.getInstCd());// set [기관코드]
			outParam.setDeptId(inParam.getDeptId());// set [부서식별자]
			outParam.setBaseDt(inParam.getBaseDt());// set [기준년월일]
			outParam.setDebitCrdtDscd(inParam.getDebitCrdtDscd());// set[BSIS구분코드]
			outParam.setAcctgDscd(inParam.getAcctgDscd());// set [회계구분코드]
			outParam.setAcctgItmCd(inParam.getAcctgItmCd());// set [계정과목코드]
			outParam.setDebitCrdtDscd(inParam.getDebitCrdtDscd());// set [차대변구분코드]
			outParam.setCrncyCd(inParam.getCrncyCd());// set [통화코드]
			outParam.setAcctgBal(inParam.getAcctgBal());// set [계리잔액]
			outParam.setExBal(inParam.getExBal());// set [환산잔액]
			outParam.setBsisDscd(inParam.getBsisDscd()); // set [BSIS구분코드]
		}
		return outParam;
	}

	@Override
	public void update(ExecutionContext executionContext) throws ItemStreamException {

		executionContext.putInt(READ_COUNT, this.crrntItmCnt);
	}

	@Override
	public void close() throws ItemStreamException {

		DasUtils.disconnectDasExecutor(iterator);
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

	/**
	 * @return the instParmMngr
	 */
	private InstParmMngr _getInstParmMngr() {
		if (instParmMngr == null) {
			instParmMngr = (InstParmMngr) CbbApplicationContext.getBean(
					InstParmMngr.class, instParmMngr);
		}
		return instParmMngr;
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
}
