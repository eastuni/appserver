package bankware.corebanking.accounting.generalledger.batch;


import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.batch.item.ExecutionContext;
import org.springframework.batch.item.ItemStream;
import org.springframework.batch.item.ItemStreamException;
import org.springframework.batch.item.ItemStreamWriter;
import org.springframework.batch.item.ItemWriter;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.context.annotation.Scope;

import bankware.corebanking.accounting.generalledger.batch.dto.GlAcctVldtnOut;
import bankware.corebanking.classinfo.annotation.CbbClassInfo;
import bxm.common.annotaion.BxmCategory;
import bxm.common.util.Assert;
import bxm.container.annotation.BxmBean;


/**
 * Author	
 * History
 */
@BxmBean("GlAcctVldtnWriter")
@Scope("step")
@BxmCategory(logicalName = "Generalledger Validation Writer", description = "GlAcctVldtnWriter")
@CbbClassInfo(classType = { "ITEM_WRITER" })
public class GlAcctVldtnWriter implements ItemStreamWriter<GlAcctVldtnOut>, InitializingBean {
	final Logger logger = LoggerFactory.getLogger(this.getClass());


	private List<ItemWriter<GlAcctVldtnOut>> delegates;
	private static final int NRML_WRITER = 0;
	private boolean ignoreItemStream = false;


	@Override
	public void write(List<? extends GlAcctVldtnOut> item) throws Exception {


		List<GlAcctVldtnOut> outList = new ArrayList<GlAcctVldtnOut>();


		if(logger.isDebugEnabled()){
			logger.debug("## GlAcctVldtnWriter > STEP3");
		}


		for(GlAcctVldtnOut out : item){
			GlAcctVldtnOut glAcctVldtnOut = new GlAcctVldtnOut();


			glAcctVldtnOut.setDstnctnNbr(out.getDstnctnNbr());// set [구분번호]
			glAcctVldtnOut.setInstCd(out.getInstCd());// set [기관코드]
			glAcctVldtnOut.setBrnchCd(out.getBrnchCd());// set [부점코드]
			glAcctVldtnOut.setBaseDt(out.getBaseDt());// set [기준년월일]
			glAcctVldtnOut.setCrncyCd(out.getCrncyCd());// set [통화코드]
			glAcctVldtnOut.setDbtAmt(out.getDbtAmt());// set [차변금액]
			glAcctVldtnOut.setCdtAmt(out.getCdtAmt());// set [대변금액]
			glAcctVldtnOut.setErrAmt(out.getErrAmt());// set [오류금액]


			outList.add(glAcctVldtnOut);
		}
		delegates.get(NRML_WRITER).write(outList);
	}


	public void setIgnoreItemStream(boolean ignoreItemStream){
		this.ignoreItemStream = ignoreItemStream;
	}


	public void setDelegates(List<ItemWriter<GlAcctVldtnOut>> delegates){
		this.delegates = delegates;
	}


	@Override
	public void close() throws ItemStreamException {


		for(ItemWriter<GlAcctVldtnOut> writer : delegates){
			if(!ignoreItemStream && (writer instanceof ItemStream)){
				((ItemStream)writer).close();
			}
		}		
	}


	@Override
	public void open(ExecutionContext executionContext) throws ItemStreamException {


		for(ItemWriter<GlAcctVldtnOut> writer : delegates){
			if(!ignoreItemStream && (writer instanceof ItemStream)){
				((ItemStream)writer).open(executionContext);
			}
		}
	}


	@Override
	public void update(ExecutionContext executionContext) throws ItemStreamException {
		for(ItemWriter<GlAcctVldtnOut> writer : delegates){
			if(!ignoreItemStream && (writer instanceof ItemStream)){
				((ItemStream)writer).update(executionContext);
			}
		}	
	}




	@Override
	public void afterPropertiesSet() throws Exception {
		Assert.notNull(delegates, "The 'delegates' may not be null");
		Assert.notEmpty(delegates, "The 'delegates' may not be empty");
	}


}
