package bankware.cloudbanking.payment.transaction.periodictrnsfrexctn.batch;
 
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

import bankware.cloudbanking.payment.transaction.periodictrnsfrexctn.batch.dao.dto.ArArrPlnMIO;
import bankware.cloudbanking.payment.transaction.periodictrnsfrexctn.batch.dso.ArArrPlnMDdo;
import bankware.cloudbanking.payment.transaction.periodictrnsfrexctn.batch.dto.PeriodicTrnsfrExctnTrgtIO;
import bankware.corebanking.classinfo.annotation.CbbClassInfo;
import bankware.corebanking.context.CbbApplicationContext;
import bankware.corebanking.product.enums.pdcondition.PdCndPeriodicTransferKind;
import bxm.common.annotaion.BxmCategory;
import bxm.container.annotation.BxmBean;
import bxm.context.das.DasUtils;
 
/**
 * Author	
 * History
 *  2017.06.21	initial version for 2.3
 */
@CbbClassInfo(classType={"ITEM_READER"})
@BxmBean("PeriodicTrnsfrExctnTrgtXtrctnReader")
@Scope("step")
@BxmCategory(logicalName = "Periodic Transfer Execution Target Extraction Reader")
public class PeriodicTrnsfrExctnTrgtXtrctnReader implements ItemStream, ItemReader<PeriodicTrnsfrExctnTrgtIO> {
	final Logger logger = LoggerFactory.getLogger(this.getClass());
	
	private ArArrPlnMDdo arArrPlnMDdo;
	
	private Iterator<ArArrPlnMIO> iterator;
	private String instCd;
	private String baseDt;
	private String tableIndex;
	private String trnsfrTp;
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
		
		String arrSrvcTpCd = PdCndPeriodicTransferKind.getEnum(trnsfrTp).getExctnSrvcName();
		
		iterator = _getArArrPlnMDdo().selectList(instCd, arrSrvcTpCd, baseDt, tableIndex).iterator();
		
		if(iterator == null) throw new ItemStreamException("connected result is not prepared");
	}
	
	/* (non-Javadoc)
	 * @see org.springframework.batch.item.ItemReader#read()
	 */
	@Override
	public PeriodicTrnsfrExctnTrgtIO read() throws Exception, UnexpectedInputException, ParseException, NonTransientResourceException {
		PeriodicTrnsfrExctnTrgtIO out = null;
		
		/*
		 * Reading the accounts which were chosen, and set the plan sequence number
		 */
		if(iterator.hasNext()) {
			this.crrntItmCnt++;
			ArArrPlnMIO row = iterator.next();
			
			out = new PeriodicTrnsfrExctnTrgtIO();
			out.setArrId(row.getArrId());         
			out.setPlnSeqNbr(row.getPlnSeqNbr()); 
			out.setTxDeptId(row.getTxDeptId());
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
				
		ExecutionContext context = stepExecution.getJobExecution().getExecutionContext();
		instCd = context.getString("instCd");
		baseDt = context.getString("baseDt");
		trnsfrTp = context.getString("trnsfrTp");
		tableIndex = context.getString("tableIndex");

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
	private ArArrPlnMDdo _getArArrPlnMDdo() {
		if (arArrPlnMDdo == null) {
			arArrPlnMDdo = (ArArrPlnMDdo) CbbApplicationContext.getBean(
					ArArrPlnMDdo.class, arArrPlnMDdo);
		}
		return arArrPlnMDdo;
	}
}

