import { useState, type FormEvent } from "react";
import { useAppDispatch } from "../../app/hooks";
import { addTask } from "./tasksSlice";

const AddTaskForm = () => {
    const [title, setTitle] = useState("");
    const dispatch = useAppDispatch();

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const trimmed = title.trim();
        if (!trimmed) return;
        dispatch(addTask(trimmed));
        setTitle("");
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 mb-6">
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be done?"
                className="border border-slate-300 p-2 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
            />
            <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-5 py-2 rounded-lg font-medium transition shadow-sm disabled:opacity-50"
                disabled={!title.trim()}
            >
                Add
            </button>
        </form>
    );
};

export default AddTaskForm;
