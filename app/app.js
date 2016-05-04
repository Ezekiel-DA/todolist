'use strict';

import 'whatwg-fetch';
import React from 'react';
import ReactDOM from 'react-dom';

import Paper from 'material-ui/lib/paper';
import List from 'material-ui/lib/lists/list';
import ListItem from 'material-ui/lib/lists/list-item';
import Checkbox from 'material-ui/lib/checkbox';

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
    render: function() {
        var todoItems = this.state.tasks.map(task => <TodoItem key= {task._id} task={task} onToggle={this.taskToggled}/> );
        return(
            <Paper zDepth={1}>
                <div className="todoList">
                    
                    <List subheader="Things to do :">
                        {todoItems}
                    </List>
                </div>
            </Paper>
        );
    }
});

var TodoItem = React.createClass({
    render: function() {
        var task = this.props.task;
        return(
            <ListItem className="todoItem">
                <Checkbox id={task._id} label={task.title} defaultChecked={task.done} onCheck={this.props.onToggle} />
            </ListItem>
        );
    }
});

ReactDOM.render(
    <TodoList pollInterval={2000}/>,
    document.getElementById('app')
);
