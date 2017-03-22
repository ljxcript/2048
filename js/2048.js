
var row = 4;
var column = 4;

var colorMapping = {
	0: "rgb(205,193,180)",
	2: "rgb(238, 228, 218)",
	4: "rgb(236, 224, 201)",
	8: "rgb(242, 177, 121",
	16: "rgb(244, 148, 101)",
	32: "rgb(245, 124, 95)",
	64: "rgb(249, 93, 48)",
	128: "rgb(237, 208, 107)",
	256: "rgb(237, 206, 88)",
	512: "rgb(239, 202, 65)",
	1024: "rgb(220, 185, 47)",
	2048: "rgb(238, 197, 25)"
}

function square (x, y) {
	this.value = 0;
	this.posX = x;
	this.posY = y;
	this.isMerged = false;	
}

square.prototype.getCusClass = function() {
	return this.value === 0? "square_empty" : "square_tile";
}

square.prototype.getColor = function () {
	console.log(colorMapping[this.value]);
	return colorMapping[this.value];
}

var squareContainer = new Array();



window.onload = function () {
	initBackground();
	initDataStructAndDom();
	init_value2_sq(2);//游戏刚开始产生两个值为2的方块
}



function initDataStructAndDom() {
	//初始化数据结构以及对应的视图方块
	var tempE = document.createDocumentFragment();
	for (var i = 0; i < row; i++) { 
		var tempArray = new Array();
		for (var j = 0; j < column; j++) {
			var sq = new window.square(i * 110, j * 110);
			tempArray.push(sq);

			tempE.appendChild(createElementSquare(sq));
		}
		squareContainer.push(tempArray);
	}
	document.getElementsByClassName("container")[0].appendChild(tempE);	
}
			


function initBackground () {
	//初始化背景方块，这个在后期需要去掉，换成耦合性更低的做法
	var tempE = document.createDocumentFragment();
	for (var i = 0; i < row; i++) { 
		for (var j = 0; j < column; j++) {
			var sq = new window.square(i * 110, j * 110);
			tempE.appendChild(createElementSquare(sq, i, j));
		}
	}
	document.getElementsByClassName("container")[0].appendChild(tempE);		
}

function init_value2_sq (times) {
	for (var i = 0; i < times; i++) 
		random_square(2);
}


function createElementSquare (sq, r, c) {
	//这个函数是专门用来创建视图方块的，在游戏初始化的时候被调用row*column次
	var square = document.createElement("div");
	modifyAttributes(square, r, c, sq);
	return square;
}


function modifyAttributes (domElement, r, c, sq) {
	//需要传入dom元素， 行、列下标（改变类名方可将dom元素和squareContainer中的下标对应，进行视图和数据结构的映射）
	//由于在初始化游戏的时候，squareContianer和dom是在同步初始的，因此直接根据下标来找會出现undefined的错误，因此多传入一个square实例来获取数据属性
	domElement.setAttribute("class", "square_base" + " " + sq.getCusClass() + " square_" + r + "_" + c);
	
	
	domElement.style.transform = "translate3d(" + sq.posX + "px," + sq.posY + "px, 0)";
	domElement.style.webkitTransform = "translate3d(" + sq.posX + "px," + sq.posY + "px, 0)";
	domElement.style.backgroundColor = sq.getColor();
	domElement.innerText = sq.value === 0? "" : sq.value;	
}

function random_square (value) {
	//随机在empty的方块上产生一个“value(2,4,8...)”方块
	var r = Math.floor(Math.random()*4), c = Math.floor(Math.random()*4);
	while (squareContainer[r][c].value !== 0) {
		r = Math.floor(Math.random()*4);
		c = Math.floor(Math.random()*4);
	}
	//将数据结构中的方块的值改为value
	squareContainer[r][c].value = value;
	
	//找到dom元素中的对应元素，并调用modifyAttribute函数对其类名，样式进行更新
	var target = document.getElementsByClassName("square_" + r + "_" + c)[0];
	modifyAttributes(target, r, c, squareContainer[r][c]);
}

