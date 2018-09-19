package bankware.corebanking.accounting.generalledger.batch;


import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.batch.core.ExitStatus;
import org.springframework.batch.core.StepExecution;
import org.springframework.batch.core.annotation.AfterStep;
import org.springframework.batch.core.annotation.BeforeStep;
import org.springframework.batch.item.ItemProcessor;

import bankware.centercut.interfaces.CntrCtMngr;
import bankware.centercut.interfaces.dto.CcInstJobInfo;
import bankware.corebanking.accounting.generalledger.daobatch.dto.AcFrgncEvltnDBatIO;
import bankware.corebanking.accounting.service.dto.ManualEntryMgmtSvcRegisterIn;
import bankware.corebanking.accounting.service.dto.ManualEntryMgmtSvcRegisterItemIn;
import bankware.corebanking.classinfo.annotation.CbbClassInfo;
import bankware.corebanking.context.CbbApplicationContext;
import bankware.corebanking.core.accounting.enums.NrmlCnclCrctnDscdEnum;
import bankware.corebanking.core.settlement.enums.DpstWhdrwlEnum;
import bxm.common.annotaion.BxmCategory;
import bxm.container.annotation.BxmBean;


/**
 * <pre>
 * This bean sample program provides common code management function.
 * It consists of inquiry, register, modify, delete function.
 * </pre>
 *
 * @file   bankware.corebanking.accounting.generalledger.batch.GlAcctFrngcVldtnCcProcessor.java
 * @author Yoonyeong
 * @history
 * <br> 2016. 5. 19. initial
 */
@BxmBean("GlAcctFrngcVldtnCcProcessor")
@BxmCategory(logicalName = "Generalledger Foreign Validation Centercut", description = "Generalledger Foreign Validation Centercut")
@CbbClassInfo(classType = { "ITEM_PROCESSOR" })
public class GlAcctFrngcVldtnCcProcessor implements ItemProcessor<AcFrgncEvltnDBatIO, AcFrgncEvltnDBatIO>{
	final Logger logger = LoggerFactory.getLogger(this.getClass());


	private CntrCtMngr cntrCtMngr;
	private String jobDt;
	private CcInstJobInfo ccInfo;


	@BeforeStep
	public void beforeStep(StepExecution stepExecution) throws Exception{
		if(logger.isDebugEnabled()){
			logger.debug("=====GlAcctFrngcVldtnCcProcessor @BeforeStep=====");
		}

		String instCd = (String) stepExecution.getJobExecution().getExecutionContext().get("instCd");
		String ccId = (String) stepExecution.getJobExecution().getExecutionContext().get("ccId");
		jobDt = (String) stepExecution.getJobExecution().getExecutionContext().get("jobDt");
		ccInfo = _getCntrCtMngr().openCcInstJobInputBundle(instCd, ccId );
	}

	@Override
	public AcFrgncEvltnDBatIO process(AcFrgncEvltnDBatIO in) throws Exception {
		
		if(logger.isDebugEnabled()){
			logger.debug("=================================");
			logger.debug("## AcFrgncEvltnDBatIO in {}", in);
			logger.debug("=================================");
		}

		ManualEntryMgmtSvcRegisterIn svcIn = new ManualEntryMgmtSvcRegisterIn();

		List<ManualEntryMgmtSvcRegisterItemIn> outList = new ArrayList<ManualEntryMgmtSvcRegisterItemIn>();

		ManualEntryMgmtSvcRegisterItemIn inItem = new ManualEntryMgmtSvcRegisterItemIn();
		// Generated by code generator [[
		inItem.setInstCd(in.getInstCd());// set [기관코드]
		inItem.setTxDt(in.getBaseDt());// set [거래년월일]
		inItem.setDeptId(in.getDeptId());// set [부서식별자]
//		inItem.setTxStsCd(null);
		inItem.setAcctgDscd(in.getAcctgDscd());// set [회계구분코드]
		inItem.setAcctgItmCd(in.getAcctgItmCd());// set [계정과목코드]
		inItem.setCrncyCd(in.getCrncyCd());// set [통화코드]
		inItem.setNrmlCnclCrctnDscd(NrmlCnclCrctnDscdEnum.NORMAL.getValue());// set [정상취소정정구분코드]
		if(in.getEvltnProfitAmt().compareTo(BigDecimal.ZERO) > 0){ // 이익금이 있으면 거래총금액에 이익금을 set
			inItem.setTxTotAmt(in.getEvltnProfitAmt());	
			inItem.setTrnsfrTxAmt(in.getEvltnProfitAmt());
			inItem.setDpstWhdrwlDscd(DpstWhdrwlEnum.DPST.getValue());// set [**입출구분코드**]
//			inItem.setFrgnTrnsfrDmstcCrncyAmt(in.getEvltnProfitAmt());// set [외화대체국내통화금액]
		}else{ // 손실금이면 거래총금액에 손실금을 set
			inItem.setTxTotAmt(in.getEvltnLossAmt());
			inItem.setTrnsfrTxAmt(in.getEvltnLossAmt());
			inItem.setDpstWhdrwlDscd(DpstWhdrwlEnum.WHDRWL.getValue());// set [**입출구분코드**]
//			inItem.setFrgnTrnsfrDmstcCrncyAmt(in.getEvltnLossAmt());// set [외화대체국내통화금액]
		}

		// Generated by code generator ]]
		outList.add(inItem);
		svcIn.setTblNm(outList); 

		boolean chk = _getCntrCtMngr().addCcInstJobInput(ccInfo, null, BigDecimal.ZERO, svcIn);
		if(logger.isDebugEnabled()) { 
			logger.debug("## chk : {}", chk);
		}
		return null;
	}

	@AfterStep
	public ExitStatus afterStep(StepExecution stepExecution) throws Exception{


		if(ExitStatus.COMPLETED.equals(stepExecution.getExitStatus()) && logger.isDebugEnabled()){
			logger.debug("@AfterStep step COMPLETED");
			_getCntrCtMngr().closeCcInstJobInputBundle(ccInfo);
		}else if(ExitStatus.FAILED.equals(stepExecution.getExitStatus()) && logger.isDebugEnabled()){
			logger.debug("@AfterStep step FAILED");
		}
		return stepExecution.getExitStatus();
	}

	/**
	 * @return the cntrCtMngr
	 */
	private CntrCtMngr _getCntrCtMngr() {
		if (cntrCtMngr == null) {
			cntrCtMngr = (CntrCtMngr) CbbApplicationContext.getBean(CntrCtMngr.class, cntrCtMngr);
		}
		return cntrCtMngr;
	}
}


