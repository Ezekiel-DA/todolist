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


var TodoList = React.createClass({
    getTasks: function() {
        fetch('/api/tasks')
            .then(res => res.json())
            .then(tasks => this.setState({tasks: tasks}));        
    },
    getInitialState: function() {
        return {tasks: []};
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
        fetch('api/task/'+e.target.id, {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({done: done})});
    },
    taskAdded: function(e) {
      if (e.key !== "Enter") {
          return;
      }
      var newTask = {
          title: e.target.value,
          done: false
      };
      this.setState({tasks: this.state.tasks.concat(newTask)});
      fetch('api/task', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(newTask)
      }).then(console.log.bind(console))
      .catch(console.log.bind(console));
    },
    taskDeleted: function(e) {
        var idToDel = e.currentTarget.id;
        this.setState({tasks: this.state.tasks.filter(task => task._id !== idToDel)});
        fetch('api/task/'+idToDel, {
            method: 'DELETE'
        }).catch(console.log.bind(console));
    },
    render: function() {
        var todoItems = this.state.tasks.map(task => <TodoItem key= {task._id} task={task} onToggle={this.taskToggled} onDelete={this.taskDeleted} /> );
        return(
            <MuiThemeProvider muiTheme={getMuiTheme({})}>
                <div className="fridgeApp">
                    <div className="todoList">
                        <List>
                            {todoItems}
                        </List>
                    </div>
                    <div className="todoEntry">
                        <TextField hintText="Add a new task..." onKeyDown={this.taskAdded}/>
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
            <ListItem className="todoItem">
                <Checkbox id={task._id} defaultChecked={task.done} onCheck={this.props.onToggle} label={task.title} />
                <IconButton tooltip="Delete task forever" onTouchTap={this.props.onDelete} id={task._id}>
                    <FontIcon className="material-icons">delete_forever</FontIcon>
                </IconButton>
            </ListItem>
        );
    }
});

ReactDOM.render(
    <TodoList pollInterval={2000}/>,
    document.getElementById('app')
);
