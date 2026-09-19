package com.Aditya.ToDo.Controller;

import com.Aditya.ToDo.models.Task;
import com.Aditya.ToDo.Service.TaskService;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.List;



@RestController
@CrossOrigin(origins = "http://localhost:5173")
//@RequestMapping()
public class TaskController {
    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping("/tasks")
    public List<Task> getTask(){
        return taskService.getAllTasks();
    }

    @PostMapping("/tasks")
    public Task createTask(@RequestParam String text){
        return taskService.makeTask(text);
    }
    @DeleteMapping("/tasks/{id}")
    public void deleteTask(@PathVariable Long id){
        taskService.deleteTask(id);
    }

    @PutMapping("/tasks/{id}")
    public Task updateTask(@PathVariable Long id){
        return taskService.updateTask(id);
    }

}
