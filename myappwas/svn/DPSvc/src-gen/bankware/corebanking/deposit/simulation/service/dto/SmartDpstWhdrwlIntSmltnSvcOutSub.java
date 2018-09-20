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
@XmlType(propOrder={"baseDt", "intAmt", "dfrncAmt", "intSmltnSubList"}, name="SmartDpstWhdrwlIntSmltnSvcOutSub")
@XmlRootElement(name="SmartDpstWhdrwlIntSmltnSvcOutSub")
@SuppressWarnings("all")
public class SmartDpstWhdrwlIntSmltnSvcOutSub  implements IOmmObject, Predictable, FieldInfo  {

	private static final long serialVersionUID = 1137591694L;

	@XmlTransient
	public static final String OMM_DESCRIPTION = "";

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
	* Property set << intAmt >> [[ */
	
	@XmlTransient
	private boolean isSet_intAmt = false;
	
	protected boolean isSet_intAmt()
	{
		return this.isSet_intAmt;
	}
	
	protected void setIsSet_intAmt(boolean value)
	{
		this.isSet_intAmt = value;
	}
	
	/**
	 * java.math.BigDecimal - String value setter
	 * @Description Interest Amount
	 */
	public void setIntAmt(java.lang.String value) {
		isSet_intAmt = true;
		this.intAmt = new java.math.BigDecimal(value);
	}
	/**
	 * java.math.BigDecimal - Double value setter
	 * @Description Interest Amount
	 */
	public void setIntAmt(double value) {
		isSet_intAmt = true;
		this.intAmt = java.math.BigDecimal.valueOf(value);
	}
	/**
	 * java.math.BigDecimal - Long value setter
	 * @Description Interest Amount
	 */
	public void setIntAmt(long value) {
		isSet_intAmt = true;
		this.intAmt = java.math.BigDecimal.valueOf(value);
	}
	
	@BxmOmm_Field(referenceType="reference", description="Interest Amount", formatType="", format="", align="right", length=17, decimal=2, arrayReference="", fill="", comment="", validationRule="")
	private java.math.BigDecimal intAmt  = new java.math.BigDecimal("0.0");
	
	/**
	 * @Description Interest Amount
	 */
	public java.math.BigDecimal getIntAmt(){
		return intAmt;
	}
	
	/**
	 * @Description Interest Amount
	 */
	@JsonProperty("intAmt")
	public void setIntAmt( java.math.BigDecimal intAmt ) {
		isSet_intAmt = true;
		this.intAmt = intAmt;
	}
	
	/** Property set << intAmt >> ]]
	*******************************************************************************************************************************/
	/*******************************************************************************************************************************
	* Property set << dfrncAmt >> [[ */
	
	@XmlTransient
	private boolean isSet_dfrncAmt = false;
	
	protected boolean isSet_dfrncAmt()
	{
		return this.isSet_dfrncAmt;
	}
	
	protected void setIsSet_dfrncAmt(boolean value)
	{
		this.isSet_dfrncAmt = value;
	}
	
	/**
	 * java.math.BigDecimal - String value setter
	 * @Description Difference In Interest Amount
	 */
	public void setDfrncAmt(java.lang.String value) {
		isSet_dfrncAmt = true;
		this.dfrncAmt = new java.math.BigDecimal(value);
	}
	/**
	 * java.math.BigDecimal - Double value setter
	 * @Description Difference In Interest Amount
	 */
	public void setDfrncAmt(double value) {
		isSet_dfrncAmt = true;
		this.dfrncAmt = java.math.BigDecimal.valueOf(value);
	}
	/**
	 * java.math.BigDecimal - Long value setter
	 * @Description Difference In Interest Amount
	 */
	public void setDfrncAmt(long value) {
		isSet_dfrncAmt = true;
		this.dfrncAmt = java.math.BigDecimal.valueOf(value);
	}
	
	@BxmOmm_Field(referenceType="reference", description="Difference In Interest Amount", formatType="", format="", align="right", length=17, decimal=2, arrayReference="", fill="", comment="", validationRule="")
	private java.math.BigDecimal dfrncAmt  = new java.math.BigDecimal("0.0");
	
	/**
	 * @Description Difference In Interest Amount
	 */
	public java.math.BigDecimal getDfrncAmt(){
		return dfrncAmt;
	}
	
	/**
	 * @Description Difference In Interest Amount
	 */
	@JsonProperty("dfrncAmt")
	public void setDfrncAmt( java.math.BigDecimal dfrncAmt ) {
		isSet_dfrncAmt = true;
		this.dfrncAmt = dfrncAmt;
	}
	
	/** Property set << dfrncAmt >> ]]
	*******************************************************************************************************************************/
	/*******************************************************************************************************************************
	* Property set << intSmltnSubList >> [[ */
	
	@XmlTransient
	private boolean isSet_intSmltnSubList = false;
	
	protected boolean isSet_intSmltnSubList()
	{
		return this.isSet_intSmltnSubList;
	}
	
	protected void setIsSet_intSmltnSubList(boolean value)
	{
		this.isSet_intSmltnSubList = value;
	}
	
	
	@BxmOmm_Field(referenceType="reference", description="Interest Simulation Sub List", formatType="", format="", align="left", length=0, decimal=0, arrayReference="20", fill="", comment="", validationRule="")
	private java.util.List<bankware.corebanking.deposit.simulation.service.dto.SmartDpstWhdrwlIntSvcList> intSmltnSubList  = new java.util.ArrayList<bankware.corebanking.deposit.simulation.service.dto.SmartDpstWhdrwlIntSvcList>();
	
	/**
	 * @Description Interest Simulation Sub List
	 */
	public java.util.List<bankware.corebanking.deposit.simulation.service.dto.SmartDpstWhdrwlIntSvcList>  getIntSmltnSubList(){
		return intSmltnSubList;
	}
	
	/**
	 * @Description Interest Simulation Sub List
	 */
	@JsonProperty("intSmltnSubList")
	public void setIntSmltnSubList( java.util.List<bankware.corebanking.deposit.simulation.service.dto.SmartDpstWhdrwlIntSvcList> intSmltnSubList ) {
		isSet_intSmltnSubList = true;
		this.intSmltnSubList = intSmltnSubList;
	}
	
	/** Property set << intSmltnSubList >> ]]
	*******************************************************************************************************************************/

	@Override
	public SmartDpstWhdrwlIntSmltnSvcOutSub clone(){
		try{
			SmartDpstWhdrwlIntSmltnSvcOutSub object= (SmartDpstWhdrwlIntSmltnSvcOutSub)super.clone();
			if ( this.baseDt== null ) object.baseDt = null;
			else{
				object.baseDt = this.baseDt;
			}
			if ( this.intAmt== null ) object.intAmt = null;
			else{
				object.intAmt = new java.math.BigDecimal(intAmt.toString());
			}
			if ( this.dfrncAmt== null ) object.dfrncAmt = null;
			else{
				object.dfrncAmt = new java.math.BigDecimal(dfrncAmt.toString());
			}
			if ( this.intSmltnSubList== null ) object.intSmltnSubList = null;
			else{
				java.util.List<bankware.corebanking.deposit.simulation.service.dto.SmartDpstWhdrwlIntSvcList> clonedList = new java.util.ArrayList<bankware.corebanking.deposit.simulation.service.dto.SmartDpstWhdrwlIntSvcList>(intSmltnSubList.size());
				for( bankware.corebanking.deposit.simulation.service.dto.SmartDpstWhdrwlIntSvcList item : intSmltnSubList ){
					clonedList.add( (bankware.corebanking.deposit.simulation.service.dto.SmartDpstWhdrwlIntSvcList)item.clone());
				}
				object.intSmltnSubList = clonedList;
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
		result = prime * result + ((baseDt==null)?0:baseDt.hashCode());
		result = prime * result + ((intAmt==null)?0:intAmt.hashCode());
		result = prime * result + ((dfrncAmt==null)?0:dfrncAmt.hashCode());
		result = prime * result + ((intSmltnSubList==null)?0:intSmltnSubList.hashCode());
		return result;
	}
	
	@Override
	public boolean equals(Object obj) {
		if ( this == obj ) return true;
		if ( obj == null ) return false;
		if ( getClass() != obj.getClass() ) return false;
		final bankware.corebanking.deposit.simulation.service.dto.SmartDpstWhdrwlIntSmltnSvcOutSub other = (bankware.corebanking.deposit.simulation.service.dto.SmartDpstWhdrwlIntSmltnSvcOutSub)obj;
		if ( baseDt == null ){
			if ( other.baseDt != null ) return false;
		}
		else if ( !baseDt.equals(other.baseDt) )
			return false;
		if ( intAmt == null ){
			if ( other.intAmt != null ) return false;
		}
		else if ( !intAmt.equals(other.intAmt) )
			return false;
		if ( dfrncAmt == null ){
			if ( other.dfrncAmt != null ) return false;
		}
		else if ( !dfrncAmt.equals(other.dfrncAmt) )
			return false;
		if ( intSmltnSubList == null ){
			if ( other.intSmltnSubList != null ) return false;
		}
		else if ( !intSmltnSubList.equals(other.intSmltnSubList) )
			return false;
		return true;
	}

	@Override
	public String toString() {
		StringBuilder sb = new StringBuilder();
	
		sb.append( "\n[bankware.corebanking.deposit.simulation.service.dto.SmartDpstWhdrwlIntSmltnSvcOutSub:\n");
		sb.append("\tbaseDt: ");
		sb.append(baseDt==null?"null":getBaseDt());
		sb.append("\n");
		sb.append("\tintAmt: ");
		sb.append(intAmt==null?"null":getIntAmt());
		sb.append("\n");
		sb.append("\tdfrncAmt: ");
		sb.append(dfrncAmt==null?"null":getDfrncAmt());
		sb.append("\n");
		sb.append("\tintSmltnSubList: ");
		if ( intSmltnSubList == null ) sb.append("null");
		else{
			sb.append("array count : ");
			sb.append(intSmltnSubList.size());
			sb.append("(items)\n");
	
			int max= (10<intSmltnSubList.size())?10:intSmltnSubList.size();
	
			for ( int i = 0; i < max; ++i ){
				sb.append("\tintSmltnSubList[");
				sb.append(i);
				sb.append("] : ");
				sb.append(intSmltnSubList.get(i));
				sb.append("\n");
			}
	
			if ( max < intSmltnSubList.size() ){
				sb.append("\tintSmltnSubList[.] : ").append("more ").append((intSmltnSubList.size()-max)).append(" items").append("\n");
			}
		}
		sb.append("]\n");
	
		return sb.toString();
	}

	/**
	 * Only for Fixed-Length Data
	 */
	@Override
	public long predictMessageLength(){
		long messageLen= 0;
	
		messageLen+= 8; /* baseDt */
		messageLen+= 17; /* intAmt */
		messageLen+= 17; /* dfrncAmt */
		{/*intSmltnSubList*/
			int size=20;
			int count= intSmltnSubList.size();
			int min= size > count?count:size;
			bankware.corebanking.deposit.simulation.service.dto.SmartDpstWhdrwlIntSvcList emptyElement= null;
			for ( int i = 0; i < size ; ++i ){
				if ( i < min ){
					bankware.corebanking.deposit.simulation.service.dto.SmartDpstWhdrwlIntSvcList element= intSmltnSubList.get(i);
					if ( element != null && !(element instanceof Predictable) )
						throw new IllegalStateException( "Can not predict message length.");
					messageLen+= element==null?0:( (Predictable)element).predictMessageLength();
				}else{
					if ( emptyElement== null ) emptyElement= new bankware.corebanking.deposit.simulation.service.dto.SmartDpstWhdrwlIntSvcList();
					if ( !(emptyElement instanceof Predictable) )
						throw new IllegalStateException( "Can not predict message length.");
					messageLen+= ( (Predictable)emptyElement).predictMessageLength();
				}
			}
		}
	
		return messageLen;
	}
	

	@Override
	@JsonIgnore
	public java.util.List<String> getFieldNames(){
		java.util.List<String> fieldNames= new java.util.ArrayList<String>();
	
		fieldNames.add("baseDt");
	
		fieldNames.add("intAmt");
	
		fieldNames.add("dfrncAmt");
	
		fieldNames.add("intSmltnSubList");
	
	
		return fieldNames;
	}

	@Override
	@JsonIgnore
	public java.util.Map<String, Object> getFieldValues(){
		java.util.Map<String, Object> fieldValueMap= new java.util.HashMap<String, Object>();
	
		fieldValueMap.put("baseDt", get("baseDt"));
	
		fieldValueMap.put("intAmt", get("intAmt"));
	
		fieldValueMap.put("dfrncAmt", get("dfrncAmt"));
	
		fieldValueMap.put("intSmltnSubList", get("intSmltnSubList"));
	
	
		return fieldValueMap;
	}

	@XmlTransient
	@JsonIgnore
	private Hashtable<String, Object> htDynamicVariable = new Hashtable<String, Object>();
	
	public Object get(String key) throws IllegalArgumentException{
		switch( key.hashCode() ){
		case -1396203711 : /* baseDt */
			return getBaseDt();
		case -1183797415 : /* intAmt */
			return getIntAmt();
		case 1886762403 : /* dfrncAmt */
			return getDfrncAmt();
		case -1271428191 : /* intSmltnSubList */
			return getIntSmltnSubList();
		default :
			if ( htDynamicVariable.containsKey(key) ) return htDynamicVariable.get(key);
			else throw new IllegalArgumentException("Not found element : " + key);
		}
	}
	
	@SuppressWarnings("unchecked")
	public void set(String key, Object value){
		switch( key.hashCode() ){
		case -1396203711 : /* baseDt */
			setBaseDt((java.lang.String) value);
			return;
		case -1183797415 : /* intAmt */
			setIntAmt((java.math.BigDecimal) value);
			return;
		case 1886762403 : /* dfrncAmt */
			setDfrncAmt((java.math.BigDecimal) value);
			return;
		case -1271428191 : /* intSmltnSubList */
			setIntSmltnSubList((java.util.List<bankware.corebanking.deposit.simulation.service.dto.SmartDpstWhdrwlIntSvcList>) value);
			return;
		default : htDynamicVariable.put(key, value);
		}
	}
}
