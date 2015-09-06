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

    
    $http.get('/api/issues').success(function(issues){
        $scope.issues = issues;
        socket.syncUpdates('issue', $scope.issues);
    }); 

// socket.syncUpdates('issuegraph', $scope.issues); // How do get a scope variable synced to an array in a specific document?  Or how do you set up socket without downloading all docs?

    // if($state.includes('index')){
        $http.get('/api/risks').success(function(risks){
        	$scope.risks = risks;
        	socket.syncUpdates('risk', $scope.risks);
        });
    // }

    if($state.includes('risk')){
        $http.get('/api/risks/' + $stateParams.root).success(function(root){
            $scope.formTree(root);
        });
    }

    if($state.includes('issue')){
        $http.get('/api/issues/' + $stateParams.root).success(function(root){
            $scope.formTree(root);
        });
    }

    // arbor.js functionality
//
//  main.js
//
//  A project template for using arbor.js
//

    $scope.arborize = function($){
        console.log("$scope.arborize has been called.");
      var Renderer = function(canvas){
        canvas = $(canvas).get(0);
        var ctx = canvas.getContext('2d');
        var particleSystem;

        var that = {
          init:function(system){
            //
            // the particle system will call the init function once, right before the
            // first frame is to be drawn. it's a good place to set up the canvas and
            // to pass the canvas size to the particle system
            //
            // save a reference to the particle system for use in the .redraw() loop
            particleSystem = system;

            // inform the system of the screen dimensions so it can map coords for us.
            // if the canvas is ever resized, screenSize should be called again with
            // the new dimensions
            particleSystem.screenSize(canvas.width, canvas.height); 
            particleSystem.screenPadding(80); // leave an extra 80px of whitespace per side
            
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
            ctx.fillStyle = 'white';
            ctx.fillRect(0,0, canvas.width, canvas.height);
            
            particleSystem.eachEdge(function(edge, pt1, pt2){
              // edge: {source:Node, target:Node, length:#, data:{}}
              // pt1:  {x:#, y:#}  source position in screen coords
              // pt2:  {x:#, y:#}  target position in screen coords

              // draw a line from pt1 to pt2
              ctx.strokeStyle = 'rgba(0,0,0, .333)';
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(pt1.x, pt1.y);
              ctx.lineTo(pt2.x, pt2.y);
              ctx.stroke();
            });

            particleSystem.eachNode(function(node, pt){
              // node: {mass:#, p:{x,y}, name:"", data:{}}
              // pt:   {x:#, y:#}  node position in screen coords

              // draw a rectangle centered at pt
              var w = 10;
              ctx.fillStyle = (node.data.alone) ? 'orange' : 'black';
              ctx.fillRect(pt.x-w/2, pt.y-w/2, w,w);
            });              
          },
          
          initMouseHandling:function(){
            // no-nonsense drag and drop (thanks springy.js)
            var dragged = null,
                _mouseP = null;

            // set up a handler object that will initially listen for mousedowns then
            // for moves and mouseups while dragging
            var handler = {
              clicked:function(e){
                var pos = $(canvas).offset();
                _mouseP = arbor.Point(e.pageX-pos.left, e.pageY-pos.top);
                dragged = particleSystem.nearest(_mouseP);

                if (dragged && dragged.node !== null){
                  // while we're dragging, don't let physics move the node
                  dragged.node.fixed = true;
                }

                $(canvas).bind('mousemove', handler.dragged);
                $(window).bind('mouseup', handler.dropped);

                return false;
              },
              dragged:function(e){
                var pos = $(canvas).offset();
                var s = arbor.Point(e.pageX-pos.left, e.pageY-pos.top);

                if (dragged && dragged.node !== null){
                  var p = particleSystem.fromScreen(s);
                  dragged.node.p = p;
                }

                return false;
              },

              dropped:function(e){
                if (dragged===null || dragged.node===undefined){return;}
                if (dragged.node !== null){ dragged.node.fixed = false;}
                dragged.node.tempMass = 1000;
                dragged = null;
                $(canvas).unbind('mousemove', handler.dragged);
                $(window).unbind('mouseup', handler.dropped);
                var _mouseP = null;
                return false;
              }
            };
            
            // start listening
            $(canvas).mousedown(handler.clicked);

          }
          
        }; 
        return that;
      };    

      $(document).ready(function(){
        console.log("Document is ready. Executing $().ready code");
        var sys = arbor.ParticleSystem(1000, 600, 0.5); // create the system with sensible repulsion/stiffness/friction
        sys.parameters({gravity:true}); // use center-gravity to make the graph settle nicely (ymmv)
        sys.renderer = new Renderer('#viewport'); // our newly created renderer will have its .init() method called shortly by sys...

        // add some nodes to the graph and watch it go...
        sys.addEdge('a','b');
        sys.addEdge('a','c');
        sys.addEdge('a','d');
        sys.addEdge('a','e');
        sys.addNode('f', {alone:true, mass:0.25});

        // or, equivalently:
        //
        // sys.graft({
        //   nodes:{
        //     f:{alone:true, mass:.25}
        //   }, 
        //   edges:{
        //     a:{ b:{},
        //         c:{},
        //         d:{},
        //         e:{}
        //     }
        //   }
        // })
        sys.eachEdge(function(node, pt){
            console.log("Node is " + node);
            console.log("pt is " + pt);
        });
      });

    };

    $scope.formTree = function(root){
        $scope.root = root;

        if($scope.root.issues){
            $http.get('/api/issuegraphs/' + $scope.root.issues).success(function(issues){
                $scope.graph = issues;
                $scope.edges = issues.edges;
                for(var i=0; i < issues.edges.length; i++){
                    $scope.leafFromEdge(i);
                }
            });
        }
        $scope.arborize($);
    };

    $scope.leafFromEdge = function(i){
        $http.get('/api/issues/id/' + $scope.edges[i].vertex).success(function(issue){
            $scope.edges[i].leaf=issue;
        });
    };

    $scope.addRisk = function() {
    	if($scope.newRisk === '') {
    		return;
    	}
    	$http.post('/api/issuegraphs', { type: 'risk', order: 'score', edges: []})
    		.success(function(graph){
    			$scope.graph = graph;
    			console.log('issuegraph '+ $scope.graph._id + 'just uploaded');
    			$http.post('/api/risks', { name: $scope.newRisk, path: $scope.newRisk.replace(/\s+/g, '_').toLowerCase(), issues: $scope.graph._id})
    				.success(function(root){
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
            .success(function(graph){
                $scope.graph = graph;
                console.log('issuegraph '+ $scope.graph._id + 'just uploaded');
                $http.post('/api/issues', { name: $scope.newIssue, path: $scope.newIssue.replace(/\s+/g, '_').toLowerCase(), issues: $scope.graph._id})
                    .success(function(root){
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
        $http.get('/api/issuegraphs/'  + issue.issues).success(function(graph){
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
        $http.get('/api/issues/search/' + name).success(function(results) {
            $scope.results = results;
        });
    };

    $scope.makeIssue = function(issue) {
    	console.log('Running makeIssue on issue with ID ' + issue._id);
        $scope.root = $http.get('/api/issues/id/' + issue._id);
	};

    $scope.connectIssue = function(root, leaf){
        console.log('Editing the issues graph of ' + root.name + ' with the _id ' + root.issues);
        if(!root||!leaf){
        	return;
        }
        //need to code this conditional = "if leaf isn't of type 'issue', then return"
        if(root._id===leaf._id){
			console.log('You can\'t connect an issue to itself');
        	return;
        }
        $http.get('/api/issuegraphs/' + root.issues).success(function(graph){
            // socket.syncUpdates('issue', root.issues);
            // socket.syncUpdates('issuegraph', graph);
            var position = _.findIndex(graph.edges, function(edge){
                return edge.vertex === leaf._id;
            });
            if(position>-1){ 
                // graph.edges[position].score++; 
                console.log(graph.edges[position] + ' is at array position ' + position + ' in the issues graph for ' + graph.root); 
                $http.put('/api/issuegraphs/edge/' + graph._id + '/' + leaf._id + '/up', graph).then(function(){
                    $scope.formTree(root);
                });
            }
            else{
            	// console.log('graph.edges currently contains:');
             //    console.log(graph.edges);
                
                var newEdge = { vertex: leaf._id, score: 1 };
                $http.post('/api/issuegraphs/edge/' + graph._id + '/' + leaf._id, newEdge).then(function(){
                    $scope.formTree(root);
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
        console.log('Editing the issues graph of ' + root.name + ' with the _id ' + root.issues);
        if(!root||!leaf){
            return;
        }
        //need to code this conditional = "if leaf isn't of type 'issue', then return"
        $http.get('/api/issuegraphs/' + root.issues).success(function(graph){
            // socket.syncUpdates('issue', root.issues);
            // socket.syncUpdates('issuegraph', graph);
            
            var position = _.findIndex(graph.edges, function(edge){
                return edge.vertex === leaf._id;
            });
            if(position>-1)
            {
                console.log(graph.edges[position] + ' is at array position ' + position + ' in the issues graph for "' + root.name + '"');
                if(graph.edges[position].score===1){
                    $http.delete('/api/issuegraphs/edge/' + graph._id + '/' + graph.edges[position].vertex).then(function(){$scope.formTree(root);});
                }
                else{
                    // graph.edges[position].score--;
                    // graph.edges.sort(function(a, b){
                    //     return b.score-a.score;
                    // });
                    // $http.put('api/issuegraphs/' + graph._id, graph).then(function(){$scope.formTree(root);});
                    $http.put('/api/issuegraphs/edge/' + graph._id + '/' + leaf._id + '/down').then(function(){
                        $scope.formTree(root);
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
