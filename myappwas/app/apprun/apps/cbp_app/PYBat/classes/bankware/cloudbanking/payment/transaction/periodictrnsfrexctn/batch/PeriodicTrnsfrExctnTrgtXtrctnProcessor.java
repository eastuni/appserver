package bankware.cloudbanking.payment.transaction.periodictrnsfrexctn.batch;
 
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.batch.core.ExitStatus;
import org.springframework.batch.core.StepExecution;
import org.springframework.batch.core.annotation.AfterStep;
import org.springframework.batch.core.annotation.BeforeStep;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.context.annotation.Scope;

import bankware.cloudbanking.payment.transaction.periodictrnsfrexctn.batch.dto.PeriodicTrnsfrExctnTrgtIO;
import bankware.corebanking.arrangement.arrangement.interfaces.ArrMngr;
import bankware.corebanking.arrangement.arrangement.interfaces.ArrReal;
import bankware.corebanking.classinfo.annotation.CbbClassInfo;
import bankware.corebanking.context.CbbApplicationContext;
import bankware.corebanking.frm.app.BizApplicationException;
import bxm.common.annotaion.BxmCategory;
import bxm.container.annotation.BxmBean;
 
/**
 * Author
 * History
 *  2017.06.20	initial version for 2.3
 */
@CbbClassInfo(classType={"ITEM_PROCESSOR"})
@BxmBean("PeriodicTrnsfrExctnTrgtXtrctnProcessor")
@Scope("step")
@BxmCategory(logicalName = "Periodic Transfer Execution Target Extraction Processor")
public class PeriodicTrnsfrExctnTrgtXtrctnProcessor implements ItemProcessor<PeriodicTrnsfrExctnTrgtIO, PeriodicTrnsfrExctnTrgtIO> {
	
	final Logger logger = LoggerFactory.getLogger(this.getClass());
	
	private	ArrMngr arrMngr;
	
	/* (non-Javadoc)
	 * @see org.springframework.batch.item.ItemProcessor#process(java.lang.Object)
	 */
	@Override
	public PeriodicTrnsfrExctnTrgtIO process(PeriodicTrnsfrExctnTrgtIO in) throws BizApplicationException {

		_debug("%%%%%%%%  PeriodicTrnsfrExctnTrgtProcessor  PeriodicTrnsfrExctnTrgtIO  ===>{}", in);
		
		
		return in;
	}
 
	@BeforeStep
	public void beforeStep(StepExecution stepExecution) {
		// Set the Job Parameter
		if(logger.isDebugEnabled()) {
			logger.debug("@BeforeStep");
		}
	}
	
	@AfterStep
	public ExitStatus afterStep(StepExecution stepExecution) {
		if(ExitStatus.COMPLETED.equals(stepExecution.getExitStatus())) {
			_debug("@AfterStep step COMPLETED");
		}
		
		if(ExitStatus.FAILED.equals(stepExecution.getExitStatus())) {
			_debug("@AfterStep step FAILED");
		}
		
		return stepExecution.getExitStatus();
	}
	
	private void _debug(String msg) {
		
		_debug(msg, "");
	}

	private void _debug(String msg, Object obj) {
		
		if(logger.isDebugEnabled()) {
			logger.debug(msg, obj);
		}
	}
	
	/**
	 * @return the arrMngr
	 */
	private ArrMngr _getArrMngr() {
		if (arrMngr == null) {
			arrMngr = (ArrMngr) CbbApplicationContext.getBean(ArrMngr.class, arrMngr);
		}
		return arrMngr;
	}

}

