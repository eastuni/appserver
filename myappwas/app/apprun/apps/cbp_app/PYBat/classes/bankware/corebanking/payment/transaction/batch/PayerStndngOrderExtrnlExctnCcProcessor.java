package bankware.corebanking.payment.transaction.batch;

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
import bankware.corebanking.classinfo.annotation.CbbClassInfo;
import bankware.corebanking.context.CbbApplicationContext;
import bankware.corebanking.payment.centercut.service.dto.PayerStndngOrderCcSvcIn;
import bankware.corebanking.payment.transaction.batch.dto.PayerStndngOrderExtrnlExctnTrgtIO;
import bxm.common.annotaion.BxmCategory;
import bxm.container.annotation.BxmBean;

/**
 * This abstraction class implements ItemProcessor.
 * This class is used for calling 'Payer standing order center cut service'.
 * For this, input data of center cut service should be made in this class.
 *
 * Author	Seungjun Choi
 * History
 *  2016.01.28	initial version for 3.0
 */
@CbbClassInfo(classType={"ITEM_PROCESSOR"})
@BxmBean("PayerStndngOrderExtrnlExctnCcProcessor")
@Scope("step")
@BxmCategory(logicalName = "Payer Standing Order Execution External Center Cut Processor")
public class PayerStndngOrderExtrnlExctnCcProcessor implements ItemProcessor<PayerStndngOrderExtrnlExctnTrgtIO, PayerStndngOrderExtrnlExctnTrgtIO> {
	final Logger logger = LoggerFactory.getLogger(this.getClass());

		private	    CntrCtMngr cntrCtMngr;

    private CcInstJobInfo ccInfo;


    /* (non-Javadoc)
     * @see org.springframework.batch.item.ItemProcessor#process(java.lang.Object)
     */
    @Override
    public PayerStndngOrderExtrnlExctnTrgtIO process(PayerStndngOrderExtrnlExctnTrgtIO in) throws Exception {
    	/*
    	 * Make input data for calling center cut service
    	 */
    	PayerStndngOrderCcSvcIn srvcIn = new PayerStndngOrderCcSvcIn();

        srvcIn.setInstCd(in.getInstCd());
        srvcIn.setCntrCtId(in.getCcId());
        srvcIn.setTxAmt(in.getTrnsfrAmt());
        srvcIn.setBlockNbr(in.getBlockNbr());
        srvcIn.setSeqNbr(in.getSeqNbr());
        srvcIn.setTxSeqNbr(in.getDataSeqNbr());
        srvcIn.setExtrnlInstCd(in.getExtrnlInstCd());
        srvcIn.setFtpFileNm(in.getFtpFileNm());
        srvcIn.setMnyRcvdAcctNbr(in.getDpstAcctNbr());
        srvcIn.setMnyRcvdBnkCd(in.getMnyRcvdBnkCd());
        srvcIn.setPrcsngDt(in.getPrcsngDt());
        _getCntrCtMngr().addCcInstJobInput(ccInfo, null, BigDecimal.ZERO, srvcIn);

        return null;
    }

    @BeforeStep
    public void beforeStep(StepExecution stepExecution) throws Exception {
		String ccId = (String) stepExecution.getJobExecution().getExecutionContext().get("ccId");
		String prcsDt = (String) stepExecution.getJobExecution().getExecutionContext().get("jobDt");
		ccInfo = _getCntrCtMngr().openCcInstJobInputBundle(ccId , prcsDt);
    }

    @AfterStep
    public ExitStatus afterStep(StepExecution stepExecution) throws Exception {
        if(ExitStatus.COMPLETED.equals(stepExecution.getExitStatus())) {
        	_getCntrCtMngr().closeCcInstJobInputBundle(ccInfo);
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

