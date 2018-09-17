<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>

<%@page import="java.lang.*"%>
<%@page import="java.io.*"%>
<%@page import="java.util.*"%>
<%@page import="bxm.service.endpoint.http.HttpServiceEndpointContextListener"%>
<%@page import="bxm.container.ApplicationContainer"%>


<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>Framework Instance Application ClassLoader Status</title>

<%
	out.println(new Date(System.currentTimeMillis()));
	System.gc();
	ApplicationContainer container = (ApplicationContainer) application
			.getAttribute(HttpServiceEndpointContextListener.FRAMEWORK_INSTANCE);
	StringBuffer sb = container.dumpClassLoaderStatus();

	BufferedReader reader = new BufferedReader(new StringReader(
			sb.toString()));
	String line = null;
	boolean startFlag = false;
	Map<String, List<Map<String, String>>> appMap = new HashMap<String, List<Map<String, String>>>();
	Map<String, String> app = null;
	while ((line = reader.readLine()) != null) {
		if (!startFlag && line.startsWith("bxm")) {
			app = new HashMap<String, String>();
			app.put("loader", line);
			startFlag = true;
		} else if (startFlag) {
			if (line.startsWith("----")) {
				String appName = app.get("application");
				List<Map<String, String>> appList = appMap.get(appName);
				if (appList == null) {
					appList = new ArrayList<Map<String, String>>();
					appMap.put(appName, appList);
				}
				appList.add(app);
				startFlag = false;
			} else {
				String[] lineArr = line.split(":");
				String key = lineArr[0].trim();
				String value = lineArr[1].trim();
				app.put(key, value);
			}
		}
		out.println(line + "<BR>");
	}

	out.println("====================================================================<BR>");
	Set<String> keySet = appMap.keySet();
	for (String key : keySet) {
		out.println("<table border=1><tr><td>");
		List<Map<String,String>> appList = appMap.get(key);
		out.println(key+"</td><td>"+appList.size()+"</td></tr>");
		for(Map<String,String> entry : appList){
			out.println("<tr><td>Loader</td><td> "+entry.get("loader")+"</td></tr>");
			out.println("<tr><td>uuid</td><td> "+entry.get("uuid")+"</td></tr>");
			out.println("<tr><td>status</td><td> "+entry.get("status")+"</td></tr>");
			out.println("<tr><td>createdTime</td><td> "+entry.get("createdTime")+"</td></tr>");
		}
		out.println("</table><br>");
	}
%>

</html>

