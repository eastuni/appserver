package bankware.corebanking.p2ploan.investmentwithdrawal.batch;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.context.annotation.Scope;

import bankware.corebanking.classinfo.annotation.CbbClassInfo;
import bankware.corebanking.p2ploan.investmentwithdrawal.batch.dto.P2pLendingWhdrwlIO;
import bxm.common.annotaion.BxmCategory;
import bxm.container.annotation.BxmBean;

/**
 * 
 * Author	Kisu Kim
 * History
 *  2016.03.15	initial version for 3.0
 */
@CbbClassInfo(classType={"ITEM_PROCESSOR"})
@BxmBean("P2pLendingWhdrwlProcessor")
@Scope("step")
@BxmCategory(logicalName = "P2P 투자자 출금 Processor", description = "P2P 투자자 출금 Processor")
public class P2pLendingWhdrwlProcessor implements ItemProcessor<P2pLendingWhdrwlIO, P2pLendingWhdrwlIO>{

	final Logger logger = LoggerFactory.getLogger(this.getClass());

	@Override
	public P2pLendingWhdrwlIO process(P2pLendingWhdrwlIO arg0) throws Exception {
		
		
	
		return null;
	}
}
