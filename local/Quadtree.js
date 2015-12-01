// Adapted from http://gamedevelopment.tutsplus.com/tutorials/quick-tip-use-quadtrees-to-detect-likely-collisions-in-2d-space--gamedev-374
var Quadtree = function(plevel, pBounds){
	//Constants
	this.maxObjs = 10;
	this.maxLvls = 5;

	// Constructor code
	this.level = plevel;
	this.objects = [];
	this.bounds = pBounds;
	this.nodes = new Array(4);

	// Clears quadtree
	this.clear = function(){
		this.objects = [];
		for (var i = 0; i < this.nodes.length; i++) {
			if (this.nodes[i] !== undefined){
				this.nodes[i].clear();
				this.nodes[i] = undefined;
			}
		}
	};

	// splits quadtre into 4
	this.split = function(){
		var subWidth = ~~(this.bounds.width/2);
		var subHeight = ~~(this.bounds.height/2);
		var x = ~~this.bounds.x;
		var y = ~~this.bounds.y;

		this.nodes[0] = new Quadtree(this.level+1,{x: x+subWidth, y: y, width: subWidth, height: subHeight});
		this.nodes[1] = new Quadtree(this.level+1,{x: x, y: y, width: subWidth, height: subHeight});
		this.nodes[2] = new Quadtree(this.level+1,{x: x, y: y+subHeight, width: subWidth, height: subHeight});
		this.nodes[3] = new Quadtree(this.level+1,{x: x+subWidth, y: y+subHeight, width: subWidth, height: subHeight});
	};

	// finds the index/node an object belongs in, or -1 if it belongs in the parent
	this.getIndex = function(obj){
		var vMidPoint = this.bounds.x + (this.bounds.width/2);
		var hMidPoint = this.bounds.y + (this.bounds.height/2);

		var topQuad = (obj.y - obj.radius > hMidPoint);
		var bottomQuad = (obj.y + obj.radius < hMidPoint);

		if (obj.x + obj.radius < vMidPoint){
			if (topQuad){
				return 2;
			}else if (bottomQuad){
				return 1;
			}
		}else if (obj.x - obj.radius > vMidPoint){
			if (topQuad){
				return 3;
			}else if (bottomQuad){
				return 0;
			}
		}
		return -1;
	};

	// Inserts object into quadtree, splits if neccesary
	this.insert = function(obj){
		if (this.nodes[0] !== undefined){
			var index = this.getIndex(obj);

			if (index != -1){
				this.nodes[index].insert(obj);
				return;//Insertion complete
			}
		}

		this.objects[this.objects.length] = obj;

		if (this.objects.length > this.maxObjs && this.level < this.maxLvls){
			if (this.nodes[0] === undefined){
				this.split();
			}

			var i = 0;
			while(i < this.objects.length){
				var index = this.getIndex(this.objects[i]);
				if (index != -1){
					this.nodes[index].insert(this.objects[i]);
					this.objects.splice(i,1);
				}else{
					i++;
				}
			}
		}
	};

	this.retrieve = function(returnObjs, obj){
		var index = this.getIndex(obj);
		if (index != -1 && this.nodes[0] !== undefined){
			returnObjs = returnObjs.concat(this.nodes[index].retrieve(returnObjs, obj));
		}
		returnObjs = returnObjs.concat(this.objects);
		return returnObjs;
	};

};
module.exports.Quadtree = Quadtree;
