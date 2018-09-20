/******************************************************************************
 * Bxm Object Message Mapping(OMM) - Source Generator V6-1
 *
 * 생성된 자바파일은 수정하지 마십시오.
 * OMM 파일 수정시 Java파일을 덮어쓰게 됩니다.
 *
 ******************************************************************************/

package bankware.corebanking.deposit.simulation.service.dto;


import bxm.omm.annotation.BxmOmm_Field;
import bxm.omm.predict.Predictable;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Hashtable;
import javax.xml.bind.annotation.XmlType;
import javax.xml.bind.annotation.XmlTransient;
import javax.xml.bind.annotation.XmlRootElement;
import bxm.omm.root.IOmmObject;
import com.fasterxml.jackson.annotation.JsonIgnore;
import bxm.omm.predict.FieldInfo;

/**
 * @Description 
 */
@XmlType(propOrder={"custId", "acctNbr", "pdCd", "arrSrvcTpCd", "txAmt", "baseDt"}, name="FeeSmltnSvcIn")
@XmlRootElement(name="FeeSmltnSvcIn")
@SuppressWarnings("all")
public class FeeSmltnSvcIn  implements IOmmObject, Predictable, FieldInfo  {

	private static final long serialVersionUID = 1201329052L;

	@XmlTransient
	public static final String OMM_DESCRIPTION = "";

	/*******************************************************************************************************************************
	* Property set << custId >> [[ */
	
	@XmlTransient
	private boolean isSet_custId = false;
	
	protected boolean isSet_custId()
	{
		return this.isSet_custId;
	}
	
	protected void setIsSet_custId(boolean value)
	{
		this.isSet_custId = value;
	}
	
	
	@BxmOmm_Field(referenceType="reference", description="고객식별자", formatType="", format="", align="left", length=15, decimal=0, arrayReference="", fill="", comment="", validationRule="")
	private java.lang.String custId  = null;
	
	/**
	 * @Description 고객식별자
	 */
	public java.lang.String getCustId(){
		return custId;
	}
	
	/**
	 * @Description 고객식별자
	 */
	@JsonProperty("custId")
	public void setCustId( java.lang.String custId ) {
		isSet_custId = true;
		this.custId = custId;
	}
	
	/** Property set << custId >> ]]
	*******************************************************************************************************************************/
	/*******************************************************************************************************************************
	* Property set << acctNbr >> [[ */
	
	@XmlTransient
	private boolean isSet_acctNbr = false;
	
	protected boolean isSet_acctNbr()
	{
		return this.isSet_acctNbr;
	}
	
	protected void setIsSet_acctNbr(boolean value)
	{
		this.isSet_acctNbr = value;
	}
	
	
	@BxmOmm_Field(referenceType="reference", description="계좌번호", formatType="", format="", align="left", length=15, decimal=0, arrayReference="", fill="", comment="", validationRule="")
	private java.lang.String acctNbr  = null;
	
	/**
	 * @Description 계좌번호
	 */
	public java.lang.String getAcctNbr(){
		return acctNbr;
	}
	
	/**
	 * @Description 계좌번호
	 */
	@JsonProperty("acctNbr")
	public void setAcctNbr( java.lang.String acctNbr ) {
		isSet_acctNbr = true;
		this.acctNbr = acctNbr;
	}
	
	/** Property set << acctNbr >> ]]
	*******************************************************************************************************************************/
	/*******************************************************************************************************************************
	* Property set << pdCd >> [[ */
	
	@XmlTransient
	private boolean isSet_pdCd = false;
	
	protected boolean isSet_pdCd()
	{
		return this.isSet_pdCd;
	}
	
	protected void setIsSet_pdCd(boolean value)
	{
		this.isSet_pdCd = value;
	}
	
	
	@BxmOmm_Field(referenceType="reference", description="상품코드", formatType="", format="", align="left", length=20, decimal=0, arrayReference="", fill="", comment="", validationRule="")
	private java.lang.String pdCd  = null;
	
