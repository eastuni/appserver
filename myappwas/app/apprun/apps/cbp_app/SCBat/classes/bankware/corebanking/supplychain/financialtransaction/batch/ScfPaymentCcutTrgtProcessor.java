package bankware.corebanking.supplychain.financialtransaction.batch;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.batch.core.ExitStatus;
import org.springframework.batch.core.StepExecution;
import org.springframework.batch.core.annotation.AfterStep;
import org.springframework.batch.core.annotation.BeforeStep;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.context.annotation.Scope;

import bankware.corebanking.classinfo.annotation.CbbClassInfo;
import bankware.corebanking.frm.app.BizApplicationException;
import bankware.corebanking.supplychain.financialtransaction.batch.dto.ScfPaymentCcutTrgtIO;
import bxm.common.annotaion.BxmCategory;
import bxm.container.annotation.BxmBean;

/**
 * 
 * Author	Sohyun Park
 * History
 */
@CbbClassInfo(classType={"ITEM_PROCESSOR"})
@BxmBean("ScfPaymentCcutTrgtProcessor")
@Scope("step")
@BxmCategory(logicalName = "Loan Application Target Processor", description = "Loan Application Target Processor")
public class ScfPaymentCcutTrgtProcessor  implements ItemProcessor<ScfPaymentCcutTrgtIO, ScfPaymentCcutTrgtIO>{
	private static final Logger logger = LoggerFactory.getLogger(ScfPaymentCcutTrgtProcessor.class);
	
	/**
	 * Extract the Center-cut target.
	 */
	@Override
	public ScfPaymentCcutTrgtIO process(ScfPaymentCcutTrgtIO in){

		ScfPaymentCcutTrgtIO out = new ScfPaymentCcutTrgtIO();
		out.setArrId(in.getArrId());

		return out;
	}

	
	@BeforeStep
	public void beforeStep(StepExecution stepExecution) throws BizApplicationException{
		
		// this.instCd = stepExecution.getJobParameters().getString("instCd");		// Institute Code
		
		if(logger.isDebugEnabled()){
			logger.debug("@BeforeStep");
		}		
	}
	
	@AfterStep
	public ExitStatus afterStep(StepExecution stepExecution){
		
		if(ExitStatus.COMPLETED.equals(stepExecution.getExitStatus()) && logger.isDebugEnabled()){
				logger.debug("@AfterStep step COMPLETED");			
		}else if(ExitStatus.FAILED.equals(stepExecution.getExitStatus()) && logger.isDebugEnabled()){
				logger.debug("@AfterStep step FAILED");			
		}
		
		return stepExecution.getExitStatus();
	}

}

