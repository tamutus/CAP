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

    $http.get('/api/issues').success(function(issues){
        $scope.issues = issues;
        socket.syncUpdates('issue', $scope.issues);
    });

// socket.syncUpdates('issuegraph', $scope.issues); // How do get a scope variable synced to an array in a specific document?  Or how do you set up socket without downloading all docs?

    if($state.includes('index')){
        $http.get('/api/risks').success(function(risks){
        	$scope.risks = risks;
        	socket.syncUpdates('risk', $scope.risks);
        });
    }

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

    $scope.formTree = function(root){
        $scope.root = root;
        if($scope.root.issues){
            $http.get('/api/issuegraphs/' + $scope.root.issues).success(function(issues){
                $scope.graph = issues
                $scope.edges = issues.edges;
                for(var i=0; i < issues.edges.length; i++){
                    $scope.leafFromEdge(i);
                }
            });
        }
    }

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
        $http.delete('/api/risks/' + risk._id);
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
                return edge.vertex == leaf._id;
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
                return edge.vertex == leaf._id;
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