	/**
	 * @Description 상품코드
	 */
	public java.lang.String getPdCd(){
		return pdCd;
	}
	
	/**
	 * @Description 상품코드
	 */
	@JsonProperty("pdCd")
	public void setPdCd( java.lang.String pdCd ) {
		isSet_pdCd = true;
		this.pdCd = pdCd;
	}
	
	/** Property set << pdCd >> ]]
	*******************************************************************************************************************************/
	/*******************************************************************************************************************************
	* Property set << arrSrvcTpCd >> [[ */
	
	@XmlTransient
	private boolean isSet_arrSrvcTpCd = false;
	
	protected boolean isSet_arrSrvcTpCd()
	{
		return this.isSet_arrSrvcTpCd;
	}
	
	protected void setIsSet_arrSrvcTpCd(boolean value)
	{
		this.isSet_arrSrvcTpCd = value;
	}
	
	
	@BxmOmm_Field(referenceType="reference", description="계약서비스유형코드", formatType="", format="", align="left", length=20, decimal=0, arrayReference="", fill="", comment="", validationRule="")
	private java.lang.String arrSrvcTpCd  = null;
	
	/**
	 * @Description 계약서비스유형코드
	 */
	public java.lang.String getArrSrvcTpCd(){
		return arrSrvcTpCd;
	}
	
	/**
	 * @Description 계약서비스유형코드
	 */
	@JsonProperty("arrSrvcTpCd")
	public void setArrSrvcTpCd( java.lang.String arrSrvcTpCd ) {
		isSet_arrSrvcTpCd = true;
		this.arrSrvcTpCd = arrSrvcTpCd;
	}
	
	/** Property set << arrSrvcTpCd >> ]]
	*******************************************************************************************************************************/
	/*******************************************************************************************************************************
	* Property set << txAmt >> [[ */
	
	@XmlTransient
	private boolean isSet_txAmt = false;
	
	protected boolean isSet_txAmt()
	{
		return this.isSet_txAmt;
	}
	
	protected void setIsSet_txAmt(boolean value)
	{
		this.isSet_txAmt = value;
	}
	
	/**
	 * java.math.BigDecimal - String value setter
	 * @Description 거래금액
	 */
	public void setTxAmt(java.lang.String value) {
		isSet_txAmt = true;
		this.txAmt = new java.math.BigDecimal(value);
	}
	/**
	 * java.math.BigDecimal - Double value setter
	 * @Description 거래금액
	 */
	public void setTxAmt(double value) {
		isSet_txAmt = true;
		this.txAmt = java.math.BigDecimal.valueOf(value);
	}
	/**
	 * java.math.BigDecimal - Long value setter
	 * @Description 거래금액
	 */
	public void setTxAmt(long value) {
		isSet_txAmt = true;
		this.txAmt = java.math.BigDecimal.valueOf(value);
	}
	
	@BxmOmm_Field(referenceType="reference", description="거래금액", formatType="", format="", align="right", length=17, decimal=2, arrayReference="", fill="", comment="", validationRule="")
	private java.math.BigDecimal txAmt  = new java.math.BigDecimal("0.0");
	
	/**
	 * @Description 거래금액
	 */
	public java.math.BigDecimal getTxAmt(){
		return txAmt;
	}
	
	/**
	 * @Description 거래금액
	 */
	@JsonProperty("txAmt")
	public void setTxAmt( java.math.BigDecimal txAmt ) {
		isSet_txAmt = true;
		this.txAmt = txAmt;
	}
	
	/** Property set << txAmt >> ]]
	*******************************************************************************************************************************/
	/*******************************************************************************************************************************
	* Property set << baseDt >> [[ */
	
	@XmlTransient
	private boolean isSet_baseDt = false;
	
	protected boolean isSet_baseDt()
	{
		return this.isSet_baseDt;
	}
	
	protected void setIsSet_baseDt(boolean value)
	{
		this.isSet_baseDt = value;
	}
	
	
	@BxmOmm_Field(referenceType="reference", description="기준년월일", formatType="", format="", align="left", length=8, decimal=0, arrayReference="", fill="", comment="", validationRule="")
	private java.lang.String baseDt  = null;
	
