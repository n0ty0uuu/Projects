package com.Aditya.ToDo.Service;


import com.Aditya.ToDo.models.Task;
import com.Aditya.ToDo.repo.TaskRepo;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TaskService {

    private final TaskRepo taskrepo;

    public TaskService(TaskRepo taskrepo) {
        this.taskrepo = taskrepo;
    }

    public List<Task> getAllTasks() {
        return  taskrepo.findAll();
    }


    public Task makeTask(String text) {
        Task task = new Task();
        task.setText(text);
        task.setCompleted(false);
        task.setCreatedAt(LocalDateTime.now());

        return taskrepo.save(task);
    }

    public void deleteTask(Long id) {
        taskrepo.deleteById(id);
    }

    public Task updateTask(Long id) {
        Task task = taskrepo.findById(id).orElseThrow();
        task.setCompleted(!task.isCompleted());

        return taskrepo.save(task);
    }
}
