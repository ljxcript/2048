
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
	return colorMapping[this.value];
}

var squareContainer = new Array(row);
for (var ii = 0; ii < row; ii++) {
	squareContainer[ii] = new Array(column);
}



window.onload = function () {
	
	initBackground();//初始化游戏背景
	
	initDataStructAndDom();//初始化代表方块的数据结构以及方块本身
	
	init_value2_sq(2);//游戏刚开始产生两个值为2的方块
	
	init_event_attachment();//初始化事件绑定
	
	
	init_mobile_event();
}






function initDataStructAndDom() {
	//初始化数据结构以及对应的视图方块
	var tempE = document.createDocumentFragment();
	for (var i = 0; i < row; i++) { 
		for (var j = 0; j < column; j++) {
			var sq = new window.square(j * 110, i * 110);
			squareContainer[i][j] = sq;
			tempE.appendChild(createElementSquare(sq, i, j));
		}
	}
	document.getElementsByClassName("container")[0].appendChild(tempE);	
}

			


function initBackground () {
	//初始化背景方块，这个在后期需要去掉，换成耦合性更低的做法
	var tempE = document.createDocumentFragment();
	for (var i = 0; i < row; i++) { 
		for (var j = 0; j < column; j++) {
			var sqbk = document.createElement("div");
			sqbk.setAttribute("class", "square_base square_bk");
			sqbk.style.transform = "translate3d(" + i*110 + "px," + j*110 + "px, 0)";
			sqbk.style.webkitTransform = "translate3d(" + i*110 + "px," + j*110 + "px, 0)";
			tempE.appendChild(sqbk);
		}
	}
	document.getElementsByClassName("container")[0].appendChild(tempE);		
}

function init_value2_sq (times) {
	for (var i = 0; i < times; i++) 
		random_square(2);
}

function init_event_attachment () {
	console.log('initializing event attachment......');
	document.body.addEventListener('keyup', move_squares);
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
	
	
	domElement.innerText = sq.value === 0? "" : sq.value;	
	domElement.style.backgroundColor = sq.getColor();
	domElement.style.transform = "translate3d(" + sq.posX + "px," + sq.posY + "px, 0)";
	domElement.style.webkitTransform = "translate3d(" + sq.posX + "px," + sq.posY + "px, 0)";
}

function random_square (value) {

	//随机在empty的方块上产生一个“value(2,4,8...)”方块
	var r = Math.floor(Math.random()*4), c = Math.floor(Math.random()*4);
	while (squareContainer[r][c].value !== 0) {
		if (isFailed()) {alert('你输了！');return;}
		r = Math.floor(Math.random()*4);
		c = Math.floor(Math.random()*4);
	}
	//将数据结构中的方块的值改为value
	squareContainer[r][c].value = value;
	
	//找到dom元素中的对应元素，并调用modifyAttribute函数对其类名，样式进行更新
	var target = document.getElementsByClassName("square_" + r + "_" + c)[0];
	modifyAttributes(target, r, c, squareContainer[r][c]);
}