	/**
	 * @Description 기준년월일
	 */
	public java.lang.String getBaseDt(){
		return baseDt;
	}
	
	/**
	 * @Description 기준년월일
	 */
	@JsonProperty("baseDt")
	public void setBaseDt( java.lang.String baseDt ) {
		isSet_baseDt = true;
		this.baseDt = baseDt;
	}
	
	/** Property set << baseDt >> ]]
	*******************************************************************************************************************************/

	@Override
	public FeeSmltnSvcIn clone(){
		try{
			FeeSmltnSvcIn object= (FeeSmltnSvcIn)super.clone();
			if ( this.custId== null ) object.custId = null;
			else{
				object.custId = this.custId;
			}
			if ( this.acctNbr== null ) object.acctNbr = null;
			else{
				object.acctNbr = this.acctNbr;
			}
			if ( this.pdCd== null ) object.pdCd = null;
			else{
				object.pdCd = this.pdCd;
			}
			if ( this.arrSrvcTpCd== null ) object.arrSrvcTpCd = null;
			else{
				object.arrSrvcTpCd = this.arrSrvcTpCd;
			}
			if ( this.txAmt== null ) object.txAmt = null;
			else{
				object.txAmt = new java.math.BigDecimal(txAmt.toString());
			}
			if ( this.baseDt== null ) object.baseDt = null;
			else{
				object.baseDt = this.baseDt;
			}
			
			return object;
		} 
		catch(Exception e){
			throw new bxm.omm.exception.CloneFailedException(e);
		}
	}

	
	@Override
	public int hashCode(){
		final int prime=31;
		int result = 1;
		result = prime * result + ((custId==null)?0:custId.hashCode());
		result = prime * result + ((acctNbr==null)?0:acctNbr.hashCode());
		result = prime * result + ((pdCd==null)?0:pdCd.hashCode());
		result = prime * result + ((arrSrvcTpCd==null)?0:arrSrvcTpCd.hashCode());
		result = prime * result + ((txAmt==null)?0:txAmt.hashCode());
		result = prime * result + ((baseDt==null)?0:baseDt.hashCode());
		return result;
	}
	
	@Override
	public boolean equals(Object obj) {
		if ( this == obj ) return true;
		if ( obj == null ) return false;
		if ( getClass() != obj.getClass() ) return false;
		final bankware.corebanking.deposit.simulation.service.dto.FeeSmltnSvcIn other = (bankware.corebanking.deposit.simulation.service.dto.FeeSmltnSvcIn)obj;
		if ( custId == null ){
			if ( other.custId != null ) return false;
		}
		else if ( !custId.equals(other.custId) )
			return false;
		if ( acctNbr == null ){
			if ( other.acctNbr != null ) return false;
		}
		else if ( !acctNbr.equals(other.acctNbr) )
			return false;
		if ( pdCd == null ){
			if ( other.pdCd != null ) return false;
		}
		else if ( !pdCd.equals(other.pdCd) )
			return false;
		if ( arrSrvcTpCd == null ){
			if ( other.arrSrvcTpCd != null ) return false;
		}
		else if ( !arrSrvcTpCd.equals(other.arrSrvcTpCd) )
			return false;
		if ( txAmt == null ){
			if ( other.txAmt != null ) return false;
		}
		else if ( !txAmt.equals(other.txAmt) )
			return false;
		if ( baseDt == null ){
			if ( other.baseDt != null ) return false;
		}
		else if ( !baseDt.equals(other.baseDt) )
			return false;
		return true;
	}

