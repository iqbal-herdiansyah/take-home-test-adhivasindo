import type { DragOverEvent } from "@dnd-kit/react";
import type { Column, TaskChecklist, Task as TaskInterface } from "@/data/column/interface";

import { useCallback, useState } from "react";
import { CollisionPriority } from "@dnd-kit/abstract";
import { move } from "@dnd-kit/helpers";
import { useDroppable } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { useColumn } from "@/data/column/column";

import { DragDropProvider } from "@dnd-kit/react";
import {
	IonBadge,
	IonButton,
	IonCard,
	IonCardContent,
	IonCardHeader,
	IonCardTitle,
	IonIcon,
	IonProgressBar,
	IonTitle,
	useIonModal,
} from "@ionic/react";
import { AvatarGroup } from "@/components/AvatarGroup/AvatarGroup";
import { CreateTaskModal } from "../Modal/CreateTaskModal/CreateTaskModal";
import { UpdateTaskModal } from "../Modal/UpdateTaskModal/UpdateTaskModal";

import { addOutline, checkboxOutline, linkOutline, stopwatchOutline } from "ionicons/icons";

import "./Board.css";

interface BoardProps extends ReturnType<typeof useColumn> {}

const Board: React.FC<BoardProps> = ({ columns, setColumns, createTask, updateTask, deleteTask }) => {
	const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
	const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

	const [presentCreateTaskModal, dismissCreateTaskModal] = useIonModal(CreateTaskModal, {
		columns,
		currentColumn: selectedColumn,
		onCreateTask: createTask,
		onDiscard: () => {
			dismissCreateTaskModal();
		},
	});

	const [presentUpdateTaskModal, dismissUpdateTaskModal] = useIonModal(UpdateTaskModal, {
		selectedTaskId,
		columns,
		currentColumn: selectedColumn,
		onUpdateTask: updateTask,
		onDeleteTask: deleteTask,
		onDiscard: () => {
			dismissUpdateTaskModal();
		},
	});

	const handleDragOver = useCallback<DragOverEvent>(
		(event) => {
			const { source } = event.operation;

			if (source?.type === "column") return;

			setColumns((columns) => move(columns, event));
		},
		[setColumns, move],
	);

	return (
		<>
			<DragDropProvider onDragOver={handleDragOver}>
				<div className="board-container">
					{Object.entries(columns).map(([column, tasks]) => (
						<Column
							key={column}
							column={column}
							tasks={tasks as TaskInterface[]}
							onClickAddButton={() => {
								setSelectedColumn(column);
								presentCreateTaskModal({ backdropDismiss: false, cssClass: "add-task-modal" });
							}}
							onClickTask={(taskId: string) => {
								setSelectedColumn(column);
								setSelectedTaskId(taskId);
								presentUpdateTaskModal({ backdropDismiss: false, cssClass: "add-task-modal" });
							}}
						/>
					))}
				</div>
			</DragDropProvider>
		</>
	);
};

interface ColumnProps {
	column: string;
	tasks: TaskInterface[];
	onClickAddButton: () => void;
	onClickTask: (taskId: string) => void;
}

const Column: React.FC<ColumnProps> = ({ column, tasks, onClickAddButton, onClickTask }) => {
	const { ref } = useDroppable({
		id: column,
		type: "column",
		collisionPriority: CollisionPriority.Low,
		accept: ["item", "column"],
	});

	return (
		<div className="board-column-container">
			<div className="column-header">
				<IonTitle>{column}</IonTitle>

				<IonButton onClick={onClickAddButton}>
					<IonIcon icon={addOutline} slot="start" />
				</IonButton>
			</div>

			<div ref={ref} className="tasks-container">
				{tasks.map((task, index) => (
					<Task key={task.id} column={column} task={task} index={index} onClickTask={onClickTask} />
				))}
			</div>
		</div>
	);
};

interface TaskProps {
	index: number;
	column: string;
	task: TaskInterface;
	onClickTask: (taskId: string) => void;
}

const Task: React.FC<TaskProps> = ({ task, index, column, onClickTask }) => {
	const { formatDueDate } = useColumn();

	const { ref, isDragging } = useSortable({
		id: task.id,
		index,
		type: "item",
		accept: "item",
		group: column,
	});

	const getLabelColor = useCallback(() => {
		switch (task.label) {
			case "Bug": {
				return "danger";
			}
			case "Issue": {
				return "warning";
			}
			case "Undefined": {
				return "undefined";
			}
			default: {
				return undefined;
			}
		}
	}, [task]);

	const getCompletedChecklist = useCallback(
		(checklists: TaskChecklist[]) => checklists.filter((t) => t.is_completed),
		[],
	);

	return (
		<IonCard
			ref={ref}
			data-dragging={isDragging}
			className="task-card"
			onClick={() => {
				onClickTask(task.id);
			}}
		>
			<IonCardHeader>
				{task.cover_image && (
					<div className="task-cover-image">
						<img src={task.cover_image.image} />
					</div>
				)}

				<IonBadge color={getLabelColor()}>{task.label}</IonBadge>

				{task.checklist_items.length >= 1 && (
					<IonProgressBar
						value={
							getCompletedChecklist(task.checklist_items).length > 0
								? getCompletedChecklist(task.checklist_items).length / task.checklist_items.length
								: 0
						}
					/>
				)}
			</IonCardHeader>

			<IonCardContent>
				<IonCardTitle>{task.title}</IonCardTitle>

				<div className="task-footer">
					<div className="task-footer-primary">
						<IonBadge color="secondary" class="ion-color-secondary task-due-date">
							<IonIcon icon={stopwatchOutline} />

							{formatDueDate(task.due_date)}
						</IonBadge>

						{task.checklist_items.length >= 1 && (
							<div className="checklist">
								<IonIcon icon={checkboxOutline} />
								{getCompletedChecklist(task.checklist_items).length}/{task.checklist_items.length}
							</div>
						)}

						<div className="attachment-section">
							<IonIcon icon={linkOutline} />2
						</div>
					</div>

					<div className="task-footer-secondary">
						<AvatarGroup items={task.assignees} itemKey="id" imageKey="image" limit={2} />
					</div>
				</div>
			</IonCardContent>
		</IonCard>
	);
};

export { Board };
