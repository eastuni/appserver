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
@XmlType(propOrder={"arrId", "baseDt", "oprtnTrmCnt", "txAmt"}, name="SmartDpstWhdrwlIntSmltnSvcIn")
@XmlRootElement(name="SmartDpstWhdrwlIntSmltnSvcIn")
@SuppressWarnings("all")
public class SmartDpstWhdrwlIntSmltnSvcIn  implements IOmmObject, Predictable, FieldInfo  {

	private static final long serialVersionUID = -56769375L;

	@XmlTransient
	public static final String OMM_DESCRIPTION = "";

	/*******************************************************************************************************************************
	* Property set << arrId >> [[ */
	
	@XmlTransient
	private boolean isSet_arrId = false;
	
	protected boolean isSet_arrId()
	{
		return this.isSet_arrId;
	}
	
	protected void setIsSet_arrId(boolean value)
	{
		this.isSet_arrId = value;
	}
	
	
	@BxmOmm_Field(referenceType="reference", description="Smart Deposit Arrangement Identification", formatType="", format="", align="left", length=40, decimal=0, arrayReference="", fill="", comment="", validationRule="")
	private java.lang.String arrId  = null;
	
	/**
	 * @Description Smart Deposit Arrangement Identification
	 */
	public java.lang.String getArrId(){
		return arrId;
	}
	
	/**
	 * @Description Smart Deposit Arrangement Identification
	 */
	@JsonProperty("arrId")
	public void setArrId( java.lang.String arrId ) {
		isSet_arrId = true;
		this.arrId = arrId;
	}
	
	/** Property set << arrId >> ]]
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
	
	
	@BxmOmm_Field(referenceType="reference", description="Base Date", formatType="", format="", align="left", length=8, decimal=0, arrayReference="", fill="", comment="", validationRule="")
	private java.lang.String baseDt  = null;
	
	/**
	 * @Description Base Date
	 */
	public java.lang.String getBaseDt(){
		return baseDt;
	}
	
	/**
	 * @Description Base Date
	 */
	@JsonProperty("baseDt")
	public void setBaseDt( java.lang.String baseDt ) {
		isSet_baseDt = true;
		this.baseDt = baseDt;
	}
	
	/** Property set << baseDt >> ]]
	*******************************************************************************************************************************/
	/*******************************************************************************************************************************
	* Property set << oprtnTrmCnt >> [[ */
	
	@XmlTransient
	private boolean isSet_oprtnTrmCnt = false;
	
	protected boolean isSet_oprtnTrmCnt()
	{
		return this.isSet_oprtnTrmCnt;
	}
	
	protected void setIsSet_oprtnTrmCnt(boolean value)
	{
		this.isSet_oprtnTrmCnt = value;
	}
	
	
	@BxmOmm_Field(referenceType="reference", description="Operation Term", formatType="", format="", align="right", length=2, decimal=0, arrayReference="", fill="", comment="", validationRule="")
	private java.lang.Integer oprtnTrmCnt  = 0;
	
	/**
	 * @Description Operation Term
	 */
	public java.lang.Integer getOprtnTrmCnt(){
		return oprtnTrmCnt;
	}
	
	/**
	 * @Description Operation Term
	 */
	@JsonProperty("oprtnTrmCnt")
	public void setOprtnTrmCnt( java.lang.Integer oprtnTrmCnt ) {
		isSet_oprtnTrmCnt = true;
		this.oprtnTrmCnt = oprtnTrmCnt;
	}
	
	/** Property set << oprtnTrmCnt >> ]]
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
	 * @Description Transaction Amount
	 */
	public void setTxAmt(java.lang.String value) {
		isSet_txAmt = true;
		this.txAmt = new java.math.BigDecimal(value);
	}
	/**
	 * java.math.BigDecimal - Double value setter
	 * @Description Transaction Amount
	 */
	public void setTxAmt(double value) {
		isSet_txAmt = true;
		this.txAmt = java.math.BigDecimal.valueOf(value);
	}
	/**
	 * java.math.BigDecimal - Long value setter
	 * @Description Transaction Amount
	 */
	public void setTxAmt(long value) {
		isSet_txAmt = true;
		this.txAmt = java.math.BigDecimal.valueOf(value);
	}
	
	@BxmOmm_Field(referenceType="reference", description="Transaction Amount", formatType="", format="", align="right", length=18, decimal=2, arrayReference="", fill="", comment="", validationRule="")
	private java.math.BigDecimal txAmt  = new java.math.BigDecimal("0.0");
	
	/**
	 * @Description Transaction Amount
	 */
	public java.math.BigDecimal getTxAmt(){
		return txAmt;
	}
	
	/**
	 * @Description Transaction Amount
	 */
	@JsonProperty("txAmt")
	public void setTxAmt( java.math.BigDecimal txAmt ) {
		isSet_txAmt = true;
		this.txAmt = txAmt;
	}
	
	/** Property set << txAmt >> ]]
	*******************************************************************************************************************************/

