<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>

<%@page import="java.lang.*"%>
<%@page import="java.io.*"%>
<%@page import="java.util.*"%>
<%@page import="bankware.corebanking.cache.*"%>
<%@page import="com.fasterxml.jackson.databind.*"%>
<%!public String getAllCacheNames(String strCacheName) {
		Set<String> unsortedCacheNames = DataCacheFactory.getAllCacheNames();
		if (unsortedCacheNames == null || unsortedCacheNames.isEmpty())
			return "";
		Set<String> sortedCacheNames = new TreeSet<String>(unsortedCacheNames);
		String result = "";

		Iterator<String> iterator = sortedCacheNames.iterator();
		while (iterator.hasNext()) {
			String key = (String) iterator.next();
			if (key.equals(strCacheName))
				result += "<option value=" + key + " selected>" + key + "</option> ";
			else
				result += "<option value=" + key + ">" + key + "</option> ";
		}
		return result;
	}

	public String getAllKeyAndValues(String strCacheName) throws IOException, Exception {
		if (strCacheName == null)
			return "";

		String result = "";
		Set<String> unsortedCacheNames = DataCacheFactory.getAllKeysOfCacheName(strCacheName);
		Set<String> sortedCacheNames = new TreeSet<String>(unsortedCacheNames);

		Iterator<String> iterator = sortedCacheNames.iterator();
		while (iterator.hasNext()) {
			String key = (String) iterator.next();
			result += "<tr><td> " + key + "</td>";
			Object objValue = DataCacheFactory.getCacheData(strCacheName, key);
			if (objValue != null)
				result += "<td> " + toStr(objValue) + "</td> </tr>";
			else
				result += "<td></td></tr>";
		}
		return result;
	}

	public String getAllKeys(String strCacheName) throws IOException, Exception {
		if (strCacheName == null)
			return "";

		String result = "";
		Set<String> unsortedCacheNames = DataCacheFactory.getAllKeysOfCacheName(strCacheName);
		Set<String> sortedCacheNames = new TreeSet<String>(unsortedCacheNames);

		Iterator<String> iterator = sortedCacheNames.iterator();
		while (iterator.hasNext()) {
			String key = (String) iterator.next();
			result += "<tr><td> " + key + "</td></tr>";
		}
		return result;
	}

	public String fromStr(Serializable o) throws IOException {
		ByteArrayOutputStream baos = new ByteArrayOutputStream();
		ObjectOutputStream oos = new ObjectOutputStream(baos);
		oos.writeObject(o);
		oos.close();
		return baos.toString();
	}

	public String toStr(Object o) throws IOException, Exception {
		if (o == null)
			return "";
		String result = new String((byte[]) o, "UTF8");
		return result;
	}%>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<script type="text/javascript">

	function submitAction(action) {
		//alert(selectCachenames.value);
		document.myform.action.value=action;
		document.myform.submit();
	}
</script>

<title>List Cache Information</title>
</head>
<body>
	<%
		out.println(new Date(System.currentTimeMillis()) + "<br>");
		String strCacheName = request.getParameter("cachenames");
		String action = request.getParameter("action");
		String msg = "";
		if ("clearAll".equals(action)) {
			DataCacheFactory.clearCacheAll();
			strCacheName = null;
			msg = "clear all Cache.";
		} else if (strCacheName != null && action != null) {
			msg = action +" "+ strCacheName;
		}
	%>
	<br>
	Cache Status <br>
	==========================================================<br>
	<%
		out.println("<pre>" + DataCacheFactory.getStatus() + "</pre>");
	%>
	==========================================================<br>
	<%
		out.println("msg : " + msg);
	%>
	<br><br>
	<button onclick="javascript:submitAction('clearAll')">ClearAllCache</button>

	<%
		if (strCacheName != null) {
			if ("query".equals(action)) {
	%>
	<button onclick="javascript:submitAction('clear')">
		Clear
		<%
		out.println(strCacheName);
	%>
	</button>
	<%
		} else if ("clear".equals(action)) {
				DataCacheFactory.clearCache(strCacheName);
				strCacheName = null;
			}
		}
	%>
	
	<hr>
	Biz Cache List
	<br>

	<form name="myform" action="CacheInfo.jsp" method="post">
		<input type="hidden" name="action" value="" /> 

		<select	name="cachenames" onChange="javascript:submitAction('query')">
			<%
				out.println(getAllCacheNames(strCacheName));
			%>
		</select>
	</form>
	<%
		if (strCacheName != null) {
	%>
	size :
	<%
		out.println(DataCacheFactory.getCacheSize(strCacheName));
	%>
	<br>
	
	<table border=1>
		<tr>
			<td align="center">key</td>
		</tr>
		<%
			out.println(getAllKeys(strCacheName));
		%>
	</table>
	<%
		}
	%>
</body>
</html>
