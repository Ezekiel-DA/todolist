'use strict';

var React = require('react');
var ReactDOM = require('react-dom');

var tasks = [{
        _id: 1,
        title: "my first task",
        done: true
    },
    {
        _id: 2,
        title: "my second task",
        done: false
    }
];


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
    },
    render: function() {
        var todoItems = this.state.tasks.map(task => <TodoItem key= {task._id} task={task} /> );
        return(
            <div className="todoList">
                <h1>TODO1</h1>
                Things to do:
                <ul>
                    {todoItems}
                </ul>
            </div>
        );
    }
});

class TodoItem extends React.Component {
    render() {
        var task = this.props.task;
        return(
            <li className="todoItem">
                <input type="checkbox" value={task._id} checked={task.done} /> {task.title}
            </li>
        );
    }
}

ReactDOM.render(
    <TodoList tasks={tasks}/>,
    document.getElementById('app')
);
