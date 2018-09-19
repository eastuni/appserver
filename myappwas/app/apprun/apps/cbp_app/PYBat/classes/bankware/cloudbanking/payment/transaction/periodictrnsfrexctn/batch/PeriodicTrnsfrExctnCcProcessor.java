package bankware.cloudbanking.payment.transaction.periodictrnsfrexctn.batch;

import java.math.BigDecimal;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.batch.core.ExitStatus;
import org.springframework.batch.core.StepExecution;
import org.springframework.batch.core.annotation.AfterStep;
import org.springframework.batch.core.annotation.BeforeStep;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.context.annotation.Scope;

import bankware.centercut.interfaces.CntrCtCtrlMngr;
import bankware.centercut.interfaces.CntrCtMngr;
import bankware.centercut.interfaces.dto.CcInstJobInfo;
import bankware.centercut.interfaces.dto.CcInstJobKey;
import bankware.cloudbanking.payment.transaction.periodictrnsfrexctn.batch.dto.PeriodicTrnsfrExctnTrgtIO;
import bankware.corebanking.classinfo.annotation.CbbClassInfo;
import bankware.corebanking.context.CbbApplicationContext;
import bankware.corebanking.payment.transfer.service.dto.TrnsfrExctnCcSvcIn;
import bxm.common.annotaion.BxmCategory;
import bxm.container.annotation.BxmBean;

/**
 * This abstraction class implements ItemProcessor.
 * This class is used for calling 'Term deposit interest payment center cut service'.
 * For this, input data of center cut service should be made in this class.
 *
 * Author	JungYeon Lee
 * History
 *  2017.07.05	initial version for 2.3
 */
@CbbClassInfo(classType={"ITEM_PROCESSOR"})
@BxmBean("PeriodicTrnsfrExctnCcProcessor")
@Scope("step")
@BxmCategory(logicalName = "Periodic Transfer Execution Center Cut Processor")
public class PeriodicTrnsfrExctnCcProcessor implements ItemProcessor<PeriodicTrnsfrExctnTrgtIO, PeriodicTrnsfrExctnTrgtIO> {
	final Logger logger = LoggerFactory.getLogger(this.getClass());

		private	    CntrCtMngr cntrCtMngr;
		private	    CntrCtCtrlMngr cntrCtCtrlMngr;
		
    private CcInstJobInfo ccInfo;


    /* (non-Javadoc)
     * @see org.springframework.batch.item.ItemProcessor#process(java.lang.Object)
     */
    @Override
    public PeriodicTrnsfrExctnTrgtIO process(PeriodicTrnsfrExctnTrgtIO in) throws Exception {
    	/*
    	 * Make input data for calling center cut service
    	 */
    	TrnsfrExctnCcSvcIn srvcIn = new TrnsfrExctnCcSvcIn();
        srvcIn.setArrId(in.getArrId());
        srvcIn.setPlnSeqNbr(in.getPlnSeqNbr()); 
        _getCntrCtMngr().addCcInstJobInput(ccInfo, null, BigDecimal.ZERO, srvcIn, null, in.getTxDeptId(), null);

        return null;
    }

    @BeforeStep
    public void beforeStep(StepExecution stepExecution) throws Exception {
    	String instCd = (String) stepExecution.getJobExecution().getExecutionContext().get("instCd");
		String ccId = (String) stepExecution.getJobExecution().getExecutionContext().get("ccId");
		ccInfo = _getCntrCtMngr().openCcInstJobInputBundle(instCd, ccId );
    }

    @AfterStep
    public ExitStatus afterStep(StepExecution stepExecution) throws Exception {
        if(ExitStatus.COMPLETED.equals(stepExecution.getExitStatus())) {
        	_getCntrCtMngr().closeCcInstJobInputBundle(ccInfo);
        	//run centercut directly.
        	String runCC = (String) stepExecution.getJobExecution().getExecutionContext().get("runCC");
        	if("true".equals(runCC)){
        		CcInstJobKey instJobKey = ccInfo.getInstJobKey();
        		_CntrCtCtrlMngr().runCentercutJob(instJobKey.getInstCd(), instJobKey.getJobId(), instJobKey.getPrcsngDt(), instJobKey.getRcptNbr(), instJobKey.getAttemptNbr());
        	}
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
	private CntrCtCtrlMngr _CntrCtCtrlMngr() {
		if (cntrCtCtrlMngr == null) {
			cntrCtCtrlMngr = (CntrCtCtrlMngr) CbbApplicationContext.getBean(CntrCtCtrlMngr.class, cntrCtCtrlMngr);
		}
		return cntrCtCtrlMngr;
	}
}

