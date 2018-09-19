package bankware.corebanking.supplychain.financialtransaction.batch;

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

import bankware.corebanking.arrangement.arrangement.daobatch.ArArrPlnMBat;
import bankware.corebanking.arrangement.arrangement.daobatch.dto.ArArrPlnInPeriod;
import bankware.corebanking.arrangement.arrangement.daobatch.dto.ArArrPlnOutStandard;
import bankware.corebanking.classinfo.annotation.CbbClassInfo;
import bankware.corebanking.context.CbbApplicationContext;
import bankware.corebanking.frm.app.BizApplicationException;
import bankware.corebanking.supplychain.financialtransaction.batch.dto.ScfPaymentCcutTrgtIO;
import bxm.common.annotaion.BxmCategory;
import bxm.container.annotation.BxmBean;
import bxm.context.das.DasUtils;

/**
 * 
 * Author	Sohyun Park
 * History
 */
@CbbClassInfo(classType={"ITEM_READER"})
@BxmBean("ScfPaymentCcutTrgtReader")
@Scope("step")
@BxmCategory(logicalName = "SCF Centercut Target Reader", description = "Loan Application Centercut Target Reader")
public class ScfPaymentCcutTrgtReader  implements ItemStream, ItemReader<ScfPaymentCcutTrgtIO>{
	
	private static final Logger logger = LoggerFactory.getLogger(ScfPaymentCcutTrgtReader.class);

	private ArArrPlnMBat         arArrPlnMBat;
	
	private static final String READ_COUNT = "read.count";  
	private int crrntItmCnt = 0;   
	private Iterator<ArArrPlnOutStandard> iterator;
	private String instCd;
	private String arrSrvcTpCd;		
	private String startDt;
	private String endDt;
	
	/**
	 * Get the target 
	 */
	@Override
	public void open(ExecutionContext executionContext) throws ItemStreamException{
		if(executionContext.containsKey(READ_COUNT)){
			this.crrntItmCnt = executionContext.getInt(READ_COUNT);
		}
		
		// Get the target arrangements
		ArArrPlnInPeriod in = new ArArrPlnInPeriod();
		in.setInstCd(this.instCd);
		in.setArrSrvcTpCd(this.arrSrvcTpCd);
		in.setStartDt(this.startDt);
		in.setEndDt(this.endDt);

		iterator = _getArArrPlnMBat().selectByPeriod(in).iterator();
		if (iterator == null) {
			throw new ItemStreamException("connected result is not prepared");
		}

	}


	/**
	 * Set the arrangement to result object
	 */
	@Override
	public ScfPaymentCcutTrgtIO read() throws Exception, UnexpectedInputException, ParseException, NonTransientResourceException{
		
		ScfPaymentCcutTrgtIO out = null;

		if (iterator.hasNext()) {
			this.crrntItmCnt++;

			if (this.crrntItmCnt <= 2) {
				ArArrPlnOutStandard row = iterator.next();
				out = new ScfPaymentCcutTrgtIO();
				out.setArrId(row.getArrId());
				out.setBaseDt(row.getNxtExctnPlnDt());
				out.setPlnSeqNbr(row.getPlnSeqNbr());

			}
		}
		if (logger.isDebugEnabled()) {
			logger.debug(this.getClass().getName() + " out : {} ", out);
		}

		return out;
	}
	
	@Override
	public void update(ExecutionContext executionContext) throws ItemStreamException{
		executionContext.putInt(READ_COUNT, this.crrntItmCnt);
	}
	
	@Override
	public void close() throws ItemStreamException{
		DasUtils.disconnectDasExecutor(iterator);
	}
	
	/**
	 * Set the parameter
	 * @param stepExecution
	 * @throws BizApplicationException 
	 */
	@BeforeStep
	public void beforeStep(StepExecution stepExecution) throws BizApplicationException{
		// Set the Job Parameter (
		
		this.instCd = (String) stepExecution.getJobExecution().getExecutionContext().get("instCd");
		this.arrSrvcTpCd = (String)stepExecution.getJobExecution().getExecutionContext().get("arrSrvcTpCd");
		this.startDt = (String)stepExecution.getJobExecution().getExecutionContext().get("startDt");
		this.endDt = (String)stepExecution.getJobExecution().getExecutionContext().get("endDt");
		
		
		if(logger.isDebugEnabled()){
			logger.debug("==========================================================");
			logger.debug("@BeforeStep instCd			{}", this.instCd);
			logger.debug("@BeforeStep arrSrvcTpCd		{}", this.arrSrvcTpCd);
			logger.debug("@BeforeStep startDt			{}", this.startDt);
			logger.debug("@BeforeStep endDt				{}", this.endDt);
			logger.debug("==========================================================");
		}
	}
	
	@AfterStep
	public ExitStatus afterStep(StepExecution stepExecution){
		if(ExitStatus.COMPLETED.equals(stepExecution.getExitStatus()) && logger.isDebugEnabled()){
			logger.debug("@AfterStep step COMMITED");
		}else if(ExitStatus.FAILED.equals(stepExecution.getExitStatus()) && logger.isDebugEnabled()){
			logger.debug("@AfterStep step FAILED");			
		}
		
		return stepExecution.getExitStatus();
	}

	/**
	 * @return the arArrPlnMBat
	 */
	private ArArrPlnMBat _getArArrPlnMBat() {
		if (arArrPlnMBat == null) {
			arArrPlnMBat = (ArArrPlnMBat) CbbApplicationContext.getBean(
					ArArrPlnMBat.class, arArrPlnMBat);
		}
		return arArrPlnMBat;
	}
}

