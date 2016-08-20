/**
 *newSchedule.html
 */

window["newtime"];
window["iden"] = false;
window["releaseIden"] = false;

//定义变量为获取到的班次数组
var banciArr = [];

var re = /[#@#]/g;
//定义排班项集合
var dom = {
	"items": []
};
var domm;
//定义排班原始集合
//定义排班周转集合变更之后的数据使用
var schduleTurnArray = [];
var schduleTurnJson = {};
//保存排班时jSON
var nursop = [];
var nu = {};
//定义weektime 本周工时
var weektime = 0;
var pwWorktime = 0;
//给复制上周排班使用
var copyTime = 0;

//定义分页变量
var perPage = 30; //每页显示的行数
var totalPage = 0; //总页数
var currentPage = 1; //当前页
var $onclick;

var globalDepartId = window["departId"];

//定义变量为成员列表的所有护士数组
var nurseArr = [];
var nurseArrAll = [];
//定义变量为删除了所剩下的所有护士数组
var nurseArrDel = [];

//排班新增的序号
var newIndex = 1;


var schNum = 7;////排班前面的序号ar
var nameNO = 2;//表格中名字的序号
var weekTimeNO = 17;//本周工时的序号
var thisWeekNO = 14;//表格中本周工时的序号
var historyTime = 15;//历史差时的序号
var overTimeNO = 16;//加班
var diffTime = 17;//累计差时


//**********************************
// 设置班次所需要设置的变量
//**********************************
var gschduleTime = '';
var $praftOe = '';
var schOption;
var popoverLable = true;
//用来存lable框中倒数第二次输入的数据
var lableZh = '';
//定义变量为item数组
var paraAll = {
	'items': []
};
//**********************************

$(function(){
	
	//沿用上周排班按钮
	$('#copyLastWeek').on('click', lastWeekCopy); //复制上周数据绑定事件
	//添加编外护士弹出层的加号
	$('#addPWmember').on('click', pwmemberAdd);
	//添加编外护士弹出层的姓名输入框
	$('input[name="name"]').on('change', inputName);
	//添加编外护士按钮
	$("#addPaiwai").on("click", paiwaiAdd);
	//删除编外护士按钮
	$('#deletePBrenyuan').on('click', paiwaiDelete);
	//删除编外护士的确定按钮
	//$('#deletePwai').on('click', pwaiDelete);
	//返回按钮
	$('#returnNrusing').on('click', newpbReturn);
	$('#yesPB').on('click', pbYes);
	$('#noPB').on('click', pbNo);
	//添加编外人员的确定按钮
	$("#addPwai").on("click", addPwaiClick);
	//对标准周工时绑定事件并计算累计差时
	$("#biaoZhgs").children().on("change", biaoZhgsChange);
	//取消保存
	$("#nosavePB").on("click", nosavePBclick);
	//保存排班表
	$("#savePB").on("click", savePBclick);
	//发布
	$("#release").on("click", releaseClick);
	//每一行的垃圾桶
	$('.lajitongPng').unbind('click').on('click', lajitongPngClick);
	//新增人员按钮
	$('#add_renyuans').unbind('click').on('click', add_renyuansClick);
	
	
	//获取班次数据
	getPlanItems();
	//增设班次弹出层按钮
	$('#setBanciBtn').on('click', getPlanItems);
	
	//***********************************************
	// 设置班次所有运行的
	//***********************************************
	//设置班次弹出层的保存按钮
	$('#BanciSave').on("click", saveScheduleOption);
	//设置班次弹出层的增加班次按钮
	$('.BanciAdd').on("click", addScheduleOption);
	//***********************************************
	
});

//获取班次数据
function getPlanItems(){
	$.ajax({
		type: 'GET',
		cache: false,
		url: wlanip + "/rest/workplan/planitems/v1/" + departId,
		beforeSend: function(xhr) {
			xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
		},
		success: function(data) {
			if (data.responseMsg == '1') {
				//================删除返回数据中重复的数据===========开始==========
				var n = {}, len = data.items.length, val, type;
				for (var i = 0; i < data.items.length; i++) {
					val = data.items[i].name;
					type = typeof val;
					if (!n[val]) {
						n[val] = [type];
						banciArr.push(data.items[i]);
					} else if (n[val].indexOf(type) < 0) {
						n[val].push(type);
						banciArr.push(data.items[i]);
					}
				}
				//banciArr就是删除重复数据后的data.items
				//现在的data.items为删除重复数据后的data.items
				data.items = banciArr;
				//================删除返回数据中重复的数据===========结束==========
				
				
				
				//全局变量为data 获取到的是设置的班次
				domm = data;
				for (i=0; i<data.items.length; i++) {
					//如果data里的第i个items的used为true的时候
					//将data里的items推到全局变量json数组dom里的items数组里
					if (data.items[i].used) {dom.items.push(data.items[i])}
				}
				//全局变量dom的items数组为data.items
				
				//获取排班数据
				getWorkPlan();
				
				
				
				//全局变量schOption为banciArr数组
				schOption = banciArr;
				//定义变量为这个数组的个数 查询有没有排班项
				var paisch = schOption.length;
				//如果有排班项
				if (paisch > 0) {
					//就执行这个函数
					renderTable();
				//否则没有
				} else {
					//就执行这个函数
					initScheduleOption();
				}
				
			}
		},
		error: function(textStatus, errorThrown) {
			alert(textStatus.responseJSON.error + "，请检查网络或服务器");
		}
	});
}

//显示周次
function showWeeks(){
	
	var oDate = $('#weeks').html();
	var oYear = oDate.substring(0, 4);
	var oMonth = oDate.substring(5, 7);
	var oDay = oDate.substring(8, 10);
	var oNewDate = oYear+oMonth+oDay;
	
	//定义变量currentWeek为getWeek()函数 得到当天在当年所在的周
	var currentWeek = getWeek((oYear - 0), (oMonth - 0), (oDay - 0));
	//定义变量lastDay为getLastDay()函数
	var lastDay = getLastDay(oYear, oMonth);
	//定义变量sunday为thrq()函数
	var sunday = thrq(oMonth, oDay, lastDay); //th追加日期并返回sunday
	//调用pwaithrq()函数
	pwaithrq(oMonth, oDay, lastDay);
	var showdate = oYear + ' 年第' + currentWeek + '周 ( ' + oMonth + '.' + oDay + ' - ' + sunday + ' )';
	
	
	var year = $dp.cal.getP('y'); //得到从日历中选择的年份
	var month = $dp.cal.getP('M'); //得到从日历中选择的月份
	var monday = $dp.cal.getP('d'); //得到从日历中选择的周一那一天
	var gschduleTime = year + month + monday;
	
	
	$.ajax({
		type: 'GET',
		cache: false,
		url: wlanip + '/rest/workplan/planitems/v1/' + departId,
		beforeSend: function(xhr) {
			xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
		},
		success: function(data) {
			//获取最新排班的数据
			if (data.responseMsg == '1') {
				dom = data;
				if (dom.items.length > 0) {
					$.ajax({
						type: 'GET',
						cache: false,
						url: wlanip + '/rest/workplan/weekplan/v1/' + departId + '/' + gschduleTime,
						beforeSend: function(xhr) {
							xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
						},
						success: function(data) {
							//获取最新排班的数据
							if (data.responseMsg == '1') {
								weekPb = data;
								if (weekPb.id != undefined) {
									if (weekPb.status == 1) {
										$('.tops.links').children('label').hide();
										$('#weekpaiban').hide();
										$('.tab_infos').html(showdate+' 该周排班已经发布');
										$('.tab_infos').show();
									} else {
										$('.tops.links').children('label').not('label:eq(0)').hide();
										$('#weekpaiban').remove();
										$('.tab_infos').html(showdate+' 该周排班在草稿箱中');
										$('.tab_infos').show();
									}
								} else {
									$('.tops.links').children('label').show();
									$('#weekpaiban').show();
									$('.tab_infos').hide();
									$('.tab_infos').html('');
									$('#week13').html(showdate);
								}

							}

						},
						error: function(textStatus, errorThrown) {
							//spinner.spin();
							alert('服务异常');
						}
					})

				} else {
					alert('对不起，本周没有发布排班');
				}

			}
		},
		error: function(textStatus, errorThrown) {
			//spinner.spin();
		}
	});
}


//获取排班数据
function getWorkPlan(){
	$.ajax({
		type: "GET",
		cache: false,
		url: wlanip + "/rest/workplan/new/v1/" + departId,
		beforeSend: function(xhr) {
			xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
		},
		success: function(data) {
			console.log(data);
			if (data.responseMsg == '1') {
				
				//全局变量pwWorktime为data数据里的worktime
				pwWorktime = data.worktime; //周标准工时
				//标准工时的子元素的值为data数据里的worktime
				$("#biaoZhgs").children().val(data.worktime);
				//全局变量newtime为data数据里的time 已注释掉这个全局变量newtime，点击保存或发布按钮的时候重新获取
				//newtime = data.time;
				//全局变量copyTime为data数据里的time
				copyTime = data.time;
				//定义变量weekTime为data数据里的time
				var weekTime = data.time;
				//定义变量year为weekTime的前4位，例如1984
				var year = weekTime.substring(0, 4);
				//定义变量month为weekTime的4~6位，例如07
				var month = weekTime.substring(4, 6);
				//定义变量monday为weekTime的6~8位，例如12
				var monday = weekTime.substring(6, 8);
				
				//定义变量currentWeek为getWeek()函数 得到当天在当年所在的周
				var currentWeek = getWeek((year - 0), (month - 0), (monday - 0));
				//return Math.ceil();
				
				//定义变量lastDay为getLastDay()函数
				var lastDay = getLastDay(year, month);
				//定义变量sunday为thrq()函数
				var sunday = thrq(month, monday, lastDay); //th追加日期并返回sunday
				//调用pwaithrq()函数
				pwaithrq(month, monday, lastDay);
				
				//定义变量showdate为，例如2016年第15周(08.01 -08.07)
				var showdate = year + " 年第" + currentWeek + "周 ( " + month + "." + monday + " - " + sunday + " )";
				//周次的内容为变量showdate
				$("#week13").text(showdate);

				//备注框信息
				$('.tab_bz table tbody tr').find("textarea").text(data.note);
				
				$("#weekpaiban").children().children("tr:gt(0)").remove();
				
				if (data.nurses.length > 0) {
					//data.nurses多的 原始的
					//nurseArr少的 科室成员的所有护士
					//对比两数组 如果nurseArr中没有含有data.nurses的数据 则data.nurs删除没有含有的数据
					for(var i=0; i<data.nurses.length; i++){
						//不含有则为-1
						if(nurseArr.indexOf(data.nurses[i])== -1){
							//data.nurses删除掉不存在的数据
							data.nurses.pop();
						}
					}
					//此时的data.nurses为剔除掉已删除的成员的数组
					
					//循环data.nurses
					for(var i=0; i<data.nurses.length; i++){
						//如果数组的id等于null
						if(data.nurses[i].id == null){
							//data.nurses删除掉不存在的数据
							data.nurses.splice([i],1);
						}
					}
					//此时的data.nurses为剔除掉id为null的成员的数组
					
					
					for (i = 0; i < data.nurses.length; i++) {
						schduleTurnJson = {
							"departId": data.departId,
							"worktime": data.worktime,
							"group": data.nurses[i].group,
							"name": data.nurses[i].name,
							"level": data.nurses[i].level,
							"isnurse": data.nurses[i].isnurse,
							"id": data.nurses[i].id,
							"extra": data.nurses[i].extra,
							"collect": data.nurses[i].collect,
							"history": data.nurses[i].history,
							"items": data.nurses[i].items,
							"year": data.nurses[i].year || "",
							"bed": data.nurses[i].bed || ""
						}
						schduleTurnArray[i] = schduleTurnJson;
					}
					
					//==============================================================
					//  schduleTurnArray数组为 剔除掉成员列表里删除掉的人 剔除掉id为null的人
					//==============================================================
					
				} else {
					var ytr = '没有医护人员';
					$('.tab_infos').html(ytr);
				}
				

				
				//全局变量总页数为获取总页数函数
				totalPage = getTotalPage(schduleTurnArray);
				//渲染表格函数
				getPage(currentPage, perPage, schduleTurnArray, dom);
				
				//拖拽换行1
				changeTr(schduleTurnArray);
				//拖拽换行2
				changeTr2();
				
				//getPageLable(totalPage);
				if (schduleTurnArray.length > 0) {
					bindSelect(schduleTurnArray);
					bindChashi(schduleTurnArray);
				}

				
			
			//否则 就是ajax返回的数据responseMsg不等于1
			}else{
				$("#weekpaiban").children().children("tr:gt(0)").remove();
				var ytr = '服务器异常';
				$('.tab_infos').html(ytr);
			}
		},
		error: function(textStatus, errorThrown) {
			alert(textStatus.responseJSON.error + "，请检查网络或服务器");
		}
	})
}

//判断属性是否存在
function isExist(val) {
    if (val !== null && val !== undefined && val != 'null')
        return val;
    return '';
}

//添加编外人员的确定按钮
function addPwaiClick(){
	//自定义变量为true
	var pwlable = true;
	//定义变量为排班表第二行td的个数
	var le = $('#weekpaiban').children().children('tr:eq(1)').children('td').length;
	//如果个数小于2 移除表格
	if(le<2){$('#weekpaiban').children().children('tr:gt(0)').remove()}
	//定义变量为空
	var trr = '';
	//定义变量为空
	var td16 = '';
	
	//遍历添加编外护士弹出层的姓名列表
	$('#pwDiv').children().each(function() {
		//定义变量为这个列表的子元素div的子元素input的value
		var na = $(this).children('div:eq(0)').children().val().trim();
		//如果input的value为空的时候 变量为false
		if(na == ''){pwlable=false;}
	});
	
	//如果变量为true的时候
	if(pwlable){
		//遍历添加编外护士弹出层的姓名列表
		$('#pwDiv').children().each(function(){
			//定义变量为这个列表的子元素div的子元素input的value
			var na = $(this).children('div:eq(0)').children().val().trim();
			
			td1 = '<td><input type="checkbox" name="checkClick" value=""><div class="lajitong"><img class="lajitongPng" data-na="'+na+'" src="../imgs/icon_lajitong.png"></div></td>';
			/*td2 = '<td>'+(newIndex++)+'</td>'*/
			td3 = '<td style="color:#ccc;">编外</td>';
			td4 = '<td>' + na + '</td>';
			td5 = '<td>无级别</td>';
			td6 = '<td></td>';
			td7 = '<td><input type="text" value=""/></td>';
			
			//定义变量opp
			var opp='';
			opp = '<option value="" schId="" selected></option>';
			for (i=0; i<dom.items.length; i++) {
				if (dom.items[i].color == 1) {
					opp += '<option value="red" schId="' + dom.items[i].id + '" style="color:red;">' + dom.items[i].name + '</option>';
				} else {
					opp += '<option value="black" schId="' + dom.items[i].id + '" style="color: black;">' + dom.items[i].name + '</option>';
				}
			}
			//循环一周
			for (j=0; j<7; j++) {
				if (j==0) {td8='<td><select role="">'+opp+'</select></td>'}
				else if (j==1) {td9='<td><select role="">'+opp+'</select></td>'}
				else if (j==2) {td10='<td><select role="">'+opp+'</select></td>'}
				else if (j==3) {td11='<td><select role="">'+opp+'</select></td>'}
				else if (j==4) {td12='<td><select role="">'+opp+'</select></td>'}
				else if (j==5) {td13='<td><select role="">'+opp+'</select></td>'}
				else if (j==6) {td14='<td><select role="">'+opp+'</select></td>'}
				else {}
			}

			td15 = "<td><button class='schUp'>上移</button>&nbsp;&nbsp;<button class='schDown'>下移</button></td>";
			td16 = "<td>0</td>";
			td17 = "<td><input type='text' value='0'></td>";
			td18 = "<td><input type='text' value='0'></td>";
			td19 = "<td>0</td>";

			trr = '<tr>' + td1 + td3 + td4 + td5 + td6 + td7 + td8 + td9 + td10 + td11 + td12 + td13 + td14 + td15 + td16 + td17 + td18 + td19 + '</tr>';
			$('#weekpaiban').children().append(trr);
			
			//每一行的垃圾桶
			$('.lajitongPng').unbind('click').on('click', lajitongPngClick);
			
			var uu = [{'id':null, 'name':null, 'hope':false},{'id':null, 'name':null, 'hope':false},{'id':null, 'name':null, 'hope':false},{'id':null, 'name':null, 'hope':false},{'id':null, 'name':null, 'hope':false},{'id':null, 'name':null, 'hope':false},{'id':null, 'name':null, 'hope':false}];
			var len = schduleTurnArray.length;
			nu = {'departId': departId,'worktime': pwWorktime,'group': null,'name': na,'level': null,'isnurse': false,'id': null,'extra': 0,'collect': 0,'history': 0,'items':uu}
			schduleTurnArray[len] = nu;
		});
		paiwaiSelect(schduleTurnArray);
		panwaiLishi(schduleTurnArray);
	} else {
		alert("！对不起，输入的姓名不能为空");
	}
}


//对标准周工时绑定事件并计算累计差时
function biaoZhgsChange(){
	var ind = 0;
	$("#weekpaiban").children().children("tr:gt(0)").each(function() {
		oy = $(this);
		schduleTurnArray[ind].worktime = $("#biaoZhgs").children().val();
		getLjchashi(oy);
		ind++;
	});
}


//取消保存
function nosavePBclick(){
	$.get("schedule/newSchedule.html", function(data) {
		$(".page_contain").html(data);
	});
}


//保存排班表
function savePBclick(){
	//==============重新定义newtime变量========开始=======
	//定义变量oWeeks为获取页面上周次的内容
	var oWeeks = $('#week13').html();
	//将变量转换为数组
	oWeeks = oWeeks.split(' ');
	//将数组的第4个去掉中间的点
	oWeeks[3] = oWeeks[3].replace('.','');
	//全局变量newtime为这个
	newtime = oWeeks[0]+oWeeks[3];
	//==============重新定义newtime变量========结束=======
	
	nursop = [];
	nu = {};
	if (schduleTurnArray.length > 0) {
		for (h = 0; h < schduleTurnArray.length; h++) {
			nu = {
				"id": schduleTurnArray[h].id,
				"isnurse": schduleTurnArray[h].isnurse,
				"group": schduleTurnArray[h].group,
				"name": schduleTurnArray[h].name,
				"level": schduleTurnArray[h].level,
				"extra": schduleTurnArray[h].extra,
				"history": schduleTurnArray[h].history,
				"collect": schduleTurnArray[h].collect,
				"items": schduleTurnArray[h].items,
				"year": schduleTurnArray[h].year,
				"bed": schduleTurnArray[h].bed,
			}
			nursop[h] = nu;
		}

		var para = {
			"departId": departId,
			"time": newtime,
			"worktime": $('#biaoZhgs').children().val(),
			"nurses": nursop,
			"note": $('#textareaStr').children().val()
		}
		if (confirm("请确认是否要保存？")) {
			$.ajax({
				url: wlanip + "/rest/workplan/weekplan/v1",
				type: 'POST',
				cache: false,
				data: JSON.stringify(para),
				dataType: 'json',
				contentType: 'application/json',
				beforeSend: function(xhr) {
					xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
				},
				success: function(data, status, xhr) {
					if (data.responseMsg == 1) {
						getSavePbQuality();
						alert("排班成功保存到草稿箱");

					} else {
						alert("服务异常");
					}
				},
				Error: function(xhr, error, exception) {
					alert(exception.toString());
				}
			});
		}

	}
}


//===============================
//          发布排班
//===============================
function releaseClick(){
	//==============重新定义newtime变量========开始=======
	//定义变量oWeeks为获取页面上周次的内容
	var oWeeks = $('#week13').html();
	//将变量转换为数组
	oWeeks = oWeeks.split(' ');
	//将数组的第4个去掉中间的点
	oWeeks[3] = oWeeks[3].replace('.','');
	//全局变量newtime为这个
	newtime = oWeeks[0]+oWeeks[3];
	//==============重新定义newtime变量========结束=======
	
	//定义变量布尔值为true
	var econfirm = true;
	//遍历每一个select框
	$('#weekpaiban').children().children('tr:gt(0)').children().children('select').each(function() {
		//定义变量为这个select的value
		var colorName = $(this).val();
		//如果select的value是green 或者是空   变量布尔值为false
		if (colorName == 'green' || colorName == '') {econfirm = false}
	});
	
	//如果变量布尔值为true的时候
	if (econfirm) {
		//定义变量数组
		var nuu = {};
		var nnursop = [];
		
		
		//如果schduleTurnArray数组的个数大于0
		if (schduleTurnArray.length > 0) {
			//循环schduleTurnArray数组
			for (h=0; h<schduleTurnArray.length; h++) {
				//构造json数组
				nnu = {
					"id": schduleTurnArray[h].id,
					"isnurse": schduleTurnArray[h].isnurse,
					"group": schduleTurnArray[h].group,
					"name": schduleTurnArray[h].name,
					"level": schduleTurnArray[h].level,
					"extra": schduleTurnArray[h].extra,
					"history": schduleTurnArray[h].history,
					"collect": schduleTurnArray[h].collect,
					"items": schduleTurnArray[h].items,
					"year": schduleTurnArray[h].year,
					"bed": schduleTurnArray[h].bed,
				}	
				//构造大数组
				nnursop[h] = nnu;
			}
			
			//定义para数组为json数组
			var para = {
				"departId": departId,
				"time": newtime,
				"worktime": $('#biaoZhgs').children().val(),
				"nurses": nnursop,
				"note": $('#textareaStr').children().val()
			}
			//如果弹出警告点击了确定
			if (confirm("请确认是否要发布？")) {
				$.ajax({
					url: wlanip + '/rest/workplan/weekplan/share/v1',
					type: 'POST',
					cache: false,
					data: JSON.stringify(para),
					dataType: 'json',
					contentType: 'application/json',
					beforeSend: function(xhr) {
						xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
					},
					success: function(data, status, xhr) {
						if (data.responseMsg == '1') {
							//获取左侧已发布的个数
							getReleasePbQuality();
							//获取左侧草稿箱的个数
							getSavePbQuality();
							alert('发布成功，进入下一周的排班');
							$.ajax({
								type: 'GET',
								cache: false,
								url: 'schedule/newSchedule.html',
								beforeSend: function(xhr) {
									xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
								},
								success: function(data) {
									$('.page_contain').html(data);
								}
							});
						} else {
							alert(data.responseMsg);
						}
					},
					Error: function(xhr, error, exception) {
						alert(exception.toString());
					}
				})
			}
		}
	} else {
		alert("请对绿色项和空项进行排班,否则无法发布")
	}
}


//拖拽换行函数
function changeTr(schduleTurnArray) {
	
	//定义变量为表格的子元素tbody
	var tbody = $('#weekpaiban').children('tbody');
	//定义变量为表格的子元素tbody的子元素tr
	var $row = $('#weekpaiban').children('tbody').children('tr:gt(0)');
	var $td2 = $('#weekpaiban').children('tbody').children('tr:gt(0)').children('td:eq(2)');
	var $selectRow;
	var startLen;
	var endLen;
	var moveLable = false;
	var moveValue;
	
	$row.each(function(){
		var $tr = $(this).children('td:eq(1)');
		//当tr鼠标按下的时候
		$tr.mousedown(function() {
			//变量为这行tr
			$selectRow = $(this).parent();
			//变量为这行tr之前的所有tr的个数
			startLen = $selectRow.prevAll().length;
			//变量为这行tr之前的所有tr的个数
			moveValue = $selectRow.prevAll().length;
			//tbody的鼠标样式为move
			tbody.css('cursor','move');
			//这行的样式为背景这个颜色
			$selectRow.css('background','#EEE');
			//定义的变量布尔值为true
			moveLable = true;
			//返回true
			return true;
		});
		//当tr鼠标拖动的时候
		$tr.mousemove(function() {
			var $this = $(this).parent();
			//如果是IE9以下的版本
			if (document.selection && document.selection.empty) {
				//禁止复制
				document.selection.empty();
			//否则 如果是IE9及以上或者是非IE
			} else if (window.getSelection) {
				//禁止复制
				var sel = window.getSelection();
				sel.removeAllRanges();
			}

			//定义变量为这个之前所有tr的个数
			var currentValue = $this.prevAll().length;
			return true;
		});
		//当tr鼠标松开的时候
		$tr.mouseup(function() {
			var $this = $(this).parent();
			//变量布尔值为false
			moveLable = false;
			//tbody的鼠标样式为default
			tbody.css('cursor','default');
			//这行的样式背景为白色
			$selectRow.css('background','#FFF');
			var selectRows = $selectRow;
			//如果这行存在
			if (selectRows) {
				//如果这行不是这行
				if (selectRows != $this) {
					//变量为这个之前所有tr的个数
					endLen = $this.prevAll().length;
					//如果startLen大于endLen
					if (startLen > endLen) {
						//这行的前面插入这行
						$this.before(selectRows); //插入   
						//定义变量为起始的个数-1
						var slenn = startLen - 1; //起始的集合中元素位置
						//定义变量为结束的个数-1
						var elenn = endLen - 1;
						//定义变量为结束的个数-1
						var elenn1 = endLen - 1;
						//定义数组变量
						var slennArray = [];
						//数组变量的第一个的值为commonArray数组的第startLen个的值
						slennArray[0] = schduleTurnArray[slenn];
						//定义变量为1
						var lab = 1;
						//循环 如果结束的个数小于开始的个数 结束的个数累加+1
						for (elenn; elenn < slenn; elenn++) {
							//数组变量里的第2个为commonArray的第endLen个
							slennArray[lab] = schduleTurnArray[elenn];
							//变量循环累加+1
							lab++;
						}
						//定义变量为0
						var la = 0;
						//循环 如果如果结束的个数1小于结束的个数+1，结束的个数1累加+1
						for (elenn1; elenn1 < slenn + 1; elenn1++) {
							//commonArray的第elenn1为数组变量的第1个
							schduleTurnArray[elenn1] = slennArray[la];
							//变量循环累加+1
							la++
						}
					//否则 就是startLen小于endLen
					} else {
						//这行的后面插入这行
						$this.after(selectRows); //插入 
						var slenn = startLen - 1; //起始的集合中元素位置
						var slenn1 = startLen - 1;
						var elenn = endLen - 1;
						var slennArray = [];

						for (m = 0; m < (elenn - slenn); m++) {
							slennArray[m] = schduleTurnArray[(slenn + 1) + m];
						}
						slennArray[elenn - slenn] = schduleTurnArray[slenn];
						
						var la = 0;
						for (slenn1; slenn1 < (elenn + 1); slenn1++) {
							schduleTurnArray[slenn1] = slennArray[la];
							la++
						}
					}
					//调用这个函数 将拖拽的保存数据库
					saveSeqencing(schduleTurnArray);
				}
				//如果这行存在 这行为null
				selectRows = null;
			}
		});
	})
	
}
//将拖拽的保存数据库
function saveSeqencing(schduleTurnArray) {
	var nursesSqu = [];
	var nn = 0;
	for (m = 0; m < schduleTurnArray.length; m++) {
		nursesSqu[nn] = schduleTurnArray[m].id;
		nn++;
	}
	var paraNew = {"departId": departId,"nurses": nursesSqu};
	
	$.ajax({
		url: wlanip + "/rest/workplan/nurse/v1",
		type: 'POST',
		data: JSON.stringify(paraNew),
		dataType: 'json',
		contentType: 'application/json',
		beforeSend: function(xhr) {
			xhr.setRequestHeader('Authorization', 'Bearer '+access_token);
		},
		success: function(data, status, xhr) {
			if (data.responseMsg == '1') {
				
			}
		},
		Error: function(xhr, error, exception) {
			alert(exception.toString());
		}
	})
}

//拖拽换行2
function changeTr2(){
	//
}






//获取某年某月第几周以及周的起始与结束日期
//返回
function getWeekdate(year, month, day) {
	var d = new Date(); // what day is first day
	var strr = '';

	d.setFullYear(year, month - 1, 1);
	var w1 = d.getDay();
	if (w1 == 0) w1 = 7; // total day of month

	d.setFullYear(year, month, 0);
	var dd = d.getDate(); // first Monday

	if (w1 != 1) d1 = 7 - w1 + 2;
	else d1 = 1;
	week_count = Math.ceil((dd - d1 + 1) / 7);
	for (var i = 0; i < week_count; i++) {
		var monday = d1 + i * 7;
		var sunday = monday + 6;
		var from = month + "." + monday;
		var to;
		if (sunday <= dd) {
			to = month + "." + sunday;
		} else {
			d.setFullYear(year, month - 1, sunday);
			to = (d.getMonth() + 1) + "." + d.getDate();
		}
		if (day >= monday && day <= sunday) {
			strb = "<option selected>" + year + "年" + month + "月第" + (i + 1) + "周 (" + from + " -" + to + ")</option>";
			strr += strb;
			hweek = month;
			hmondy = monday;
		} else {
			strb = "<option>" + year + "年" + month + "月第" + (i + 1) + "周 (" + from + " -" + to + ")</option>";
			strr += strb;
			if (i == 0) {hweek=month; hmondy=monday}
		}
	}
	return strr;
}



//获取某年某月第几周以及周的起始与结束日期
//返回
function getfirstzhou(year, month, day) {
	var d = new Date(); // what day is first day
	var firstmondy = '';

	d.setFullYear(year, month - 1, 1);
	var w1 = d.getDay();
	if (w1 == 0) w1 = 7; // total day of month

	d.setFullYear(year, month, 0);
	var dd = d.getDate(); // first Monday

	if (w1 != 1) d1 = 7 - w1 + 2;
	else d1 = 1;
	week_count = Math.ceil((dd - d1 + 1) / 7);
	for (var i = 0; i < week_count; i++) {
		var monday = d1 + i * 7;
		if (i == 0) {firstmondy = monday}
	}
	return firstmondy;
}

//表格<th>列添加当周的日期的函数
function thrq(month, monday, lastDay) {
	var i = 1;
	var sunday = 0;
	$("#weekpaiban").children().children("tr:eq(0)").children("th:gt(5)").each(function(index) {
		
		//如果第二个th
		if (index == 0) {
			//如果月份小于10 就是07-0=7
			if ((month - 0) < 10) {
				//如果日期小于10 就是07-0=7 也就是15-0=15  这个th的内容是 例如07.07(一)
				if ((monday - 0) < 10) {$(this).html(("0" + (month - 0)) + "." + ("0" + (monday - 0)) + '(一)')}
				//否则  这个th的内容是 例如07.15(一)
				else{$(this).html(("0" + (month - 0)) + "." + monday + '(一)')}
			//否则 如果月份大于10 就是10-0=10
			}else{
				//如果如期小于10 就是07-0=7 也就是15-0=15  这个th的内容是 例如例如10.07(一)
				if ((monday - 0) < 10) {$(this).html(month + "." + ("0" + (monday - 0)) + '(一)')}
				//否则  这个th的内容是 例如例如10.15(一)
				else{$(this).html(month + "." + monday + '(一)')}
			}
		}
		
		//否则 如果第二个th
		else if (index == 1) {
			//如果日期-0+1小于当月最后一天 例如 30-0=30，30+1=31  29-0=29 29+1=30
			if (((monday - 0) + 1) <= lastDay) {
				//如果月份小于10
				if ((month - 0) < 10) {
					//如果日期小于10  这个th的内容是 例如07.08(二)
					if (((monday - 0) + 1) < 10) {$(this).html(("0" + (month - 0)) + "." + ("0" + ((monday - 0) + 1)) + '(二)')}
					//否则 就是日期大于等于10  这个th的内容是 例如07.10(二)
					else {$(this).html(("0" + (month - 0)) + "." + ((monday - 0) + 1) + '(二)')}
				//否则月份大于等于10
				}else{
					//如果日期小于10  这个th的内容是 例如 10.09(二)
					if (((monday - 0) + 1) < 10) {$(this).html(month + "." + "0" + ((monday - 0) + 1) + '(二)')}
					//否则 就是日期大于等于10  这个th的内容是 例如 10.11(二)
					else {$(this).html(month + "." + ((monday - 0) + 1) + '(二)')}
				}
			//否则 如果日期-0+1小于等于12
			}else{
				//如果月份小于等于12
				if (((month - 0) + 1) <= 12) {
					//如果月份小于10  这个th的内容是 例如 09.01(二)
					if (((month - 0) + 1) < 10) {$(this).html(("0" + ((month - 0) + 1)) + ".0" + i + '(二)'); i++;}
					//否则 月份大于等于10  //这个th的内容是 例如 10.02(二)
					else {$(this).html(((month - 0) + 1) + ".0" + i + '(二)'); i++;}
				//否则 就是月份大于12，也就是第二年，小于10  这个th的内容是 例如01.01(二)
				}else{$(this).html(("0" + ((month - 0) - 11)) + ".0" + i + '(二)'); i++}
			}
		}
		
		//否则 如果第三个th
		else if (index == 2) {
			if (((monday - 0) + 2) <= lastDay) {
				if ((month - 0) < 10) {
					if (((monday - 0) + 2) < 10) {$(this).html(("0" + (month - 0)) + "." + "0" + ((monday - 0) + 2) + '(三)')}
					else {$(this).html(("0" + (month - 0)) + "." + ((monday - 0) + 2) + '(三)')}
				} else {
					if (((monday - 0) + 2) < 10) {$(this).html(month + "." + "0" + ((monday - 0) + 2) + '(三)')}
					else {$(this).html(month + "." + ((monday - 0) + 2) + '(三)')}
				}
			} else {
				if (((month - 0) + 1) <= 12) {
					if (((month - 0) + 1) < 10) {$(this).html(("0" + ((month - 0) + 1)) + ".0" + i + '(三)'); i++;}
					else {$(this).html(((month - 0) + 1) + ".0" + i + '(三)'); i++;}
				}
				else {$(this).html(("0" + ((month - 0) - 11)) + ".0" + i + '(三)'); i++;}
			}
		}
		
		//否则 如果第四个th
		else if (index == 3) {
			if (((monday - 0) + 3) <= lastDay) {
				if ((month - 0) < 10) {
					if (((monday - 0) + 3) < 10) {$(this).html(("0" + (month - 0)) + "." + "0" + ((monday - 0) + 3) + '(四)')}
					else {$(this).html(("0" + (month - 0)) + "." + ((monday - 0) + 3) + '(四)')}
				} else {
					if (((monday - 0) + 3) < 10) {$(this).html(month + "." + "0" + ((monday - 0) + 3) + '(四)')}
					else {$(this).html(month + "." + ((monday - 0) + 3) + '(四)')}
				}
			} else {
				if (((month - 0) + 1) <= 12) {
					if (((month - 0) + 1) < 10) {$(this).html(("0" + ((month - 0) + 1)) + ".0" + i + '(四)'); i++}
					else {$(this).html(((month - 0) + 1) + ".0" + i + '(四)'); i++}
				}
				else {$(this).html(("0" + ((month - 0) - 11)) + ".0" + i + '(四)'); i++}
			}
		}
		
		//否则 如果第五个th
		else if (index == 4) {
			if (((monday - 0) + 4) <= lastDay) {
				if ((month - 0) < 10) {
					if (((monday - 0) + 4) < 10) {$(this).html(("0" + (month - 0)) + "." + "0" + ((monday - 0) + 4) + '(五)')}
					else {$(this).html(("0" + (month - 0)) + "." + ((monday - 0) + 4) + '(五)')}
				} else {
					if (((monday - 0) + 4) < 10) {$(this).html(month + "." + "0" + ((monday - 0) + 4) + '(五)')}
					else {$(this).html(month + "." + ((monday - 0) + 4) + '(五)')}
				}
			} else {
				if (((month - 0) + 1) <= 12) {
					if (((month - 0) + 1) < 10) {$(this).html(("0" + ((month - 0) + 1)) + ".0" + i + '(五)'); i++}
					else {$(this).html(((month - 0) + 1) + ".0" + i + '(五)'); i++}
				}
				else {$(this).html(("0" + ((month - 0) - 11)) + ".0" + i + '(五)'); i++}
			}
		}
		
		//否则 如果第六个th
		else if (index == 5) {
			if (((monday - 0) + 5) <= lastDay) {
				if ((month - 0) < 10) {
					if (((monday - 0) + 5) < 10) {$(this).html(("0" + (month - 0)) + "." + "0" + ((monday - 0) + 5) + '(六)')}
					else {$(this).html(("0" + (month - 0)) + "." + ((monday - 0) + 5) + '(六)')}
				} else {
					if (((monday - 0) + 5) < 10) {$(this).html(month + "." + "0" + ((monday - 0) + 5) + '(六)')}
					else {$(this).html(month + "." + ((monday - 0) + 5) + '(六)')}
				}
			} else {
				if (((month - 0) + 1) <= 12) {
					if (((month - 0) + 1) < 10) {$(this).html(("0" + ((month - 0) + 1)) + ".0" + i + '(六)'); i++}
					else {$(this).html(((month - 0) + 1) + ".0" + i + '(六)'); i++}
				}
				else {$(this).html(("0" + ((month - 0) - 11)) + ".0" + i + '(六)'); i++}
			}
		}
		
		//否则 如果第七个th
		else if (index == 6) {
			if (((monday - 0) + 6) <= lastDay) {
				if ((month - 0) < 10) {
					if (((monday - 0) + 6) < 10) {
						$(this).html(("0" + (month - 0)) + "." + "0" + ((monday - 0) + 6) + '(日)');
						sunday = ("0" + (month - 0)) + "." + "0" + ((monday - 0) + 6);
					} else {
						$(this).html(("0" + (month - 0)) + "." + ((monday - 0) + 6) + '(日)');
						sunday = ("0" + (month - 0)) + "." + ((monday - 0) + 6);
					}
				} else {
					if (((monday - 0) + 6) < 10) {
						$(this).html(month + "." + "0" + ((monday - 0) + 6) + '(日)');
						sunday = month + "." + ((monday - 0) + 6);
					} else {
						$(this).html(month + "." + ((monday - 0) + 6) + '(日)');
						sunday = month + "." + ((monday - 0) + 6);
					}
				}
			} else {
				if (((month - 0) + 1) <= 12) {
					if (((month - 0) + 1) < 10) {
						$(this).html(("0" + ((month - 0) + 1)) + ".0" + i + '(日)');
						sunday = ("0" + ((month - 0) + 1)) + "." + "0" + i;
					} else {
						$(this).html(((month - 0) + 1) + ".0" + i + '(日)');
						sunday = (((month - 0) + 1)) + "." + "0" + i;
					}
				} else {
					$(this).html(("0" + ((month - 0) - 11)) + ".0" + i + '(日)');
					sunday = (("0" + ((month - 0) - 11))) + "." + "0" + i;
				}
			}

		}
		
		//否则不是这些th
		else {}
		if(index>-1&&index<7){
			$(this).append('<br><button class="count" type="button">统计</button>');
		}
	});

	$("#weekpaiban").on('click','.count',function(){
		var row = $(this).parent().prevAll().length;
		var $selectArr = $("#weekpaiban").children("tbody").children("tr:gt(0)");
		var json = {};
		$selectArr.each(function(){
			var selectName = $(this).children('td:eq('+row+')').children('select').children('option:selected').text().trim();
			if(!!selectName){
				if(!json[selectName]){
					json[selectName] = 1;
				}else{
					json[selectName] = json[selectName]+1;
				}
			}
		});
		
		var alertCont = '';
		for(var name in json){
			alertCont += name + ":" + json[name] +'    ';
		}
		alert(alertCont);
	})
	return sunday;
}


//表格<th>列添加当周的日期的函数
function pwaithrq(month, monday, lastDay) {
	var i = 1;
	$("#pbtable").children().children("tr:eq(0)").children("th:gt(2)").each(function(index) {
		
		if (index == 0) {
			if ((month - 0) < 10) {
				if ((monday - 0) < 10) {$(this).html(("0" + (month - 0)) + "." + ("0" + (monday - 0)) + '<br>(一)')}
				else {$(this).html(("0" + (month - 0)) + "." + monday + '<br>(一)')}
			}
			else {
				if ((monday - 0) < 10) {$(this).html(month + "." + ("0" + (monday - 0)) + '<br>(一)')}
				else {$(this).html(month + "." + monday + '<br>(一)')}
			}
		}
		
		else if (index == 1) {
			if (((monday - 0) + 1) <= lastDay) {
				if (((monday - 0) + 1) < 10) {$(this).html(month + "." + "0" + ((monday - 0) + 1) + '<br>(二)')}
				else {$(this).html(month + "." + ((monday - 0) + 1) + '<br>(二)')}
			} else {
				if (((month - 0) + 1) <= 12) {$(this).html(((month - 0) + 1) + ".0" + i + '<br>(二)'); i++}
				else {$(this).html(("0" + ((month - 0) - 11)) + ".0" + i + '<br>(二)'); i++}
			}

		}
		
		else if (index == 2) {
			if (((monday - 0) + 2) <= lastDay) {
				if (((monday - 0) + 2) < 10) {$(this).html(month + "." + "0" + ((monday - 0) + 2) + '<br>(三)')}
				else {$(this).html(month + "." + ((monday - 0) + 2) + '<br>(三)')}
			} else {
				if (((month - 0) + 1) <= 12) {$(this).html(((month - 0) + 1) + ".0" + i + '<br>(三)'); i++}
				else {$(this).html(("0" + ((month - 0) - 11)) + ".0" + i + '<br>(三)'); i++}
			}
		}
		
		else if (index == 3) {
			if (((monday - 0) + 3) <= lastDay) {
				if (((monday - 0) + 3) < 10) {$(this).html(month + "." + "0" + ((monday - 0) + 3) + '<br>(四)')}
				else {$(this).html(month + "." + ((monday - 0) + 3) + '<br>(四)')}
			} else {
				if (((month - 0) + 1) <= 12) {$(this).html(((month - 0) + 1) + ".0" + i + '<br>(四)'); i++}
				else {$(this).html(("0" + ((month - 0) - 11)) + ".0" + i + '<br>(四)'); i++}
			}
		}
		
		else if (index == 4) {
			if (((monday - 0) + 4) <= lastDay) {
				if (((monday - 0) + 4) < 10) {$(this).html(month + "." + "0" + ((monday - 0) + 4) + '<br>(五)')}
				else {$(this).html(month + "." + ((monday - 0) + 4) + '<br>(五)')}
			} else {
				if (((month - 0) + 1) <= 12) {$(this).html(((month - 0) + 1) + ".0" + i + '<br>(五)'); i++}
				else {$(this).html(("0" + ((month - 0) - 11)) + ".0" + i + '<br>(五)'); i++}
			}
		}
		
		else if (index == 5) {
			if (((monday - 0) + 5) <= lastDay) {
				if (((monday - 0) + 5) < 10) {$(this).html(month + "." + "0" + ((monday - 0) + 5) + '<br>(六)')}
				else {$(this).html(month + "." + ((monday - 0) + 5) + '<br>(六)')}
			} else {
				if (((month - 0) + 1) <= 12) {$(this).html(((month - 0) + 1) + ".0" + i + '<br>(六)'); i++}
				else {$(this).html(("0" + ((month - 0) - 11)) + ".0" + i + '<br>(六)'); i++}
			}
		}
		
		else if (index == 6) {
			if (((monday - 0) + 6) <= lastDay) {
				if (((monday - 0) + 6) < 10) {$(this).html(month + "." + "0" + ((monday - 0) + 6) + '<br>(日)')}
				else {$(this).html(month + "." + ((monday - 0) + 6) + '<br>(日)')}
			} else {
				if (((month - 0) + 1) <= 12) {$(this).html(((month - 0) + 1) + ".0" + i + '<br>(日)')}
				else {$(this).html(("0" + ((month - 0) - 11)) + ".0" + i + '<br>(日)')}
			}
		} 
		
		else {}
	})
}


function getLastDay(year, month) {
	var new_year = year; //取当前的年份          
	var new_month = month++; //取下一个月的第一天，方便计算（最后一天不固定）          
	if (month > 12) {
		new_month -= 12; //月份减          
		new_year++; //年份增          
	}
	var new_date = new Date(new_year, new_month, 1); //取当年当月中的第一天          
	return (new Date(new_date.getTime() - 1000 * 60 * 60 * 24)).getDate(); //获取当月最后一天日期          
}


//获取总页数
function getTotalPage(schduleTurnArray) {
	//定义变量为schduleTurnArray的个数
	var totalData = schduleTurnArray.length;
	//如果数组的个数不为0
	if (totalData != 0) {
		//如果数组的个数 小于 全局变量perPage=30
		if (totalData < perPage) {
			//总页数为1
			totalPage = 1;
			//全局变量perPage为数组的个数
			perPage = totalData;
		//否则 就是数组的个数 大于等于 全局变量perPage=30
		} else {
			//如果数组的个数 模 全局变量perPage=30 等于0  也就是数组的个数是全局变量的倍数
			if (totalData % perPage == 0) {
				//总页数为 数组的个数 / 全局变量perPage=30
				totalPage = totalData / perPage;
			//否则 就是模有余数
			} else {
				//总页数为 数组的个数 / 全局变量perPage=30 + 1
				totalPage = totalData / perPage + 1;
			}
		}
	}
	//返回 总页数
	return totalPage;
}










































//分页标签函数
function getPageLable(totalPage) {
	var li = '';
	var up = "<li><a href='#' name='up'>&laquo;</a></li>";
	var down = "<li><a href='#' name='down'>&raquo;</a></li>";
	for (i = 0; i < totalPage; i++) {

		li += "<li><a href='#' name='currentpage'>" + (i + 1) + "</a></li>";
	}

	var ul = "<ul class='pagination'>" + up + li + down + "</ul>";
	$("#pageLable").append(ul);
}




//对下拉框元素绑定事件并计算本周工时和累计差时
function bindSelect(schduleTurnArray) {
	//遍历表格里每个select框
	$('#weekpaiban').children().children('tr:gt(0)').children().children('select').each(function() {
		//定义变量为这个select框
		var oe = $(this);
		//定义变量为这个select框的value值
		var clickValue = oe.val();
		
		//如果这个值等于green的时候
		if (clickValue == 'green') {
			//这个select框点击事件
			oe.on('click', function() {
				//定义变量为这个select框
				var od = $(this);
				//定义变量为这个select框的被选中的子元素option的内容
				var clickName = od.children('option:selected').text().trim();
				//定义变量为这个select框的被选中的子元素option的的属性schId值
				var clickId = od.children('option:selected').attr('schId');
				//定义变量为这个select框父级的父级的第一个子元素td的子元素input的value值
				var clickNursId = od.parent().parent().children("td:eq(0)").children('input').val();
				//定义变量为这个select框的父级之前的全部同级个数
				var indd = od.parent().prevAll().length;
				//定义变量为这个个数+1
				var indexd = Number(indd) + 1;
				//定义变量clickColor
				var clickColor;
				
				//循环dom.items数组
				for (i=0; i<dom.items.length; i++) {
					//如果这个select框的被选中的子元素option的的属性schId值 == 数组的id
					if (clickId == dom.items[i].id) {
						//如果数组的color == 1
						if (dom.items[i].color == 1) {
							//变量为red
							clickColor = 'red';
						//否则就是数组的color不等于1
						} else {
							//变量为black
							clickColor = 'black';
						}
					}
				}
				//这个select框的color为变量clickColor
				od.css('color', clickColor);
				
				//遍历这个select框的每个子元素
				od.children().each(function() {
					//如果这个子元素的value == green
					if ($(this).val() == 'green') {
						//这个子元素的color为变量clickColor
						$(this).css('color', clickColor);
						//这个子元素的value为这个变量clickColor
						$(this).val(clickColor);
					}
				});
				
				//循环护士数组
				for (k = 0; k < schduleTurnArray.length; k++) {
					//如果数组的id == 这个select框父级的父级的第一个子元素td的子元素input的value值
					if (schduleTurnArray[k].id == clickNursId) {
						//数组的item数组的第[(这个select框的父级之前的全部同级个数+1)-5]个items的id 为 这个select框的被选中的子元素option的的属性schId值
						schduleTurnArray[k].items[indexd - schNum].id = clickId;
						//数组的item数组的第[(这个select框的父级之前的全部同级个数+1)-5]个items的name 为 这个select框的被选中的子元素option的内容
						schduleTurnArray[k].items[indexd - schNum].name = clickName;
						//数组的item数组的第[(这个select框的父级之前的全部同级个数+1)-5]个items的hope 为 false
						schduleTurnArray[k].items[indexd - schNum].hope = false;
					}
				}
				
				//解除这个select框点击事件
				$(this).unbind('click');
			});
		}
	});

	//表格里每个select框change的时候事件
	$('#weekpaiban').children().children("tr:gt(0)").children().on('change', 'select', function() {
		//定义变量为0
		var bengshi = 0;
		//定义变量为0
		var ljChashi = 0;
		//定义变量为这个select框
		var seob = $(this);
		//定义变量为这个select框的被选中的子元素的内容
		var op = seob.children('option:selected').text().trim();
		//定义变量为这个select框的被选中的子元素的属性schId值
		var opId = seob.children('option:selected').attr('schId');
		//定义变量为这个select框的被选中的子元素的value值
		var changecolor = seob.children('option:selected').val().trim();
		
		//这个select框的样式color为变量changecolor
		seob.css('color', changecolor);
		//这个select框的属性role为变量opId
		seob.attr('role',opId);

		//==========修改schduleTurnArray的值===========开始===========
		//定义变量为这个select框的父级的父级的第三个td的内容
		var na = seob.parent().parent().children('td:eq('+nameNO+')').text().trim();
		//定义变量为这个select框的父级的父级的第一个td的子元素input的value值
		var naId = seob.parent().parent().children("td:eq(0)").children('input').val();
		//定义变量为这个select框的父级之前的全部同级个数
		var ind = seob.parent().prevAll().length;
		//定义变量为这个个数+1
		var index = Number(ind) + 1;
		//定义变量为布尔值false
		var orgOp = false;
		//定义变量为空
		var orgOpId = '';
		//定义变量colorLable
		var colorLable;
		
		//循环护士数组
		for (k=0; k<schduleTurnArray.length; k++) {
			//如果数组的id == 这个select框的父级的父级的第一个td的子元素input的value值
			if (schduleTurnArray[k].id == naId) {
				//变量布尔值false 为 这个数组的第[(这个select框的父级之前的全部同级个数+1)-5]个item的hope值
				orgOp = schduleTurnArray[k].items[index - schNum].hope;
				//空变量 为 这个数组的第[(这个select框的父级之前的全部同级个数+1)-5]个item的id值
				orgOpId = schduleTurnArray[k].items[index - schNum].id;
			}
		}
		
		//如果变量布尔值为true
		if (orgOp) {
			//循环班次数组
			for (i=0; i<dom.items.length; i++) {
				//如果班次数组的id == 变量orgOpId 现在的这个变量orgOpId已经是护士数组的第[(这个select框的父级之前的全部同级个数+1)-5]个item的id值
				if (dom.items[i].id == orgOpId) {
					//如果班次数组的color == 1
					if (dom.items[i].color == 1) {
						//变量为red
						colorLable = 'red';
					//否则就是班次数组的color 不等于 1
					} else {
						//变量为black
						colorLable = 'black';
					}
				}
			}
			
			//遍历这个这个select框的子元素option
			seob.children('option').each(function() {
				//定义变量为这个子元素option
				var od = $(this);
				//定义变量为这个子元素option的属性schId值
				var optionNameId = od.attr("schId");
				
				//如果这个子元素option的属性schId值 == 护士数组的第[(这个select框的父级之前的全部同级个数+1)-5]个item的id值
				if (optionNameId == orgOpId) {
					//这个子元素option的样式color为变量colorLable
					od.css('color', colorLable);
				}
			});
		
		//否则 就是变量布尔值为false
		} else {
			//循环班次数组
			for (i=0; i<dom.items.length; i++) {
				//如果护士数组的第[(这个select框的父级之前的全部同级个数+1)-5]个item的id值 == 班次数组的id
				if (orgOpId == dom.items[i].id) {
					//如果班次数组的color == 1
					if (dom.items[i].color == 1) {
						//变量为red
						colorLable = 'red';
					//否则就是班次数组的color 不等于 1
					} else {
						//变量为black
						colorLable = 'black';
					}
				}
			}
			
			//如果护士数组的第[(这个select框的父级之前的全部同级个数+1)-5]个item的id值 == 空
			if (orgOpId == '') {
				//变量为black
				colorLable = 'black';
			}
			
			//遍历这个select框的子元素option
			seob.children('option').each(function() {
				//定义变量为这个子元素option
				var od = $(this);
				//定义变量为这个子元素option的属性schId值
				var optionNameId = od.attr('schId');
				//如果护士数组的第[(这个select框的父级之前的全部同级个数+1)-5]个item的id值 == 这个子元素option的属性schId值
				if (orgOpId == optionNameId) {
					//这个子元素option的样式color为变量colorLable
					od.css('color', colorLable);
				}
			});
		}
		//==========修改schduleTurnArray的值===========结束===========


		//=============修改schduleTurnArray的值========开始========
		//遍历这个select框的父级的父级的子元素的子元素select框
		seob.parent().parent().children().children('select').each(function() {
			//定义变量为这些select框的被选中的子元素option的属性schId值
			var mmId = $(this).children('option:selected').attr('schId');
			//如果这个变量为空 变量bengshi循环空累加 就是0
			if (mmId == '') {bengshi += 0}
			//否则 就是这个变量不为空
			else {
				//循环班次数组
				for (i=0; i<dom.items.length; i++) {
					//如果这个变量 == 班次数组的id
					if (mmId == dom.items[i].id) {
						//变量bengshi循环累加班次数组的lable
						bengshi += dom.items[i].lable;
					}
				}
			}
		});
		//这个select框的父级的父级的第12个子元素td的内容为bengshi 就是bengshi《本周工时》
		seob.parent().parent().children('td:eq('+thisWeekNO+')').text(bengshi);
		
		//定义变量为护士数组第1个的worktime 《周标准工时》
		var worktime = schduleTurnArray[0].worktime; //获得周标准工时
		//定义变量为这个select框的父级的父级的第16个子元素td的子元素的value 就是m《历史时差》
		var m = seob.parent().parent().children("td:eq("+historyTime+")").children().val();
		//定义变量为这个select框的父级的父级的第17个子元素td的子元素的value 就是n《加班》
		var n = seob.parent().parent().children("td:eq("+overTimeNO+")").children().val(); //获得加班时间
		//循环护士数组
		for (k = 0; k < schduleTurnArray.length; k++) {
			//如果这个select框的父级的父级的第一个td的子元素input的value值 == 空
			if (naId == '') {
				//如果护士数组的name == 这个select框的父级的父级的第三个td的内容
				if (schduleTurnArray[k].name == na) {
					//如果这个select框的被选中的子元素的属性schId值 == 空
					if (opId == '') {
						//护士数组的item第[(这个select框的父级之前的全部同级个数+1)-5]的id为null
						schduleTurnArray[k].items[index - schNum].id = null;
						//护士数组的item第[(这个select框的父级之前的全部同级个数+1)-5]的name为null
						schduleTurnArray[k].items[index - schNum].name = null;
					//否则就是这个select框的被选中的子元素的属性schId值存在
					} else {
						//护士数组的item第[(这个select框的父级之前的全部同级个数+1)-5]的id 为 这个select框的被选中的子元素的属性schId值
						schduleTurnArray[k].items[index - schNum].id = opId;
						//护士数组的item第[(这个select框的父级之前的全部同级个数+1)-5]的name 为 为这个select框的被选中的子元素的内容
						schduleTurnArray[k].items[index - schNum].name = op;
					}
					
					//护士数组的collect 为 这个
					schduleTurnArray[k].collect = (bengshi - worktime) + (m - 0) + (n - 0);
					//这个select的父级的父级的第15个子元素td的内容为护士数组的collect值
					seob.parent().parent().children("td:eq("+diffTime+")").text(schduleTurnArray[k].collect);
				}
			
			//否则 就是护士数组的name 不等于 这个select框的父级的父级的第三个td的内容
			} else {
				//如果护士数组的id == 这个select框的父级的父级的第一个td的子元素input的value值
				if (schduleTurnArray[k].id == naId) {
					//如果这个select框的被选中的子元素的属性schId值 == 空
					if (opId == '') {
						//护士数组的item第[(这个select框的父级之前的全部同级个数+1)-5]的id为null
						schduleTurnArray[k].items[index - schNum].id = null;
						//护士数组的item第[(这个select框的父级之前的全部同级个数+1)-5]的name为null
						schduleTurnArray[k].items[index - schNum].name = null;
					//否则就是这个select框的被选中的子元素的属性schId值存在
					} else {
						//护士数组的item第[(这个select框的父级之前的全部同级个数+1)-5]的id 为 这个select框的被选中的子元素的属性schId值
						schduleTurnArray[k].items[index - schNum].id = opId;
						//护士数组的item第[(这个select框的父级之前的全部同级个数+1)-5]的name 为 为这个select框的被选中的子元素的内容
						schduleTurnArray[k].items[index - schNum].name = op;
					}
					
					//护士数组的collect 为 (本周工时-周标准工时)+(历史时差-0)+(加班-0)
					//schduleTurnArray[k].collect = (bengshi - worktime) + (m - 0) + (n - 0);
					//护士数组的collect 为 (本周工时-周标准工时)+(加班-0)
					schduleTurnArray[k].collect = (bengshi - worktime) + (n - 0);
					//这个select的父级的父级的第15个子元素td的内容为护士数组的collect值
					//就是《累计时差》
					seob.parent().parent().children("td:eq("+diffTime+")").text(schduleTurnArray[k].collect);
				}
			}
		}
		//=============修改schduleTurnArray的值========结束========
	});
}


//对历史差时和加班绑定事件并计算累计差时
function bindChashi(schduleTurnArray) {
	//遍历所有input
	$('#weekpaiban').children().children('tr:gt(0)').children('td:gt(0)').on('change', 'input', function() {
		//定义变量
		teob = $(this).parent().parent();

		var p = teob.children("td:eq("+thisWeekNO+")").text(); //获得本周工时	
		var m = teob.children("td:eq("+historyTime+")").children().val(); //获得历史差时
		var n = teob.children("td:eq("+overTimeNO+")").children().val(); //获得加班时间
		var worktime = schduleTurnArray[0].worktime; //获得周标准工时

		var na = $(this).parent().parent().children('td:eq('+nameNO+')').text().trim();
		var naId = $(this).parent().parent().children("td:eq(0)").children().val();
		var ind = $(this).parent().prevAll().length;
		var index = Number(ind) + 1;

		var va = $(this).val() - 0;
		for (k = 0; k < schduleTurnArray.length; k++) {
			if (naId == '') {

				if (schduleTurnArray[k].name == na) {

					if (index == weekTimeNO) {

						schduleTurnArray[k].history = va;
						schduleTurnArray[k].collect = ((p - 0) - (worktime - 0)) + (m - 0) + (n - 0);
						teob.children("td:eq("+diffTime+")").text(schduleTurnArray[k].collect);
					} else {
						schduleTurnArray[k].extra = va;
						schduleTurnArray[k].collect = ((p - 0) - (worktime - 0)) + (m - 0) + (n - 0);
						teob.children("td:eq("+diffTime+")").text(schduleTurnArray[k].collect);
					}
				}

			} else {

				if (schduleTurnArray[k].id == naId) {
					if (index == weekTimeNO) {

						schduleTurnArray[k].history = va;
						schduleTurnArray[k].collect = ((p - 0) - (worktime - 0)) + (m - 0) + (n - 0);
						teob.children("td:eq("+diffTime+")").text(schduleTurnArray[k].collect);
					} else {
						schduleTurnArray[k].extra = va;
						schduleTurnArray[k].collect = ((p - 0) - (worktime - 0)) + (m - 0) + (n - 0);
						teob.children("td:eq("+diffTime+")").text(schduleTurnArray[k].collect);
					}
				}
			}

		}

	})
}

//var currentWeek = getWeek((year - 0), (month - 0), (monday - 0));
//得到当天在当年所在的周
function getWeek(a, b, c) {
	//定义变量d1为
	var d1 = new Date(a, b - 1, c);
	var d2 = new Date(a, 0, 1);
	//定义变量为四舍五入的值
	var d = Math.round((d1 - d2) / 86400000);
	//返回向上取整的值
	return Math.ceil((d + ((d2.getDay() + 1) - 1)) / 7);
}



//获取某年某月第几周以及周的起始与结束日期
function getWeekMondy(year, month, day) {
	var d = new Date(); // what day is first day
	var strr = '';

	d.setFullYear(year, month - 1, 1);
	var w1 = d.getDay();
	if (w1 == 0) w1 = 7; // total day of month

	d.setFullYear(year, month, 0);
	var dd = d.getDate(); // first Monday

	if (w1 != 1) d1 = 7 - w1 + 2;
	else d1 = 1;
	week_count = Math.ceil((dd - d1 + 1) / 7);
	for (var i = 0; i < week_count; i++) {
		var monday = d1 + i * 7;
		var sunday = monday + 6;
		var from = month + "." + monday;
		var to;
		if (day >= monday && day <= sunday) {

			return monday;

		}
	}
}

function getLjchashi(oy) {

	var p = oy.children("td:eq("+thisWeekNO+")").text(); //获得本周工时	
	var m = oy.children("td:eq("+historyTime+")").children().val(); //获得历史差时
	var n = oy.children("td:eq("+overTimeNO+")").children().val(); //获得加班时间
	var worktime = $("#biaoZhgs").children().val(); //获得周标准工时
	oy.children("td:eq("+diffTime+")").text(((p - 0) - (worktime - 0)) + (m - 0) + (n - 0));

};

//对编外下拉框元素绑定事件并计算本周工时和累计差时
function bindbwSelect(dom) {


	$("#pbtable").children().children("tr:eq(1)").children().on("change", "select", function() {

		bengshi = 0;
		ljChashi = 0;

		seob = $(this);
		var opcolor = seob.children("option:selected").val();
		var op = seob.children("option:selected").text().trim();

		seob.css("color", opcolor);

		seob.parent().parent().children().children("select").each(function() {

			var mmId = $(this).children("option:selected").attr("schId");

			if (mmId == '') {

				bengshi += 0;
			} else {

				for (i = 0; i < dom.items.length; i++) {

					if (mmId == dom.items[i].id) {

						bengshi += dom.items[i].lable;

					}
				}
			}
		})

		seob.parent().parent().children("td:eq("+thisWeekNO+")").text(bengshi);
		var worktime = $("#biaoZhgs").children().val() - 0; //获得周标准工时
		var m = seob.parent().parent().children("td:eq("+historyTime+")").children().val(); //获得历史差时
		var n = seob.parent().parent().children("td:eq("+overTimeNO+")").children().val(); //获得加班时间
		seob.parent().parent().children("td:eq("+diffTime+")").text((bengshi - worktime) + (m - 0) + (n - 0));

	})
}

//对编外历史差时和加班绑定事件并计算累计差时
function bindbwChashi() {


	$("#pbtable").children().children("tr:eq(1)").children("td:gt(0)").on("change", "input", function() {

		teob = $(this).parent().parent();
		getbwLjchashi(teob);

	})
}

//计算累计差时函数
function getbwLjchashi(ob) {

	var p = ob.children("td:eq("+thisWeekNO+")").text(); //获得本周工时	
	var m = ob.children("td:eq("+historyTime+")").children().val(); //获得历史差时
	var n = ob.children("td:eq("+overTimeNO+")").children().val(); //获得加班时间
	var worktime = $("#biaoZhgs").children().val(); //获得周标准工时
	ob.children("td:eq("+diffTime+")").text(((p - 0) - (worktime - 0)) + (m - 0) + (n - 0));
}


function paiwaiSelect(schduleTurnArray) {
	//对新增加的行select绑定事件
	$('input[name="checkClick"]').parent().parent().children().on('change', 'select', function() {
		var bengshi = 0;
		var ljChashi = 0;

		var seob = $(this);
		var opcolor = seob.children('option:selected').val();
		seob.css('color', opcolor);
		
		//定义变量为表格的第三个td的内容 即姓名
		var na = seob.parent().parent().children('td:eq('+nameNO+')').text().trim();
		//定义变量为这个一行之前的所有行的个数
		var ind = seob.parent().prevAll().length;
		//定义变量为所有行的个数+1
		var index = Number(ind) + 1;
		//定义变量为选中的option的内容
		var op = seob.children('option:selected').text().trim();
		//定义变量为选中的option的属性schId的值
		var opId = seob.children('option:selected').attr('schId');
		
		//遍历所有的select框
		seob.parent().parent().children().children('select').each(function() {
			//定义变量为这个select框的选中的子元素option的属性schId的值
			var mmId = $(this).children("option:selected").attr("schId");
			//如果这个值为空
			if (mmId == '') {
				bengshi += 0;
			//否则
			} else {
				//循环
				for (i=0; i<dom.items.length; i++) {
					//如果这个值等于数组里的id 变量循环累加数组的lable的值
					if (mmId == dom.items[i].id) {bengshi += dom.items[i].lable}
				}
			}
		});
		//第12个td的内容为bengshi的值
		seob.parent().parent().children("td:eq("+thisWeekNO+")").text(bengshi);
		
		//定义变量
		var worktime = schduleTurnArray[0].worktime; //获得周标准工时
		var m = seob.parent().parent().children("td:eq("+historyTime+")").children().val(); //获得历史差时
		var n = seob.parent().parent().children("td:eq("+overTimeNO+")").children().val(); //获得加班时间

		for (k = 0; k < schduleTurnArray.length; k++) {
			if (schduleTurnArray[k].name == na) {
				if (opId == '') {
					schduleTurnArray[k].items[index - schNum].id = null;
					schduleTurnArray[k].items[index - schNum].name = null;
				} else {
					schduleTurnArray[k].items[index - schNum].id = opId;
					schduleTurnArray[k].items[index - schNum].name = op;
				}

				schduleTurnArray[k].collect = (bengshi - worktime) + (m - 0) + (n - 0);
				seob.parent().parent().children("td:eq("+diffTime+")").text(schduleTurnArray[k].collect);
			}

		}
	})
}

//计算累计时差 并写入到schduleTurnArray数组里
function panwaiLishi(schduleTurnArray) {
	//对新增加的行历史差时和加班绑定事件
	$("input[name='checkClick']").parent().parent().children().on("change", "input", function() {
		//定义变量为这个input的父级的父级，就是这行tr
		var teob = $(this).parent().parent();
		//定义变量p为这行tr的第12个子元素td的内容 《本周工时》
		var p = teob.children("td:eq("+thisWeekNO+")").text();
		//定义变量m为这行tr的第13个子元素td的子元素的value 《历史差时》
		var m = teob.children("td:eq("+historyTime+")").children().val();
		//定义变量n为这行tr的第14个子元素td的子元素的value 《加班时间》
		var n = teob.children("td:eq("+overTimeNO+")").children().val();
		//定义变量worktime为数组第1个的worktime的值
		var worktime = schduleTurnArray[0].worktime;
		
		//定义变量na为这行tr的第4个子元素td的内容
		var na = teob.children('td:eq('+nameNO+')').text().trim();
		//定义变量ind为这个input的父级td之前的所有td的个数
		var ind = $(this).parent().prevAll().length;
		//定义变量为这个input所在这行的个数
		var index = Number(ind) + 1;
		
		//定义变量为这个input的value - 0
		var va = $(this).val() - 0;
		//循环schduleTurnArray数组
		for (k=0; k<schduleTurnArray.length; k++) {
			//如果数组的name == 这行tr的第4个子元素td的内容
			if (schduleTurnArray[k].name == na) {
				//如果这个input数第17个 也就是《历史时差》
				if (index == weekTimeNO) {
					//数组history为这个input的value-0
					schduleTurnArray[k].history = va;
					//数组的collect为 ((本周工时 - 0) - (worktime - 0)) + (历时时差 - 0) + (加班时间 - 0)
					schduleTurnArray[k].collect = ((p - 0) - (worktime - 0)) + (m - 0) + (n - 0);
					//累计时差就为数组的collect
					teob.children('td:eq('+diffTime+')').text(schduleTurnArray[k].collect);
				//否则 就是这个input不是第13个
				} else {
					//数组的extra为这个input的value-0
					schduleTurnArray[k].extra = va;
					//数组的collect为 ((本周工时 - 0) - (worktime - 0)) + (历时时差 - 0) + (加班时间 - 0)
					schduleTurnArray[k].collect = ((p - 0) - (worktime - 0)) + (m - 0) + (n - 0);
					//累计时差就为数组的collect
					teob.children('td:eq('+diffTime+')').text(schduleTurnArray[k].collect);
				}
			}
		}
	})
}

//沿用上周排班按钮事件
function lastWeekCopy() {
	
	//定义变量为布尔值true
	var usedLable = true;
	//定义变量为布尔值true
	var curLastLable = true;
	//定义变量为0
	var lastYMD = 0;
	//定义变量
	var allNurs;
	
	//全局变量copyTime是《wlanip + "/rest/workplan/new/v1/" + departId》的data.time 如：20160708
	var year = copyTime.substring(0, 4);
	var month = copyTime.substring(4, 6);
	var monday = copyTime.substring(6, 8);
	
	//定义变量为count(copyTime)函数 function count(str){}
	var lastMonday = count(copyTime);
	
	//如果lastMonday 大于(monday-0)
	if (lastMonday > (monday - 0)) {
		//如果(month-0)等于1
		if ((month - 0) == 1) {
			lastYMD = ((year - 0) - 1) + '12' + lastMonday;
		} else {
			if (((month - 0) - 1) < 10) {
				lastYMD = year + ('0' + ((month - 0) - 1)) + lastMonday;
			} else {
				lastYMD = year + ((month - 0) - 1) + lastMonday;
			}
		}
	} else {
		if ((lastMonday - 0) < 10) {
			lastYMD = year + month + ('0' + lastMonday);
		} else {
			lastYMD = year + month + lastMonday;
		}
	}
	
	//变量allNurs为getWeekPB(lastYMD)函数里的allNursings数组
	allNurs = getWeekPB(lastYMD);
	
	//如果allNurs.id等于undefined 'WorkPlan_145'
	if (allNurs.id == undefined) {
		alert('上周没有排班');
	//否则
	} else {
		
		//循环allNurs.nurses数组
		for (h=0; h<allNurs.nurses.length; h++) {
			//循环allNurs.nurses[h].items数组
			for (y = 0; y < allNurs.nurses[h].items.length; y++) {
				//循环domm.items数组
				for (g = 0; g < domm.items.length; g++) {
					//如果domm.items[g].used存在
					if (domm.items[g].used){
					} else {
						if (allNurs.nurses[h].items[y].id == domm.items[g].id) {
							//变量布尔值为false
							usedLable = false;
						}
					}
				}
			}
		}
		//变量usedLable布尔值为false
		
		
		
		var schLength = schduleTurnArray.length;
		var allNursLength = allNurs.nurses.length;
		//如果这两个数组个数相等
		if (schLength == allNursLength) {
			
			//定义变量为0
			var schIndex = 0;
			//循环schduleTurnArray数组
			for (j=0; j<schduleTurnArray.length; j++) {
				//如果数组的isnurse是true
				if (schduleTurnArray[j].isnurse == true) {
					//循环allNurs.nurses数组
					for (s=0; s<allNurs.nurses.length; s++) {
						//如果allNurs.nurses的id 等于 schduleTurnArray数组的id
						if (allNurs.nurses[s].id == schduleTurnArray[j].id) {
							//schIndex循环累加+1
							schIndex++;
						}
					}
				//否则 就是数组的isnurse是false
				} else {
					//循环allNurs.nurses数组
					for (s=0; s<allNurs.nurses.length; s++) {
						//如果allNurs.nurses的name 等于 schduleTurnArray的name
						if (allNurs.nurses[s].name == schduleTurnArray[j].name) {
							//schIndex循环累加+1
							schIndex++;
						}
					}
				}
			}
			
			//如果schduleTurnArray数组的个数不等于变量schIndex 变量布尔值为false
			if (schduleTurnArray.length != schIndex) {curLastLable = false}
		
		//否则 就是这两个数组个数不想等
		} else {
			curLastLable = false;
		}
		
		//如果变量布尔值为true
		if (usedLable) {
			//如果变量布尔值为true
			if (curLastLable) {
				//每页显示的行数
				perPage = 30;
				//总页数
				totalPage = 0;
				currentPage = 1;
				
				$('.tab_bz').children('tbody').children('tr').find('textarea').text(allNurs.note);
				$('#weekpaiban').children().children('tr:gt(0)').remove();
				
				//schduleTurnArray数组为空
				schduleTurnArray = [];
				//schduleTurnJson数组为空
				schduleTurnJson = {};
				
				//循环allNurs.nurses数组
				for (i=0; i<allNurs.nurses.length; i++) {
					if(allNurs.nurses[i].group == null){allNurs.nurses[i].group = '未分组'}
					if(allNurs.nurses[i].level == null){allNurs.nurses[i].level = '无级别'}
					//构造数组
					schduleTurnJson = {
						"departId": allNurs.departId,
						"worktime": allNurs.worktime,
						"group": allNurs.nurses[i].group,
						"name": allNurs.nurses[i].name,
						"level": allNurs.nurses[i].level,
						"isnurse": allNurs.nurses[i].isnurse,
						"id": allNurs.nurses[i].id,
						"extra": 0,
						"collect": 0,
						"history": allNurs.nurses[i].collect,
						"items": allNurs.nurses[i].items
					}
					//构造数组
					schduleTurnArray[i] = schduleTurnJson;
				}
				//总页数为getTotalPage函数 获取总页数
				totalPage = getTotalPage(schduleTurnArray);
				
				//调用 渲染表格
				getPage(currentPage, perPage, schduleTurnArray, dom);
				
				
				
				//拖拽行
				changeTr(schduleTurnArray);
				
				//调用 对下拉框元素绑定事件并计算本周工时和累计差时
				bindSelect(schduleTurnArray);
				//调用函数
				bindChashi(schduleTurnArray);
				alert('沿用上周排班成功');
			} else {
				alert("上周排班人员和本周不一致，无法沿用");
			}
		} else {
			alert("上周排班中的部分班次已被禁用，无法沿用");
		}
	}
	
	
}

function getWeekPB(lastYMD) {
	var allNursings;
	$.ajax({
		type: 'GET',
		cache: false,
		url: wlanip + '/rest/workplan/weekplan/v1/' + departId + '/' + lastYMD,
		async: false,
		beforeSend: function(xhr) {
			xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
		},
		success: function(data) {
			if (data.responseMsg == '1') {
				allNursings = data;
			}
		},
		error: function(textStatus, errorThrown) {
			//
		}
	});
	return allNursings;
}

function pwmemberAdd() {

/*<li>
	<span><a href="javascript:;" id="addPWmember">[+]</a>姓名</span>
	<div><input type="text" name="name" placeholder="请填写姓名"></div>
</li>*/


	/*$("<div class='form-group'>" +
		"<label for='name' class='col-sm-2 control-label'>姓名</label>" +
		"<div class='col-sm-8'>" +
		"<input type='text' style='border: 1px solid #88dbd4;' class='form-control'  name='name' placeholder='请填写姓名'>" +
		"</div>" +
		"<div class='col-sm-2'><a href='#' name='deleteAddPWmember'><i class='fa fa-remove' style='color: #88dbd4;'></i></a>" +
		"</div>" +
		"</div>").appendTo($("#pwDiv"));*/
	$('<li>' +
		'<span><a href="javascript:;" name="deleteAddPWmember">[╳]</a>姓名</span>' +
		'<div><input type="text" name="name" placeholder="请填写姓名"></div>'+
	'</li>').appendTo($("#pwDiv"));
	
	$("#addFooter").html('');
	$("#addFooter").html('注释:点击[X]，删除改行');
	$("input[name='name']").unbind("change");
	$("input[name='name']").on("change", inputName);
	$("a[name='deleteAddPWmember']").unbind("click");
	$("a[name='deleteAddPWmember']").on("click", addPwmemberDelete);

}

function inputName() {

	seob = $(this);
	var savelable = true; //标示
	var str = seob.val();
	if (str.indexOf(" ") != -1) {

		alert("名字名中不能含有空格");
		var sname = str.replace(/[ ]/g, '');
		seob.val(sname);
	} else {

		var sname = str.replace(/[ ]/g, '');
		var xsnmae = sname.toLocaleLowerCase();
		var usname = sname.toUpperCase();

		seob.parent().parent().siblings().each(function() {

			ob = $(this);
			nname = ob.children("div:eq(0)").children().val().trim();

			if (sname == nname || xsnmae == nname || usname == nname) {

				savelable = false;
			}
		})

		$("#weekpaiban").children('tbody').children("tr:gt(0)").each(function() {

			$oe = $(this);
			nnameId = $oe.children("td:eq(0)").val();
			if (nnameId == '') {
				nname = $oe.children("td:eq("+nameNO+")").text();
				if (sname == nname || xsnmae == nname || usname == nname) {

					savelable = false;
				}
			}
		})

		if (savelable) {

		} else {

			alert("这个输入姓名已存在，请对名字进行修改");
			seob.val('');
		}
	}
}

//删除新增加的 编外
function addPwmemberDelete() {

	$(this).parent().parent().remove();
	$("#addFooter").html('注释:点击[+]，新增一行；点击[X]，删除改行');
	
}

function paiwaiAdd() {
	$('#pwDiv').children('li:eq(0)').children('div').children().val('');
	$('#pwDiv').children('li:gt(0)').remove();
	$('#addFooter').text('');
	$('#addFooter').text('注释:点击[+]，新增一行');
}

//删除编外护士按钮
function paiwaiDelete() {
	//定义变量为true
	var pwrLable = true;
	$('#deletePWmember').children().children("tr:gt(0)").remove();
	for (m=0; m<schduleTurnArray.length; m++) {
		if (schduleTurnArray[m].id == null) {
			pwrLable = false;
			$('<tr><td>' + schduleTurnArray[m].name + '</td><td><input type="checkbox" class="tab_check" value=""></td></tr>').appendTo($("#deletePWmember tbody"))
		}
	}
	if (pwrLable) {
		$("<tr><td colspan='2'>！对不起 ，暂时没有添加任何编外护士 ，无法删除</td></tr>").appendTo($("#deletePWmember tbody"))
	}
}

//删除编外护士的删除确定按钮
/*function pwaiDelete() {
	var pwlable = false;
	//遍历#deletePWmember下的tr
	$("#deletePWmember").children().children().each(function() {
		//定义$or为这个tr
		var $or = $(this);
		//如果这个tr的第二个子元素的子元素是checked
		if ($or.children("td:eq(1)").children().is(":checked")) {
			//变量na为这个tr的第一个子元素的内容
			na = $or.children("td:eq(0)").text().trim();
			
			for (var n=0; n<schduleTurnArray.length; n++) {
				//如果变量na的值 == schduleTurnArray[n].name的值
				if (na == schduleTurnArray[n].name) {
					//删除这个值
					schduleTurnArray.splice(n, 1);
					//这个tr移除
					$or.remove();
					
					pwlable = true;
					
					//遍历表格的所有tr
					$('#weekpaiban').children().children('tr:gt(0)').each(function() {
						//定义变量为这个tr
						var $ou = $(this);
						//定义变量为这个tr的第一个子元素td的子元素input的value
						var nn = $ou.children("td:eq(0)").children().val();
						//如果这个input的value的值为空的时候
						if (nn == '') {
							//定义变量name为这个tr的第三个子元素td的内容
							var name = $ou.children("td:eq(2)").text().trim();
							//如果这个内容等于弹出层的第一个子元素的内容
							if (name == na) {
								//表格的这个tr移除
								$ou.remove();
							}
						}
					})
				}
			}
		}
	});
	
	if (pwlable) {

	} else {
		alert("请选中编外护士");
	}
}*/


//左侧草稿箱的个数
function getSavePbQuality() {
	$.ajax({
		type: 'GET',
		cache: false,
		url: wlanip + '/rest/workplan/private/v1/' + departId,
		beforeSend: function(xhr) {
			xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
		},
		success: function(data) {
			if (data.responseMsg == '1') {
				$('font[name="saveQuatity"]').text('');
				$('font[name="saveQuatity"]').text(data.workplan.length);
			}
		},
		error: function(textStatus, errorThrown) {
			//spinner.spin();
		}
	})
}

//获取左侧已发布的个数
function getReleasePbQuality() {
	$.ajax({
		type: 'GET',
		cache: false,
		url: wlanip + '/rest/workplan/share/v1/' + departId,
		beforeSend: function(xhr) {
			xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
		},
		success: function(data) {
			if (data.responseMsg == '1') {
				$('font[name="releaseQuatity"]').text('');
				$('font[name="releaseQuatity"]').text(data.workplan.length);
			}
		},
		error: function(textStatus, errorThrown) {
			//spinner.spin();
		}
	});
}

function newpbReturn() {

	$("#returnHidden").val($(this).attr("id"));
	//$("#returnModal").modal("show");
}

function pbYes() {
	
	nursop = [];
	nu = {};
	schduleStatus = '';
	//$("#yesPB").attr("data-dismiss", "modal");
	//$("body").removeClass("modal-open");
	//$(".modal-backdrop.fade.in").remove();
	if (schduleTurnArray.length > 0) {

		for (h = 0; h < schduleTurnArray.length; h++) {

			nu = {

				"id": schduleTurnArray[h].id,
				"isnurse": schduleTurnArray[h].isnurse,
				"group": schduleTurnArray[h].group,
				"name": schduleTurnArray[h].name,
				"level": schduleTurnArray[h].level,
				"extra": schduleTurnArray[h].extra,
				"history": schduleTurnArray[h].history,
				"collect": schduleTurnArray[h].collect,
				"items": schduleTurnArray[h].items,
				"year": schduleTurnArray[h].year,
				"bed": schduleTurnArray[h].bed,
			}

			nursop[h] = nu;
		}

		var para = {
			"departId": departId,
			"time": newtime,
			"worktime": $("#biaoZhgs").children().val(),
			"nurses": nursop,
			"note": $("#textareaStr").children().val()
		}

		if (confirm("请确认是否要保存？")) {
			$.ajax({
				url: wlanip + "/rest/workplan/weekplan/v1",
				type: 'POST',
				data: JSON.stringify(para),
				dataType: 'json',
				contentType: 'application/json',
				beforeSend: function(xhr) {
					xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
				},
				success: function(data, status, xhr) {
					if (data.responseMsg == 1) {
						getSavePbQuality();
						alert("排班成功保存到草稿箱");

					} else {
						alert("服务异常");
					}
				},
				Error: function(xhr, error, exception) {
					alert(exception.toString());
				}
			})
		}

	}

	/**$.get("schedule/schedule.html", function(data) {
		//spinner.spin();
		$(".page_contain").html(data);
	});*/
	$.ajax({
		type: 'GET',
		cache: false,
		url: "schedule/schedule.html",
		beforeSend: function(xhr) {
			xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
		},
		success: function(data) {
			//spinner.spin();
			$(".page_contain").html(data);
		}
	});
}

function pbNo() {
	schduleStatus = '';
	$.ajax({
		type: 'GET',
		cache: false,
		url: "schedule/schedule.html",
		beforeSend: function(xhr) {
			xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
		},
		success: function(data) {
			$(".page_contain").html(data);
		}
	});
}


function count(str) {
	var oDate = new Date(str.slice(0, 4), str.slice(4, 6) - 1, str.slice(-2));
	var oDay = oDate.getDay();
	var oNum = oDate.getDate();
	var bWeek1 = new Date(str.slice(0, 4), str.slice(4, 6) - 1, oNum - oDay - 6);
	var bWeek2 = new Date(str.slice(0, 4), str.slice(4, 6) - 1, oNum - oDay);
	var aWeek1 = new Date(str.slice(0, 4), str.slice(4, 6) - 1, oNum + 8 - oDay);
	var aWeek2 = new Date(str.slice(0, 4), str.slice(4, 6) - 1, oNum + 8 - oDay + 6);
	return bWeek1.getDate();
}


//获取成员列表的所有护士
function getAllNurses(){
	$.ajax({
		type: 'GET',
		cache: false,
		url: wlanip + '/rest/doctors/pc/v1/' + globalDepartId,
		async: false,
		beforeSend: function(xhr) {
			xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
		},
		success: function(data) {
			if (data.responseMsg == '1') {
				//定义变量为data.doctors全部成员
				var nurses = data.doctors;
				//定义变量为数组
				var nursesArr = [];
				
				//循环所有成员
				for(var i=0; i<nurses.length; i++){
					//如果是护士、护士长、未知身份的人
					if(nurses[i].type == '32' || nurses[i].type == '34' || nurses[i].type == '0'){
						//将这些人推到nursesArr数组里
						nursesArr.push(nurses[i]);
					}
				}
				//此时的nursesArr为成员里的所有护士和未知身份的人
				
				//========================对比数组==========================
				//schduleTurnArray为获取最新排班成员的数组，已剔除已删除的成员，也剔除了id为null的成员
				//遍历schduleTurnArray数组
				$(schduleTurnArray).each(function(i , nrs) {
					//循环nurseArr数组
					for(var n=0; n<nursesArr.length; n++){
						//如果nursesArr的id等于schduleTurnArray的id
						if(nursesArr[n].id == nrs.id){
							//nursesArr删除这条数据
							nursesArr.splice(n,1);
						}
					}
				});
				//此时的nursesArr为已剔除掉schduleTurnArray数据后的数组
				
				
				
				//===============重构造nursesArr数组=======开始======
				var uu = [{'id':null, 'name':null, 'hope':false},{'id':null, 'name':null, 'hope':false},{'id':null, 'name':null, 'hope':false},{'id':null, 'name':null, 'hope':false},{'id':null, 'name':null, 'hope':false},{'id':null, 'name':null, 'hope':false},{'id':null, 'name':null, 'hope':false}];
				for (i = 0; i < nursesArr.length; i++) {
					var nursesArrJson = {
						"departId": nursesArr[i].departId,
						"worktime": pwWorktime,
						"group": nursesArr[i].group,
						"name": nursesArr[i].name,
						"level": nursesArr[i].level,
						"isnurse": true,
						"id": nursesArr[i].id,
						"extra": 0,
						"collect": 0,
						"history": 0,
						"items": uu,
						"year": nursesArr[i].year,
						"bed": nursesArr[i].bed
					}
					nursesArr[i] = nursesArrJson;
				}
				//===============重构造nursesArr数组=======结束======
				//此时的nursesArr为新的数组
				
				//全局变量数组为这个数组
				nurseArr = nursesArr;
			}
		},
		error: function(textStatus, errorThrown) {
			alert(textStatus.responseJSON.error + "，请检查网络或服务器");
		}
	});
}


//新增人员按钮事件
function add_renyuansClick(){
	
	//定义变量
	var nurses = nurseArr;
	var nType;
	var nGroup;
	var nLevel;
	
	//移除表格所有tr
	$("#add_renyuanTab>tbody").children("tr:gt(0)").remove();
	//如果nurseArrDel的个数大于0
	if(nurses.length>0){
		$('.tab_infos').remove();
		
		//遍历所有护士数组
		$(nurses).each(function(i, nurse) {
			//如果存在分组
			if(nurses.group){nGroup = nurses.group}
			else{nGroup = '未分组'}
			
			//如果存在级别
			if(nurses.level){nLevel = nurses.level}
			else{nLevel = '无级别'}

			//如果存在级别
			if(nurses.year){nLevel = nurses.year}
			else{nYear = ''}

			//如果存在级别
			if(nurses.bed){nLevel = nurses.bed}
			else{nBed = ''}
			
			if (nurse.logon == false){
				$('<tr>' +
					'<td style="color:#999;">' + nurse.name + '</td>' +
					'<td><a href="javascript:;" data-id="'+nurse.id+'" class="addNurses" data-level="'+nLevel+'" data-group="'+nGroup+'" role="'+nurse.name+'" data-year="'+nYear+'" data-bed="'+nBed+'">添加</a></td>' +
					'</tr>').appendTo($("#add_renyuanTab>tbody"));
			}else{
				$('<tr>' +
					'<td>' + nurse.name + '</td>' +
					'<td><a href="javascript:;" data-id="'+nurse.id+'" class="addNurses" data-level="'+nLevel+'" data-group="'+nGroup+'" role="'+nurse.name+'" data-year="'+nYear+'" data-bed="'+nBed+'">添加</a></td>' +
					'</tr>').appendTo($("#add_renyuanTab>tbody"));
			}
		});
	}else{
		$('.tab_infos').text('所有人员已经列出');
	}
	
	//添加按钮
	$('.addNurses').unbind('click').on('click', addNursesClick);
}

//添加护士按钮
function addNursesClick(){
	//定义变量为垃圾桶的上一个元素的value
	var addNursesId = $(this).data('id');
	var na = $(this).attr('role').trim();
	var nGroup =  $(this).data('group');
	var nLevel =  $(this).data('level');
	var nYear = $(this).data('year');
	var nBed = $(this).data("bed");
	//定义变量为这个按钮的这一行tr
	var addTr = $(this).parent().parent();
	//定义变量为全局变量数组
	var nurses = nurseArr;
	
	//遍历排班表的所有tr
	$('#add_renyuanTab').children().children('tr:gt(0)').each(function() {
		//循环nurseArr数组
		for(var i=0; i<nurses.length; i++){
			//定义变量为数组第i个id
			var nurseId = nurses[i].id;
			//如果垃圾桶的上一个元素的value 等于 数组的id
			if (addNursesId == nurseId){
				//schduleTurnArray.push(nurses[i]);
				nurseArr.splice(i,1);
				//这行移除
				addTr.remove();
			}
		}
    });
	
	
	td1 = '<td><input type="checkbox" name="checkClick" value="'+addNursesId+'"><div class="lajitong"><img class="lajitongPng" data-id="'+addNursesId+'" data-na="'+na+'" src="../imgs/icon_lajitong.png"></div></td>';
	/*td2 = '<td>'+(newIndex++)+'</td>'*/
	td3 = '<td>'+nGroup+'</td>';
	td4 = '<td role="'+addNursesId+'">' + na + '</td>';
	td5 = '<td>'+nLevel+'</td>';
	td6 = '<td>'+nBed+'</td>';
	td7 = '<td><input type="text" value="'+nYear+'"/></td>';

	
	//定义变量opp
	var opp='';
	opp = '<option value="" schId="" selected></option>';
	for (i=0; i<dom.items.length; i++) {
		if (dom.items[i].color == 1) {
			opp += '<option value="red" schId="' + dom.items[i].id + '" style="color:red;">' + dom.items[i].name + '</option>';
		} else {
			opp += '<option value="black" schId="' + dom.items[i].id + '" style="color: black;">' + dom.items[i].name + '</option>';
		}
	}
	//循环一周
	for (j=0; j<7; j++) {
		if (j==0) {td8='<td><select role="">'+opp+'</select></td>'}
		else if (j==1) {td9='<td><select role="">'+opp+'</select></td>'}
		else if (j==2) {td10='<td><select role="">'+opp+'</select></td>'}
		else if (j==3) {td11='<td><select role="">'+opp+'</select></td>'}
		else if (j==4) {td12='<td><select role="">'+opp+'</select></td>'}
		else if (j==5) {td13='<td><select role="">'+opp+'</select></td>'}
		else if (j==6) {td14='<td><select role="">'+opp+'</select></td>'}
		else {}
	}
	
	td15 = "<td><button class='schUp'>上移</button>&nbsp;&nbsp;<button class='schDown'>下移</button></td>";
	td16 = "<td>0</td>";
	td17 = "<td><input type='text' value='0'></td>";
	td18 = "<td><input type='text' value='0'></td>";
	td19 = "<td>0</td>";

	trr = '<tr>' + td1 + td3 + td4 + td5 + td6 + td7 + td8 + td9 + td10 + td11 + td12 + td13 + td14 + td15 + td16 + td17 + td18 + td19 + '</tr>';
	$('#weekpaiban').children().append(trr);
	
	//每一行的垃圾桶
	$('.lajitongPng').unbind('click').on('click', lajitongPngClick);
	
	//自定义数组
	var uu = [{'id':null, 'name':null, 'hope':false},{'id':null, 'name':null, 'hope':false},{'id':null, 'name':null, 'hope':false},{'id':null, 'name':null, 'hope':false},{'id':null, 'name':null, 'hope':false},{'id':null, 'name':null, 'hope':false},{'id':null, 'name':null, 'hope':false}];
	//自定义变量为数组的个数
	var len = schduleTurnArray.length;
	//定义变量nu数组
	var nu = {'departId': departId,'worktime': pwWorktime,'group': nGroup,'name': na,'level': nLevel,'isnurse': false,'id': addNursesId,'extra': 0,'collect': 0,'history': 0,'items':uu}
	//数组的第len个为变量数组nu
	schduleTurnArray[len] = nu;

	//拖拽行
	changeTr(schduleTurnArray);
	paiwaiSelect(schduleTurnArray);
	panwaiLishi(schduleTurnArray);
}


//点击每一行垃圾桶图标删除事件
function lajitongPngClick(){
	//定义变量ID为垃圾桶的data-id
	var ljtId = $(this).data('id');
	//定义变量名字为垃圾桶的data-na
	var ljtNa = $(this).data('na');
	
	//如果是编外护士前面的垃圾桶
	if(ljtId==undefined){
		//alert('编外');
		//循环数组
		for (var n=0; n<schduleTurnArray.length; n++) {
			//如果变量ljtNa == schduleTurnArray[n].name
			if (ljtNa == schduleTurnArray[n].name) {
				//然后再删除这调数据
				schduleTurnArray.splice(n, 1);
				
				//遍历表格的所有tr
				$('#weekpaiban').children().children('tr:gt(0)').each(function() {
					//定义变量为这个tr
					var $ou = $(this);
					//定义变量为这个tr的第一个子元素td的子元素input的value
					var nn = $ou.children("td:eq(0)").children('input').val();
					//如果这个input的value的值为空
					if (nn == '') {
						//定义变量name为这个的第三个td的内容
						var name = $ou.children("td:eq("+nameNO+")").text().trim();
						//如果这个内容等于ljtNa
						if (name == ljtNa){
							$ou.remove();
						}
					}
				});
			}
		}
		//遍历删除编外的弹出层的table
		$("#deletePWmember").children().children().each(function() {
			//定义变量为这行的第一个TD的内容 也就是名字
			var Pname = $(this).children('td:eq(0)').text();
			if(Pname == ljtNa){
				$(this).remove();
			}
		});
	
	//否则 就是成员前面的垃圾桶
	}else{
		//alert('成员');
		for (var n=0; n<schduleTurnArray.length; n++) {
			//如果变量ljtId == schduleTurnArray[n].id
			if (ljtId == schduleTurnArray[n].id) {
				//先将这条数据推到nurseArr数组里
				nurseArr.push(schduleTurnArray[n]);
				//然后再删除这调数据
				schduleTurnArray.splice(n, 1);
				
				//遍历表格的所有tr
				$('#weekpaiban').children().children('tr:gt(0)').each(function() {
					//定义变量为这个tr
					var $ou = $(this);
					//定义变量为这个tr的第一个子元素td的子元素input的value
					var nn = $ou.children("td:eq(0)").children('input').val();
					//如果这个input的value的值等于 这个垃圾桶的ID  //表格的这个tr移除
					if (nn == ljtId) {
						$ou.remove();
					}
				});
			}
		}
	}
	
	return false;
}





//**********************************
// 设置班次的JS
//**********************************

//渲染弹出层表格
function renderTable() {
	$('#benciTab').children().children().remove();
	//渲染增加班次弹出层的表格头部
	sttd0 = '<th>班次</th>';
	sttd1 = '<th>工时</th>';
	sttd2 = '<th>显示红色</th>';
	sttd3 = '<th title="勾选的班次可在排班中使用">启用</th>';
	sttd4 = '<th>操作</th>';
	sttd = sttd0 + sttd1 + sttd2 + sttd3 + sttd4;
	trh = '<tr>' + sttd + '</tr>';
	$('#benciTab').children().append(trh);
	
	//循环data.items数组
	for (i=0; i<schOption.length; i++) {
		//如果数组里的used存在
		if (schOption[i].used) {
			//如果数组里的update存在
			if (schOption[i].update) {
				//定义变量为这个数组的color
				var xhbiaoshi = schOption[i].color;
				//如果变量等于1
				if (xhbiaoshi == 1) { /**判断是否要显示红色 */
					stt0='<td><input type="text" name="pname" style="color:red;" value="'+schOption[i].name+'"></td>';
					stt1='<td><input type="text" name="plable" value="'+schOption[i].lable+'"></td>';
					stt2='<td><input type="checkbox" class="tab_check" name="cbox" checked/></td>';
					stt3='<td><input type="checkbox" class="tab_check" name="diableCheckbox" checked/></td>';
					stt4='<td><i data-id="'+schOption[i].id+'" class="eddeletpd" name="remove"></i></td>';
					sttd = stt0+stt1+stt2+stt3+stt4;
					trh = '<tr>'+sttd+'</tr>';
					$('#benciTab').children().append(trh);
				//否则
				} else {
					stt0 = '<td><input type="text" name="pname" value="'+schOption[i].name+'"></td>';
					stt1 = '<td><input type="text" name="plable" value="'+schOption[i].lable+'"></td>';
					stt2 = '<td><input type="checkbox" class="tab_check" name="cbox"/></td>';
					stt3 = '<td><input type="checkbox" class="tab_check" name="diableCheckbox" checked></td>';
					stt4 = '<td><i data-id="'+schOption[i].id+'" class="eddeletpd" name="remove"></i></td>';
					sttd = stt0+stt1+stt2+stt3+stt4;
					trh = '<tr class="">'+sttd+'</tr>';
					$('#benciTab').children().append(trh);
				}
			//否则 就是数组里的update不存在
			} else {
				var xhbiaoshi = schOption[i].color;
				if (xhbiaoshi == 1) { /**判断是否要显示红色 */
					stt0 = '<td><input type="text" name="pname" style="color: red;" value="'+schOption[i].name+'"></td>';
					stt1 = '<td><input type="text" name="plable" value="'+schOption[i].lable+'"></td>';
					stt2 = '<td><input type="checkbox" class="tab_check" name="cbox" checked/></td>';
					stt3 = '<td><input type="checkbox" class="tab_check" name="diableCheckbox" checked></td>';
					stt4 = '<td><i data-id="'+schOption[i].id+'" class="eddeletpd" name="ok" data-toggle="popover" title="在排班表中已被使用过，不能再编辑班次名称和班时，也不能被删除"></i></td>';
					sttd = stt0+stt1+stt2+stt3+stt4;
					trh = '<tr>'+sttd+'</tr>';
					$('#benciTab').children().append(trh);
				} else {
					stt0 = '<td><input type="text" name="pname" style="" value="'+schOption[i].name+'"></td>';
					stt1 = '<td><input type="text" name="plable" value="'+schOption[i].lable+'"></td>';
					stt2 = '<td><input type="checkbox" class="tab_check" name="cbox"/></td>';
					stt3 = '<td><input type="checkbox" class="tab_check" name="diableCheckbox" checked></td>';
					stt4 = '<td><i data-id="'+schOption[i].id+'" class="eddeletpd" name="ok" data-toggle="popover" title="在排班表中已被使用过，不能再编辑班次名称和班时，也不能删除"></i></td>';
					sttd = stt0+stt1+stt2+stt3+stt4;
					trh = '<tr class="">'+sttd+'</tr>';
					$('#benciTab').children().append(trh);

				}
			}

		} else {
			var xhbiaoshi = schOption[i].color;
			if (xhbiaoshi == 1) { /**判断是否要显示红色 */
				stt0 = '<td><input type="text" name="pname" style="color:red;" value="'+schOption[i].name+'" disabled="disabled"></td>';
				stt1 = '<td><input type="text" name="plable" value="'+schOption[i].lable+'" disabled="disabled"></td>';
				stt2 = '<td><input type="checkbox" class="tab_check" name="cbox" disabled="disabled" checked/></td>';
				stt3 = '<td><input type="checkbox" class="tab_check" name="diableCheckbox"></td>';
				stt4 = '<td><i data-id="'+schOption[i].id+'" class="eddeletpd" name="disabled" data-toggle="popover" title="该班次已被禁用，不能再使用" disabled="disabled">已禁用</i></td>';
				sttd = stt0+stt1+stt2+stt3+stt4;
				trh = '<tr>'+sttd+'</tr>';
				$('#benciTab').children().append(trh);

			} else {
				stt0 = '<td><input type="text" name="pname" style="" value="'+schOption[i].name+'" disabled="disabled"></td>';
				stt1 = '<td><input type="text" name="plable" value="'+schOption[i].lable+'" disabled="disabled"></td>';
				stt2 = '<td><input type="checkbox" class="tab_check" disabled="disabled" name="cbox"/></td>';
				stt3 = '<td><input type="checkbox" class="tab_check" name="diableCheckbox"></td>';
				stt4 = '<td><i href="javascript:;" data-id="'+schOption[i].id+'" class="eddeletpd" name="disabled" data-toggle="popover" title="该班次已被禁用，不能再使用" disabled="disabled">已禁用</i></td>';
				sttd = stt0+stt1+stt2+stt3+stt4;
				trh = '<tr class="">'+sttd+'</tr>';
				$('#benciTab').children().append(trh);

			}
		}
	}
	
	
	
	//渲染表格的删除按钮
	//$(document).off('click', '.eddeletpd').on('click', '.eddeletpd', deleteScheduleOptionXr);
	$(document).off('change', 'input[name="cbox"]').on('change', 'input[name="cbox"]', checkboxColor);
	$(document).off('change', 'input[name="diableCheckbox"]').on('change', 'input[name="diableCheckbox"]', checkboxDisable);
	$(document).off('change', 'input[name="pname"]').on('change', 'input[name="pname"]', nameChange);
	$(document).off('change', 'input[name="plable"]').on('change', 'input[name="plable"]', lableChange);
	$(document).off('click', '.tishi').on('click', '.tishi', tishiChange);
}

function tishiChange() {
	var $ob = $(this);
	if (popoverLable) {
		$ob.popover('show');
		popoverLable = false;
	} else {
		$ob.popover('hide');
		popoverLable = true;
	}
}
//初始化排班项
function initScheduleOption() {
	var items = [{
		"name": "白班",
		"lable": 6,
		"color": 0,
		"sure": true,
		"update": true,
		"used": true
	}, {
		"name": "晚班",
		"lable": 8,
		"color": 0,
		"sure": false,
		"update": true,
		"used": true
	}, {
		"name": "夜班",
		"lable": 11,
		"color": 0,
		"sure": false,
		"update": true,
		"used": true
	}];
	var params = {
		"items": items
	};
	$.ajax({
		url: wlanip+"/rest/workplan/planitems/v1/"+departId,
		type: 'POST',
		data: JSON.stringify(params),
		dataType: 'json',
		contentType: 'application/json',
		beforeSend: function(xhr) {
			xhr.setRequestHeader('Authorization', 'Bearer '+access_token);
		},
		success: function(data, status, xhr) {
			if (data.responseMsg == '1') {
				//goContentPage(this, 'schedule/scheduleOptions.html');
			}
		},
		Error: function(xhr, error, exception) {
			alert(exception.toString());
		}
	})
}

//增加班次按钮 增加一行
function addScheduleOption() {

	stt0 = '<td><input type="text" name="pname" style="" value=""></td>';
	stt1 = '<td><input type="text" name="plable" value=""></td>';
	stt2 = '<td><input type="checkbox" class="tab_check" name="cbox"/></td>';
	stt3 = '<td><input type="checkbox" class="tab_check" name="diableCheckbox" checked><a href="javascript:;" class="eddeletpdOne" name="remove"><span class="glyphicon glyphicon-remove"></span></a></td>';
	stt4 = '<td><a href="javascript:;" class="deleteAdd" name="remove">删除</a></td>';
	sttd = stt0+stt1+stt2+stt3+stt4;
	trh = '<tr class="">'+sttd+'</tr>';
	$('#benciTab').children().children('tr:eq(1)').before(trh);
	
	//新增行的删除按钮
	$(document).off('click', '.deleteAdd').on('click', '.deleteAdd', deleteScheduleOptionXz);
	
	//$(document).off('click', '.eddeletpdOne').on('click', '.eddeletpdOne', deleteSchOption);
	$(document).off('change', 'input[name="cbox"]').on('change', 'input[name="cbox"]', checkboxColor);
	$(document).off('change', 'input[name="diableCheckbox"]').on('change', 'input[name="diableCheckbox"]', checkboxDisable);
	$(document).off('change', 'input[name="pname"]').on('change', 'input[name="pname"]', nameChange);
	$(document).off('change', 'input[name="plable"]').on('change', 'input[name="plable"]', lableChange);
}

//新增行的删除按钮事件
function deleteScheduleOptionXz(){
	$(this).parent().parent().remove();
}

//复选框转色
function checkboxColor() {
	if ($(this).is(':checked')) {
		$(this).parent().prev().prev().children().css('color', 'red');
	} else {
		$(this).parent().prev().prev().children().css('color', '');
	}
}

//复选框禁用
function checkboxDisable() {
	var $id = $(this).parent().next().children().attr('data-id');
	if ($id == undefined) {
		if ($(this).is(':checked')) {
			$(this).parent().prev().children().removeAttr('disabled', 'disabled');
			$(this).parent().prev().prev().children().removeAttr('disabled', 'disabled');
			$(this).parent().prev().prev().prev().children().removeAttr('disabled', 'disabled');
		} else {
			$(this).parent().prev().children().attr('disabled', 'disabled');
			$(this).parent().prev().prev().children().attr('disabled', 'disabled');
			$(this).parent().prev().prev().prev().children().attr('disabled', 'disabled');
		}

	} else {
		for (i=0; i<schOption.length; i++) {
			if (schOption[i].id == $id) {
				if ($(this).is(':checked')) {
					$(this).parent().prev().children().removeAttr('disabled', 'disabled');
					$(this).parent().prev().prev().children().removeAttr('disabled', 'disabled');
					$(this).parent().prev().prev().prev().children().removeAttr('disabled', 'disabled');
				} else {
					$(this).parent().prev().children().attr('disabled', 'disabled');
					$(this).parent().prev().prev().children().attr('disabled', 'disabled');
					$(this).parent().prev().prev().prev().children().attr('disabled', 'disabled');
				}
			}
		}
	}

	//$(document).off('click', '.eddeletpd').on('click', '.eddeletpd', deleteScheduleOption);
	$(document).off('change', 'input[name="cbox"]').on('change', 'input[name="cbox"]', checkboxColor);
	$(document).off('change', 'input[name="diableCheckbox"]').on('change', 'input[name="diableCheckbox"]', checkboxDisable);
	$(document).off('change', 'input[name="pname"]').on('change', 'input[name="pname"]', nameChange);
	$(document).off('change', 'input[name="plable"]').on('change', 'input[name="plable"]', lableChange);
}

//渲染表格的删除按钮 
/*function deleteScheduleOptionXr() {
	//定义变量为这个按钮
	var $ob = $(this);
	//定义变量为这个按钮的属性data-id的值
	var $id = $ob.attr("data-id");
	//定义变量为这个按钮的属性name的值
	var $type = $ob.attr("name");
	
	//如果这个按钮的属性name的值 == remove
	if ($type == "remove") {
		$.ajax({
			url: wlanip + "/rest/workplan/planitems/v1/" + departId + '/' + $id,
			type: 'DELETE',
			dataType: 'json',
			contentType: 'application/json',
			success: function(data, status, xhr) {
				if (data.responseMsg == '1') {
					alert('删除成功');
					//这个按钮的父级的父级移除 就是这行移除
					$ob.parent().parent().remove();
				}
			},
			Error: function(xhr, error, exception) {
				alert(exception.toString());
			}
		})
	}
}*/

function deleteSchOption() {

	$(this).parent().parent().remove();
}

//增加班次input事件
function nameChange() {
	//定义变量为这个input
	var seob = $(this);
	//定义变量为布尔值true 标示
	var savelable = true;
	//定义变量为这个input的value
	var str = seob.val();
	
	//如果input的value含有空格
	if (str.indexOf(" ") != -1) {
		//定义变量为删除空格后的value
		var sname = str.replace(/[ ]/g, '');
		//这个input的value值为这个value
		seob.val(sname);
	} else {
		//定义变量为删除空格后的value
		var sname = str.replace(/[ ]/g, '');
		
		//变量为小写
		//var xsnmae = sname.toLocaleLowerCase();
		//变量为大写
		//var usname = sname.toUpperCase();
		
		//遍历这个input的父级的父级的其他同级tr
		seob.parent().parent().siblings().each(function() {
			//定义变量为这些同级tr
			var ob = $(this);
			//定义变量为这个tr的第一个子元素td的子元素的value
			var nname = ob.children("td:eq(0)").children().val();

			if (nname == sname) {
				savelable = false;
			}
		})
		
		/*var ind = seob.parent().parent().prevAll().length;
		var index = Number(ind) + 1;
		var str = '';
		for (m=0; m<schOption.length; m++) {
			if (m == (index - 2)) {
				str = schOption[m].name
			}
		}*/

		if (savelable) {

		} else {
			alert("这个排班项名已存在，请更改为别的排班项名");
			seob.val('');
		}
	}
}
//lable框绑定事件
function lableChange() {
	var $oe = $(this);
	var lab = $oe.val();
	var lableNull = lab.replace(/[ ]/g, '');
	if ($.isNumeric(lab) || $.isNumeric(lableNull)) {

		if (lab.indexOf(" ") != -1) {
			alert("班时中不能含有空格");
			lab = lab.replace(/[ ]/g, '');
			$oe.val(lab);
		} else {
			lableZh = lab;
		}

	} else {
		alert("班时只能为数字，请输入数字");
		$oe.val(lableZh);
	}

}

//设置班次弹出层的保存按钮
function saveScheduleOption() {
	
	//遍历每一个select框 这是为了将选中的option的id值赋给它的父级的role值
	$('#weekpaiban').children().children('tr:gt(0)').children().children('select').each(function() {
		//定义变量为这个select框的子元素opiton
		var optionb = $(this).children();
		//循环option
		for(var i=0; i<optionb.length; i++){
			var schidb = $(this).children('option:eq('+i+')').attr('schid');
			//如果这个option选中的话
			if($(this).children('option:eq('+i+')').is(':selected')){
				$(this).attr('role', schidb);
			}
		}
	});
	
	
	//定义变量为布尔值true
	var la = true;
	//定义变量为item数组
	var paraNew = {
		'items': []
	};
	//定义变量为item数组
	var paraEdit = {
		'items': []
	};

	
	//遍历表格所有的tr
	$('#benciTab tr:gt(0)').each(function(index, dom) {
		//定义变量为这个tr
		var $ob = $(this);
		//定义变量为这个tr的第5个td的子元素的属性data-id的值
		var $id = $ob.children("td:eq(4)").children().attr('data-id');
		//定义变量为这个tr的第1个td的子元素的value
		var name = $ob.children("td:eq(0)").children().val();
		//定义变量为这个tr的第2个td的子元素的value
		var labelStr = $ob.children("td:eq(1)").children().val();
		//定义变量为第2个td的子元素的value
		var label = parseInt(labelStr);
		//定义变量update
		var update;
		
		//定义变量color
		var color;
		//如果这个tr的第3个td的子元素被选中
		if ($ob.children("td:eq(2)").children().is(":checked")) {
			//变量为1
			color = 1;
		//否则就是未被选中
		} else {
			//变量为0
			color = 0;
		}
		
		//定义变量used
		var used;
		//如果这个tr的第4个td的子元素input被选中
		if ($ob.children('td:eq(3)').children('input').is(':checked')) {
			//变量为true
			used = true;
		//否则就是未被选中
		} else {
			//变量为false
			used = false;
		}
		
		//如果第一个value为空 并且 第二个value为空
		if (name == '' || labelStr == '') {
			//变量为false
			la = false;
			//返回
			return false;
		}
		
		//如果第5个td的子元素的属性data-id的值为undefined
		if ($id == undefined) {
			//定义变量数组
			var pa = {
				'name': name,
				'lable': label,
				'color': color,
				'sure': true,
				'update': true,
				'used': used
			};
			//将变量数组推到变量paraNew.items数组里
			paraNew.items.push(pa);
			
		//否则 就是第5个td的子元素的属性data-id的值存在
		} else {
			//循环data.items数组
			for (i=0; i<schOption.length; i++) {
				//如果数组的id 等于 第5个td的子元素的属性data-id的值
				if (schOption[i].id == $id) {
					//变量为这个数组的update的值
					update = schOption[i].update;
				}
			}
			//定义变量数组
			var pa = {
				"id": $id,
				"name": name,
				"lable": label,
				"color": color,
				"sure": true,
				"update": update,
				"used": used
			};
			//将变量数组推到paraEdit.items数组
			paraEdit.items.push(pa);
		}
	});
	
	
	//合并数组
	paraAll.items = [];
	for (var i=0; i<paraNew.items.length; i++){
		paraAll.items.push(paraNew.items[i]);
	}
	for (var i=0; i<paraEdit.items.length; i++){
		paraAll.items.push(paraEdit.items[i]);
	}
	
	
	
	//提交数组到服务器
	$.ajax({
		url: wlanip + "/rest/workplan/planitems/v1/" + departId,
		type: 'POST',
		data: JSON.stringify(paraAll),
		dataType: 'json',
		contentType: 'application/json',
		beforeSend: function(xhr) {
			xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
		},
		success: function(data, status, xhr) {
			if (data.responseMsg == '1') {
				
				//获取排班数据
				$.ajax({
					type: 'GET',
					cache: false,
					url: wlanip + "/rest/workplan/planitems/v1/" + departId,
					beforeSend: function(xhr) {
						xhr.setRequestHeader('Authorization', 'Bearer ' + access_token);
					},
					success: function(data) {
						if (data.responseMsg == '1') {
							//================删除返回数据中重复的数据===========开始==========
							var n = {}, banciArr2 = [], len = data.items.length, val, type;
							for (var i = 0; i < data.items.length; i++) {
								val = data.items[i].name;
								type = typeof val;
								if (!n[val]) {
									n[val] = [type];
									banciArr2.push(data.items[i]);
								} else if (n[val].indexOf(type) < 0) {
									n[val].push(type);
									banciArr2.push(data.items[i]);
								}
							}
							//banciArr2就是删除重复数据后的data.items
							//================删除返回数据中重复的数据===========结束==========
							
							//先将全局变量数组清空
							dom.items = [];
							for (i=0; i<banciArr2.length; i++) {
								//如果data里的第i个items的used为true的时候
								//将data里的items推到全局变量json数组dom里的items数组里
								if (banciArr2[i].used) {dom.items.push(banciArr2[i])}
							}
							//全局变量dom的items数组为data.items
							
							
							//遍历每一个select框
							$('#weekpaiban').children().children('tr:gt(0)').children().children('select').each(function() {
								var oSelectRole = $(this).attr('role');
								//定义变量为这个select框的子元素opiton
								var option = $(this).children();
								//循环option
								for(var i=0; i<option.length; i++){
									var schIda = $(this).children('option:eq('+i+')').attr('schId');
									if(schIda == oSelectRole){
										$(this).children('option:eq('+i+')').siblings('option').remove();
									}else{
										$(this).children().remove();
									}
								}
								
								var w1 = '<option value="" schId="" selected></option>';
								for(var d=0; d<dom.items.length; d++){
									if(dom.items[d].used){
										if(dom.items[d].hope){
											if(dom.items[d].id == oSelectRole){
												w1 += '<option value="green" schId="'+dom.items[d].id+'" style="color:green;" selected>'+dom.items[d].name+'</option>';
											}else{
												w1 += '<option value="green" schId="'+dom.items[d].id+'" style="color:green;" selected>'+dom.items[d].name+'</option>';
											}
											
										}else{
											if(dom.items[d].id == oSelectRole){
												if (paraAll.items[d].color == 1) {
													w1 += '<option value="red" schId="'+dom.items[d].id+'" style="color:red;" selected>'+dom.items[d].name+'</option>';
												} else {
													w1 += '<option value="black" schId="'+dom.items[d].id+'" style="color: black;" selected>'+dom.items[d].name+'</option>';
												}
											}else{
												if (paraAll.items[d].color == 1) {
													w1 += '<option value="red" schId="'+dom.items[d].id+'" style="color:red;">'+dom.items[d].name+'</option>';
												} else {
													w1 += '<option value="black" schId="'+dom.items[d].id+'" style="color: black;">'+dom.items[d].name+'</option>';
												}
											}
										}
									}
								}
								$(this).append(w1);
                            });
							
							//==================更新排班表的select框==========结束=========
			
							alert("保存成功");
							$('#setBanci').prop('checked',false);

							
						}
					},
					error: function(textStatus, errorThrown) {
						alert(textStatus.responseJSON.error + "，请检查网络或服务器");
					}
				});
				
				
			}
		},
		Error: function(xhr, error, exception) {
			alert(exception.toString());
		}
	});
}


