import type { Column, Task } from "./interface";

import { useCallback, useState } from "react";

import dummyColumns from "./column.json";
import dummyTasks from "./task.json";

const useBoard = () => {
	const [columns] = useState<Column[]>([...dummyColumns]);
	const [tasks, setTasks] = useState<Task[]>([...dummyTasks] as Task[]);

	const getTasksByColumnId = useCallback(
		(columnId: string) => {
			const filteredTasks = tasks.filter((task) => task.column_id === columnId);

			return filteredTasks;
		},
		[tasks],
	);

	const getTaskById = useCallback((id: string) => tasks.find((t) => t.id === id), [tasks]);

	const updateTaskById = useCallback(
		(id: string, task: Omit<Task, "id">) => {
			const index = tasks.findIndex((t) => t.id === id);
			const tasksTemp = [...tasks];

			tasksTemp[index] = { ...tasksTemp[index], ...task };

			setTasks(tasksTemp);
		},
		[tasks],
	);

	return {
		columns,
		tasks,
		setTasks,
		getTasksByColumnId,
		updateTaskById,
		getTaskById,
	};
};

export { useBoard };
