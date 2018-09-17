package bankware.corebanking.payment.transaction.batch;

import java.util.Iterator;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.batch.core.StepExecution;
import org.springframework.batch.core.annotation.BeforeStep;
import org.springframework.batch.item.ExecutionContext;
import org.springframework.batch.item.ItemReader;
import org.springframework.batch.item.ItemStream;
import org.springframework.batch.item.ItemStreamException;
import org.springframework.batch.item.ItemWriter;
import org.springframework.batch.item.NonTransientResourceException;
import org.springframework.batch.item.ParseException;
import org.springframework.batch.item.UnexpectedInputException;
import org.springframework.context.annotation.Scope;

import bankware.corebanking.applicationcommon.commondata.interfaces.CmnContext;
import bankware.corebanking.context.CbbApplicationContext;
import bankware.corebanking.core.applicationcommon.constant.CCM01;
import bankware.corebanking.frm.app.BizApplicationException;
import bankware.corebanking.payment.transaction.batch.dao.ArrMrchntBat;
import bankware.corebanking.payment.transaction.batch.dto.ArrMrchntInfoExtrtnTrgtIO;
import bankware.corebanking.payment.transaction.batch.dto.ArrMrchntInfoIO;
import bxm.common.annotaion.BxmCategory;
import bxm.container.annotation.BxmBean;
import bxm.context.das.DasUtils;

/**
 * @file         bankware.corebanking.payment.transaction.batch.ArrMrchntInfoXtrctn.java
 * @filetype     java source file
 * @brief
 * @author       hongkyu.shim
 * @version      0.1
 * @history
 * <pre>
 * 버전          성명                   일자              변경내용
 * -------       ----------------       -----------       -----------------
 * 0.1           hongkyu.shim       2017. 04. 14.       신규 작성
 * </pre>
 */

@BxmBean("ArrMrchntInfoXtrctnReader")
@Scope("step")
@BxmCategory(logicalName = "ArrMrchntInfoXtrctn", description = "ArrMrchntInfoXtrctn")
public class ArrMrchntInfoXtrctnReader implements ItemStream, ItemReader<ArrMrchntInfoExtrtnTrgtIO>{

    final Logger logger = LoggerFactory.getLogger(this.getClass());

    private CmnContext			cmnContext;
    private ArrMrchntBat		arrMrchntBat;
    private ItemWriter<ArrMrchntInfoExtrtnTrgtIO> writer;

    private String instCd;
    private String baseDt;
    private List<ArrMrchntInfoIO> mrchntInfoList;
    private Iterator<ArrMrchntInfoIO> iterator;


    @BeforeStep
    public void beforeStep(StepExecution stepExecution) throws BizApplicationException{

        //Set the Job Parameter

//		instCd = (String)stepExecution.getJobExecution().getExecutionContext().get("instCd");
        instCd = _getCmnContext().getInstCode();
//		baseDt = (String)stepExecution.getJobExecution().getExecutionContext().get("baseDt");
        baseDt = _getCmnContext().getTxDate();

    }

    @Override
    public void open(ExecutionContext arg0) throws ItemStreamException {

        mrchntInfoList = _getArrMrchntBat().selectArrMrchntInfo(instCd, baseDt);
        iterator = mrchntInfoList.iterator();

        if( logger.isErrorEnabled() ){
            logger.debug("[AR] opened {} merchants :: ", mrchntInfoList.size());
        }
    }


    @Override
    public void close() throws ItemStreamException {
        DasUtils.disconnectDasExecutor(iterator);

        if( logger.isErrorEnabled() ){
            logger.debug("[AR] disconnected :: ");
        }
    }


    @Override
    public void update(ExecutionContext arg0) throws ItemStreamException {
        // TODO
    }


    @Override
    public ArrMrchntInfoExtrtnTrgtIO read() throws Exception, UnexpectedInputException, ParseException, NonTransientResourceException {

        ArrMrchntInfoExtrtnTrgtIO out = null;

        if( iterator.hasNext() ){

            out = new ArrMrchntInfoExtrtnTrgtIO();

            ArrMrchntInfoIO mrchntInfo = iterator.next();
            if( mrchntInfo == null && logger.isErrorEnabled() ){
                logger.debug("[AR] read merchant is null :: ");
                return out;
            }

            out.setTntInstId(mrchntInfo.getInstCd());
            out.setMrchntNbr(mrchntInfo.getArrExtrnlIdNbr());
            out.setMrchntTpCd("01");
            out.setMrchntNm(mrchntInfo.getActorNm());
            out.setMrchntStsCd(CCM01.CHAR_ONE);

            if( logger.isErrorEnabled() ){
                logger.debug("[AR] read merchant {} :: ", out.getMrchntNbr());
            }
        }

        return out;
    }




    /**
     * @return the arrMrchntBat
     */
    private ArrMrchntBat _getArrMrchntBat() {
        if (arrMrchntBat == null) {
            arrMrchntBat = (ArrMrchntBat) CbbApplicationContext.getBean(ArrMrchntBat.class, arrMrchntBat);
        }
        return arrMrchntBat;
    }


    /**
     * @return the cmnContext
     */
    private CmnContext _getCmnContext() {
        if (cmnContext == null) {
            cmnContext = (CmnContext) CbbApplicationContext.getBean(CmnContext.class, cmnContext);
        }
        return cmnContext;
    }

}