package bankware.corebanking.payment.transaction.batch;
 
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.batch.core.ExitStatus;
import org.springframework.batch.core.StepExecution;
import org.springframework.batch.core.annotation.AfterStep;
import org.springframework.batch.core.annotation.BeforeStep;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.context.annotation.Scope;

import bankware.corebanking.arrangement.arrangement.interfaces.ArrMngr;
import bankware.corebanking.classinfo.annotation.CbbClassInfo;
import bankware.corebanking.frm.app.BizApplicationException;
import bankware.corebanking.context.CbbApplicationContext;
import bankware.corebanking.payment.transaction.batch.dto.TrnsRsrvtnExctnTrgtIO;
import bxm.common.annotaion.BxmCategory;
import bxm.container.annotation.BxmBean;
 
/**
 * This abstraction class implements ItemProcessor.
 * This class is used for processing target accounts which were extracted from the previous step.
 * The output data from this class will be used to center cut service.
 *
 * Author	Heejung Park
 * History
 *  2015.10.12	initial version for 2.3
 */
@CbbClassInfo(classType={"ITEM_PROCESSOR"})
@BxmBean("TrnsRsrvtnExctnTrgtXtrctnProcessor")
@Scope("step")
@BxmCategory(logicalName = "Transfer Reservation Execution Target Extraction Processor")
public class TrnsRsrvtnExctnTrgtXtrctnProcessor implements ItemProcessor<TrnsRsrvtnExctnTrgtIO, TrnsRsrvtnExctnTrgtIO> {
	final Logger logger = LoggerFactory.getLogger(this.getClass());
	
	private	ArrMngr arrMngr;
	
	/* (non-Javadoc)
	 * @see org.springframework.batch.item.ItemProcessor#process(java.lang.Object)
	 */
	@Override
	public TrnsRsrvtnExctnTrgtIO process(TrnsRsrvtnExctnTrgtIO in) throws BizApplicationException {

		/*
		 * Set the other necessary information for center cut service
		 */
		_debug("%%%%%%%%  TrnsRsrvtnActionTrgtXtrctnProcessor  TrnsRsrvtnActionTrgtIO  ===>{}", in);
		
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

