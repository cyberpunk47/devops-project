package main

import "sync"

type Task struct {
	ID          int    `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Completed   bool   `json:"completed"`
}

var (
	tasks  []Task
	nextID = 1
	mu     sync.Mutex
)
