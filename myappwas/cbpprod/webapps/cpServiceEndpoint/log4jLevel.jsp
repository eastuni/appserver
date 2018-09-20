<%@ page contentType="text/html;charset=UTF-8"%>

<%@ page import="java.util.LinkedList"%>
<%@ page import="java.util.Collections"%>
<%@ page import="java.util.Comparator"%>
<%@ page import="java.util.Enumeration"%>
<%@ page import="java.util.List"%>
<%@ page import="org.apache.log4j.Category"%>
<%@ page import="org.apache.log4j.Level"%>
<%@ page import="org.apache.log4j.Logger"%>

<%!
	public static List<Category> getAllCategories() {
		Logger root = Logger.getRootLogger();
		
		List<Category> results = new LinkedList<Category>();
/*	Enumeration currentCategories = root.getLoggerRepository().getCurrentCategories();
		while(currentCategories.hasMoreElements()) {
			Category category = (Category) currentCategories.nextElement();
			results.add(category);
		}
		
		Collections.sort(results, new Comparator<Category>(){
			public int compare(Category o1, Category o2) {
				if (o1 == null || o2 == null) return 0;
				if (o1.getName() == null || o2.getName() == null) return 0;
				return o1.getName().compareTo(o2.getName());
			}});
*/		
		results.add(0, root);
		
		return results;
	}
	
	public static void setLogLeve(String categoryName, Level level) {
		Category category = findCategory(categoryName);
		if (category == null) {
			System.out.println("[Log4JUtil] Can not find category: " + categoryName);
			return;
		}
		
		category.setLevel(level);
	}
	
	private static Category findCategory(String categoryName) {
		if (categoryName == null) return null;
		Logger root = Logger.getRootLogger();
		if ("root".equals(categoryName)) return root;
		Enumeration categories = root.getLoggerRepository().getCurrentCategories();
		while(categories.hasMoreElements()) {
			Category category = (Category) categories.nextElement();
			if (categoryName.equals(category.getName())) return category;
		}
		return null;
	}
%>
<%
	String level = request.getParameter("level");
	String[] categoryNames = request.getParameterValues("categoryNames");
	if (level != null && level.trim().length() > 0) {
		if (categoryNames == null) categoryNames = new String[0];
		for(String categoryName : categoryNames) {
			setLogLeve(categoryName, Level.toLevel(level, null));
		}
		response.sendRedirect("log4jLevel.jsp");
		return;
	}
%>

<html>
<head>
<title>Log4J levels</title>
<style type="text/css">
h1 { font-size:20px; }
th {
    text-align:left;
    color:#fff;
    background-color:#000;
}
td {
    text-align:left;
    background-color:#eee;
}
.l {text-align:left}
.c {text-align:center}
</style>

<script>
function toggleCheckBox(checked) {
	var inputs = document.getElementsByTagName('input');
	for(var i = 0; i < inputs.length; i++) {
		if (inputs[i].type != 'checkbox') continue;
		if (inputs[i].name != 'categoryNames') continue;
		inputs[i].checked = checked;
	}
}
function iBatisSqlLog(isOn) {
	var iBatisSqlLogLevel = document.getElementById('iBatisSqlLogLevel');
	if (isOn) {
		iBatisSqlLogLevel.value = 'DEBUG';
	} else {
		iBatisSqlLogLevel.value = 'OFF';
	}
	document.getElementById('iBatisSqlLogForm').submit();
}
</script>

</head>

<body>
<h1>Log4J levels</h1>

<form method="post">
	<select name="level">
		<option>DEBUG</option>
		<option>INFO</option>
		<option>WARN</option>
		<option>ERROR</option>
		<option>FATAL</option>
		<option>OFF</option>
		<option>TRACE</option>
		<option>NULL</option>
	</select>
	<input type="submit" value="Change all selected logger levels!"/>
<!--	<a href="javascript:iBatisSqlLog(true);">[iBatis SQL log ON!]</a>
	<a href="javascript:iBatisSqlLog(false);">[iBatis SQL log OFF!]</a> -->
	<table>
		<col width="50" />
		<col width="*" />
		<col width="100" />
		<tr>
			<th class="c"><input name="selectAll" type="checkbox" onclick="toggleCheckBox(this.checked)" checked /></th>
			<th>Category</th>
			<th>Level</th>
		</tr>
		<%
			List<Category> categories = getAllCategories();
			for(Category category : categories) {
		%>
		<tr>
			<td class="c"><input name="categoryNames" type="checkbox" value="<%=category.getName()%>" checked /></td>
			<td><%=category.getName()%></td>
			<td><%=category.getLevel() != null ? category.getLevel() : ""%></td>
		</tr>
		<%	}	%>
		
	</table>
</form>
<form id="iBatisSqlLogForm" name="iBatisSqlLogForm" method="post">
	<input id="iBatisSqlLogLevel" type="hidden" name="level" value="OFF">
	<input type="hidden" name="categoryNames" value="java.sql.Connection">
	<input type="hidden" name="categoryNames" value="java.sql.Statement">
	<input type="hidden" name="categoryNames" value="java.sql.PreparedStatement">
	<input type="hidden" name="categoryNames" value="java.sql.ResultSet">
</form>
</body>
</html>

