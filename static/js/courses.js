
//Fetch all data before creating the graphs
queue()
    .defer(d3.json, "/mydb/courses")
	.defer(d3.json, "/unique")
    //.defer(d3.json, "static/courses.json")
    .await(makeGraphs);
	
	//http://dc-js.github.io/dc.js/examples/ refered for over 30 samples
function makeGraphs(error, studentsJson, uniqueCoursesJson/*, coursesJson*/) {
	
	var studentsData = studentsJson;
	var uniqueData = uniqueCoursesJson;
	
	//Create an object of the crossfilter instance
	var cf = crossfilter(studentsData);
	
	//Define the dimensions for the data
	var genderDim = cf.dimension(function(data){
		return data["gender"];
	});
	var typeDim = cf.dimension(function(data){
		return data["type"];
	});
	var ageDim = cf.dimension(function(data){
		return data["age"];
	});
	var totalDim = cf.dimension(function(data){
		return data["student_id"];
	});
	
	var coursesDim = cf.dimension(function(data){
		return data["courses"];
	},true);

	
	//Define data groups
	var all = cf.groupAll();
	var coursesByGender = genderDim.group();
	var coursesByType = typeDim.group();
	var coursesByAge = ageDim.group();
	var coursesByTotal = totalDim.groupAll().reduceSum(function(data){
		return data["student_id"];
	});
	var coursesByCourses = coursesDim.group();
	
	
	//Define values
	//var frequentCourse = totalDim.top(1)[0].value;	
	
	// Define charts
	var genderChart = dc.rowChart("#gender-chart");
	var typeChart = dc.pieChart("#type-chart");
	var coursesChart = dc.pieChart("#courses-chart");
	var ageChart = dc.barChart("#age-chart");
	//var totalChart = dc.rowChart("#total-chart");
	
	var totalStudents = dc.numberDisplay("#all-students");
	
	/*
	barChart
	pieChart
	rowChart
	geoChoroplethChart
	numberDisplay
	*/
	
	coursesChart
		.width(600)
		.height(600)
		.slicesCap(15)
		.innerRadius(100)
		.dimension(coursesDim)
		.group(coursesByCourses)
		.legend(dc.legend());

	genderChart
	    .width(250)
		.height(250)
		.dimension(genderDim)
		.group(coursesByGender);

	typeChart
		.width(250)
		.height(250)
		.slicesCap(4)
		.innerRadius(50)
		.dimension(typeDim)
		.group(coursesByType)
		.legend(dc.legend());

	ageChart
	    .width(250)
		.height(250)
		.x(d3.scale.linear().domain([15,30]))
		.y(d3.scale.linear().domain([0,10]))
		.brushOn(false)
		.dimension(ageDim)
		.group(coursesByAge);

	totalStudents
		.formatNumber(d3.format("d"))
		.valueAccessor(function(d){return d; })
		.group(all);

	dc.renderAll();
};