	@Override
	public String toString() {
		StringBuilder sb = new StringBuilder();
	
		sb.append( "\n[bankware.corebanking.deposit.simulation.service.dto.FeeSmltnSvcIn:\n");
		sb.append("\tcustId: ");
		sb.append(custId==null?"null":getCustId());
		sb.append("\n");
		sb.append("\tacctNbr: ");
		sb.append(acctNbr==null?"null":getAcctNbr());
		sb.append("\n");
		sb.append("\tpdCd: ");
		sb.append(pdCd==null?"null":getPdCd());
		sb.append("\n");
		sb.append("\tarrSrvcTpCd: ");
		sb.append(arrSrvcTpCd==null?"null":getArrSrvcTpCd());
		sb.append("\n");
		sb.append("\ttxAmt: ");
		sb.append(txAmt==null?"null":getTxAmt());
		sb.append("\n");
		sb.append("\tbaseDt: ");
		sb.append(baseDt==null?"null":getBaseDt());
		sb.append("\n");
		sb.append("]\n");
	
		return sb.toString();
	}

	/**
	 * Only for Fixed-Length Data
	 */
	@Override
	public long predictMessageLength(){
		long messageLen= 0;
	
		messageLen+= 15; /* custId */
		messageLen+= 15; /* acctNbr */
		messageLen+= 20; /* pdCd */
		messageLen+= 20; /* arrSrvcTpCd */
		messageLen+= 17; /* txAmt */
		messageLen+= 8; /* baseDt */
	
		return messageLen;
	}
	

	@Override
	@JsonIgnore
	public java.util.List<String> getFieldNames(){
		java.util.List<String> fieldNames= new java.util.ArrayList<String>();
	
		fieldNames.add("custId");
	
		fieldNames.add("acctNbr");
	
		fieldNames.add("pdCd");
	
		fieldNames.add("arrSrvcTpCd");
	
		fieldNames.add("txAmt");
	
		fieldNames.add("baseDt");
	
	
		return fieldNames;
	}

	@Override
	@JsonIgnore
	public java.util.Map<String, Object> getFieldValues(){
		java.util.Map<String, Object> fieldValueMap= new java.util.HashMap<String, Object>();
	
		fieldValueMap.put("custId", get("custId"));
	
		fieldValueMap.put("acctNbr", get("acctNbr"));
	
		fieldValueMap.put("pdCd", get("pdCd"));
	
		fieldValueMap.put("arrSrvcTpCd", get("arrSrvcTpCd"));
	
		fieldValueMap.put("txAmt", get("txAmt"));
	
		fieldValueMap.put("baseDt", get("baseDt"));
	
	
		return fieldValueMap;
	}

	@XmlTransient
	@JsonIgnore
	private Hashtable<String, Object> htDynamicVariable = new Hashtable<String, Object>();
	
	public Object get(String key) throws IllegalArgumentException{
		switch( key.hashCode() ){
		case -1349089586 : /* custId */
			return getCustId();
		case -1177207765 : /* acctNbr */
			return getAcctNbr();
		case 3434869 : /* pdCd */
			return getPdCd();
		case 1163150570 : /* arrSrvcTpCd */
			return getArrSrvcTpCd();
		case 110769316 : /* txAmt */
			return getTxAmt();
		case -1396203711 : /* baseDt */
			return getBaseDt();
		default :
			if ( htDynamicVariable.containsKey(key) ) return htDynamicVariable.get(key);
			else throw new IllegalArgumentException("Not found element : " + key);
		}
	}
	
	@SuppressWarnings("unchecked")
	public void set(String key, Object value){
		switch( key.hashCode() ){
		case -1349089586 : /* custId */
			setCustId((java.lang.String) value);
			return;
		case -1177207765 : /* acctNbr */
			setAcctNbr((java.lang.String) value);
			return;
		case 3434869 : /* pdCd */
			setPdCd((java.lang.String) value);
			return;
		case 1163150570 : /* arrSrvcTpCd */
			setArrSrvcTpCd((java.lang.String) value);
			return;
		case 110769316 : /* txAmt */
			setTxAmt((java.math.BigDecimal) value);
			return;
		case -1396203711 : /* baseDt */
			setBaseDt((java.lang.String) value);
			return;
		default : htDynamicVariable.put(key, value);
		}
	}
}
