'use strict';

var React = require('react');
var ReactDOM = require('react-dom');

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
            if (task._id === e.target.value) {
                task.done = !task.done;
            }
            return task;
        })});
        fetch('api/task/'+e.target.value, {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({done: done})});
    },
    render: function() {
        var todoItems = this.state.tasks.map(task => <TodoItem key= {task._id} task={task} onToggle={this.taskToggled}/> );
        return(
            <div className="todoList">
                <h1>TODO</h1>
                Things to do:
                <ul>
                    {todoItems}
                </ul>
            </div>
        );
    }
});

var TodoItem = React.createClass({
    getInitialState: function() {
        return {done: this.props.task.done};       
    },
    render: function() {
        var task = this.props.task;
        return(
            <li className="todoItem">
                <input type="checkbox" value={task._id} checked={task.done} onChange={this.props.onToggle}/> {task.title}
            </li>
        );
    }
});

ReactDOM.render(
    <TodoList pollInterval={10000}/>,
    document.getElementById('app')
);
