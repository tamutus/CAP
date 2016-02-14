'use strict';

angular.module('capApp')
  .controller('BuilderCtrl', function ($scope, $http, socket, $stateParams, $state) {
    
    $scope.risks = [];
    $scope.focused = {};
    $scope.addedRisk = {};
    $scope.root = {};
    $scope.graph = {};
    $scope.edges = [];
    $scope.results = [];
    var arbor = window.arbor;
    $scope.debugging = true;
    $scope.framesDrawn = 0;
    
    $http.get('/api/issues').then(function(issues){
        $scope.issues = issues.data;
        socket.syncUpdates('issue', $scope.issues);
    }); 

// socket.syncUpdates('issuegraph', $scope.issues); // How do get a scope variable synced to an array in a specific document?  Or how do you set up socket without downloading all docs?

    // if($state.includes('index')){
        $http.get('/api/risks').then(function(risks){
        	$scope.risks = risks.data;
        	socket.syncUpdates('risk', $scope.risks);
        });
    // }

    if($state.includes('risk')){
        $http.get('/api/risks/' + $stateParams.root).then(function(root){
            $scope.formTree(root.data);
        });
    }

    if($state.includes('issue')){
        $http.get('/api/issues/' + $stateParams.root).then(function(root){
            $scope.formTree(root.data);
        });
    }

    // arbor.js functionality
//
//  main.js
//
//  A project template for using arbor.js
//

    $scope.arborize = function($){
      if($scope.debugging){console.log('Calling arborize($)');}
      
      var Renderer = function(elt){
        if($scope.debugging){console.log('creating new Renderer');}
        var canvas = $(elt).get(0),
            // dom = $(elt),
            ctx = canvas.getContext('2d'),
            gfx = arbor.Graphics(canvas),
            sys = null;
        
        var that = {
          init:function(system){
            //
            // the particle system will call the init function once, right before the
            // first frame is to be drawn. it's a good place to set up the canvas and
            // to pass the canvas size to the particle system
            //
            // save a reference to the particle system for use in the .redraw() loop
            sys = system;

            // inform the system of the screen dimensions so it can map coords for us.
            // if the canvas is ever resized, screenSize should be called again with
            // the new dimensions
            sys.screenSize(canvas.width, canvas.height); 
            sys.screenPadding(80); // leave an extra 80px of whitespace per side
            
            // set up some event handlers to allow for node-dragging
            that.initMouseHandling();
          },
          
          redraw:function(){
            // 
            // redraw will be called repeatedly during the run whenever the node positions
            // change. the new positions for the nodes can be accessed by looking at the
            // .p attribute of a given node. however the p.x & p.y values are in the coordinates
            // of the particle system rather than the screen. you can either map them to
            // the screen yourself, or use the convenience iterators .eachNode (and .eachEdge)
            // which allow you to step through the actual node objects but also pass an
            // x,y point in the screen's coordinate system
            // 
            if (!sys){return;}

            gfx.clear(); // clears the canvas
            var nodeBoxes = [];
            
            //draw the edges
            // var maxWeight = particleSystem.getEdges(); (TO DO - make weights relative to heaviest weighted edge)
            sys.eachEdge(function(edge, pt1, pt2){
                // var weight = edge.data.weight;
                // var color = edge.data.color;
                
                // if (!color || (''+color).match(/^[ \t]*$/)){ color = null; }

                gfx.line(pt1, pt2, {stroke:'#b2b19d', width:2});

                // //find start point
                // var tail = intersectLineBox(pt1, pt2, nodeBoxes[edge.source.name]);
                // var head = intersectLineBox(tail, pt2, nodeBoxes[edge.target.name]);

                // ctx.save();
                //     ctx.beginPath();
                //     ctx.lineWidth = (!isNaN(weight)) ? parseFloat(weight) : 1;
                //     ctx.strokeStyle = (color) ? color : '#cccccc';
                //     ctx.fillStyle = null;

                //     ctx.moveTo(tail.x, tail.y);
                //     ctx.lineTo(head.x, head.y);
                //     ctx.stroke();
                // ctx.restore();

                // find center of edge
                var midpoint = { x:(pt1.x+pt2.x)/2, y:(pt1.y+pt2.y)/2 };
                midpoint.x = Math.floor(midpoint.x);
                midpoint.y = Math.floor(midpoint.y);

                // update button locations
                edge.upButton.location.x=midpoint.x-30;
                edge.upButton.location.y=midpoint.y;

                edge.downButton.location.x=midpoint.x+30;
                edge.downButton.location.y=midpoint.y;

                // draw boxes for upvote/downvote links on each edge,
                // and put links 
                ctx.save();
                    
                    ctx.font = '12px Georgia';
                    ctx.textAlign = 'center';
                    
                    ctx.fillStyle = 'blue';
                    ctx.fillRect(midpoint.x-40, midpoint.y-10, 20, 20);
                    
                    ctx.fillStyle = 'white';
                    ctx.fillText('+', midpoint.x-30, midpoint.y+4);
                    
                    ctx.fillStyle = 'red';
                    ctx.fillRect(midpoint.x+20, midpoint.y-10, 20, 20);

                    ctx.fillStyle = 'white';
                    ctx.fillText('-', midpoint.x+30, midpoint.y+4);

                ctx.restore();

                // draw an arrowhead if this is a -> style edge
                // if (edge.data.directed){
                //     ctx.save();
                //         // move to the head position of the edge we just drew
                //         var wt = !isNaN(weight) ? parseFloat(weight) : 1;
                //         var arrowLength = 6 + wt;
                //         var arrowWidth = 2 + wt;
                //         ctx.fillStyle = (color) ? color : '#cccccc';
                //         ctx.translate(head.x, head.y);
                //         ctx.rotate(Math.atan2(head.y - tail.y, head.x - tail.x));

                //         // delete some of the edge that's already there (so the point isn't hidden)
                //         ctx.clearRect(-arrowLength/2,-wt/2, arrowLength/2,wt);

                //         // draw the chevron
                //         ctx.beginPath();
                //         ctx.moveTo(-arrowLength, arrowWidth);
                //         ctx.lineTo(0, 0);
                //         ctx.lineTo(-arrowLength, -arrowWidth);
                //         ctx.lineTo(-arrowLength * 0.8, -0);
                //         ctx.closePath();
                //         ctx.fill();
                //     ctx.restore();
                // }

            });
            
            sys.eachNode(function(node, pt){
                // node: {mass:#, p:{x,y}, name:"", data:{}}
                // pt:   {x:#, y:#}  node position in screen coords

                // determine the box size and round off the coords if we'll be 
                // drawing a text label (awful alignment jitter otherwise...)
                var label = node.data.name||'';
                var w = ctx.measureText('' + label.substr(0,16)).width + 10;
                if(!('' + label).match(/^[ \t]*$/)){
                    pt.x = Math.floor(pt.x);
                    pt.y = Math.floor(pt.y);
                }
                else{
                    label = null;
                }

                
                //fill with node's color, or else go for white.
                if(node.data.color){ctx.fillStyle = node.data.color;}
                else{ctx.fillStyle = 'rgba(0,0,0,.2)';}
                
                if(node.data.color === 'white'){ctx.fillStyle = 'white';}

                if(node.data.shape === 'dot'){
                    gfx.oval(pt.x-w/2, pt.y-w/2, w,w, {fill:ctx.fillStyle});
                    nodeBoxes[node.name] = [pt.x-w/2, pt.y-w/2, w, w];
                }
                else{
                    gfx.rect(pt.x-w/2, pt.y-10, w,20, 4, {fill:ctx.fillStyle});
                    nodeBoxes[node.name] = [pt.x-w/2, pt.y-11, w, 22];
                }

                //draw text
                if(label){
                    ctx.font = '12px Georgia';
                    ctx.textAlign = 'center';
                    ctx.fillStyle = 'white';
                    if(node.data.color === 'none'){ctx.fillStyle = '#333333';}
                    ctx.fillText(label.substr(0, 16)||'', pt.x, pt.y+4);
                    ctx.fillText(label.substr(0, 16)||'', pt.x, pt.y+4);
                }
            });

            
          }, //end of redraw
          
          // activate:function(activated){
          //   var parent = sys.getEdgesFrom(activated)[0].source;
          //   var children = $.map(sys.getEdgesFrom(activated), function(edge){
          //       return edge.target;
          //   });

          //   sys.eachNode(function(node){
          //       var nowVisible = ($.inArray(node, children)>=0),
          //           newAlpha = (nowVisible) ? 1 : 0,
          //           dt = (nowVisible)? 0.5 : 0.5;
          //       sys.tweenNode(node, dt, {alpha:newAlpha});

          //       if(newAlpha===1){
          //           node.p.x = parent.p.x + 0.5*Math.random() - 0.025;
          //           node.p.y = parent.p.y + 0.5*Math.random() - 0.025;
          //           node.tempMass = 0.001;
          //       }
          //   });
          // },

          initMouseHandling:function(){
            // no-nonsense drag and drop (thanks springy.js)
            var selected = null,
                nearest = null,
                _mouseP = null,
                dragged = null,
                s,
                pos;
                // oldmass = 1,
                // _section = null;

            // set up a handler object that will initially listen for mousedowns then
            // for moves and mouseups while dragging
            // 
            // ***also takes into account the buttons that I set up in $scope.buttonSys
            var handler = {
              
              moved:function(e){
                // if($scope.debugging){console.log('\'moved\' is active.');}
                pos = $(canvas).offset();
                _mouseP = arbor.Point(e.pageX-pos.left, e.pageY-pos.top);
                if(sys && sys.nearest(_mouseP)){
                    nearest =   ($scope.buttonSys.buttons.length===0 || 
                                sys.nearest(_mouseP).distance<$scope.buttonSys.nearest(_mouseP).distance) ? 
                                sys.nearest(_mouseP) : $scope.buttonSys.nearest(_mouseP);
                }
                else{ return false; }
                
                if(nearest && nearest.distance){
                    selected = (nearest.distance < 20) ? nearest : null;
                    if(selected && selected.button){document.body.style.cursor = 'pointer';}
                    else{document.body.style.cursor = 'auto';}
                    
                    if(nearest.node && nearest.distance < 50){
                        selected = nearest;
                    }
                }
                // if(nearest.node && _.find($scope.edges, function(n){return n.vertex = nearest.node.data._id;})) { //check whether "nearest" is in $scope's tree
                //     if(nearest.node.name != _section){
                //         _section = nearest.node.name;
                //         that.activate(_section);
                //     }
                //     // dom.removeClass('linkable');
                //     window.status = '';
                // }

                return false;
              },

              clicked:function(e){
                // if($scope.debugging){console.log('\'clicked\' is active.');}
                var pos = $(canvas).offset();
                _mouseP = arbor.Point(e.pageX-pos.left, e.pageY-pos.top);
                if(sys.nearest(_mouseP)){
                    nearest =   (!$scope.buttonSys.nearest(_mouseP) || 
                                sys.nearest(_mouseP).distance<$scope.buttonSys.nearest(_mouseP).distance) ? 
                                sys.nearest(_mouseP) : $scope.buttonSys.nearest(_mouseP);
                }
                if (selected && selected.button ){
                    $scope.buttonSys.pushButton(selected.button);
                }
                else{ dragged = nearest; }
                // if(nearest && selected &&  nearest.node!==selected.node){
                //     var link = selected.node.data.path;
                //     if(link.match(/^#/)){
                //         $(that).trigger({type:"navigate", path:link.substr(1)});
                //     }
                //     else{
                //         window.location = link;
                //     }
                //     return false;
                // }

                if (dragged && dragged.node){
                  // while we're dragging, don't let physics move the node
                  dragged.node.fixed = true;
                }

                $(canvas).unbind('mousemove', handler.moved);
                $(canvas).bind('mousemove', handler.dragged);
                $(window).bind('mouseup', handler.dropped);

                return false;
              },
              doubleClicked: function(e){
                var pos = $(canvas).offset();
                _mouseP = arbor.Point(e.pageX-pos.left, e.pageY-pos.top);
                nearest =   (sys.nearest(_mouseP).distance<$scope.buttonSys.nearest(_mouseP).distance) ? 
                            sys.nearest(_mouseP) : $scope.buttonSys.nearest(_mouseP);
                if (selected && selected.node){
                    $scope.makeIssue(selected.node.data);
                }
              },
              dragged:function(e){
                // if($scope.debugging){console.log('\'dragged\' is active.');}
                // var old_nearest = nearest && nearest.node && nearest.node._id,
                    var pos = $(canvas).offset();
                    s = arbor.Point(e.pageX-pos.left, e.pageY-pos.top);

                if(!nearest){
                    return;
                }
                if (dragged && dragged.node){
                  var p = sys.fromScreen(s);
                  dragged.node.p = p;
                }

                return false;
              },

              dropped:function(e){
                // if($scope.debugging){console.log('\'dropped\' is active.');}
                // if (!dragged || !dragged.node){return;}
                if (dragged && dragged.node){
                    dragged.node.fixed = false;
                    dragged.node.tempMass = 1000;
                }
                dragged = null;
                
                $(canvas).unbind('mousemove', handler.dragged);
                $(window).unbind('mouseup', handler.dropped);
                $(canvas).bind('mousemove', handler.moved);
                _mouseP = null;
                return false;
              }

            };
            
            // start listening
            $(canvas).mousedown(handler.clicked);
            $(canvas).mousemove(handler.moved);
            $(canvas).dblclick(handler.doubleClicked);

          } //end of initMouseHandling

        }; //end of "that"

        // helpers for figuring out where to draw arrows (thanks springy.js)
        // var intersectLineLine = function(p1, p2, p3, p4){
        //     var denom = ((p4.y - p3.y)*(p2.x - p1.x) - (p4.x - p3.x)*(p2.y - p1.y));
        //     if (denom === 0) { return false; } // lines are parallel
        //     var ua = ((p4.x - p3.x)*(p1.y - p3.y) - (p4.y - p3.y)*(p1.x - p3.x)) / denom;
        //     var ub = ((p2.x - p1.x)*(p1.y - p3.y) - (p2.y - p1.y)*(p1.x - p3.x)) / denom;

        //     if (ua < 0 || ua > 1 || ub < 0 || ub > 1) { return false; }
        //     return arbor.Point(p1.x + ua * (p2.x - p1.x), p1.y + ua * (p2.y - p1.y));
        // };

        // var intersectLineBox = function(p1, p2, boxTuple){
        //     var p3 = {x:boxTuple[0], y:boxTuple[1]},
        //         w = boxTuple[2],
        //         h = boxTuple[3];

        //     var tl = {x: p3.x, y: p3.y};
        //     var tr = {x: p3.x + w, y: p3.y};
        //     var bl = {x: p3.x, y: p3.y + h};
        //     var br = {x: p3.x + w, y: p3.y + h};

        //     return  intersectLineLine(p1, p2, tl, tr) ||
        //             intersectLineLine(p1, p2, tr, br) ||
        //             intersectLineLine(p1, p2, br, bl) ||
        //             intersectLineLine(p1, p2, bl, tl) ||
        //             false;
        // };    
 
        return that;
      }; //end of Renderer    

      
      // var Nav = function(elt){
      //   var dom = $(elt)

      //   var _path = null
        
      //   var that = {
      //     init:function(){
      //       $(window).bind('popstate',that.navigate);
      //       dom.find('> a').click(that.back);
      //       $('.more').one('click',that.more);
            
      //       $('#docs dl:not(.datastructure) dt').click(that.reveal);
      //       that.update();
      //       return that;
      //     },
      //     more:function(e){
      //       $(this).removeAttr('href').addClass('less').html('&nbsp;').siblings().fadeIn();
      //       $(this).next('h2').find('a').one('click', that.less);
            
      //       return false
      //     },
      //     less:function(e){
      //       var more = $(this).closest('h2').prev('a');
      //       $(this).closest('h2').prev('a')
      //       .nextAll().fadeOut(function(){
      //         $(more).text('creation & use').removeClass('less').attr('href','#');
      //       })
      //       $(this).closest('h2').prev('a').one('click',that.more);
            
      //       return false;
      //     },
      //     reveal:function(e){
      //       $(this).next('dd').fadeToggle('fast');
      //       return false;
      //     },
      //     back:function(){
      //       _path = "/";
      //       if (window.history && window.history.pushState){
      //         window.history.pushState({path:_path}, "", _path);
      //       }
      //       that.update();
      //       return false;
      //     },
      //     navigate:function(e){
      //       var oldpath = _path;
      //       if (e.type==='navigate'){
      //         _path = e.path;
      //         if (window.history && window.history.pushState){
      //            window.history.pushState({path:_path}, "", _path);
      //         }else{
      //           that.update();
      //         }
      //       }else if (e.type==='popstate'){
      //         var state = e.originalEvent.state || {};
      //         _path = state.path || window.location.pathname.replace(/^\//,'');
      //       }
      //       if (_path !== oldpath) that.update();
      //     },
      //     update:function(){
      //       var dt = 'fast';
      //       if (_path===null){
      //         // this is the original page load. don't animate anything just jump
      //         // to the proper state
      //         _path = window.location.pathname.replace(/^\//,'');
      //         dt = 0;
      //         dom.find('p').css('opacity',0).show().fadeTo('slow',1);
      //       }

      //       switch (_path){
      //         case '':
      //         case '/':
      //         dom.find('p').text('a graph visualization library using web workers and jQuery')
      //         dom.find('> a').removeClass('active').attr('href','#')

      //         $('#docs').fadeTo('fast',0, function(){
      //           $(this).hide()
      //           $(that).trigger({type:'mode', mode:'visible', dt:dt})
      //         })
      //         document.title = "arbor.js"
      //         break
              
      //         case 'introduction':
      //         case 'reference':
      //         $(that).trigger({type:'mode', mode:'hidden', dt:dt})
      //         dom.find('> p').text(_path)
      //         dom.find('> a').addClass('active').attr('href','#')
      //         $('#docs').stop(true).css({opacity:0}).show().delay(333).fadeTo('fast',1)
                        
      //         $('#docs').find(">div").hide()
      //         $('#docs').find('#'+_path).show()
      //         document.title = "arbor.js Â» " + _path
      //         break
      //       }
            
      //     }
      //   }
      //   return that
      // }

      $(document).ready(function(){
        // if($scope.debugging){console.log('Document is ready. Executing $().ready code');}
        
        var sys = arbor.ParticleSystem(500, 600, 0.5); // create the system with sensible repulsion/stiffness/friction
        sys.parameters({gravity:true}); // use center-gravity to make the graph settle nicely (ymmv)
        sys.renderer = new Renderer('#viewport'); // our newly created renderer will have its .init() method called shortly by sys...
        $scope.sys = sys;

        // var nav = Nav('#nav');
        // $(sys.renderer).bind('navigate', nav.navigate);
        // $(nav).bind('mode', sys.renderer.switchMode);
        // nav.init();

      }); // closes document ready function
      if($scope.debugging){ console.log('Exiting arborize'); }
    }; //end of $scope.arborize

    $scope.buttonSys = {
        
        buttons: [], // a button has the form {edge, direction, label}
        
        addButton: function(edge, direction, location){
            var newButton = {edge: edge, direction: direction, location: location, isButton: true};
            this.buttons.push(newButton);
            return newButton;
        },
        deleteButtonPair: function(edge){
            this.buttons.splice(_.findIndex(this.buttons, function(button){
                return button.edge===edge;
            }), 2);
        },
        getButton: function(source, target, direction){
            _.find(this.buttons, function(button){
                return button.edge.source.name===source && button.edge.target.name===target && button.direction===direction;
            });
        },
        eachButton: function(callback){
            for(var i=0; i<this.buttons.length; i++){
                callback(this.buttons[i], this.buttons[i].location); // f(button, Pt)
            }
        },
        distance: function(a, b){ //a and b are points.  Returns distance.
            return Math.sqrt(Math.pow(a.x-b.x, 2)+Math.pow(a.y-b.y, 2));
        },
        nearest: function(_mouseP){ // takes an arbor Point, returns {nearestButton, point, distance})
            if(this.buttons.length===0){return null;}
            var match;
            this.eachButton(function(button, pt){
                var dis = $scope.buttonSys.distance(_mouseP, pt);
                if(!match || dis < match.distance){ match={button: button, p: pt, distance: dis}; }
            });
            
            return match;
        },
        pushButton: function(button){
            if(button.direction==='up'){
                $scope.connectIssue(button.edge.source.data, button.edge.target.data);
            }
            if(button.direction==='down'){
                $scope.detachIssue(button.edge.source.data, button.edge.target.data);
            }
        }
    };

    // $scope.arborizeTree = function (root, edges){
    //     root
    // };

    $scope.formTree = function(root){
        if(!root.name){return;}

        $scope.root = root;

        if($scope.debugging){console.log('Calling formTree(root) on ' + root.name);}
        if(!$scope.sys){ $scope.arborize($); }
        // if(false && $scope.sys){
        //     if($scope.debugging){ console.log('scope.sys evaluated to true.  The nodes are:'); }
        //     if($scope.debugging){ $scope.sys.eachNode(function(node, pt){console.log(node.name + ' at ' + pt.x +' '+ pt.y);}); }
        //     $scope.sys.prune(function(node, from, to){return true;});
        //     $scope.buttonSys.buttons=[];
        //     // console.log('after pruning all nodes, nodes are:');
        //     // $scope.sys.eachNode(function(node, pt){console.log(node.name);});
        // }
        var parent = $scope.sys.getNode(root.name);
        var rootNode = parent? parent : $scope.sys.addNode(root.name, root);
        rootNode.data.color = 'purple';
        rootNode.data.shape = 'dot';
        // if($scope.debugging){ 
        //     console.log(rootNode.name + ' is the root node. Adding leaves:'); 
        // }
        
        if($scope.edges.length===0){
            if($scope.debugging){console.log('$scope.edges.length===0. root.issues = ' + root.issues);}
            $http.get('/api/issuegraphs/' + root.issues).then(function(issuesPromise){
                var issues = issuesPromise.data;
                
                $scope.graph = issues;
                if($scope.debugging){console.log('before newLeafFromEdge for-loop, issues = '); console.log(issues);}
                
                $scope.edges = issues.edges;
                if($scope.debugging){console.log('before newLeafFromEdge for-loop, issues.edges = '); console.log(issues.edges);}
                
                for(var i = 0; i < 5 && i < issues.edges.length; i++){
                    $scope.newLeafFromEdge(i);
                }
            });
        }
        else{ $scope.updateEdges(root); }
    };

    $scope.updateEdges = function(root){
        console.log('Calling updateEdges on ' + root);
        var branches = [];
        $http.get('/api/issuegraphs/' + root.issues).then(function(issues){
            issues = issues.data;
            $scope.graph = issues;
            $scope.edges = issues.edges;
            branches = $scope.sys.getEdgesFrom($scope.sys.getNode(root.name)); //store current edges from root in "branches"
            var iterations = 5 < issues.edges.length ? 5 : issues.edges.length;
            $scope.updateNextEdge(branches, 0, iterations);
        });
    };
    
    // make sure each issuegraph edge is in temp array branches.  If a match is made, remove the edge from temp array branches
    // if, for an issuegraph edge, no match is made with branches, add it to the system
    $scope.updateNextEdge = function(branches, current, last){
        if($scope.debugging){
            console.log('Calling updateNextEdge. Current = '+current+'. Last = '+last+'. Edges in "branches" are:');
            for(var n = 0; n < branches.length; n++){
                console.log(branches[n]);
            }
            console.log('Checking whether edge ' + current + ' is in branches...');
        }

        $http.get('/api/issues/id/' + $scope.edges[current].vertex).then(function(issue){
            issue = issue.data;
            $scope.edges[current].leaf=issue;
            var found = _.findIndex(branches, function(branch){
               return branch.target.name===issue.name;
            });
            if(found>-1){
                branches[found].weight=$scope.edges[current].weight;
                if($scope.debugging){ console.log(issue.name + ' found match at position ' + found + ' with ' + branches[found]); }
                branches.splice(found, 1);
            }
            else{
                if($scope.debugging){ console.log('no match found.'); }
                $scope.newLeafFromEdge(current);
            }

            if($scope.debugging){ 
                console.log('After splicing, these branches remain:'); 
                console.log(branches); 
            }
        }).then(function(){
            current++;
            if(current<last){
                $scope.updateNextEdge(branches, current, last);
            }
            else{
                // after making sure top five edges are in the sys, remove the rest that are still referenced in branches
                $scope.removeOldBranches(branches);
            }
        });
    };

    $scope.removeOldBranches = function(branches){
        if($scope.debugging){console.log('Removing ' + branches.length + ' items from sys.');}
        for (var j = 0; j < branches.length; j++){
            $scope.removeBranch(branches[j]);
        }
    };

    $scope.removeBranch = function(edge){
        var node = edge.target;
        if($scope.debugging){ console.log('Removing edge:'); console.log(edge); }
        $scope.buttonSys.deleteButtonPair(edge);
        $scope.sys.pruneEdge(edge);
        if($scope.sys.getEdgesTo(node).length===0 && $scope.sys.getEdgesFrom(node).length===0){
            $scope.sys.pruneNode(node);
        }
    };

    $scope.newLeafFromEdge = function(i){
        if($scope.debugging){
            console.log('Before making leaf at position '+i+'. Sys edges are '+$scope.sys.getEdgesFrom($scope.root.name));
        }

        $http.get('/api/issues/id/' + $scope.edges[i].vertex).then(function(issue){
            // if($scope.debugging){ console.log(issue.name); }
            issue = issue.data;
            $scope.edges[i].leaf=issue;
            var temp = $scope.sys.addNode(issue.name, issue);
            temp.data.color = 'mediumorchid';
            temp.data.shape = 'dot';
            if($scope.debugging){ console.log('creating new leaf for ' + temp.name); }
            // if($scope.debugging){ console.log('Successfully made node from leaf: ' + temp.name); }
            var edge = $scope.sys.addEdge($scope.root.name, issue.name, $scope.edges[i].score);
            $scope.buttonsFromEdge(edge);
            if($scope.debugging){console.log('Finished iteration '+i+'. Edges are '+$scope.sys.getEdgesFrom($scope.root.name));}
        });
    };

    // $scope.reloadTree = function(root){
    //     $http.get('/api/issuegraphs/' + root.issues).success(function(issues){
    //         $scope.graph = issues;
    //         $scope.edges = issues.edges;
    //         var arborEdges = $scope.sys.getEdgesFrom(root);
    //         for(var i=0; i < issues.edges.length; i++){
    //            
    //         }
    //     });
    // }

    // $scope.editTreeEdge = function(root, leaf, command){
    //     var edge = $scope.sys.getEdge(root, leaf)

    //     if(command==='add'){

    //     }
    //     if(command==='remove'){
    //         $scope.sys.getEdge(edge.)
    //     }
    //     if(command==='upvote'){

    //     }
    //     if(command==='downvote'){

    //     }

    // };


    $scope.buttonsFromEdge = function(edge){
        edge.upButton = $scope.buttonSys.addButton(edge, 'up', arbor.Point(0,0) );
        edge.downButton = $scope.buttonSys.addButton(edge, 'down', arbor.Point(0,0) );
    };

    $scope.addRisk = function() {
    	if($scope.newRisk === '') {
    		return;
    	}
    	$http.post('/api/issuegraphs', { type: 'risk', order: 'score', edges: []})
    		.then(function(graphPromise){
    			var graph = graphPromise.data;
                $scope.graph = graph;
    			console.log('issuegraph '+ $scope.graph._id + 'just uploaded');
    			$http.post('/api/risks', { name: $scope.newRisk, path: $scope.newRisk.replace(/\s+/g, '_').toLowerCase(), issues: $scope.graph._id})
    				.then(function(root){
    					root = root.data;
                        console.log('risk ' + root.name + ' just uploaded');
    					$scope.graph.root = root._id;
    					$http.put('/api/issuegraphs/' + $scope.graph._id, $scope.graph);
    					$scope.newRisk = '';
    					$scope.graph = {};
    			});
    	});
    	
    };

    $scope.addIssue = function() {
        console.log($scope.newIssue);
        if($scope.newIssue === '') {
            return;
        } 
        // to program: "if issue name already taken, return a message"
        $http.post('/api/issuegraphs', { type: 'issue', order: 'score', edges: []})
            .then(function(graph){
                graph = graph.data;
                $scope.graph = graph;
                console.log('issuegraph '+ $scope.graph._id + 'just uploaded');
                $http.post('/api/issues', { name: $scope.newIssue, path: $scope.newIssue.replace(/\s+/g, '_').toLowerCase(), issues: $scope.graph._id})
                    .then(function(root){
                        root = root.data;
                        console.log('issue ' + root.name + ' just uploaded');
                        $scope.graph.root = root._id;
                        $http.put('/api/issuegraphs/' + $scope.graph._id, $scope.graph);
                        $scope.newIssue = '';
                        $scope.graph = {};
                });
        });
    };

    $scope.deleteRisk = function(risk) {
    	$http.delete('/api/issuegraphs/' + risk.issues);
    	$http.delete('/api/risks/' + risk._id);
    };

    $scope.deleteIssue = function(issue) {
        $http.get('/api/issuegraphs/'  + issue.issues).then(function(graph){
            graph = graph.data;
            for(var i = 0; i<graph.edges.length; i++){
                $http.delete('/api/issues/edge/' + graph.edges[i]._id + '/' + issue._id);
            }
        });
        $http.delete('/api/issuegraphs/' + issue.issues);
        // $http.delete('/api/risks/' + risk._id);
    };

    $scope.deleteGraph = function(graph) {
    	$http.delete('/api/issuegraphs/id/' + graph._id);
    };

    $scope.saveRisk = function(risk) {
    	console.log(risk);
    	$http.put('/api/risks/' + risk._id, risk).then(function() {
			$state.go('risk');
		});
    };

    $scope.saveIssue = function(issue) {
        console.log(issue);
        $http.put('/api/issues/' + issue._id, issue).then(function() {
            $state.go('issue');
        });
    };

    $scope.findIssue = function(name) {
        $http.get('/api/issues/search/' + name).then(function(results) {
            $scope.results = results.data;
        });
    };

    $scope.makeIssue = function(issue) {
    	console.log('Running makeIssue on issue with ID ' + issue._id);
        $http.get('/api/issues/id/' + issue._id).then(function(issue){
            $state.go('issue', {root: issue.data.path});
        });
	};

    $scope.connectIssue = function(root, leaf){
        if($scope.debugging){console.log('Upvoting connection between ' + root.name + ' and ' + leaf.name);}
        if(!root||!leaf){
        	return;
        }
        //need to code this conditional = "if leaf isn't of type 'issue', then return"
        if(root._id===leaf._id){
			console.log('You can\'t connect an issue to itself');
        	return;
        }
        $http.get('/api/issuegraphs/' + root.issues).then(function(graph){
            // socket.syncUpdates('issuegraph', graph);
            graph = graph.data;
            var position = _.findIndex(graph.edges, function(edge){
                return edge.vertex === leaf._id;
            });
            if(position>-1){ 
                // graph.edges[position].score++; 
                // if($scope.debugging){console.log('The nodes are:');}
                // if($scope.debugging){ $scope.sys.eachNode(function(node, pt){console.log(node.name + ' at ' + pt.x + ' ' + pt.y);}); }
                // if($scope.debugging){ console.log(leaf.name + ' is at array position ' + position + ' in the issues graph for ' + graph.root); }
                $http.put('/api/issuegraphs/edge/' + graph._id + '/' + leaf._id + '/up', graph).then(function(){
                    $scope.formTree(root);
                });
            }
            else{
            	// console.log('graph.edges currently contains:');
             //    console.log(graph.edges);
                
                var newEdge = { vertex: leaf._id, score: 1 };
                $http.post('/api/issuegraphs/edge/' + graph._id + '/' + leaf._id, newEdge).then(function(){
                    // $scope.reformBranches(root);
                    $scope.formTree(root);  //REPLACE THIS WITH SOMETHING MORE SPECIFIC
                });
            	// graph.edges.sort(function(a, b){
            	// 	return b.score-a.score;
            	// });	
             //    console.log('Pushed edge with vertex ' + leaf._id);
             //    console.log('$scope.graph.edges now contains:');
             //    console.log(graph.edges);
            }
        });
    };

    $scope.detachIssue = function(root, leaf){
        if($scope.debugging){console.log('Downvoting connection between ' + root.name + ' and ' + leaf.name);}
        if(!root||!leaf){
            return;
        }
        //need to code this conditional = "if leaf isn't of type 'issue', then return"
        $http.get('/api/issuegraphs/' + root.issues).then(function(graph){
            // socket.syncUpdates('issue', root.issues);
            // socket.syncUpdates('issuegraph', graph);
            graph = graph.data;
            var position = _.findIndex(graph.edges, function(edge){
                return edge.vertex === leaf._id;
            });
            if(position>-1)
            {
                if($scope.debugging){ console.log(leaf.name + ' is at array position ' + position + ' in the issues graph for ' + graph.root); }
                if(graph.edges[position].score===1){
                    $http.delete('/api/issuegraphs/edge/' + graph._id + '/' + graph.edges[position].vertex).then(function(){
                        $scope.formTree(root);  //  REPLACE THIS WITH SOMETHING MORE SPECIFIC
                        
                    });
                }
                else{
                    // graph.edges[position].score--;
                    // graph.edges.sort(function(a, b){
                    //     return b.score-a.score;
                    // });
                    // $http.put('api/issuegraphs/' + graph._id, graph).then(function(){$scope.formTree(root);});
                    $http.put('/api/issuegraphs/edge/' + graph._id + '/' + leaf._id + '/down').then(function(){
                        $scope.formTree(root);  // REPLACE THIS WITH SOMETHING MORE SPECIFIC
                    });
                }
            }
            
        });
    };

    $scope.$on('$destroy', function() {
    	socket.unsyncUpdates('risk');
        socket.unsyncUpdates('issue');
        socket.unsyncUpdates('issuegraph');
    });

  });
