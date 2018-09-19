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
import org.springframework.batch.item.NonTransientResourceException;
import org.springframework.batch.item.ParseException;
import org.springframework.batch.item.UnexpectedInputException;
import org.springframework.context.annotation.Scope;

import bankware.corebanking.arrangement.arrangement.daobatch.ArArrArrIdBat;
import bankware.corebanking.arrangement.arrangement.daobatch.dto.ArArrArrIdIO;
import bankware.corebanking.arrangement.enums.ArrSrvcEnum;
import bankware.corebanking.classinfo.annotation.CbbClassInfo;
import bankware.corebanking.context.CbbApplicationContext;
import bankware.corebanking.payment.transaction.batch.dto.StndngOrderExctnTrgtIO;
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
@BxmBean("StndngOrderExctnTrgtXtrctnReader")
@Scope("step")
@BxmCategory(logicalName = "Standing Order Execution Target Extraction Reader")
public class StndngOrderExctnTrgtXtrctnReader implements ItemStream, ItemReader<StndngOrderExctnTrgtIO> {
	final Logger logger = LoggerFactory.getLogger(this.getClass());
	
	private ArArrArrIdBat arArrArrIdBat;
	
	private Iterator<ArArrArrIdIO> iterator;
	private String instCd;
	private String baseDt;
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
		
		/*
		 * Inquiry the extraction target accounts from plan table of arrangement
		 */
		ArArrArrIdIO inParam = new ArArrArrIdIO();
		inParam.setInstCd(instCd);                   
		inParam.setBaseDt(baseDt);                   
		inParam.setArrSrvcTpCd(ArrSrvcEnum.OPEN_STANDING_ORDER.getValue());         
		
		iterator = _getArArrArrIdBat().selectByPlan(inParam).iterator();
		
		if(iterator == null) throw new ItemStreamException("connected result is not prepared");
	}
	
	/* (non-Javadoc)
	 * @see org.springframework.batch.item.ItemReader#read()
	 */
	@Override
	public StndngOrderExctnTrgtIO read() throws Exception, UnexpectedInputException, ParseException, NonTransientResourceException {
		StndngOrderExctnTrgtIO out = null;
		
		/*
		 * Reading the accounts which were chosen, and set the plan sequence number
		 */
		if(iterator.hasNext()) {
			this.crrntItmCnt++;
			ArArrArrIdIO row = iterator.next();
			
			out = new StndngOrderExctnTrgtIO();
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
		// Set the Job Parameter
		instCd = (String) stepExecution.getJobExecution().getExecutionContext().get("instCd");
		baseDt = (String) stepExecution.getJobExecution().getExecutionContext().get("baseDt");
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
	 * @return the arArrArrIdBat
	 */
	private ArArrArrIdBat _getArArrArrIdBat() {
		if (arArrArrIdBat == null) {
			arArrArrIdBat = (ArArrArrIdBat) CbbApplicationContext.getBean(
					ArArrArrIdBat.class, arArrArrIdBat);
		}
		return arArrArrIdBat;
	}
}

