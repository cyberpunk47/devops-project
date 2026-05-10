import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchTasks, updateTask, deleteTask, type Task } from './tasksSlice';

const TasksList = () => {
    const dispatch = useAppDispatch();
    const { items, status, error } = useAppSelector(state => state.tasks);

    useEffect(() => {
        if (status === 'idle') dispatch(fetchTasks());
    }, [status, dispatch]);

    if (status === 'loading') return <p className="text-slate-500 italic">Loading tasks...</p>;
    if (status === 'failed') return <p className="text-red-500">{error}</p>;

    const handleToggle = (task: Task) => {
        dispatch(updateTask({ ...task, completed: !task.completed }));
    };

    if (items.length === 0) {
        return <p className="text-slate-400 italic text-center py-6">No tasks yet. Add one above!</p>;
    }

    return (
        <ul className="space-y-2">
            {items.map(task => (
                <li
                    key={task.id}
                    className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition"
                >
                    <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => handleToggle(task)}
                        className="w-5 h-5 accent-blue-600 cursor-pointer"
                    />
                    <span
                        className={`flex-grow ${
                            task.completed
                                ? 'line-through text-slate-400'
                                : 'text-slate-800'
                        }`}
                    >
                        {task.title}
                    </span>
                    <button
                        onClick={() => dispatch(deleteTask(task.id))}
                        className="text-red-500 hover:text-white hover:bg-red-500 px-3 py-1 rounded-md text-sm font-medium transition"
                    >
                        Delete
                    </button>
                </li>
            ))}
        </ul>
    );
};

export default TasksList;
