package bankware.corebanking.supplychain.financialtransaction.batch;

import java.math.BigDecimal;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.batch.core.ExitStatus;
import org.springframework.batch.core.StepExecution;
import org.springframework.batch.core.annotation.AfterStep;
import org.springframework.batch.core.annotation.BeforeStep;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.context.annotation.Scope;

import bankware.centercut.interfaces.CntrCtMngr;
import bankware.centercut.interfaces.dto.CcInstJobInfo;
import bankware.corebanking.supplychain.financialtransaction.batch.dto.ScfPaymentCcutTrgtIO;
import bankware.corebanking.context.CbbApplicationContext;
import bankware.corebanking.supplychain.financialtransaction.service.dto.TradeDtlsPaymentSvcIn;
import bxm.common.annotaion.BxmCategory;
import bxm.container.annotation.BxmBean;

/**
 * 
 * Author	Sohyun Park
 * History
 */
@BxmBean("ScfPaymentCcutProcessor")
@Scope("step")
@BxmCategory(logicalName = "Loan application CenterCut Processor")
public class ScfPaymentCcutProcessor implements ItemProcessor<ScfPaymentCcutTrgtIO, ScfPaymentCcutTrgtIO> {
	private static final Logger logger = LoggerFactory.getLogger(ScfPaymentCcutProcessor.class);

		private		    CntrCtMngr cntrCtMngr;

	    private CcInstJobInfo ccInfo;


	/**
	 * Process the center-cut data
	 */
	@Override
	public ScfPaymentCcutTrgtIO process(ScfPaymentCcutTrgtIO in) throws Exception{

		TradeDtlsPaymentSvcIn svcIn = new TradeDtlsPaymentSvcIn();
		svcIn.setArrId(in.getArrId());

		_getCntrCtMngr().addCcInstJobInput(ccInfo, null, BigDecimal.ZERO, svcIn);

		if(logger.isDebugEnabled()){
			logger.debug("{} CC Input : {}", this.getClass().getName(), svcIn);
		}

		return null;
	}

	@BeforeStep
	public void beforeStep(StepExecution stepExecution) throws Exception{
		if(logger.isDebugEnabled()){
			logger.debug("@BeforeStep");
		}

		String ccId = (String) stepExecution.getJobExecution().getExecutionContext().get("ccId");
		String prcsDt = (String) stepExecution.getJobExecution().getExecutionContext().get("jobDt");
		ccInfo = _getCntrCtMngr().openCcInstJobInputBundle(ccId , prcsDt);
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

