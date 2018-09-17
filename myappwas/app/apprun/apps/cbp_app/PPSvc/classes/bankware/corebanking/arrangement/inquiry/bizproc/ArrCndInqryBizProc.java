package bankware.corebanking.arrangement.inquiry.bizproc;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import bankware.corebanking.applicationcommon.codelibrary.interfaces.Cd;
import bankware.corebanking.applicationcommon.commondata.interfaces.CmnContext;
import bankware.corebanking.arrangement.arrangement.interfaces.Arr;
import bankware.corebanking.arrangement.arrangementcondition.interfaces.ArrCnd;
import bankware.corebanking.arrangement.arrangementcondition.interfaces.ArrCndFee;
import bankware.corebanking.arrangement.arrangementcondition.interfaces.ArrCndInt;
import bankware.corebanking.arrangement.arrangementcondition.interfaces.ArrCndLst;
import bankware.corebanking.arrangement.arrangementcondition.interfaces.ArrCndRng;
import bankware.corebanking.context.CbbApplicationContext;
import bankware.corebanking.frm.app.BizApplicationException;
import bxm.common.annotaion.BxmCategory;
import bxm.container.annotation.BxmBean;

/**
 *
 * Author
 * History
 */
@BxmBean("ArrCndInqryBizProc")
@BxmCategory(logicalName = "Arrangement Condition Inquiry BizProc")
public class ArrCndInqryBizProc {

    final Logger logger = LoggerFactory.getLogger(this.getClass());

    private Cd					cd;
    private CmnContext			cmnContext;
    //private FeeCalculator		feeCalculator;

    private final String ARR_STS_CD_NBR = "50000";

    /**
     * Get Arrangemet Condition Value
     *
     * @param arrCnd
     * @return
     * @throws BizApplicationException
     */
    public String getArrangementConditionValue(ArrCnd arrCnd) throws BizApplicationException {

        if (arrCnd == null) {
            return null;
        }

        if (!arrCnd.isArrLevel()) {
            return arrCnd.getPdCndValAsReadableForm();
        }

        String cndValue = "";

        switch (arrCnd.getCndTp()) {
        case LIST:
            cndValue = ((ArrCndLst) arrCnd).getListCd();
            break;

        case RANGE:
            cndValue = ((ArrCndRng) arrCnd).getRngVal() == null ? "": ((ArrCndRng) arrCnd).getRngVal().toString();
            break;

        case FEE:
            cndValue = ((ArrCndFee) arrCnd).getFeeVal() == null ? "": ((ArrCndFee) arrCnd).getFeeVal().toString();
            break;

        case INTEREST:
            if (((ArrCndInt) arrCnd).getAplyRt() != null) {
                cndValue = ((ArrCndInt) arrCnd).getAplyRt().toString();
            }
            break;

        default:
            break;
        }

        return cndValue;
    }

    /**
     * Get Arrangement Fee Simulation
     *
     * @param arrSrvcEnum
     * @param arr
     * @return
     * @throws BizApplicationException
     */
//    public FeeCalculatorOut getArrangementFeeSimulation(ArrSrvcEnum arrSrvcEnum, Arr arr) throws BizApplicationException {
//
//        ArrCndActionRequiredValue arrCndActionRequiredValue = new ArrCndActionRequiredValue();
//
//        arrCndActionRequiredValue.setCashTransfer(CashTrnsfrEnum.TRNSFR);
//        arrCndActionRequiredValue.setTxAmt(new BigDecimal(arr.getArrCnd(PdCndEnum.CONTRACT_AMOUNT.getValue()).getCndVal()));
//        arrCndActionRequiredValue.setTxDt(_getCmnContext().getTxDate());
//
//        return _getFeeCalculator().calculateFee(arrSrvcEnum.getValue(), arr, arrCndActionRequiredValue, true);
//    }

    /**
     * Get Arrangement Fee Simulation
     *
     * @param arrSrvcEnum
     * @param arrangement
     * @return
     * @throws BizApplicationException
     */
//    public FeeCalculatorOut getArrangementFeeSimulation(ArrSrvcEnum arrSrvcEnum, Arrangement arrangement) throws BizApplicationException {
//
//        ArrCndActionRequiredValue arrCndActionRequiredValue = new ArrCndActionRequiredValue();
//        arrCndActionRequiredValue.setCashTransfer( CashTrnsfrEnum.TRNSFR );
//        arrCndActionRequiredValue.setTxAmt(new BigDecimal(arrangement.getArrCnd(PdCndEnum.CONTRACT_AMOUNT.getValue()).getCndVal()));
//
//        arrCndActionRequiredValue.setTxDt(_getCmnContext().getTxDate());
//
//        return _getFeeCalculator().calculateFee( arrSrvcEnum.getValue(), arrangement, arrCndActionRequiredValue, true);
//    }

    /**
     * Get Arrangement Status Name
     *
     * @param arr
     * @return
     * @throws BizApplicationException
     */
    public String getArrangementStatusName(Arr arr) throws BizApplicationException {

        return _getCd().getCode(ARR_STS_CD_NBR, arr.getArrSts().getValue());
    }

    /**
     * @return the cd
     */
    private Cd _getCd() {
        if (cd == null) {
            cd = (Cd) CbbApplicationContext.getBean(Cd.class, cd);
        }
        return cd;
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

//    /**
//     * @return the feeCalculator
//     */
//    private FeeCalculator _getFeeCalculator() {
//        if (feeCalculator == null) {
//            feeCalculator = (FeeCalculator) CbbApplicationContext.getBean(
//                    FeeCalculator.class, feeCalculator);
//        }
//        return feeCalculator;
//    }
}
