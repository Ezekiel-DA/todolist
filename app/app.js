'use strict';

import 'whatwg-fetch';
import React from 'react';
import ReactDOM from 'react-dom';

import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import {List, ListItem} from 'material-ui/List';
import Checkbox from 'material-ui/Checkbox';
import TextField from 'material-ui/TextField';
import FontIcon from 'material-ui/FontIcon';
import IconButton from 'material-ui/IconButton';
import Toggle from 'material-ui/Toggle';
import Subheader from 'material-ui/Subheader';
import Divider from 'material-ui/Divider';

function getTasks() {
    return fetch('/api/tasks', { credentials: 'include' })
    .then(function (res) {
        return res.json();
    });
}
function setTaskDoneState(taskId, state) {
    return fetch('/api/task/'+taskId, {
       method: 'PATCH',
       headers: {'Content-Type': 'application/json'},
       credentials: 'include',
       body: JSON.stringify({done: state}) 
    });
}

function createTask(newTaskInfo) {
    return fetch('api/task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(newTaskInfo)
    });
}

function deleteTask(taskId) {
    return fetch('api/task/' + taskId, {
        method: 'DELETE',
        credentials: 'include'
    });
}

var TodoApp = React.createClass({
    getTasks: function() {
        getTasks().then(tasks => this.setState({ tasks: tasks }));
    },
    getInitialState: function() {
        return {tasks: [], fridgeTasks: []};
    },
    componentDidMount: function() {
        this.getTasks();
        setInterval(this.getTasks, this.props.pollInterval);
    },
    taskToggled: function(e) {
        var done = e.target.checked;
        this.setState({tasks: this.state.tasks.map(task => {
            if (task._id === e.target.id) {
                task.done = !task.done;
            }
            return task;
        })});
        setTaskDoneState(e.target.id, done);
    },
    taskAdded: function(e) {
      if (e.key !== "Enter") {
          return;
      }
      var newTask = {
          title: e.target.value,
          done: false
      };
      e.target.value = '';
      this.setState({tasks: this.state.tasks.concat(newTask)});
      createTask(newTask);
    },
    taskDeleted: function(e) {
        var idToDel = e.currentTarget.id;
        this.setState({tasks: this.state.tasks.filter(task => task._id !== idToDel)});
        deleteTask(idToDel).catch(console.log.bind(console));
    },
    render: function() {
        var myTodoItems = this.state.tasks.map(task => <TodoItem key= {task._id} task={task} onToggle={this.taskToggled} onDelete={this.taskDeleted} /> );
        var fridgeTodoItems = this.state.fridgeTasks.map(fridgeTask => <TodoItem key= {task._id} task={task} onToggle={this.taskToggled} onDelete={this.taskDeleted} /> );
        return(
            <MuiThemeProvider muiTheme={getMuiTheme({})}>
                <div className="fridgeApp">
                    <div className="todoList">
                        <Subheader>My private tasks</Subheader>
                            <List>
                                {myTodoItems}
                            </List>
                        <Divider />
                        <Subheader>My shared tasks</Subheader>
                            <List>
                                {fridgeTodoItems}
                            </List>
                    </div>
                    <div className="todoEntry">
                        <span>
                            <TextField hintText="Enter your new task and hit enter..." floatingLabelText="New task"
                                       onKeyDown={this.taskAdded} onBlur={this.taskAdded}/>
                            <Toggle label="Shared"/>
                        </span>
                    </div>
                </div>
            </MuiThemeProvider>
        );
    }
});

var TodoItem = React.createClass({
    render: function() {
        var task = this.props.task;
        return(
            <ListItem className="todoItem"
                leftCheckbox={<Checkbox id={task._id} defaultChecked={task.done} onCheck={this.props.onToggle}/>}
                primaryText={task.title}
                rightIconButton={
                    <IconButton tooltip="Delete task" onTouchTap={this.props.onDelete} id={task._id}>
                        <FontIcon className="material-icons">delete</FontIcon>
                    </IconButton>
                }
            />
        );
    }
});

ReactDOM.render(
    <TodoApp pollInterval={2000}/>,
    document.getElementById('app')
);
