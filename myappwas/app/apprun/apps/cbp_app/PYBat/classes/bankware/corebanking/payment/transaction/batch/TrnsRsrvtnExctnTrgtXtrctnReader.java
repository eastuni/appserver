package bankware.corebanking.payment.transaction.batch;
 
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
import org.springframework.context.annotation.Scope;

import bankware.corebanking.arrangement.enums.ArrSrvcEnum;
import bankware.corebanking.classinfo.annotation.CbbClassInfo;
import bankware.corebanking.context.CbbApplicationContext;
import bankware.corebanking.frm.app.BizApplicationException;
import bankware.corebanking.payment.transaction.batch.dao.TxArrPlnBat;
import bankware.corebanking.payment.transaction.batch.dao.dto.TxArrPlnIO;
import bankware.corebanking.payment.transaction.batch.dto.TrnsRsrvtnExctnTrgtIO;
import bxm.common.annotaion.BxmCategory;
import bxm.container.annotation.BxmBean;
import bxm.context.das.DasUtils;
 
/**
 * This abstraction class implements ItemStream and ItemReader.
 * This class is used for extracting target accounts of automatically term deposit interest payment.
 * Extraction of accounts is based on the plan table of arrangement area.
 *
 * Author	Heejung Park
 * History
 *  2015.10.12	initial version for 2.3
 */
@CbbClassInfo(classType={"ITEM_READER"})
@BxmBean("TrnsRsrvtnExctnTrgtXtrctnReader")
@Scope("step")
@BxmCategory(logicalName = "Transfer Reservation Execution Target Extraction Reader")
public class TrnsRsrvtnExctnTrgtXtrctnReader implements ItemStream, ItemReader<TrnsRsrvtnExctnTrgtIO> {
	final Logger logger = LoggerFactory.getLogger(this.getClass());
	
	private TxArrPlnBat txArrPlnBat;
	
	private Iterator<TxArrPlnIO> iterator;
	private String instCd;
	private String baseDt;
	private String baseHhmm;
	private int crrntItmCnt = 0;
	private static final String READ_COUNT = "read.count";
	
	/* (non-Javadoc)
	 * @see org.springframework.batch.item.ItemStream#open(org.springframework.batch.item.ExecutionContext)
	 */
	@Override
	public void open(ExecutionContext executionContext) throws ItemStreamException {
		if(executionContext.containsKey(READ_COUNT)) {
			this.crrntItmCnt = executionContext.getInt(READ_COUNT);
		}
    	if (logger.isDebugEnabled()) {
    		logger.debug("##LH>in:{},{}", instCd, baseDt);
    	}
		/*
		 * Inquiry the extraction target accounts from plan table of arrangement
		 */
		TxArrPlnIO inParam = new TxArrPlnIO();
		inParam.setInstCd(instCd);                   
		inParam.setBaseDt(baseDt);      		
		inParam.setNxtExctnPlnHhmm(baseHhmm);
		inParam.setArrSrvcTpCd(ArrSrvcEnum.INTRA_INSTITUTION_SCHEDULED_TRANSFER.getValue());         
		
    	if (logger.isDebugEnabled()) {
    		logger.debug("##LH>inParam:{}", inParam);
    	}
		iterator = _getTxArrPlnBat().selectPlans(inParam).iterator();
		
		if(iterator == null) throw new ItemStreamException("connected result is not prepared");
	}
	
	/* (non-Javadoc)
	 * @see org.springframework.batch.item.ItemReader#read()
	 */
	@Override
	public TrnsRsrvtnExctnTrgtIO read() throws BizApplicationException {
		TrnsRsrvtnExctnTrgtIO out = null;
		
		/*
		 * Reading the accounts which were chosen, and set the plan sequence number
		 */
		if(iterator.hasNext()) {
			this.crrntItmCnt++;
			TxArrPlnIO row = iterator.next();
			
			out = new TrnsRsrvtnExctnTrgtIO();
			out.setArrId(row.getArrId());         
			out.setPlnSeqNbr(row.getPlnSeqNbr()); 
		}
		
		return out;
	}
	
	/* (non-Javadoc)
	 * @see org.springframework.batch.item.ItemStream#update(org.springframework.batch.item.ExecutionContext)
	 */
	@Override
	public void update(ExecutionContext executionContext) throws ItemStreamException {
		executionContext.putInt(READ_COUNT, this.crrntItmCnt);
	}
	
	/* (non-Javadoc)
	 * @see org.springframework.batch.item.ItemStream#close()
	 */
	@Override
	public void close() throws ItemStreamException {
		DasUtils.disconnectDasExecutor(iterator);
	}
	
	@BeforeStep
	public void beforeStep(StepExecution stepExecution) {
    	if (logger.isDebugEnabled()) {
			logger.debug("##LH>getJobParameters:{}", stepExecution.getJobParameters());
			logger.debug("##LH>getJobParameters:{}", stepExecution.getExecutionContext());
			logger.debug("##LH>getJobParameters:{}", stepExecution.getJobExecution());
    	}
    	
    	// Set the Job Parameter
		this.instCd = stepExecution.getJobParameters().getString("instCd");
		this.baseDt = stepExecution.getJobParameters().getString("baseDt");
		this.baseHhmm = stepExecution.getJobParameters().getString("baseHhmm");
	}
	
	@AfterStep
	public ExitStatus afterStep(StepExecution stepExecution) {
		if(ExitStatus.COMPLETED.equals(stepExecution.getExitStatus())) {
			_debug("@AfterStep step COMMITED");
		}
		
		else if(ExitStatus.FAILED.equals(stepExecution.getExitStatus())) {
			_debug("@AfterStep step FAILED");
		}
		
		return stepExecution.getExitStatus();
	}
	private void _debug(String msg) {
		
		if(logger.isDebugEnabled()) {
			logger.debug(msg);
		}
	}

	/**
	 * @return the txArrPlnBat
	 */
	private TxArrPlnBat _getTxArrPlnBat() {
		if (txArrPlnBat == null) {
			txArrPlnBat = (TxArrPlnBat) CbbApplicationContext.getBean(
					TxArrPlnBat.class, txArrPlnBat);
		}
		return txArrPlnBat;
	}
}