	@Override
	public SmartDpstWhdrwlIntSmltnSvcIn clone(){
		try{
			SmartDpstWhdrwlIntSmltnSvcIn object= (SmartDpstWhdrwlIntSmltnSvcIn)super.clone();
			if ( this.arrId== null ) object.arrId = null;
			else{
				object.arrId = this.arrId;
			}
			if ( this.baseDt== null ) object.baseDt = null;
			else{
				object.baseDt = this.baseDt;
			}
			if ( this.oprtnTrmCnt== null ) object.oprtnTrmCnt = null;
			else{
				object.oprtnTrmCnt = this.oprtnTrmCnt;
			}
			if ( this.txAmt== null ) object.txAmt = null;
			else{
				object.txAmt = new java.math.BigDecimal(txAmt.toString());
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
		result = prime * result + ((arrId==null)?0:arrId.hashCode());
		result = prime * result + ((baseDt==null)?0:baseDt.hashCode());
		result = prime * result + ((oprtnTrmCnt==null)?0:oprtnTrmCnt.hashCode());
		result = prime * result + ((txAmt==null)?0:txAmt.hashCode());
		return result;
	}
	
	@Override
	public boolean equals(Object obj) {
		if ( this == obj ) return true;
		if ( obj == null ) return false;
		if ( getClass() != obj.getClass() ) return false;
		final bankware.corebanking.deposit.simulation.service.dto.SmartDpstWhdrwlIntSmltnSvcIn other = (bankware.corebanking.deposit.simulation.service.dto.SmartDpstWhdrwlIntSmltnSvcIn)obj;
		if ( arrId == null ){
			if ( other.arrId != null ) return false;
		}
		else if ( !arrId.equals(other.arrId) )
			return false;
		if ( baseDt == null ){
			if ( other.baseDt != null ) return false;
		}
		else if ( !baseDt.equals(other.baseDt) )
			return false;
		if ( oprtnTrmCnt == null ){
			if ( other.oprtnTrmCnt != null ) return false;
		}
		else if ( !oprtnTrmCnt.equals(other.oprtnTrmCnt) )
			return false;
		if ( txAmt == null ){
			if ( other.txAmt != null ) return false;
		}
		else if ( !txAmt.equals(other.txAmt) )
			return false;
		return true;
	}

	@Override
	public String toString() {
		StringBuilder sb = new StringBuilder();
	
		sb.append( "\n[bankware.corebanking.deposit.simulation.service.dto.SmartDpstWhdrwlIntSmltnSvcIn:\n");
		sb.append("\tarrId: ");
		sb.append(arrId==null?"null":getArrId());
		sb.append("\n");
		sb.append("\tbaseDt: ");
		sb.append(baseDt==null?"null":getBaseDt());
		sb.append("\n");
		sb.append("\toprtnTrmCnt: ");
		sb.append(oprtnTrmCnt==null?"null":getOprtnTrmCnt());
		sb.append("\n");
		sb.append("\ttxAmt: ");
		sb.append(txAmt==null?"null":getTxAmt());
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
	
		messageLen+= 40; /* arrId */
		messageLen+= 8; /* baseDt */
		messageLen+= 2; /* oprtnTrmCnt */
		messageLen+= 18; /* txAmt */
	
		return messageLen;
	}
	

	@Override
	@JsonIgnore
	public java.util.List<String> getFieldNames(){
		java.util.List<String> fieldNames= new java.util.ArrayList<String>();
	
		fieldNames.add("arrId");
	
		fieldNames.add("baseDt");
	
		fieldNames.add("oprtnTrmCnt");
	
		fieldNames.add("txAmt");
	
	
		return fieldNames;
	}

	@Override
	@JsonIgnore
	public java.util.Map<String, Object> getFieldValues(){
		java.util.Map<String, Object> fieldValueMap= new java.util.HashMap<String, Object>();
	
		fieldValueMap.put("arrId", get("arrId"));
	
		fieldValueMap.put("baseDt", get("baseDt"));
	
		fieldValueMap.put("oprtnTrmCnt", get("oprtnTrmCnt"));
	
		fieldValueMap.put("txAmt", get("txAmt"));
	
	
		return fieldValueMap;
	}

	@XmlTransient
	@JsonIgnore
	private Hashtable<String, Object> htDynamicVariable = new Hashtable<String, Object>();
	
	public Object get(String key) throws IllegalArgumentException{
		switch( key.hashCode() ){
		case 93089628 : /* arrId */
			return getArrId();
		case -1396203711 : /* baseDt */
			return getBaseDt();
		case -662021627 : /* oprtnTrmCnt */
			return getOprtnTrmCnt();
		case 110769316 : /* txAmt */
			return getTxAmt();
		default :
			if ( htDynamicVariable.containsKey(key) ) return htDynamicVariable.get(key);
			else throw new IllegalArgumentException("Not found element : " + key);
		}
	}
	
	@SuppressWarnings("unchecked")
	public void set(String key, Object value){
		switch( key.hashCode() ){
		case 93089628 : /* arrId */
			setArrId((java.lang.String) value);
			return;
		case -1396203711 : /* baseDt */
			setBaseDt((java.lang.String) value);
			return;
		case -662021627 : /* oprtnTrmCnt */
			setOprtnTrmCnt((java.lang.Integer) value);
			return;
		case 110769316 : /* txAmt */
			setTxAmt((java.math.BigDecimal) value);
			return;
		default : htDynamicVariable.put(key, value);
		}
	}
}
