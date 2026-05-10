import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

export interface Task {
    id: number;
    title: string;
    description: string;
    completed: boolean;
}

interface TasksState {
    items: Task[];
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
}

const initialState: TasksState = {
    items: [],
    status: "idle",
    error: null,
};

export const fetchTasks = createAsyncThunk("tasks/fetchTasks", async () => {
    const response = await axiosInstance.get<Task[]>("/tasks");
    return response.data ?? [];
});

export const addTask = createAsyncThunk(
    "tasks/addTask",
    async (title: string) => {
        const response = await axiosInstance.post<Task>("/tasks", {
            title,
            description: "",
            completed: false,
        });
        return response.data;
    }
);

export const updateTask = createAsyncThunk(
    "tasks/updateTask",
    async (task: Task) => {
        const response = await axiosInstance.put<Task>(`/tasks/${task.id}`, task);
        return response.data;
    }
);

export const deleteTask = createAsyncThunk(
    "tasks/deleteTask",
    async (id: number) => {
        await axiosInstance.delete(`/tasks/${id}`);
        return id;
    }
);

const tasksSlice = createSlice({
    name: "tasks",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchTasks.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchTasks.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.items = action.payload;
            })
            .addCase(fetchTasks.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.error.message ?? "Unknown error";
            })
            .addCase(addTask.fulfilled, (state, action) => {
                state.items.push(action.payload);
            })
            .addCase(updateTask.fulfilled, (state, action) => {
                const index = state.items.findIndex((t) => t.id === action.payload.id);
                if (index !== -1) state.items[index] = action.payload;
            })
            .addCase(deleteTask.fulfilled, (state, action) => {
                state.items = state.items.filter((t) => t.id !== action.payload);
            });
    },
});

export default tasksSlice.reducer;