function move_squares (e) {
	for (var i = 0; i < row; i++) {
		for (var j = 0; j < column; j++) {
			switch(e.keyCode){
				case 37:
					//这是按下左方向的处理过程，从最左一列到最右一列从上到下遍历方块
					if (squareContainer[j][i].value !== 0) {
						var tempC = i;
						var toMerge = false;
						while ( tempC - 1 >= 0 && squareContainer[j][tempC-1].value === 0) {
							tempC--;
						}
					
						if (tempC - 1 >= 0 && squareContainer[j][tempC-1].value === squareContainer[j][i].value && !squareContainer[j][tempC-1].isMerged) {
							tempC--;
							toMerge = true;
						}
						if (tempC !== i) {
							if (toMerge) {//这次移动是否发生了合并，如果发生了，更新数值之后再进行位置交换
								squareContainer[j][i].value *= 2; 
								squareContainer[j][tempC].value = 0;
								squareContainer[j][tempC].isMerged = true;
							}
							//可以移动，交换数据结构中方块的value
							swapSquareData(j, i, j, tempC);
							//交换视图中的dom元素跟数据结构同步
							swapSquareDom(j, i, j, tempC);
						}
					}
					break;
				case 38:
					//这是按下上方向的处理过程，从最上一行到最下一行从左到右遍历方块
					if (squareContainer[i][j].value !== 0) {
						var tempR = i;
						var toMerge = false;
						while ( tempR - 1 >= 0 && squareContainer[tempR-1][j].value === 0) {
							tempR--;
						}
					
						if (tempR - 1 >= 0 && squareContainer[tempR - 1][j].value === squareContainer[i][j].value && !squareContainer[tempR - 1][j].isMerged) {
							tempR--;
							toMerge = true;
						}
						if (tempR !== i) {
							if (toMerge) {//这次移动是否发生了合并，如果发生了，更新数值之后再进行位置交换
								squareContainer[i][j].value *= 2; 
								squareContainer[tempR][j].value = 0;
								squareContainer[tempR][j].isMerged = true;
							}
							//可以移动，交换数据结构中方块的value
							swapSquareData(i, j, tempR, j);
							//交换视图中的dom元素跟数据结构同步
							swapSquareDom(i, j, tempR, j);
						}						
					}
					break;
				case 39:
					//这是按下右方向的处理过程，从最右一列到最左一列从上到下遍历方块
					if (squareContainer[j][column - i - 1].value !== 0) {
						var tempC = column - i - 1;
						var toMerge = false;
						while ( tempC + 1 < column  && squareContainer[j][tempC+1].value === 0) {
							tempC++;
						}
					
						if (tempC + 1 < column && squareContainer[j][tempC+1].value === squareContainer[j][column - i - 1].value && !squareContainer[j][tempC+1].isMerged) {
							tempC++;
							toMerge = true;
						}
						if (tempC !== column - i - 1) {
							if (toMerge) {//这次移动是否发生了合并，如果发生了，更新数值之后再进行位置交换
								squareContainer[j][column - i - 1].value *= 2; 
								squareContainer[j][tempC].value = 0;
								squareContainer[j][tempC].isMerged = true;
							}
							//可以移动，交换数据结构中方块的value
							swapSquareData(j, column - i - 1, j, tempC);
							//交换视图中的dom元素跟数据结构同步
							swapSquareDom(j, column - i - 1, j, tempC);
						}						
					}
		    		break;
				case 40:
					//这是按下下方向的处理过程，从最下一行到最上一行从左到右遍历方块
					if (squareContainer[row - i - 1][j].value !== 0) {
						var tempR = row - i - 1;
						var toMerge = false;
						while ( tempR + 1 < row && squareContainer[tempR + 1][j].value === 0) {
							tempR++;
						}
					
						if (tempR + 1 < row && squareContainer[tempR + 1][j].value === squareContainer[row - i - 1][j].value && !squareContainer[tempR + 1][j].isMerged) {
							tempR++;
							toMerge = true;
						}
						if (tempR !== row - i - 1) {
							if (toMerge) {//这次移动是否发生了合并，如果发生了，更新数值之后再进行位置交换
								squareContainer[row - i - 1][j].value *= 2; 
								squareContainer[tempR][j].value = 0;
								squareContainer[tempR][j].isMerged = true;
							}
							//可以移动，交换数据结构中方块的value
							swapSquareData(row - i - 1, j, tempR, j);
							//交换视图中的dom元素跟数据结构同步
							swapSquareDom(row - i - 1, j, tempR, j);
						}							
					}
					break;
			}
		}
	}
	setTimeout(random_square, 400, 2);
	clearMergedFlags();
}

function swapSquareData (ar, ac, br, bc) {
	var tempS = squareContainer[ar][ac].value;
	squareContainer[ar][ac].value = squareContainer[br][bc].value;
	squareContainer[br][bc].value = tempS;
	//
}

function swapSquareDom (ar, ac, br, bc) {
	var sa = document.getElementsByClassName("square_" + ar + "_" + ac)[0];
	var sb = document.getElementsByClassName("square_" + br + "_" + bc)[0];
	modifyAttributes(sa, br, bc, squareContainer[br][bc]);
	modifyAttributes(sb, ar, ac, squareContainer[ar][ac]);
	
}

function clearMergedFlags () {
	squareContainer.forEach(function (item, index, array) {
		item.forEach(function (it, ind, array) {
			it.isMerged = false;
			
		})
		
	})
}


function isFailed () {
	return squareContainer.every(function (item, index, array) {
		return item.every(function (it, ind, ar) {
			return it.value !== 0;
		})
		
	});
}

