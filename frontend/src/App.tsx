import NavBar from './ui/NavBar';
import Footer from './ui/Footer';
import AddTaskForm from './features/tasks/AddTaskForm';
import TasksList from './features/tasks/TasksList';

function App() {
    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-slate-200">
            <NavBar />
            <main className="flex-grow container mx-auto p-4 md:p-8 max-w-3xl w-full">
                <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">
                        Todo Application
                    </h1>
                    <p className="text-slate-500 mb-6">
                        A simple todo app powered by React, Redux Toolkit and Go.
                    </p>
                    <AddTaskForm />
                    <TasksList />
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default App;
