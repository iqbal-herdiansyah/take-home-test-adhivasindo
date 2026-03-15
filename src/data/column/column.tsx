import type { TaskSchema } from "@/pages/Home/schemas/task-schema";
import type { User } from "../user/interface";
import type { ColumnFilter, Column, Task, TaskLabel, TaskPriority } from "./interface";

import { useCallback, useMemo, useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import columnsSeeder from "./column.json";

const useColumn = () => {
	const [columns, setColumns] = useLocalStorage("columns", { ...columnsSeeder });
	const [filter, setFilter] = useState<ColumnFilter>({
		keyword: "",
		userIds: [],
	});

	const columnsTemp = useMemo(() => {
		const columnsCopied = { ...columns };
		const columnsEntries = Object.entries(columnsCopied);

		for (const columnTemp of columnsEntries) {
			const filteredTasks = columnTemp[1].filter(
				(t) =>
					(t as Task).title.toLowerCase().includes(filter.keyword.toLowerCase()) &&
					(filter.userIds.length
						? (t as Task).assignees.map((a) => a.id).filter((t) => filter.userIds.includes(t)).length
						: true),
			);

			columnsCopied[columnTemp[0] as keyof typeof columnsCopied] = filteredTasks;
		}

		return columnsCopied;
	}, [columns, filter]);

	const createTask = useCallback(
		(payload: TaskSchema) => {
			const { column, ...data } = payload;

			const columnsTemp = { ...columns };
			const tasksTemp = [...columnsTemp[column]];

			const task: Task = {
				id: data.id,
				description: data.description,
				due_date: data.due_date,
				label: data.label as TaskLabel,
				priority: data.priority as TaskPriority,
				title: data.title,
				assignees: data.assignees as any as User[],
				attachment_files: data.attachment_files,
				checklist_items: data.checklist_items,
				cover_image: data.cover_image,
			};

			tasksTemp.push(task as never);
			columnsTemp[column] = tasksTemp as any;
			setColumns(columnsTemp);
		},
		[columns],
	);

	const updateTask = useCallback(
		(payload: TaskSchema) => {
			const column = Object.entries(columns).find((c) => c[1].find((t) => (t as Task).id === payload.id));

			if (!column) return;

			const [columnName, tasks] = column;

			const tasksTemp = [...tasks];
			const taskIndex = tasksTemp.findIndex((t) => (t as Task).id === payload.id);

			(tasksTemp[taskIndex] as Task) = {
				id: payload.id,
				title: payload.title,
				description: payload.description,
				assignees: payload.assignees as any,
				due_date: payload.due_date,
				label: payload.label as any,
				priority: payload.priority as any,
				checklist_items: payload.checklist_items,
				attachment_files: payload.attachment_files,
				cover_image: payload.cover_image,
			};

			const columnsTemp = { ...columns };

			if (columnName === payload.column) {
				columnsTemp[columnName as keyof Column] = tasksTemp as any;
			} else {
				columnsTemp[payload.column as keyof Column].push(tasksTemp[taskIndex]);
				columnsTemp[columnName as keyof Column].splice(taskIndex, 1);
			}

			setColumns(columnsTemp);
		},
		[columns],
	);

	const deleteTask = useCallback(
		(taskId: string) => {
			const column = Object.entries(columns).find((c) => c[1].find((t) => (t as Task).id === taskId));

			if (!column) return;

			const [columnName, tasks] = column;

			const tasksTemp = [...tasks];
			const taskIndex = tasksTemp.findIndex((t) => (t as Task).id === taskId);

			const columnsTemp = { ...columns };

			columnsTemp[columnName as keyof Column].splice(taskIndex, 1);

			setColumns(columnsTemp);
		},
		[columns],
	);

	const formatDueDate = useCallback((value: string) => {
		const locale = "id-ID";

		return new Intl.DateTimeFormat(locale, {
			day: "numeric",
			month: "short",
		}).format(new Date(value));
	}, []);

	return {
		columns: columnsTemp,
		setColumns,
		createTask,
		updateTask,
		deleteTask,
		formatDueDate,
		filter,
		setFilter,
	};
};

export { useColumn };
