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
 * @Description SmartDpstWhdrwlIntSmltnSvcOut
 */
@XmlType(propOrder={"intSmltnList"}, name="SmartDpstWhdrwlIntSmltnSvcOut")
@XmlRootElement(name="SmartDpstWhdrwlIntSmltnSvcOut")
@SuppressWarnings("all")
public class SmartDpstWhdrwlIntSmltnSvcOut  implements IOmmObject, Predictable, FieldInfo  {

	private static final long serialVersionUID = -1759844526L;

	@XmlTransient
	public static final String OMM_DESCRIPTION = "SmartDpstWhdrwlIntSmltnSvcOut";

	/*******************************************************************************************************************************
	* Property set << intSmltnList >> [[ */
	
	@XmlTransient
	private boolean isSet_intSmltnList = false;
	
	protected boolean isSet_intSmltnList()
	{
		return this.isSet_intSmltnList;
	}
	
	protected void setIsSet_intSmltnList(boolean value)
	{
		this.isSet_intSmltnList = value;
	}
	
	
	@BxmOmm_Field(referenceType="reference", description="Interest Simulation List", formatType="", format="", align="left", length=0, decimal=0, arrayReference="100", fill="", comment="", validationRule="")
	private java.util.List<bankware.corebanking.deposit.simulation.service.dto.SmartDpstWhdrwlIntSmltnSvcOutSub> intSmltnList  = new java.util.ArrayList<bankware.corebanking.deposit.simulation.service.dto.SmartDpstWhdrwlIntSmltnSvcOutSub>();
	
	/**
	 * @Description Interest Simulation List
	 */
	public java.util.List<bankware.corebanking.deposit.simulation.service.dto.SmartDpstWhdrwlIntSmltnSvcOutSub>  getIntSmltnList(){
		return intSmltnList;
	}
	
	/**
	 * @Description Interest Simulation List
	 */
	@JsonProperty("intSmltnList")
	public void setIntSmltnList( java.util.List<bankware.corebanking.deposit.simulation.service.dto.SmartDpstWhdrwlIntSmltnSvcOutSub> intSmltnList ) {
		isSet_intSmltnList = true;
		this.intSmltnList = intSmltnList;
	}
	
	/** Property set << intSmltnList >> ]]
	*******************************************************************************************************************************/

	@Override
	public SmartDpstWhdrwlIntSmltnSvcOut clone(){
		try{
			SmartDpstWhdrwlIntSmltnSvcOut object= (SmartDpstWhdrwlIntSmltnSvcOut)super.clone();
			if ( this.intSmltnList== null ) object.intSmltnList = null;
			else{
				java.util.List<bankware.corebanking.deposit.simulation.service.dto.SmartDpstWhdrwlIntSmltnSvcOutSub> clonedList = new java.util.ArrayList<bankware.corebanking.deposit.simulation.service.dto.SmartDpstWhdrwlIntSmltnSvcOutSub>(intSmltnList.size());
				for( bankware.corebanking.deposit.simulation.service.dto.SmartDpstWhdrwlIntSmltnSvcOutSub item : intSmltnList ){
					clonedList.add( (bankware.corebanking.deposit.simulation.service.dto.SmartDpstWhdrwlIntSmltnSvcOutSub)item.clone());
				}
				object.intSmltnList = clonedList;
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
		result = prime * result + ((intSmltnList==null)?0:intSmltnList.hashCode());
		return result;
	}
	
	@Override
	public boolean equals(Object obj) {
		if ( this == obj ) return true;
		if ( obj == null ) return false;
		if ( getClass() != obj.getClass() ) return false;
		final bankware.corebanking.deposit.simulation.service.dto.SmartDpstWhdrwlIntSmltnSvcOut other = (bankware.corebanking.deposit.simulation.service.dto.SmartDpstWhdrwlIntSmltnSvcOut)obj;
		if ( intSmltnList == null ){
			if ( other.intSmltnList != null ) return false;
		}
		else if ( !intSmltnList.equals(other.intSmltnList) )
			return false;
		return true;
	}

	@Override
	public String toString() {
		StringBuilder sb = new StringBuilder();
	
		sb.append( "\n[bankware.corebanking.deposit.simulation.service.dto.SmartDpstWhdrwlIntSmltnSvcOut:\n");
		sb.append("\tintSmltnList: ");
		if ( intSmltnList == null ) sb.append("null");
		else{
			sb.append("array count : ");
			sb.append(intSmltnList.size());
			sb.append("(items)\n");
	
			int max= (10<intSmltnList.size())?10:intSmltnList.size();
	
			for ( int i = 0; i < max; ++i ){
				sb.append("\tintSmltnList[");
				sb.append(i);
				sb.append("] : ");
				sb.append(intSmltnList.get(i));
				sb.append("\n");
			}
	
			if ( max < intSmltnList.size() ){
				sb.append("\tintSmltnList[.] : ").append("more ").append((intSmltnList.size()-max)).append(" items").append("\n");
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
	
		{/*intSmltnList*/
			int size=100;
			int count= intSmltnList.size();
			int min= size > count?count:size;
			bankware.corebanking.deposit.simulation.service.dto.SmartDpstWhdrwlIntSmltnSvcOutSub emptyElement= null;
			for ( int i = 0; i < size ; ++i ){
				if ( i < min ){
					bankware.corebanking.deposit.simulation.service.dto.SmartDpstWhdrwlIntSmltnSvcOutSub element= intSmltnList.get(i);
					if ( element != null && !(element instanceof Predictable) )
						throw new IllegalStateException( "Can not predict message length.");
					messageLen+= element==null?0:( (Predictable)element).predictMessageLength();
				}else{
					if ( emptyElement== null ) emptyElement= new bankware.corebanking.deposit.simulation.service.dto.SmartDpstWhdrwlIntSmltnSvcOutSub();
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
	
		fieldNames.add("intSmltnList");
	
	
		return fieldNames;
	}

	@Override
	@JsonIgnore
	public java.util.Map<String, Object> getFieldValues(){
		java.util.Map<String, Object> fieldValueMap= new java.util.HashMap<String, Object>();
	
		fieldValueMap.put("intSmltnList", get("intSmltnList"));
	
	
		return fieldValueMap;
	}

	@XmlTransient
	@JsonIgnore
	private Hashtable<String, Object> htDynamicVariable = new Hashtable<String, Object>();
	
	public Object get(String key) throws IllegalArgumentException{
		switch( key.hashCode() ){
		case 1035887323 : /* intSmltnList */
			return getIntSmltnList();
		default :
			if ( htDynamicVariable.containsKey(key) ) return htDynamicVariable.get(key);
			else throw new IllegalArgumentException("Not found element : " + key);
		}
	}
	
	@SuppressWarnings("unchecked")
	public void set(String key, Object value){
		switch( key.hashCode() ){
		case 1035887323 : /* intSmltnList */
			setIntSmltnList((java.util.List<bankware.corebanking.deposit.simulation.service.dto.SmartDpstWhdrwlIntSmltnSvcOutSub>) value);
			return;
		default : htDynamicVariable.put(key, value);
		}
	}
}
