import type { Column as ColumnInterface, Task as TaskInterface } from "@/data/board/interface";

import { useCallback } from "react";
import {
	DndContext,
	DragEndEvent,
	DragOverEvent,
	PointerSensor,
	pointerWithin,
	useDroppable,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useBoard } from "@/data/board/board";

import { IonBadge, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonProgressBar, IonTitle } from "@ionic/react";

import "./Board.css";

interface BoardProps {}

const Board: React.FC<BoardProps> = () => {
	const { columns, setTasks, getTasksByColumnId } = useBoard();

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: { distance: 8 },
		}),
	);

	const handleDragOver = useCallback((event: DragOverEvent) => {
		const { active, over } = event;

		if (!over) return;

		const activeId = active.id;
		const overId = over.id;

		if (activeId === overId) return;

		const activeData = active.data.current;
		const overData = over.data.current;

		if (!activeData || !overData) return;

		const isActiveTask = activeData.type === "task";
		const isOverTask = overData.type === "task";
		const isOverColumn = overData.type === "column";

		if (!isActiveTask) return;

		setTasks((prev) => {
			const activeIndex = prev.findIndex((t) => t.id === activeId);
			const overIndex = prev.findIndex((t) => t.id === overId);

			if (isOverTask) {
				const overTask = overData.task as TaskInterface;

				if (prev[activeIndex].column_id !== overTask.column_id) {
					const updatedTasks = [...prev];

					updatedTasks[activeIndex] = {
						...updatedTasks[activeIndex],
						column_id: overTask.column_id,
					};

					return arrayMove(updatedTasks, activeIndex, overIndex);
				}

				return arrayMove(prev, activeIndex, overIndex);
			}

			if (isOverColumn) {
				const targetColumnId = overId as string;

				if (prev[activeIndex].column_id !== targetColumnId) {
					const updatedTasks = [...prev];

					updatedTasks[activeIndex] = {
						...updatedTasks[activeIndex],
						column_id: targetColumnId,
					};

					const tasksInTargetColumn = updatedTasks.filter((t) => t.column_id === targetColumnId);
					const lastTaskInTarget = tasksInTargetColumn[tasksInTargetColumn.length - 1];

					const lastIndexInTarget = updatedTasks.findIndex((t) => t.id === lastTaskInTarget?.id);

					const newIndex = lastIndexInTarget !== -1 ? lastIndexInTarget : activeIndex;

					return arrayMove(updatedTasks, activeIndex, newIndex);
				}
			}

			return prev;
		});
	}, []);

	const handleEndOver = useCallback((event: DragEndEvent) => {
		const { active, over } = event;

		if (!over) return;

		setTasks((prevTasks) => {
			const activeIndex = prevTasks.findIndex((t) => t.id === active.id);
			const overIndex = prevTasks.findIndex((t) => t.id === over.id);

			let finalTasks = prevTasks;

			if (activeIndex !== overIndex) {
				finalTasks = arrayMove(prevTasks, activeIndex, overIndex);
			}

			return finalTasks.map((task, index) => ({
				...task,
				order: index,
			}));
		});
	}, []);

	return (
		<DndContext
			sensors={sensors}
			collisionDetection={pointerWithin}
			onDragOver={handleDragOver}
			onDragEnd={handleEndOver}
		>
			<div className="board-container">
				{columns.map((column) => (
					<SortableContext
						key={column.id}
						items={getTasksByColumnId(column.id).map((task) => task.id)}
						strategy={verticalListSortingStrategy}
					>
						<Column column={column} tasks={getTasksByColumnId(column.id)} />
					</SortableContext>
				))}
			</div>
		</DndContext>
	);
};

interface ColumnProps {
	column: ColumnInterface;
	tasks: TaskInterface[];
}

const Column: React.FC<ColumnProps> = ({ column, tasks }) => {
	const { setNodeRef } = useDroppable({
		id: column.id,
		data: {
			type: "column",
			column,
		},
	});

	return (
		<div ref={setNodeRef} className="board-column-container">
			<div className="column-header">
				<IonTitle>{column.title}</IonTitle>
			</div>

			<div className="tasks-container">
				{tasks.map((task) => (
					<Task key={task.id} task={task} />
				))}
			</div>
		</div>
	);
};

interface TaskProps {
	task: TaskInterface;
}

const Task: React.FC<TaskProps> = ({ task }) => {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: task.id,
		data: { type: "task", task },
	});

	const style = {
		transform: CSS.Translate.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
		cursor: "pointer",
	};

	return (
		<div ref={setNodeRef} style={style} {...attributes} {...listeners}>
			<IonCard>
				<IonCardHeader>
					<IonBadge>{task.label}</IonBadge>
					<IonProgressBar value={0.3} />
				</IonCardHeader>

				<IonCardContent>
					<IonCardTitle>{task.title}</IonCardTitle>
				</IonCardContent>
			</IonCard>
		</div>
	);
};

export { Board };
