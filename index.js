//Sample for Assignment 3
const express = require('express');

//Import a body parser module to be able to access the request body as json
const bodyParser = require('body-parser');

//Use cors to avoid issues with testing on localhost
const cors = require('cors');

const app = express();

//Port environment variable already set up to run on Heroku
var port = process.env.PORT || 3000;

var api_path = '/api/v1'

//Tell express to use the body parser module
app.use(bodyParser.json());

//Tell express to use cors -- enables CORS for this backend
app.use(cors());  

//The following is an example of an array of three boards. 
var boards = [
    { id: '0', name: "Planned", description: "Everything that's on the todo list.", tasks: ["0","1","2"] },
    { id: '1', name: "Ongoing", description: "Currently in progress.", tasks: [] },
    { id: '3', name: "Done", description: "Completed tasks.", tasks: ["3"] },
    { id: '4', name: "Side-Project", description: "", tasks: [] }

];
var next_board_id = boards.length + 1;

var tasks = [
    { id: '0', boardId: '0', taskName: "Another task", dateCreated: new Date(Date.UTC(2021, 00, 21, 15, 48)), archived: false },
    { id: '1', boardId: '0', taskName: "Prepare exam draft", dateCreated: new Date(Date.UTC(2021, 00, 21, 16, 48)), archived: false },
    { id: '2', boardId: '0', taskName: "Discuss exam organisation", dateCreated: new Date(Date.UTC(2021, 00, 21, 14, 48)), archived: false },
    { id: '3', boardId: '3', taskName: "Prepare assignment 2", dateCreated: new Date(Date.UTC(2021, 00, 10, 16, 00)), archived: true }
];
var next_task_id = tasks.length + 1;

function getBoard(id){
    return boards.find(board => board.id === id);
};

function getTask(id){
    return tasks.find(task => task.id === id);
};
/*
function getBoard(id){
    for(var i = 0; i < boards.length; i++){
        var board = boards[i];
        if (board["id"] == id){
            return board;
        }
    }
    return null;
};*/

/*
function getTask(id){
    for(var i = 0; i < tasks.length; i++){
        var task = tasks[i];
        if (task["id"] == id){
            return task;
        }
    }
    return null;
};*/

function removeBoard(id){
    for(var i = 0; i < boards.length; i++){ 
        var board = boards[i];
        if (board["id"] == id) { 
            boards.splice(i, 1);
        }
    }
};

//Completly removes the task from everything.
function removeTask(boardId, taskId){
    removeTaskFromBoard(boardId, taskId);
    for(var i = 0; i < tasks.length; i++){
        var task = tasks[i];
        if(task["id"] == taskId){
            tasks.splice(i, 1);
        }
    }
};
//Removes the task from the boards array of tasks
function removeTaskFromBoard(boardId, taskId){
    var board = getBoard(boardId);
    for(var i = 0; i < board["tasks"].length; i++)
    {
        if (board["tasks"][i] == taskId){
            board["tasks"].splice(i, 1);
        }
    }
};

function boardHasTasks(id){
    var board_tasks = getTasks(id);
    if (board_tasks.length == 0){
        return false;
    }
    for(var i = 0; i < board_tasks.length; i++){
        var task = board_tasks[i];
        if (task['archived'] == false){
                return true;
        }
    }
    return false;
};

function getTasks(board_id){
    var board = getBoard(board_id);
    var boards_tasks = board['tasks'];
    var return_tasks = [];
    for(var i = 0; i < boards_tasks.length; i++){
        task = getTask(boards_tasks[i]);
        return_tasks.push(task);
    }
    return return_tasks;
}


//Your endpoints go here


/*

    BOARDS

*/
app.delete(api_path + '/boards/:id', (req, res) => {
    console.log(req.params.id);
    var board = getBoard(req.params.id);
    if (board != null){
        if(!boardHasTasks(board["id"])){
            removeBoard(board["id"]);
            res.status(200).json(board);
        }
        else{
            res.status(400).send("cannot delete board that has active tasks");
        }
    }
    else{
        res.status(404).send("failed to get board");
    }
});

app.get(api_path + '/boards/:id', (req, res) => {
    var board = getBoard(req.params.id);
    if (board != null){
        res.status(200).json(board);
    }
    else{
        res.status(404).send("failed to get board");
    }
});


app.delete(api_path + '/boards', (req, res) => {
    var old_board = boards;
    boards = [];
    tasks = [];
    console.log("All boards and task have been removed.");
    res.status(200).json(old_board);

});

app.post(api_path + '/boards', (req, res) => {
    if(req.body["name"].length > 0){ //Not allowed to create a board with no name 
        var new_board = { id: next_board_id.toString(), name: req.body["name"], description: req.body["description"], tasks: [] }; //Let tasks be empty,
        boards.push(new_board);
        next_board_id++;
        console.log("created new board with id '"  + new_board["id"] +  "'");
        res.status(201).json(new_board);
    }
    else{
        res.status(400).send("failed to create new board");
    }
});

app.get(api_path + '/boards', (req, res) => {
    res.status(200).json(boards);
});

/*

    TASKS

*/
app.post(api_path + '/boards/:id/tasks', (req, res) => {
    var board = getBoard(req.params.id);
    if (board != null){
        if(req.body["taskName"].length > 0 ){
            //{ id: '0', boardId: '0', taskName: "Another task", dateCreated: new Date(Date.UTC(2021, 00, 21, 15, 48)), archived: false }
            var new_task = {id:next_task_id.toString(), boardId: board['id'], taskName: req.body["taskName"], dateCreated: new Date(), archived: false};
            tasks.push(new_task);
            board["tasks"].push(new_task["id"]);
            next_task_id++;
            console.log("created new task for board '" + board['id']  + "'");
            res.status(201).json(new_task);
        }
        else{
            res.status(400).send("failed to create new board");
        }
    }
    else{
        res.status(404).send("failed to get board");
    }
});
app.patch(api_path + '/boards/:id/tasks/:taskid', (req, res) => {
    var board = getBoard(req.params.id);
    var task = getTask(req.params.taskid);
    if (req.body.boardId){
        var new_board = getBoard(req.body.boardId);
        console.log("moving task to another board");
        //Remove the task id from the old board
        removeTask(board["id"], task["id"]);
        
        task["boardId"] = new_board["id"];
        new_board["tasks"].push(task["id"]);
        res.status(200).json(task);
    }
    else if(req.body.archived){
        console.log("archiving task ");
        task["archived"] = req.body.archived;
        res.status(200).json(task);
    }
    else if(req.body.taskName){
        console.log("renaming task to");
        task["taskName"] = req.body.taskName;
        res.status(200).json(task);
    }
    else{
        res.status(404).send("body attribute not found.");
    };

});

app.delete(api_path + '/boards/:id/tasks/:taskid', (req, res) => {
    var board = getBoard(req.params.id);
    var task = getTask(req.params.taskid);
    removeTask(board["id"], task["id"]);
    res.status(200).json(task);
    console.log(tasks);
});

app.get(api_path + '/boards/:id/tasks/:taskid', (req, res) => {
    var task = getTask(req.params.taskid);
    res.status(200).json(task);
});
app.get(api_path + '/boards/:id/tasks', (req, res) => {
    var tasks = getTasks(req.params.id);
    res.status(200).json(tasks);
});

//Used for debugging
app.use(function (req, res, next) {
    console.log("[REQUEST]", + req.ip + ": " + req.path + " " + req.method);
    next();
});

app.use('*', (req, res) => {
    res.status(405).send("This operation is not supported.")
});

//Start the server
app.listen(port, () => {
    console.log('Event app listening...');
});

